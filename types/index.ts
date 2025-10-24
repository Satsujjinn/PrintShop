/**
 * Type definitions for the art gallery application
 * Created by Leon Jordaan
 */

export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  price: number
  imageUrl: string
  featured: boolean
  created_at: string
  updated_at: string
}

export interface ArtworkFilters {
  search?: string
  featured?: boolean
}

export interface ArtworkSortOptions {
  sortBy?: 'created_at' | 'title' | 'artist' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface ArtworkListResponse {
  artworks: Artwork[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CreateArtworkInput {
  title: string
  artist: string
  description: string
  price: number
  featured?: boolean
  image: File
}

export interface UpdateArtworkInput {
  id: string
  title?: string
  artist?: string
  description?: string
  price?: number
  featured?: boolean
  image?: File
}

export interface VisitorRecord {
  id: string
  ipHash: string
  userAgent: string
  firstSeen: string
  lastSeen: string
  visits: number
  lastPath: string
  lastReferrer: string | null
  country: string | null
}

export interface VisitorSummary {
  totalVisits: number
  uniqueVisitors: number
  visitorsLast24h: number
  lastUpdated: string
}
