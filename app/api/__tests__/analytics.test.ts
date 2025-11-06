/**
 * Tests for analytics API routes
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as TRACK_POST, GET as TRACK_GET } from '../analytics/track/route'
import { GET as VISITORS_GET, POST as VISITORS_POST } from '../analytics/visitors/route'
import { createSessionToken, buildSessionCookie } from '@/lib/auth'
import { trackVisitor } from '@/lib/analytics'

describe('POST /api/analytics/track', () => {
  beforeEach(() => {
    process.env.ANALYTICS_SECRET = 'test-secret'
  })

  it('should track visitor with IP and user agent', async () => {
    const request = new NextRequest('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ path: '/test' }),
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    })

    const response = await TRACK_POST(request)
    expect(response.status).toBe(204)
  })

  it('should handle missing headers gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await TRACK_POST(request)
    expect(response.status).toBe(204)
  })

  it('should handle invalid JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await TRACK_POST(request)
    expect(response.status).toBe(204)
  })

  it('should reject GET requests', async () => {
    const response = await TRACK_GET()
    expect(response.status).toBe(405)
  })
})

describe('GET /api/analytics/visitors', () => {
  beforeEach(async () => {
    process.env.AUTH_SECRET = 'test-secret'
    process.env.ANALYTICS_SECRET = 'test-secret'
    // Clear analytics data
    await trackVisitor({ ip: '192.168.1.1', userAgent: 'Test', path: '/' })
  })

  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/analytics/visitors', {
      method: 'GET',
    })

    const response = await VISITORS_GET(request)
    expect(response.status).toBe(401)
  })

  it('should return visitor data with valid session', async () => {
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const request = new NextRequest('http://localhost:3000/api/analytics/visitors', {
      method: 'GET',
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await VISITORS_GET(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('summary')
    expect(data).toHaveProperty('visitors')
    expect(data.summary).toHaveProperty('totalVisits')
    expect(data.summary).toHaveProperty('uniqueVisitors')
  })

  it('should reject POST requests', async () => {
    const response = await VISITORS_POST()
    expect(response.status).toBe(405)
  })
})

