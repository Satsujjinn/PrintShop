/**
 * React Query hook for fetching artworks
 * Created by Leon Jordaan
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { ArtworkFilters, ArtworkSortOptions, PaginationOptions, ArtworkListResponse } from '@/types'

interface UseArtworksOptions extends ArtworkFilters, ArtworkSortOptions, PaginationOptions {}

async function fetchArtworks(options: UseArtworksOptions): Promise<ArtworkListResponse> {
  const params = new URLSearchParams()
  
  if (options.search) params.set('search', options.search)
  if (options.featured) params.set('featured', 'true')
  if (options.sortBy) params.set('sortBy', options.sortBy)
  if (options.sortOrder) params.set('sortOrder', options.sortOrder)
  if (options.page) params.set('page', options.page.toString())
  if (options.limit) params.set('limit', options.limit.toString())
  
  const response = await fetch(`/api/artworks?${params.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch artworks')
  }
  
  return response.json()
}

export function useArtworks(options: UseArtworksOptions = {}) {
  return useQuery({
    queryKey: ['artworks', options],
    queryFn: () => fetchArtworks(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - cache for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  })
}

