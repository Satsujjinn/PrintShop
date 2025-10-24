/**
 * API route for individual artwork operations
 * Created by Leon Jordaan
 */

import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { getArtworkById, updateArtwork, deleteArtwork } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { validateRequestSession } from '@/lib/auth'

/**
 * GET /api/artworks/[id]
 * Fetch a single artwork by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const artwork = await getArtworkById(id)
    
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/artworks/[id]
 * Update an existing artwork
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = validateRequestSession(request)
    if (!session.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const formData = await request.formData()
    
    const updates: any = {}
    
    const title = formData.get('title')
    const artist = formData.get('artist')
    const description = formData.get('description')
    const price = formData.get('price')
    const featured = formData.get('featured')
    const image = formData.get('image') as File | null
    
    if (title) updates.title = title as string
    if (artist) updates.artist = artist as string
    if (description) updates.description = description as string
    if (price) updates.price = parseFloat(price as string)
    if (featured !== null) updates.featured = featured === 'true'
    
    // Handle image update
    if (image && image.size > 0) {
      const artwork = await getArtworkById(id)
      
      if (artwork) {
        // Delete old image
        try {
          await del(artwork.imageUrl)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
      
      // Upload new image
      const blob = await put(`artworks/${generateId()}-${image.name}`, image, {
        access: 'public',
      })
      
      updates.imageUrl = blob.url
    }
    
    const updatedArtwork = await updateArtwork(id, updates)
    
    if (!updatedArtwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedArtwork)
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/artworks/[id]
 * Delete an artwork
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = validateRequestSession(request)
    if (!session.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const success = await deleteArtwork(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}
