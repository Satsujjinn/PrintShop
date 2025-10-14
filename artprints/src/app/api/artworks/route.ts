/**
 * Artworks API routes with enhanced error handling and validation
 * Created by Leon Jordaan
 */

import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getArtworks, createArtwork, createArtworkSizes } from '@/lib/db'
import { getArtworksQuerySchema, createArtworkSchema } from '@/lib/schemas'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  validateQueryParams,
  withErrorHandling,
  ApiErrorCode,
  HttpStatus,
  ApiErrorClass,
  logApiRequest,
  getClientIP,
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

/**
 * POST /api/artworks - Create new artwork (Admin only)
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      throw new ApiErrorClass(
        'Authentication required',
        ApiErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED
      )
    }

    if (session.user.role !== 'admin') {
      throw new ApiErrorClass(
        'Admin access required',
        ApiErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN
      )
    }

    // Validate request body
    const validation = await validateRequestBody(request, createArtworkSchema)
    
    if (!validation.success) {
      return validation.response
    }

    const artworkData = validation.data

    // Create artwork in database
    const artwork = await createArtwork({
      title: artworkData.title,
      artist: artworkData.artist,
      description: artworkData.description,
      base_price: artworkData.base_price,
      image_url: artworkData.image_url,
      image_key: artworkData.image_key,
      category: artworkData.category,
      tags: artworkData.tags || [],
      is_featured: artworkData.is_featured || false,
    })

    // Create artwork sizes
    if (artworkData.sizes && artworkData.sizes.length > 0) {
      await createArtworkSizes(artwork.id, artworkData.sizes)
    }

    // Log request
    const duration = Date.now() - startTime
    logApiRequest(request, 'POST', '/api/artworks', HttpStatus.CREATED, duration, session.user.id)

    return createSuccessResponse(
      transformArtwork({ ...artwork, sizes: artworkData.sizes }),
      'Artwork created successfully',
      HttpStatus.CREATED
    )
  } catch (error) {
    const duration = Date.now() - startTime
    const session = await getServerSession(authOptions)
    logApiRequest(request, 'POST', '/api/artworks', HttpStatus.INTERNAL_SERVER_ERROR, duration, session?.user?.id)
    
    if (error instanceof ApiErrorClass) {
      throw error
    }
    
    throw new ApiErrorClass(
      'Failed to create artwork',
      ApiErrorCode.DATABASE_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
})
