/**
 * API related types and interfaces
 * Created by Leon Jordaan
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean
  /** Response data */
  data?: T
  /** Error message if request failed */
  error?: string
  /** Additional error details */
  details?: Record<string, unknown>
  /** Response message */
  message?: string
  /** Response timestamp */
  timestamp?: string
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number
    /** Items per page */
    limit: number
    /** Total number of items */
    total: number
    /** Total number of pages */
    totalPages: number
    /** Whether there's a next page */
    hasNext: boolean
    /** Whether there's a previous page */
    hasPrev: boolean
  }
}

/**
 * API error details
 */
export interface ApiError {
  /** Error code */
  code: string
  /** Human-readable error message */
  message: string
  /** Field that caused the error (for validation errors) */
  field?: string
  /** Additional error context */
  context?: Record<string, unknown>
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiResponse {
  /** List of validation errors */
  errors: Array<{
    field: string
    message: string
    code: string
    value?: unknown
  }>
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  /** File URL */
  url: string
  /** File key/identifier */
  key: string
  /** Original filename */
  filename: string
  /** File size in bytes */
  size: number
  /** MIME type */
  type: string
  /** Upload timestamp */
  uploadedAt: string
}

/**
 * Request metadata
 */
export interface RequestMetadata {
  /** Request ID for tracking */
  requestId: string
  /** User ID if authenticated */
  userId?: string
  /** IP address */
  ip?: string
  /** User agent */
  userAgent?: string
  /** Request timestamp */
  timestamp: string
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Requests remaining in current window */
  remaining: number
  /** Total requests allowed per window */
  limit: number
  /** Time window in seconds */
  window: number
  /** Timestamp when window resets */
  resetTime: number
}

/**
 * API endpoints enumeration
 */
export enum ApiEndpoints {
  // Artworks
  ARTWORKS = '/api/artworks',
  ARTWORK_BY_ID = '/api/artworks/:id',
  
  // Authentication
  AUTH_LOGIN = '/api/auth/signin',
  AUTH_LOGOUT = '/api/auth/signout',
  AUTH_SESSION = '/api/auth/session',
  
  // Orders
  ORDERS = '/api/orders',
  ORDER_BY_ID = '/api/orders/:id',
  
  // Checkout
  CHECKOUT = '/api/checkout',
  
  // File uploads
  UPLOAD = '/api/upload',
  
  // Database initialization
  INIT_DB = '/api/init',
  
  // Health check
  HEALTH = '/api/health',
}

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string
  /** Default timeout in milliseconds */
  timeout: number
  /** Default headers */
  headers: Record<string, string>
  /** Whether to include credentials */
  withCredentials: boolean
  /** Retry configuration */
  retry: {
    attempts: number
    delay: number
    backoff: 'linear' | 'exponential'
  }
}

/**
 * Request options
 */
export interface RequestOptions {
  /** Request headers */
  headers?: Record<string, string>
  /** Request timeout */
  timeout?: number
  /** Whether to retry on failure */
  retry?: boolean
  /** Cache strategy */
  cache?: 'no-cache' | 'force-cache' | 'default'
  /** Next.js revalidation */
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

/**
 * API client interface
 */
export interface ApiClient {
  /** GET request */
  get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>
  /** POST request */
  post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
  /** PUT request */
  put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
  /** PATCH request */
  patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>
  /** DELETE request */
  delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>
}
