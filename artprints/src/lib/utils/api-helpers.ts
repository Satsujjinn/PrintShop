/**
 * API helper utilities for error handling and responses
 * Created by Leon Jordaan
 */

import { NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'
import type { ApiResponse, ApiError } from '@/types'

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Custom API error class
 */
export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public code: ApiErrorCode,
    public statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  statusCode: HttpStatus = HttpStatus.OK
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string | ApiErrorClass | Error,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): NextResponse {
  let errorMessage: string
  let errorCode: string | undefined
  let errorContext: Record<string, unknown> | undefined

  if (error instanceof ApiErrorClass) {
    errorMessage = error.message
    errorCode = error.code
    statusCode = error.statusCode
    errorContext = error.context
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorCode = 'INTERNAL_ERROR'
  } else {
    errorMessage = error
  }

  const response: ApiResponse = {
    success: false,
    error: errorMessage,
    details: details || errorContext,
    timestamp: new Date().toISOString(),
  }

  // Add error code if available
  if (errorCode) {
    response.details = { ...response.details, code: errorCode }
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create a validation error response from Zod error
 */
export function createValidationErrorResponse(error: ZodError): NextResponse {
  const validationErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    value: err.input,
  }))

  const response: ApiResponse = {
    success: false,
    error: 'Validation failed',
    details: {
      code: ApiErrorCode.VALIDATION_ERROR,
      errors: validationErrors,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: HttpStatus.UNPROCESSABLE_ENTITY })
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: createValidationErrorResponse(error) }
    }
    return {
      success: false,
      response: createErrorResponse(
        'Invalid JSON in request body',
        HttpStatus.BAD_REQUEST
      ),
    }
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params: Record<string, unknown> = {}
    
    for (const [key, value] of searchParams.entries()) {
      // Handle array parameters (e.g., tags[]=value1&tags[]=value2)
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2)
        if (!params[baseKey]) {
          params[baseKey] = []
        }
        ;(params[baseKey] as unknown[]).push(value)
      } else if (params[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(params[key])) {
          ;(params[key] as unknown[]).push(value)
        } else {
          params[key] = [params[key], value]
        }
      } else {
        // Convert string numbers to actual numbers
        if (/^\d+$/.test(value)) {
          params[key] = parseInt(value, 10)
        } else if (/^\d*\.\d+$/.test(value)) {
          params[key] = parseFloat(value)
        } else if (value === 'true' || value === 'false') {
          params[key] = value === 'true'
        } else {
          params[key] = value
        }
      }
    }

    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: createValidationErrorResponse(error) }
    }
    return {
      success: false,
      response: createErrorResponse(
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST
      ),
    }
  }
}

/**
 * Handle async route errors
 */
export function handleRouteError(error: unknown): NextResponse {
  console.error('Route error:', error)

  if (error instanceof ApiErrorClass) {
    return createErrorResponse(error)
  }

  if (error instanceof ZodError) {
    return createValidationErrorResponse(error)
  }

  if (error instanceof Error) {
    return createErrorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { originalError: error.message }
    )
  }

  return createErrorResponse(
    'An unknown error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR
  )
}

/**
 * Async route wrapper with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleRouteError(error)
    }
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests = new Map<string, number[]>()

  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private maxRequests: number = 100
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []
    
    // Filter out requests outside the window
    const validRequests = requests.filter(time => time > windowStart)
    
    // Check if rate limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return true
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return false
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

/**
 * Default rate limiter instance
 */
export const defaultRateLimiter = new RateLimiter()

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  request: Request,
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  userId?: string
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    statusCode,
    duration,
    userAgent: request.headers.get('user-agent'),
    ip: getClientIP(request),
    userId,
  }

  // In production, you might want to send this to a logging service
  console.log('API Request:', JSON.stringify(logData))
}
