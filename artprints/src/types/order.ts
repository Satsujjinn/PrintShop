/**
 * Order related types and interfaces
 * Created by Leon Jordaan
 */

/**
 * Order status enumeration
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Address interface
 */
export interface Address {
  /** Street address line 1 */
  line1: string
  /** Street address line 2 */
  line2?: string
  /** City */
  city: string
  /** State/Province */
  state: string
  /** Postal/ZIP code */
  postalCode: string
  /** Country code (ISO 3166-1 alpha-2) */
  country: string
  /** Full name for delivery */
  name?: string
  /** Phone number */
  phone?: string
}

/**
 * Order item interface
 */
export interface OrderItem {
  /** Unique identifier */
  readonly id: number
  /** Order ID this item belongs to */
  readonly orderId: number
  /** Artwork ID */
  artworkId: number
  /** Artwork title (snapshot) */
  artworkTitle: string
  /** Artist name (snapshot) */
  artworkArtist: string
  /** Selected size name */
  sizeName: string
  /** Size dimensions */
  sizeDimensions: string
  /** Quantity ordered */
  quantity: number
  /** Unit price at time of order */
  unitPrice: number
  /** Total price for this item */
  totalPrice: number
  /** Creation timestamp */
  readonly createdAt: string
}

/**
 * Database order item representation
 */
export interface DatabaseOrderItem {
  readonly id: number
  order_id: number
  artwork_id: number
  artwork_title: string
  artwork_artist: string
  size_name: string
  size_dimensions: string
  quantity: number
  unit_price: number
  total_price: number
  readonly created_at: string
}

/**
 * Order interface
 */
export interface Order {
  /** Unique identifier */
  readonly id: number
  /** Stripe session ID */
  stripeSessionId?: string
  /** Customer email */
  customerEmail: string
  /** Customer name */
  customerName?: string
  /** Shipping address */
  shippingAddress?: Address
  /** Billing address */
  billingAddress?: Address
  /** Total order amount */
  totalAmount: number
  /** Order status */
  status: OrderStatus
  /** Order items */
  items: OrderItem[]
  /** Tracking number */
  trackingNumber?: string
  /** Shipping method */
  shippingMethod?: string
  /** Notes */
  notes?: string
  /** Creation timestamp */
  readonly createdAt: string
  /** Last update timestamp */
  readonly updatedAt: string
}

/**
 * Database order representation
 */
export interface DatabaseOrder {
  readonly id: number
  stripe_session_id?: string
  customer_email: string
  customer_name?: string
  shipping_address?: Record<string, unknown>
  billing_address?: Record<string, unknown>
  total_amount: number
  status: string
  tracking_number?: string
  shipping_method?: string
  notes?: string
  readonly created_at: string
  readonly updated_at: string
}

/**
 * Order creation payload
 */
export interface CreateOrderPayload {
  stripeSessionId?: string
  customerEmail: string
  customerName?: string
  shippingAddress?: Address
  billingAddress?: Address
  totalAmount: number
  items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>[]
  shippingMethod?: string
  notes?: string
}

/**
 * Order update payload
 */
export interface UpdateOrderPayload {
  status?: OrderStatus
  trackingNumber?: string
  shippingMethod?: string
  notes?: string
  shippingAddress?: Address
  billingAddress?: Address
}

/**
 * Order filter options
 */
export interface OrderFilters {
  status?: OrderStatus
  customerEmail?: string
  dateRange?: {
    start: string
    end: string
  }
  minAmount?: number
  maxAmount?: number
  search?: string
}

/**
 * Order sort options
 */
export type OrderSortBy = 
  | 'created_at'
  | 'updated_at'
  | 'total_amount'
  | 'status'
  | 'customer_email'

export interface OrderSortOptions {
  sortBy: OrderSortBy
  sortOrder: 'asc' | 'desc'
}

/**
 * Paginated orders response
 */
export interface PaginatedOrders {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Order summary statistics
 */
export interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<OrderStatus, number>
  recentOrders: Order[]
}
