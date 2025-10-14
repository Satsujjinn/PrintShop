/**
 * Common validation schemas
 * Created by Leon Jordaan
 */

import { z } from 'zod'

/**
 * ID validation schema (can be string or number)
 */
export const idSchema = z.union([
  z.string().regex(/^\d+$/, 'Invalid ID format').transform(Number),
  z.number().int().positive('ID must be positive'),
])

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
})

/**
 * Sort schema
 */
export const sortSchema = z.object({
  sortBy: z.string().min(1, 'Sort field is required'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  start: z.string().datetime('Invalid start date'),
  end: z.string().datetime('Invalid end date'),
}).refine(data => new Date(data.start) <= new Date(data.end), {
  message: 'Start date must be before or equal to end date',
})

/**
 * Search schema
 */
export const searchSchema = z.object({
  query: z.string().max(200, 'Search query too long').optional(),
  fields: z.array(z.string()).optional(),
})

/**
 * File upload schema
 */
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z.number().int().min(1, 'File size must be positive').max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string().refine(type => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    return allowedTypes.includes(type)
  }, 'Invalid file type'),
})

/**
 * Coordinates schema
 */
export const coordinatesSchema = z.object({
  lat: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  lng: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
})

/**
 * Color schema
 */
export const colorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  rgb: z.object({
    r: z.number().int().min(0).max(255),
    g: z.number().int().min(0).max(255),
    b: z.number().int().min(0).max(255),
  }).optional(),
})

/**
 * Currency schema
 */
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])

/**
 * Language schema
 */
export const languageSchema = z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'])

/**
 * Country schema
 */
export const countrySchema = z.enum(['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'JP', 'CN'])

/**
 * Phone number schema
 */
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(15, 'Phone number too long')

/**
 * URL schema
 */
export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')

/**
 * Slug schema
 */
export const slugSchema = z.string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(1, 'Slug is required')
  .max(200, 'Slug too long')

/**
 * Tag schema
 */
export const tagSchema = z.string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag too long')
  .regex(/^[a-zA-Z0-9\s-_]+$/, 'Tag contains invalid characters')
  .transform(tag => tag.trim().toLowerCase())

/**
 * Tags array schema
 */
export const tagsSchema = z.array(tagSchema)
  .max(10, 'Too many tags (maximum 10)')
  .transform(tags => Array.from(new Set(tags))) // Remove duplicates

/**
 * Metadata schema
 */
export const metadataSchema = z.record(
  z.string().min(1, 'Metadata key cannot be empty'),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
)

/**
 * API response schema
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().min(1, 'Error message is required'),
  details: z.record(z.unknown()).optional(),
  code: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

/**
 * Success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

// Type exports
export type IDInput = z.infer<typeof idSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SortInput = z.infer<typeof sortSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type CoordinatesInput = z.infer<typeof coordinatesSchema>
export type ColorInput = z.infer<typeof colorSchema>
export type TagsInput = z.infer<typeof tagsSchema>
export type MetadataInput = z.infer<typeof metadataSchema>
export type ApiResponseInput = z.infer<typeof apiResponseSchema>
export type ErrorResponseInput = z.infer<typeof errorResponseSchema>
export type SuccessResponseInput = z.infer<typeof successResponseSchema>
