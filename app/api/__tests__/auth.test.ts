/**
 * Tests for auth API routes
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as LOGIN_POST, GET as LOGIN_GET } from '../auth/login/route'
import { POST as LOGOUT_POST, GET as LOGOUT_GET } from '../auth/logout/route'
import { GET as ME_GET, POST as ME_POST } from '../auth/me/route'
import { hashPassword, createSessionToken, buildSessionCookie } from '@/lib/auth'

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.ADMIN_PASSWORD_HASH = await hashPassword('admin123')
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should reject missing email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'admin123' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await LOGIN_POST(request)
    expect(response.status).toBe(400)
  })

  it('should reject missing password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await LOGIN_POST(request)
    expect(response.status).toBe(400)
  })

  it('should reject invalid credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrong' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await LOGIN_POST(request)
    expect(response.status).toBe(401)
  })

  it('should accept valid credentials and set session cookie', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await LOGIN_POST(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    const cookies = response.headers.get('set-cookie')
    expect(cookies).toContain('ps_session')
  })

  it('should reject GET requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'GET',
    })

    const response = await LOGIN_GET()
    expect(response.status).toBe(405)
  })
})

describe('POST /api/auth/logout', () => {
  it('should clear session cookie', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    })

    const response = await LOGOUT_POST(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    const cookies = response.headers.get('set-cookie')
    expect(cookies).toContain('ps_session=')
  })

  it('should reject GET requests', async () => {
    const response = await LOGOUT_GET()
    expect(response.status).toBe(405)
  })
})

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should return unauthenticated when no session', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    })

    const response = await ME_GET(request)
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.authenticated).toBe(false)
  })

  it('should return authenticated user with valid session', async () => {
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await ME_GET(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.authenticated).toBe(true)
    expect(data.user.role).toBe('admin')
  })

  it('should reject POST requests', async () => {
    const response = await ME_POST()
    expect(response.status).toBe(405)
  })
})

