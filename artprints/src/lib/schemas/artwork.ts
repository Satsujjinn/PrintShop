/**
 * Artwork validation schemas
 * Created by Leon Jordaan
 */

import { z } from 'zod'

/**
 * Artwork size schema
 */
export const artworkSizeSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Size name is required').max(100, 'Size name too long'),
  dimensions: z.string().min(1, 'Dimensions are required').max(100, 'Dimensions too long'),
  price_multiplier: z.number().min(0.1, 'Price multiplier must be at least 0.1').max(10, 'Price multiplier too high'),
  priceMultiplier: z.number().min(0.1).max(10).optional(), // For backwards compatibility
})

/**
 * Create artwork schema
 */
export const createArtworkSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .trim(),
  artist: z.string()
    .min(1, 'Artist name is required')
    .max(255, 'Artist name too long')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description too long')
    .trim(),
  base_price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(10000, 'Price too high')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  image_url: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL too long'),
  image_key: z.string()
    .max(255, 'Image key too long')
    .optional(),
  category: z.string()
    .max(100, 'Category too long')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag too long'))
    .max(10, 'Too many tags')
    .optional(),
  is_featured: z.boolean().optional().default(false),
  sizes: z.array(artworkSizeSchema)
    .min(1, 'At least one size is required')
    .max(10, 'Too many sizes'),
})

/**
 * Update artwork schema
 */
export const updateArtworkSchema = createArtworkSchema.partial().extend({
  is_active: z.boolean().optional(),
})

/**
 * Artwork filters schema
 */
export const artworkFiltersSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine(data => data.min <= data.max, {
    message: 'Min price must be less than or equal to max price',
  }).optional(),
  artist: z.string().optional(),
  search: z.string().max(200, 'Search query too long').optional(),
})

/**
 * Artwork sort schema
 */
export const artworkSortSchema = z.object({
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'artist', 'price', 'featured']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(20),
})

/**
 * Get artworks query schema
 */
export const getArtworksQuerySchema = artworkFiltersSchema
  .merge(artworkSortSchema)
  .merge(paginationSchema)
  .extend({
    includeInactive: z.boolean().optional().default(false),
  })

/**
 * Artwork ID parameter schema
 */
export const artworkIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid artwork ID').transform(Number),
})

// Type exports
export type ArtworkSizeInput = z.infer<typeof artworkSizeSchema>
export type CreateArtworkInput = z.infer<typeof createArtworkSchema>
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>
export type ArtworkFiltersInput = z.infer<typeof artworkFiltersSchema>
export type ArtworkSortInput = z.infer<typeof artworkSortSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type GetArtworksQueryInput = z.infer<typeof getArtworksQuerySchema>
export type ArtworkIdInput = z.infer<typeof artworkIdSchema>
