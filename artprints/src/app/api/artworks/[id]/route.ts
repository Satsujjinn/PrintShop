import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getArtworkById, updateArtwork, deleteArtwork, updateArtworkSizes } from '@/lib/db'
import { deleteFromS3 } from '@/lib/s3'

// GET /api/artworks/[id] - Get artwork by ID
export async function GET(
  request: NextRequest,
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

    // Transform data to match the existing interface
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
      sizes: artwork.sizes?.filter(s => s.id !== null) || [],
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

// PUT /api/artworks/[id] - Update artwork (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      artist, 
      description, 
      base_price, 
      image_url, 
      image_key,
      category, 
      tags, 
      is_featured,
      is_active,
      sizes 
    } = body

    const artworkId = parseInt(params.id)

    // Update artwork
    const updatedData: any = {}
    if (title !== undefined) updatedData.title = title
    if (artist !== undefined) updatedData.artist = artist
    if (description !== undefined) updatedData.description = description
    if (base_price !== undefined) updatedData.base_price = parseFloat(base_price)
    if (image_url !== undefined) updatedData.image_url = image_url
    if (image_key !== undefined) updatedData.image_key = image_key
    if (category !== undefined) updatedData.category = category
    if (tags !== undefined) updatedData.tags = tags
    if (is_featured !== undefined) updatedData.is_featured = is_featured
    if (is_active !== undefined) updatedData.is_active = is_active

    const artwork = await updateArtwork(artworkId, updatedData)

    if (!artwork) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Update artwork sizes if provided
    if (sizes && sizes.length > 0) {
      await updateArtworkSizes(artworkId, sizes)
    }

    return NextResponse.json({ 
      success: true, 
      data: artwork,
      message: 'Artwork updated successfully' 
    })
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

// DELETE /api/artworks/[id] - Delete artwork (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const artworkId = parseInt(params.id)

    // Get artwork to retrieve image key for S3 deletion
    const artwork = await getArtworkById(artworkId)
    
    if (!artwork) {
      return NextResponse.json(
        { success: false, error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Delete artwork from database
    await deleteArtwork(artworkId)

    // Delete image from S3 if it exists
    if (artwork.image_key) {
      await deleteFromS3(artwork.image_key)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Artwork deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}
