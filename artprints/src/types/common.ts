/**
 * Common types and utilities used throughout the application
 * Created by Leon Jordaan
 */

/**
 * Generic ID type - can be string or number
 */
export type ID = string | number

/**
 * Timestamp type - ISO 8601 string
 */
export type Timestamp = string

/**
 * Optional properties utility type
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P]
}

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Currency codes (ISO 4217)
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
}

/**
 * Language codes (ISO 639-1)
 */
export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  JA = 'ja',
  ZH = 'zh',
}

/**
 * Country codes (ISO 3166-1 alpha-2)
 */
export enum Country {
  US = 'US',
  CA = 'CA',
  GB = 'GB',
  AU = 'AU',
  DE = 'DE',
  FR = 'FR',
  IT = 'IT',
  ES = 'ES',
  NL = 'NL',
  BE = 'BE',
  JP = 'JP',
  CN = 'CN',
}

/**
 * Generic loading state
 */
export interface LoadingState {
  /** Whether currently loading */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Loading progress (0-100) */
  progress?: number
}

/**
 * Generic async state
 */
export interface AsyncState<T> extends LoadingState {
  /** The data */
  data: T | null
  /** Last successful fetch timestamp */
  lastFetch?: Timestamp
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number
  /** Items per page */
  limit: number
  /** Sort field */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page */
  page: number
  /** Items per page */
  limit: number
  /** Total items */
  total: number
  /** Total pages */
  totalPages: number
  /** Has next page */
  hasNext: boolean
  /** Has previous page */
  hasPrev: boolean
}

/**
 * Search parameters
 */
export interface SearchParams {
  /** Search query */
  query: string
  /** Search fields */
  fields?: string[]
  /** Filters */
  filters?: Record<string, unknown>
}

/**
 * File information
 */
export interface FileInfo {
  /** File name */
  name: string
  /** File size in bytes */
  size: number
  /** MIME type */
  type: string
  /** Last modified timestamp */
  lastModified: number
  /** File extension */
  extension: string
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Aspect ratio */
  aspectRatio: number
}

/**
 * Color information
 */
export interface Color {
  /** Color name */
  name: string
  /** Hex color code */
  hex: string
  /** RGB values */
  rgb: {
    r: number
    g: number
    b: number
  }
  /** HSL values */
  hsl: {
    h: number
    s: number
    l: number
  }
}

/**
 * Coordinates
 */
export interface Coordinates {
  /** Latitude */
  lat: number
  /** Longitude */
  lng: number
}

/**
 * Time range
 */
export interface TimeRange {
  /** Start time */
  start: Timestamp
  /** End time */
  end: Timestamp
}

/**
 * Generic key-value pair
 */
export interface KeyValue<T = string> {
  key: string
  value: T
}

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * Generic event
 */
export interface Event<T = unknown> {
  /** Event type */
  type: string
  /** Event payload */
  payload: T
  /** Event timestamp */
  timestamp: Timestamp
  /** Event metadata */
  metadata?: Record<string, unknown>
}

/**
 * Generic error with context
 */
export interface AppError extends Error {
  /** Error code */
  code: string
  /** HTTP status code */
  statusCode?: number
  /** Error context */
  context?: Record<string, unknown>
  /** Whether error is user-facing */
  isPublic?: boolean
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  /** Flag name */
  name: string
  /** Whether flag is enabled */
  enabled: boolean
  /** Flag description */
  description?: string
  /** Rollout percentage (0-100) */
  rollout?: number
}

/**
 * Theme configuration
 */
export interface Theme {
  /** Theme name */
  name: string
  /** Primary colors */
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  /** Typography */
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
  }
  /** Spacing scale */
  spacing: Record<string, string>
  /** Border radius scale */
  borderRadius: Record<string, string>
}
