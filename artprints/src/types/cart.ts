/**
 * Shopping cart related types and interfaces
 * Created by Leon Jordaan
 */

import type { Artwork } from './artwork'

/**
 * Cart item interface extending artwork with cart-specific properties
 */
export interface CartItem extends Artwork {
  /** Selected size for this cart item */
  selectedSize: string
  /** Quantity in cart */
  quantity: number
  /** Final price after size multiplier */
  finalPrice: number
}

/**
 * Cart state interface
 */
export interface CartState {
  /** Items in the cart */
  items: CartItem[]
  /** Whether cart sidebar is open */
  isOpen: boolean
  /** Loading state for cart operations */
  isLoading: boolean
  /** Error message if any */
  error: string | null
}

/**
 * Add to cart payload
 */
export interface AddToCartPayload {
  artwork: Artwork
  selectedSize: string
  quantity?: number
}

/**
 * Update cart item payload
 */
export interface UpdateCartItemPayload {
  artworkId: string
  selectedSize: string
  quantity: number
}

/**
 * Remove from cart payload
 */
export interface RemoveFromCartPayload {
  artworkId: string
  selectedSize: string
}

/**
 * Cart summary
 */
export interface CartSummary {
  /** Total number of items */
  totalItems: number
  /** Subtotal before taxes and shipping */
  subtotal: number
  /** Tax amount */
  tax: number
  /** Shipping cost */
  shipping: number
  /** Final total */
  total: number
  /** Applied discount */
  discount?: {
    code: string
    amount: number
    type: 'percentage' | 'fixed'
  }
}

/**
 * Shipping option
 */
export interface ShippingOption {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Description */
  description?: string
  /** Price in cents */
  price: number
  /** Estimated delivery time */
  estimatedDays: {
    min: number
    max: number
  }
  /** Whether this is the default option */
  isDefault?: boolean
}

/**
 * Cart validation result
 */
export interface CartValidation {
  /** Whether cart is valid */
  isValid: boolean
  /** Validation errors */
  errors: CartValidationError[]
  /** Warnings (non-blocking) */
  warnings: CartValidationWarning[]
}

/**
 * Cart validation error
 */
export interface CartValidationError {
  /** Error type */
  type: 'out_of_stock' | 'price_changed' | 'unavailable' | 'invalid_quantity'
  /** Item that caused the error */
  itemId: string
  /** Error message */
  message: string
  /** Current valid value (if applicable) */
  currentValue?: unknown
}

/**
 * Cart validation warning
 */
export interface CartValidationWarning {
  /** Warning type */
  type: 'price_increase' | 'limited_stock' | 'shipping_delay'
  /** Item that caused the warning */
  itemId: string
  /** Warning message */
  message: string
  /** Additional context */
  context?: Record<string, unknown>
}

/**
 * Cart persistence state
 */
export interface CartPersistenceState {
  /** Persisted cart items */
  items: CartItem[]
  /** Last update timestamp */
  lastUpdated: string
  /** Session identifier */
  sessionId?: string
}

/**
 * Cart actions interface
 */
export interface CartActions {
  /** Add item to cart */
  addItem: (payload: AddToCartPayload) => void
  /** Remove item from cart */
  removeItem: (payload: RemoveFromCartPayload) => void
  /** Update item quantity */
  updateItem: (payload: UpdateCartItemPayload) => void
  /** Clear entire cart */
  clearCart: () => void
  /** Toggle cart sidebar */
  toggleCart: () => void
  /** Open cart sidebar */
  openCart: () => void
  /** Close cart sidebar */
  closeCart: () => void
  /** Validate cart contents */
  validateCart: () => Promise<CartValidation>
  /** Get cart summary */
  getCartSummary: () => CartSummary
  /** Apply discount code */
  applyDiscount: (code: string) => Promise<boolean>
  /** Remove discount */
  removeDiscount: () => void
}
