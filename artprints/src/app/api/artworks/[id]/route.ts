/**
 * Single artwork API route - Read-only for artwork display
 * Created by Leon Jordaan
 */

import { NextRequest, NextResponse } from 'next/server'
import { getArtworkById } from '@/lib/db'

/**
 * GET /api/artworks/[id] - Get artwork by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await getArtworkById(parseInt(params.id))
    
    if (!artwork) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Transform data to match the frontend interface
    const transformedArtwork = {
      id: artwork.id.toString(),
      title: artwork.title,
      artist: artwork.artist,
      price: parseFloat(artwork.base_price),
      image: artwork.image_url,
      description: artwork.description,
      category: artwork.category,
      tags: artwork.tags,
      isFeatured: artwork.is_featured,
      isActive: artwork.is_active,
      sizes: artwork.sizes?.filter((s: any) => s.id !== null) || [],
      createdAt: artwork.created_at,
      updatedAt: artwork.updated_at
    }

    return NextResponse.json({ success: true, data: transformedArtwork })
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}