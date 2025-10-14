/**
 * Main types and interfaces for ArtPrints application
 * Created by Leon Jordaan
 */

// Re-export all types for easy importing
export * from './artwork'
export * from './user'
export * from './order'
export * from './cart'
export * from './api'
export * from './database'
export * from './stripe'
export * from './common'

// Specific exports for commonly used types
export type { 
  Artwork, 
  ArtworkSize, 
  ArtworkFilters, 
  ArtworkSortOptions,
  PaginatedArtworks 
} from './artwork'

export type { 
  CartItem, 
  CartState, 
  CartActions 
} from './cart'

export type { 
  User, 
  UserRole, 
  UserSession 
} from './user'

export type { 
  Order, 
  OrderItem, 
  OrderStatus 
} from './order'

export type { 
  ApiResponse, 
  ApiError, 
  PaginatedApiResponse 
} from './api'
