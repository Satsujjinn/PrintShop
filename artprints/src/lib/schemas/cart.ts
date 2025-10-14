/**
 * Cart validation schemas
 * Created by Leon Jordaan
 */

import { z } from 'zod'

/**
 * Cart item schema
 */
export const cartItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  price: z.number().min(0.01, 'Price must be positive'),
  image: z.string().url('Invalid image URL'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sizes: z.array(z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Size name is required'),
    dimensions: z.string().min(1, 'Dimensions are required'),
    price_multiplier: z.number().min(0.1).max(10),
    priceMultiplier: z.number().min(0.1).max(10).optional(),
  })),
  selectedSize: z.string().min(1, 'Size selection is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high'),
  finalPrice: z.number().min(0.01, 'Final price must be positive'),
})

/**
 * Add to cart schema
 */
export const addToCartSchema = z.object({
  artwork: z.object({
    id: z.string().min(1, 'Artwork ID is required'),
    title: z.string().min(1, 'Title is required'),
    artist: z.string().min(1, 'Artist is required'),
    price: z.number().min(0.01, 'Price must be positive'),
    image: z.string().url('Invalid image URL'),
    description: z.string().min(1, 'Description is required'),
    sizes: z.array(z.object({
      name: z.string().min(1, 'Size name is required'),
      dimensions: z.string().min(1, 'Dimensions are required'),
      price_multiplier: z.number().min(0.1).max(10),
    })).min(1, 'At least one size is required'),
  }),
  selectedSize: z.string().min(1, 'Size selection is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high').default(1),
})

/**
 * Update cart item schema
 */
export const updateCartItemSchema = z.object({
  artworkId: z.string().min(1, 'Artwork ID is required'),
  selectedSize: z.string().min(1, 'Size selection is required'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative').max(99, 'Quantity too high'),
})

/**
 * Remove from cart schema
 */
export const removeFromCartSchema = z.object({
  artworkId: z.string().min(1, 'Artwork ID is required'),
  selectedSize: z.string().min(1, 'Size selection is required'),
})

/**
 * Cart validation schema
 */
export const cartValidationSchema = z.object({
  items: z.array(cartItemSchema).max(50, 'Too many items in cart'),
})

/**
 * Shipping option schema
 */
export const shippingOptionSchema = z.object({
  id: z.string().min(1, 'Shipping option ID is required'),
  name: z.string().min(1, 'Shipping option name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  estimatedDays: z.object({
    min: z.number().int().min(1, 'Minimum days must be at least 1'),
    max: z.number().int().min(1, 'Maximum days must be at least 1'),
  }).refine(data => data.min <= data.max, {
    message: 'Minimum days must be less than or equal to maximum days',
  }),
  isDefault: z.boolean().optional(),
})

/**
 * Discount code schema
 */
export const discountCodeSchema = z.object({
  code: z.string().min(1, 'Discount code is required').max(50, 'Discount code too long'),
})

// Type exports
export type CartItemInput = z.infer<typeof cartItemSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
export type CartValidationInput = z.infer<typeof cartValidationSchema>
export type ShippingOptionInput = z.infer<typeof shippingOptionSchema>
export type DiscountCodeInput = z.infer<typeof discountCodeSchema>
