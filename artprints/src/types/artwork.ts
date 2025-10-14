/**
 * Artwork related types and interfaces
 * Created by Leon Jordaan
 */

/**
 * Size configuration for an artwork
 */
export interface ArtworkSize {
  /** Unique identifier for the size */
  readonly id?: number
  /** Display name of the size (e.g., "Small", "Medium", "Large") */
  name: string
  /** Dimensions in human-readable format (e.g., "8x10 inches") */
  dimensions: string
  /** Price multiplier relative to base price */
  price_multiplier: number
  /** Alternative property name for backwards compatibility */
  priceMultiplier?: number
}

/**
 * Main artwork interface
 */
export interface Artwork {
  /** Unique identifier */
  readonly id: string
  /** Artwork title */
  title: string
  /** Artist name */
  artist: string
  /** Base price before size multiplier */
  price: number
  /** Main image URL */
  image: string
  /** Detailed description */
  description: string
  /** Category classification */
  category?: string
  /** Searchable tags */
  tags?: string[]
  /** Whether artwork is featured */
  isFeatured?: boolean
  /** Whether artwork is active/visible */
  isActive?: boolean
  /** Available sizes for this artwork */
  sizes: ArtworkSize[]
  /** Creation timestamp */
  readonly createdAt?: string
  /** Last update timestamp */
  readonly updatedAt?: string
}

/**
 * Database artwork representation (snake_case)
 */
export interface DatabaseArtwork {
  readonly id: number
  title: string
  artist: string
  base_price: number
  image_url: string
  image_key?: string
  description: string
  category?: string
  tags?: string[]
  is_featured: boolean
  is_active: boolean
  readonly created_at: string
  readonly updated_at: string
}

/**
 * Artwork creation payload
 */
export interface CreateArtworkPayload {
  title: string
  artist: string
  description: string
  base_price: number
  image_url: string
  image_key?: string
  category?: string
  tags?: string[]
  is_featured?: boolean
  sizes: Omit<ArtworkSize, 'id'>[]
}

/**
 * Artwork update payload
 */
export interface UpdateArtworkPayload {
  title?: string
  artist?: string
  description?: string
  base_price?: number
  image_url?: string
  image_key?: string
  category?: string
  tags?: string[]
  is_featured?: boolean
  is_active?: boolean
  sizes?: Omit<ArtworkSize, 'id'>[]
}

/**
 * Artwork filter options
 */
export interface ArtworkFilters {
  category?: string
  tags?: string[]
  featured?: boolean
  active?: boolean
  priceRange?: {
    min: number
    max: number
  }
  artist?: string
  search?: string
}

/**
 * Artwork sort options
 */
export type ArtworkSortBy = 
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'artist'
  | 'price'
  | 'featured'

export type ArtworkSortOrder = 'asc' | 'desc'

export interface ArtworkSortOptions {
  sortBy: ArtworkSortBy
  sortOrder: ArtworkSortOrder
}

/**
 * Paginated artwork response
 */
export interface PaginatedArtworks {
  artworks: Artwork[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
