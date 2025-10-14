/**
 * User validation schemas
 * Created by Leon Jordaan
 */

import { z } from 'zod'

/**
 * Password validation schema
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim()

/**
 * User registration schema
 */
export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim()
    .optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

/**
 * User login schema
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim()
    .optional(),
  email: emailSchema.optional(),
  image: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL too long')
    .optional(),
  currentPassword: z.string()
    .min(1, 'Current password is required')
    .optional(),
  newPassword: passwordSchema.optional(),
}).refine(data => {
  // If changing password, current password is required
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: 'Current password is required when setting a new password',
  path: ['currentPassword'],
})

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

/**
 * User role schema
 */
export const userRoleSchema = z.enum(['user', 'admin', 'moderator'])

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    orderUpdates: z.boolean().default(true),
    newsletter: z.boolean().default(false),
  }).default({}),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
})

/**
 * Admin user creation schema
 */
export const createAdminUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim(),
  role: userRoleSchema.default('admin'),
})

/**
 * User query filters schema
 */
export const userFiltersSchema = z.object({
  role: userRoleSchema.optional(),
  emailVerified: z.boolean().optional(),
  search: z.string().max(200, 'Search query too long').optional(),
  dateRange: z.object({
    start: z.string().datetime('Invalid start date'),
    end: z.string().datetime('Invalid end date'),
  }).refine(data => new Date(data.start) <= new Date(data.end), {
    message: 'Start date must be before end date',
  }).optional(),
})

/**
 * User sort schema
 */
export const userSortSchema = z.object({
  sortBy: z.enum(['created_at', 'updated_at', 'email', 'name', 'role', 'last_login_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Get users query schema
 */
export const getUsersQuerySchema = userFiltersSchema
  .merge(userSortSchema)
  .extend({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })

/**
 * User ID parameter schema
 */
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid user ID').transform(Number),
})

// Type exports
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
export type UserSortInput = z.infer<typeof userSortSchema>
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>
export type UserIdInput = z.infer<typeof userIdSchema>
