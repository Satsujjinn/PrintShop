/**
 * Custom hooks for artwork data fetching with React Query
 * Created by Leon Jordaan
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { 
  Artwork, 
  PaginatedArtworks, 
  ArtworkFilters,
  ArtworkSortOptions 
} from '@/types'

// Query keys for React Query
export const artworkKeys = {
  all: ['artworks'] as const,
  lists: () => [...artworkKeys.all, 'list'] as const,
  list: (filters: ArtworkFilters & ArtworkSortOptions & { page: number; limit: number }) => 
    [...artworkKeys.lists(), filters] as const,
  details: () => [...artworkKeys.all, 'detail'] as const,
  detail: (id: string) => [...artworkKeys.details(), id] as const,
}

/**
 * Fetch artworks with filters, pagination, and sorting
 */
export function useArtworks(
  params: {
    page?: number
    limit?: number
    includeInactive?: boolean
    sortBy?: 'created_at' | 'updated_at' | 'title' | 'artist' | 'price' | 'featured'
    sortOrder?: 'asc' | 'desc'
  } & ArtworkFilters = { sortBy: 'created_at', sortOrder: 'desc' }
) {
  const {
    page = 1,
    limit = 20,
    includeInactive = false,
    sortBy = 'created_at',
    sortOrder = 'desc',
    ...filters
  } = params

  return useQuery({
    queryKey: artworkKeys.list({ page, limit, sortBy, sortOrder, ...filters }),
    queryFn: async (): Promise<PaginatedArtworks> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(includeInactive && { includeInactive: 'true' }),
      })

      // Add filters to search params
      if (filters.category) searchParams.set('category', filters.category)
      if (filters.featured !== undefined) searchParams.set('featured', filters.featured.toString())
      if (filters.search) searchParams.set('search', filters.search)
      if (filters.artist) searchParams.set('artist', filters.artist)
      if (filters.tags?.length) {
        filters.tags.forEach(tag => searchParams.append('tags', tag))
      }
      if (filters.priceRange) {
        searchParams.set('minPrice', filters.priceRange.min.toString())
        searchParams.set('maxPrice', filters.priceRange.max.toString())
      }

      const response = await fetch(`/api/artworks?${searchParams}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch artworks')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch artworks')
      }

      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch a single artwork by ID
 */
export function useArtwork(id: string) {
  return useQuery({
    queryKey: artworkKeys.detail(id),
    queryFn: async (): Promise<Artwork> => {
      const response = await fetch(`/api/artworks/${id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch artwork')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch artwork')
      }

      return data.data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - artworks don't change often
  })
}


/**
 * Prefetch an artwork for better UX
 */
export function usePrefetchArtwork() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: artworkKeys.detail(id),
      queryFn: async (): Promise<Artwork> => {
        const response = await fetch(`/api/artworks/${id}`)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch artwork')
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch artwork')
        }

        return data.data
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }
}
