/**
 * Checkout API route with enhanced error handling and validation
 * Created by Leon Jordaan
 */

import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
  ApiErrorCode,
  HttpStatus,
  ApiErrorClass,
  logApiRequest,
  defaultRateLimiter,
  getClientIP,
} from '@/lib/utils/api-helpers'

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

// Validation schema for checkout request
const checkoutRequestSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1, 'Item ID is required'),
    title: z.string().min(1, 'Item title is required'),
    artist: z.string().min(1, 'Artist name is required'),
    selectedSize: z.string().min(1, 'Size selection is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high'),
    price: z.number().min(0.01, 'Price must be positive'),
    image: z.string().url('Invalid image URL'),
  })).min(1, 'At least one item is required').max(50, 'Too many items in cart'),
  customerEmail: z.string().email('Invalid email'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
})

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>

/**
 * Validate cart items and check for any issues
 */
function validateCartItems(items: CheckoutRequest['items']): void {
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  if (totalValue > 50000) { // $500 limit
    throw new ApiErrorClass(
      'Cart total exceeds maximum allowed amount',
      ApiErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST
    )
  }

  if (totalValue < 1) {
    throw new ApiErrorClass(
      'Cart total must be at least $1.00',
      ApiErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST
    )
  }

  // Check for duplicate items (same artwork and size)
  const itemKeys = new Set<string>()
  for (const item of items) {
    const key = `${item.id}-${item.selectedSize}`
    if (itemKeys.has(key)) {
      throw new ApiErrorClass(
        'Duplicate items found in cart',
        ApiErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST
      )
    }
    itemKeys.add(key)
  }
}

/**
 * Create Stripe line items from cart items
 */
function createStripeLineItems(items: CheckoutRequest['items']): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.title} - ${item.selectedSize}`,
        description: `by ${item.artist}`,
        images: [item.image],
        metadata: {
          artwork_id: item.id,
          size: item.selectedSize,
          artist: item.artist,
        },
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))
}

/**
 * Get shipping options configuration
 */
function getShippingOptions(): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 1000, currency: 'usd' }, // $10.00
        display_name: 'Standard Shipping',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 5 },
          maximum: { unit: 'business_day', value: 10 },
        },
        tax_behavior: 'exclusive',
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 2500, currency: 'usd' }, // $25.00
        display_name: 'Express Shipping',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 2 },
          maximum: { unit: 'business_day', value: 3 },
        },
        tax_behavior: 'exclusive',
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 4500, currency: 'usd' }, // $45.00
        display_name: 'Overnight Shipping',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 1 },
          maximum: { unit: 'business_day', value: 1 },
        },
        tax_behavior: 'exclusive',
      },
    },
  ]
}

/**
 * POST /api/checkout - Create Stripe checkout session
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now()
  const clientIP = getClientIP(request)

  try {
    // Rate limiting
    if (defaultRateLimiter.isRateLimited(clientIP)) {
      throw new ApiErrorClass(
        'Too many checkout requests. Please try again later.',
        ApiErrorCode.RATE_LIMITED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new ApiErrorClass(
        'Payment system configuration error',
        ApiErrorCode.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new ApiErrorClass(
        'Site configuration error',
        ApiErrorCode.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }

    // Validate request body
    const validation = await validateRequestBody(request, checkoutRequestSchema)
    
    if (!validation.success) {
      return validation.response
    }

    const { items, customerEmail, successUrl, cancelUrl } = validation.data

    // Validate cart items
    validateCartItems(items)

    // Create Stripe line items
    const lineItems = createStripeLineItems(items)

    // Prepare session metadata
    const sessionMetadata = {
      customer_ip: clientIP,
      created_at: new Date().toISOString(),
      items_count: items.length.toString(),
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
      items_data: JSON.stringify(items.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.price,
      }))),
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK'],
      },
      shipping_options: getShippingOptions(),
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      metadata: sessionMetadata,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
      automatic_tax: {
        enabled: true,
      },
    })

    if (!session.url) {
      throw new ApiErrorClass(
        'Failed to create checkout session',
        ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        HttpStatus.BAD_GATEWAY
      )
    }

    // Log successful request
    const duration = Date.now() - startTime
    logApiRequest(request, 'POST', '/api/checkout', HttpStatus.OK, duration)

    return createSuccessResponse(
      { 
        url: session.url,
        sessionId: session.id,
        expiresAt: session.expires_at,
      },
      'Checkout session created successfully'
    )

  } catch (error) {
    const duration = Date.now() - startTime
    logApiRequest(request, 'POST', '/api/checkout', HttpStatus.INTERNAL_SERVER_ERROR, duration)

    if (error instanceof ApiErrorClass) {
      throw error
    }

    if (error instanceof Stripe.errors.StripeError) {
      throw new ApiErrorClass(
        `Payment processing error: ${error.message}`,
        ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        HttpStatus.BAD_GATEWAY,
        { 
          stripeCode: error.code,
          stripeType: error.type,
        }
      )
    }

    throw new ApiErrorClass(
      'Failed to create checkout session',
      ApiErrorCode.INTERNAL_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
})
