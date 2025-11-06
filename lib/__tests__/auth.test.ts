/**
 * Tests for authentication functions
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  validateRequestSession,
  buildSessionCookie,
  buildExpiredSessionCookie,
} from '../auth'
import { NextRequest } from 'next/server'

describe('Password hashing', () => {
  it('should hash a password', async () => {
    const hash = await hashPassword('testpassword')
    expect(hash).toBeTruthy()
    expect(hash).toContain(':')
    expect(hash.split(':')).toHaveLength(2)
  })

  it('should verify correct password', async () => {
    const hash = await hashPassword('testpassword')
    const isValid = await verifyPassword('testpassword', hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('testpassword')
    const isValid = await verifyPassword('wrongpassword', hash)
    expect(isValid).toBe(false)
  })

  it('should reject invalid hash format', async () => {
    const isValid = await verifyPassword('testpassword', 'invalid-hash')
    expect(isValid).toBe(false)
  })

  it('should generate different hashes for same password', async () => {
    const hash1 = await hashPassword('testpassword')
    const hash2 = await hashPassword('testpassword')
    expect(hash1).not.toBe(hash2) // Different salts
  })
})

describe('Admin credentials verification', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.ADMIN_PASSWORD_HASH = await hashPassword('admin123')
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should verify correct admin credentials', async () => {
    const isValid = await verifyAdminCredentials('admin@example.com', 'admin123')
    expect(isValid).toBe(true)
  })

  it('should reject incorrect email', async () => {
    const isValid = await verifyAdminCredentials('wrong@example.com', 'admin123')
    expect(isValid).toBe(false)
  })

  it('should reject incorrect password', async () => {
    const isValid = await verifyAdminCredentials('admin@example.com', 'wrongpassword')
    expect(isValid).toBe(false)
  })

  it('should handle email case insensitivity', async () => {
    const isValid = await verifyAdminCredentials('ADMIN@EXAMPLE.COM', 'admin123')
    expect(isValid).toBe(true)
  })

  it('should trim email whitespace', async () => {
    const isValid = await verifyAdminCredentials('  admin@example.com  ', 'admin123')
    expect(isValid).toBe(true)
  })

  it('should throw error when ADMIN_EMAIL is not set', async () => {
    delete process.env.ADMIN_EMAIL
    await expect(verifyAdminCredentials('admin@example.com', 'admin123')).rejects.toThrow()
  })

  it('should throw error when ADMIN_PASSWORD_HASH is not set', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    delete process.env.ADMIN_PASSWORD_HASH
    await expect(verifyAdminCredentials('admin@example.com', 'admin123')).rejects.toThrow()
  })
})

describe('Session token management', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key'
  })

  it('should create a session token', () => {
    const token = createSessionToken()
    expect(token).toBeTruthy()
    expect(token).toContain('.')
    expect(token.split('.')).toHaveLength(2)
  })

  it('should verify a valid session token', () => {
    const token = createSessionToken()
    const payload = verifySessionToken(token)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('admin')
    expect(payload?.iat).toBeTypeOf('number')
    expect(payload?.exp).toBeTypeOf('number')
  })

  it('should reject null or undefined token', () => {
    expect(verifySessionToken(null)).toBeNull()
    expect(verifySessionToken(undefined)).toBeNull()
  })

  it('should reject invalid token format', () => {
    expect(verifySessionToken('invalid-token')).toBeNull()
    expect(verifySessionToken('invalid.token.format.extra')).toBeNull()
  })

  it('should reject token with invalid signature', () => {
    const token = createSessionToken()
    const [body] = token.split('.')
    const fakeToken = `${body}.invalid-signature`
    expect(verifySessionToken(fakeToken)).toBeNull()
  })

  it('should reject expired token', () => {
    // Create a token with expired timestamp
    const expiredPayload = {
      sub: 'admin',
      iat: Date.now() - 100000,
      exp: Date.now() - 1000, // Expired 1 second ago
    }
    const secret = process.env.AUTH_SECRET!
    const serialized = JSON.stringify(expiredPayload)
    const body = Buffer.from(serialized).toString('base64url')
    const signature = require('crypto')
      .createHmac('sha256', secret)
      .update(body)
      .digest('base64url')
    const expiredToken = `${body}.${signature}`
    
    expect(verifySessionToken(expiredToken)).toBeNull()
  })

  it('should reject token with invalid payload structure', () => {
    const secret = process.env.AUTH_SECRET!
    const invalidPayload = { invalid: 'data' }
    const serialized = JSON.stringify(invalidPayload)
    const body = Buffer.from(serialized).toString('base64url')
    const signature = require('crypto')
      .createHmac('sha256', secret)
      .update(body)
      .digest('base64url')
    const invalidToken = `${body}.${signature}`
    
    expect(verifySessionToken(invalidToken)).toBeNull()
  })
})

describe('Session cookie building', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    process.env.NODE_ENV = 'test'
  })

  it('should build session cookie', () => {
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)
    expect(cookie.name).toBe('ps_session')
    expect(cookie.value).toBe(token)
    expect(cookie.httpOnly).toBe(true)
    expect(cookie.sameSite).toBe('strict')
    expect(cookie.path).toBe('/')
    expect(cookie.maxAge).toBeGreaterThan(0)
  })

  it('should set secure flag in production', () => {
    process.env.NODE_ENV = 'production'
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)
    expect(cookie.secure).toBe(true)
  })

  it('should not set secure flag in development', () => {
    process.env.NODE_ENV = 'development'
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)
    expect(cookie.secure).toBe(false)
  })

  it('should build expired session cookie', () => {
    const cookie = buildExpiredSessionCookie()
    expect(cookie.name).toBe('ps_session')
    expect(cookie.value).toBe('')
    expect(cookie.maxAge).toBe(0)
    expect(cookie.httpOnly).toBe(true)
  })
})

describe('Request session validation', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should validate session from request cookies', () => {
    const token = createSessionToken()
    const cookies = new Map()
    cookies.set('ps_session', { value: token })
    
    const request = {
      cookies: {
        get: (name: string) => cookies.get(name),
      },
    } as unknown as NextRequest
    
    const validation = validateRequestSession(request)
    expect(validation.valid).toBe(true)
    expect(validation.payload).not.toBeNull()
  })

  it('should reject request without session cookie', () => {
    const request = {
      cookies: {
        get: () => undefined,
      },
    } as unknown as NextRequest
    
    const validation = validateRequestSession(request)
    expect(validation.valid).toBe(false)
    expect(validation.payload).toBeNull()
  })
})

