/**
 * Utility functions
 * Created by Leon Jordaan
 */

import { Artwork, ArtworkFilters, ArtworkSortOptions } from '@/types'

/**
 * Filter and sort artworks
 */
export function filterAndSortArtworks(
  artworks: Artwork[],
  filters: ArtworkFilters & ArtworkSortOptions
): Artwork[] {
  let result = [...artworks]

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(
      (artwork) =>
        artwork.title.toLowerCase().includes(searchLower) ||
        artwork.artist.toLowerCase().includes(searchLower) ||
        artwork.description.toLowerCase().includes(searchLower)
    )
  }

  // Apply featured filter
  if (filters.featured) {
    result = result.filter((artwork) => artwork.featured)
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'

  result.sort((a, b) => {
    let aVal: any = a[sortBy]
    let bVal: any = b[sortBy]

    // Handle string comparisons
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return result
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

