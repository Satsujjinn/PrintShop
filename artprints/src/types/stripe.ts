/**
 * Stripe related types and interfaces
 * Created by Leon Jordaan
 */

import type { CartItem } from './cart'

/**
 * Stripe checkout session creation payload
 */
export interface CreateCheckoutSessionPayload {
  /** Items to checkout */
  items: CartItem[]
  /** Customer email */
  customerEmail?: string
  /** Success URL */
  successUrl?: string
  /** Cancel URL */
  cancelUrl?: string
  /** Metadata */
  metadata?: Record<string, string>
}

/**
 * Stripe line item for checkout
 */
export interface StripeLineItem {
  /** Price data */
  price_data: {
    /** Currency code */
    currency: string
    /** Product data */
    product_data: {
      /** Product name */
      name: string
      /** Product description */
      description?: string
      /** Product images */
      images?: string[]
      /** Metadata */
      metadata?: Record<string, string>
    }
    /** Unit amount in cents */
    unit_amount: number
  }
  /** Quantity */
  quantity: number
}

/**
 * Stripe shipping option
 */
export interface StripeShippingOption {
  /** Shipping rate data */
  shipping_rate_data: {
    /** Type of shipping rate */
    type: 'fixed_amount'
    /** Fixed amount */
    fixed_amount: {
      /** Amount in cents */
      amount: number
      /** Currency */
      currency: string
    }
    /** Display name */
    display_name: string
    /** Delivery estimate */
    delivery_estimate?: {
      /** Minimum delivery time */
      minimum: {
        /** Unit */
        unit: 'business_day' | 'day' | 'hour' | 'month' | 'week'
        /** Value */
        value: number
      }
      /** Maximum delivery time */
      maximum: {
        /** Unit */
        unit: 'business_day' | 'day' | 'hour' | 'month' | 'week'
        /** Value */
        value: number
      }
    }
  }
}

/**
 * Stripe webhook event types
 */
export enum StripeWebhookEvents {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed',
  CHARGE_SUCCEEDED = 'charge.succeeded',
  CHARGE_FAILED = 'charge.failed',
  REFUND_CREATED = 'charge.refund.created',
}

/**
 * Stripe webhook payload
 */
export interface StripeWebhookPayload {
  /** Event ID */
  id: string
  /** Event type */
  type: StripeWebhookEvents
  /** Event data */
  data: {
    /** Event object */
    object: Record<string, unknown>
  }
  /** Whether this is a live event */
  livemode: boolean
  /** Event creation timestamp */
  created: number
  /** Pending webhooks */
  pending_webhooks: number
}

/**
 * Stripe checkout session
 */
export interface StripeCheckoutSession {
  /** Session ID */
  id: string
  /** Customer email */
  customer_email?: string
  /** Payment status */
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  /** Total amount */
  amount_total: number
  /** Currency */
  currency: string
  /** Metadata */
  metadata: Record<string, string>
  /** Shipping details */
  shipping_details?: {
    /** Shipping address */
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    /** Recipient name */
    name: string
  }
  /** Customer details */
  customer_details?: {
    /** Customer email */
    email: string
    /** Customer name */
    name?: string
    /** Customer phone */
    phone?: string
  }
}

/**
 * Stripe payment intent
 */
export interface StripePaymentIntent {
  /** Payment intent ID */
  id: string
  /** Amount */
  amount: number
  /** Currency */
  currency: string
  /** Status */
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  /** Client secret */
  client_secret: string
  /** Metadata */
  metadata: Record<string, string>
}

/**
 * Stripe refund
 */
export interface StripeRefund {
  /** Refund ID */
  id: string
  /** Amount refunded */
  amount: number
  /** Currency */
  currency: string
  /** Reason */
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  /** Status */
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  /** Metadata */
  metadata: Record<string, string>
}

/**
 * Stripe error
 */
export interface StripeError {
  /** Error type */
  type: string
  /** Error code */
  code?: string
  /** Error message */
  message: string
  /** Parameter that caused the error */
  param?: string
  /** Decline code */
  decline_code?: string
}

/**
 * Stripe configuration
 */
export interface StripeConfig {
  /** Publishable key */
  publishableKey: string
  /** Secret key */
  secretKey: string
  /** Webhook endpoint secret */
  webhookSecret: string
  /** API version */
  apiVersion: string
  /** Allowed countries for shipping */
  allowedCountries: string[]
  /** Default currency */
  defaultCurrency: string
  /** Payment methods */
  paymentMethods: string[]
}
