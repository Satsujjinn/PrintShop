/**
 * Order validation schemas
 * Created by Leon Jordaan
 */

import { z } from 'zod'

/**
 * Address schema
 */
export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required').max(255, 'Address line 1 too long'),
  line2: z.string().max(255, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state: z.string().min(1, 'State is required').max(100, 'State name too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
  country: z.string().length(2, 'Country must be a 2-letter code').toUpperCase(),
  name: z.string().max(255, 'Name too long').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
})

/**
 * Order item schema
 */
export const orderItemSchema = z.object({
  artworkId: z.number().int().positive('Artwork ID must be positive'),
  artworkTitle: z.string().min(1, 'Artwork title is required').max(255, 'Title too long'),
  artworkArtist: z.string().min(1, 'Artist name is required').max(255, 'Artist name too long'),
  sizeName: z.string().min(1, 'Size name is required').max(100, 'Size name too long'),
  sizeDimensions: z.string().min(1, 'Size dimensions are required').max(100, 'Dimensions too long'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high'),
  unitPrice: z.number().min(0.01, 'Unit price must be positive').max(10000, 'Unit price too high'),
  totalPrice: z.number().min(0.01, 'Total price must be positive').max(100000, 'Total price too high'),
})

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  stripeSessionId: z.string().min(1, 'Stripe session ID is required').optional(),
  customerEmail: z.string().email('Invalid email address').max(255, 'Email too long'),
  customerName: z.string().max(255, 'Name too long').optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  totalAmount: z.number().min(0.01, 'Total amount must be positive').max(100000, 'Total amount too high'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required').max(50, 'Too many items'),
  shippingMethod: z.string().max(100, 'Shipping method name too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
})

/**
 * Update order schema
 */
export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  trackingNumber: z.string().max(100, 'Tracking number too long').optional(),
  shippingMethod: z.string().max(100, 'Shipping method too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
})

/**
 * Order filters schema
 */
export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  customerEmail: z.string().email('Invalid email format').optional(),
  dateRange: z.object({
    start: z.string().datetime('Invalid start date'),
    end: z.string().datetime('Invalid end date'),
  }).refine(data => new Date(data.start) <= new Date(data.end), {
    message: 'Start date must be before or equal to end date',
  }).optional(),
  minAmount: z.number().min(0, 'Minimum amount must be non-negative').optional(),
  maxAmount: z.number().min(0, 'Maximum amount must be non-negative').optional(),
  search: z.string().max(200, 'Search query too long').optional(),
})

/**
 * Order sort schema
 */
export const orderSortSchema = z.object({
  sortBy: z.enum(['created_at', 'updated_at', 'total_amount', 'status', 'customer_email']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Get orders query schema
 */
export const getOrdersQuerySchema = orderFiltersSchema
  .merge(orderSortSchema)
  .extend({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })

/**
 * Order ID parameter schema
 */
export const orderIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid order ID').transform(Number),
})

/**
 * Stripe webhook schema
 */
export const stripeWebhookSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  type: z.string().min(1, 'Event type is required'),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  livemode: z.boolean(),
  created: z.number().int().positive(),
})

// Type exports
export type AddressInput = z.infer<typeof addressSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>
export type OrderSortInput = z.infer<typeof orderSortSchema>
export type GetOrdersQueryInput = z.infer<typeof getOrdersQuerySchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>
