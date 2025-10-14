/**
 * Custom hooks for artwork data fetching with React Query
 * Created by Leon Jordaan
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { 
  Artwork, 
  PaginatedArtworks, 
  CreateArtworkPayload, 
  UpdateArtworkPayload,
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
  } & ArtworkFilters & ArtworkSortOptions = {}
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
 * Create a new artwork (admin only)
 */
export function useCreateArtwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (artwork: CreateArtworkPayload): Promise<Artwork> => {
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artwork),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create artwork')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create artwork')
      }

      return data.data
    },
    onSuccess: (newArtwork) => {
      // Invalidate artwork lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() })
      
      // Optimistically add to cache
      queryClient.setQueryData(artworkKeys.detail(newArtwork.id), newArtwork)
      
      toast.success('Artwork created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create artwork')
    },
  })
}

/**
 * Update an existing artwork (admin only)
 */
export function useUpdateArtwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: UpdateArtworkPayload 
    }): Promise<Artwork> => {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update artwork')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update artwork')
      }

      return data.data
    },
    onSuccess: (updatedArtwork) => {
      // Update the specific artwork in cache
      queryClient.setQueryData(artworkKeys.detail(updatedArtwork.id), updatedArtwork)
      
      // Invalidate artwork lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() })
      
      toast.success('Artwork updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update artwork')
    },
  })
}

/**
 * Delete an artwork (admin only)
 */
export function useDeleteArtwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete artwork')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete artwork')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: artworkKeys.detail(deletedId) })
      
      // Invalidate artwork lists to refetch without deleted item
      queryClient.invalidateQueries({ queryKey: artworkKeys.lists() })
      
      toast.success('Artwork deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete artwork')
    },
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
