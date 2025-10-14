/**
 * User related types and interfaces
 * Created by Leon Jordaan
 */

/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * User interface
 */
export interface User {
  /** Unique identifier */
  readonly id: string
  /** User email address */
  email: string
  /** User role */
  role: UserRole
  /** User display name */
  name?: string
  /** Profile image URL */
  image?: string
  /** Account creation timestamp */
  readonly createdAt: string
  /** Last update timestamp */
  readonly updatedAt: string
  /** Email verification status */
  emailVerified?: boolean
  /** Last login timestamp */
  lastLoginAt?: string
}

/**
 * Database user representation
 */
export interface DatabaseUser {
  readonly id: number
  email: string
  password_hash: string
  role: string
  name?: string
  image?: string
  readonly created_at: string
  readonly updated_at: string
  email_verified?: boolean
  last_login_at?: string
}

/**
 * User registration payload
 */
export interface RegisterUserPayload {
  email: string
  password: string
  name?: string
}

/**
 * User login payload
 */
export interface LoginUserPayload {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  name?: string
  email?: string
  image?: string
  currentPassword?: string
  newPassword?: string
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequestPayload {
  email: string
}

/**
 * Password reset payload
 */
export interface PasswordResetPayload {
  token: string
  newPassword: string
}

/**
 * User session interface
 */
export interface UserSession {
  user: {
    id: string
    email: string
    role: string
    name?: string
    image?: string
  }
  expires: string
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    orderUpdates: boolean
    newsletter: boolean
  }
  currency: 'USD' | 'EUR' | 'GBP'
  language: 'en' | 'es' | 'fr' | 'de'
}
