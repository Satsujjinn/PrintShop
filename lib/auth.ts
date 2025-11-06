/**
 * Authentication helpers for protecting admin functionality.
 * Session tokens are HMAC signed to avoid server-side storage.
 */

import { createHmac, randomBytes, timingSafeEqual, scrypt as scryptCallback } from 'crypto'
import { promisify } from 'util'
import type { NextRequest } from 'next/server'

const scrypt = promisify(scryptCallback)

const SESSION_COOKIE_NAME = 'ps_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours
const PASSWORD_KEY_LENGTH = 64

export interface SessionPayload {
  sub: string // User ID or 'admin' for admin sessions
  role: 'user' | 'admin'
  iat: number
  exp: number
}

export interface SessionValidation {
  valid: boolean
  payload: SessionPayload | null
}

/**
 * Thin wrapper around the cookie store so the helpers work
 * with both NextRequest.cookies and next/headers cookies().
 */
export interface CookieReader {
  get: (name: string) => { value: string } | undefined
}

/**
 * Derive the configured admin email.
 */
function getAdminEmail(): string {
  const value = process.env.ADMIN_EMAIL
  if (!value) {
    throw new Error('ADMIN_EMAIL environment variable is not set')
  }
  return value.trim().toLowerCase()
}

/**
 * Derive the configured admin password hash.
 */
function getAdminPasswordHash(): string {
  const value = process.env.ADMIN_PASSWORD_HASH
  if (!value) {
    throw new Error('ADMIN_PASSWORD_HASH environment variable is not set')
  }
  return value
}

/**
 * Derive the session secret used to sign tokens.
 */
function getAuthSecret(): string {
  const value = process.env.AUTH_SECRET
  if (!value) {
    throw new Error('AUTH_SECRET environment variable is not set')
  }
  return value
}

/**
 * Constant time comparison helper.
 */
function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'utf8')
  const bBuffer = Buffer.from(b, 'utf8')

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

/**
 * Hash a password using scrypt. Exported so a CLI helper can reuse it.
 */
export async function hashPassword(password: string, salt = randomBytes(16).toString('hex')): Promise<string> {
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Validate a plaintext password against a stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  if (!salt || !key) {
    return false
  }

  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer
  const keyBuffer = Buffer.from(key, 'hex')

  if (derivedKey.length !== keyBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, keyBuffer)
}

/**
 * Validate the provided credentials against the configured admin account.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  try {
    const storedEmail = getAdminEmail()
    const storedHash = getAdminPasswordHash()

    const normalizedEmail = email.trim().toLowerCase()
    if (!safeCompare(normalizedEmail, storedEmail)) {
      return false
    }

    return verifyPassword(password, storedHash)
  } catch (error) {
    console.error('Authentication configuration error:', error)
    throw error
  }
}

/**
 * Build a signed session token for admin.
 */
export function createSessionToken(): string {
  return createUserSessionToken('admin', 'admin')
}

/**
 * Build a signed session token for a user.
 */
export function createUserSessionToken(userId: string, role: 'user' | 'admin' = 'user'): string {
  const payload: SessionPayload = {
    sub: userId,
    role,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  }

  const secret = getAuthSecret()
  const serialized = JSON.stringify(payload)
  const body = Buffer.from(serialized).toString('base64url')
  const signature = createHmac('sha256', secret).update(body).digest('base64url')

  return `${body}.${signature}`
}

/**
 * Verify a signed session token.
 */
export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null
  }

  const [body, signature] = token.split('.')
  if (!body || !signature) {
    return null
  }

  const secret = getAuthSecret()
  const expectedSignature = createHmac('sha256', secret).update(body).digest('base64url')

  if (!safeCompare(signature, expectedSignature)) {
    return null
  }

  let payload: SessionPayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!payload.sub || typeof payload.exp !== 'number' || !payload.role) {
    return null
  }

  if (Date.now() > payload.exp) {
    return null
  }

  return payload
}

/**
 * Read and validate the session from a cookie store.
 */
export function validateSessionFromCookies(cookieStore: CookieReader | undefined): SessionValidation {
  if (!cookieStore) {
    return { valid: false, payload: null }
  }

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const payload = verifySessionToken(token || null)

  return {
    valid: Boolean(payload),
    payload: payload || null,
  }
}

/**
 * Pull the session token directly from a request object.
 */
export function validateRequestSession(request: NextRequest): SessionValidation {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const payload = verifySessionToken(token || null)

  return {
    valid: Boolean(payload),
    payload: payload || null,
  }
}

/**
 * Cookie options used for session management.
 */
export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  }
}

/**
 * Expire the session cookie.
 */
export function buildExpiredSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  }
}

