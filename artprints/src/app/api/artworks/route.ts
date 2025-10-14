/**
 * Artworks API routes - Read-only for displaying artwork gallery
 * Created by Leon Jordaan
 */

import type { NextRequest } from 'next/server'
import { getArtworks } from '@/lib/db'
import { getArtworksQuerySchema } from '@/lib/schemas'
import {
  createSuccessResponse,
  validateQueryParams,
  withErrorHandling,
  ApiErrorCode,
  HttpStatus,
  ApiErrorClass,
  logApiRequest,
} from '@/lib/utils/api-helpers'
import type { Artwork } from '@/types'

/**
 * Transform database artwork to API format
 */
function transformArtwork(artwork: any): Artwork {
  return {
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
    updatedAt: artwork.updated_at,
  }
}

/**
 * GET /api/artworks - Get all artworks with filtering and pagination
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now()
  
  try {
    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const validation = validateQueryParams(searchParams, getArtworksQuerySchema)
    
    if (!validation.success) {
      return validation.response
    }

    const { includeInactive, page, limit, sortBy, sortOrder, ...filters } = validation.data

    // Fetch artworks from database
    const artworks = await getArtworks(!includeInactive)
    
    // Apply filters
    let filteredArtworks = artworks
    
    if (filters.category) {
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.category?.toLowerCase() === filters.category?.toLowerCase()
      )
    }
    
    if (filters.featured !== undefined) {
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.is_featured === filters.featured
      )
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredArtworks = filteredArtworks.filter(artwork =>
        artwork.title.toLowerCase().includes(searchLower) ||
        artwork.artist.toLowerCase().includes(searchLower) ||
        artwork.description.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredArtworks = filteredArtworks.filter(artwork =>
        filters.tags!.some(tag => artwork.tags?.includes(tag))
      )
    }

    // Apply sorting
    filteredArtworks.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Apply pagination
    const total = filteredArtworks.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedArtworks = filteredArtworks.slice(offset, offset + limit)

    // Transform data
    const transformedArtworks = paginatedArtworks.map(transformArtwork)

    // Log request
    const duration = Date.now() - startTime
    logApiRequest(request, 'GET', '/api/artworks', HttpStatus.OK, duration)

    return createSuccessResponse({
      artworks: transformedArtworks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logApiRequest(request, 'GET', '/api/artworks', HttpStatus.INTERNAL_SERVER_ERROR, duration)
    
    throw new ApiErrorClass(
      'Failed to fetch artworks',
      ApiErrorCode.DATABASE_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
})
