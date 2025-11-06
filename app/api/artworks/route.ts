/**
 * API route for managing artworks
 * Created by Leon Jordaan
 */

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAllArtworks, addArtwork } from '@/lib/db'
import { filterAndSortArtworks, generateId } from '@/lib/utils'
import { Artwork, ArtworkFilters, ArtworkSortOptions } from '@/types'
import { validateRequestSession } from '@/lib/auth'

/**
 * GET /api/artworks
 * Fetch all artworks with optional filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const filters: ArtworkFilters & ArtworkSortOptions = {
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Get all artworks
    const allArtworks = await getAllArtworks()
    
    // Filter and sort
    const filtered = filterAndSortArtworks(allArtworks, filters)
    
    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArtworks = filtered.slice(startIndex, endIndex)
    
    return NextResponse.json({
      artworks: paginatedArtworks,
      total: filtered.length,
      page,
      limit,
      hasMore: endIndex < filtered.length,
    })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/artworks
 * Create a new artwork
 */
export async function POST(request: NextRequest) {
  try {
    const session = validateRequestSession(request)
    if (!session.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const featured = formData.get('featured') === 'true'
    const image = formData.get('image') as File
    
    // Validate required fields
    if (!title || !artist || !description || isNaN(price) || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Upload image to Vercel Blob in Art/ folder
    const blob = await put(`Art/${generateId()}-${image.name}`, image, {
      access: 'public',
    })
    
    // Create artwork object
    const artwork: Artwork = {
      id: generateId(),
      title,
      artist,
      description,
      price,
      imageUrl: blob.url,
      featured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Save to database
    await addArtwork(artwork)
    
    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    console.error('Error creating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}
