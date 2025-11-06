/**
 * Tests for artworks API routes
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../artworks/route'
import { GET as GET_ID, PATCH, DELETE } from '../artworks/[id]/route'
import { getAllArtworks, addArtwork, saveArtworks } from '@/lib/db'
import { createSessionToken, buildSessionCookie } from '@/lib/auth'
import { Artwork } from '@/types'

// Mock Vercel Blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.vercel-storage.com/test.jpg' }),
  del: vi.fn().mockResolvedValue(undefined),
  list: vi.fn().mockResolvedValue({ blobs: [] }),
}))

describe('GET /api/artworks', () => {
  beforeEach(async () => {
    await saveArtworks([])
  })

  it('should return empty array when no artworks', async () => {
    const request = new NextRequest('http://localhost:3000/api/artworks')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.artworks).toEqual([])
    expect(data.total).toBe(0)
  })

  it('should return all artworks', async () => {
    const artwork: Artwork = {
      id: '1',
      title: 'Test',
      artist: 'Artist',
      description: 'Description',
      price: 100,
      imageUrl: 'https://example.com/image.jpg',
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    await addArtwork(artwork)

    const request = new NextRequest('http://localhost:3000/api/artworks')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.artworks).toHaveLength(1)
    expect(data.total).toBe(1)
  })

  it('should filter by search query', async () => {
    await addArtwork({
      id: '1',
      title: 'Sunset',
      artist: 'John',
      description: 'Beautiful',
      price: 100,
      imageUrl: 'https://example.com/1.jpg',
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    })
    await addArtwork({
      id: '2',
      title: 'Mountain',
      artist: 'Jane',
      description: 'Amazing',
      price: 200,
      imageUrl: 'https://example.com/2.jpg',
      featured: false,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    })

    const request = new NextRequest('http://localhost:3000/api/artworks?search=Sunset')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.artworks).toHaveLength(1)
    expect(data.artworks[0].title).toBe('Sunset')
  })

  it('should filter by featured', async () => {
    await addArtwork({
      id: '1',
      title: 'Featured Art',
      artist: 'Artist',
      description: 'Description',
      price: 100,
      imageUrl: 'https://example.com/1.jpg',
      featured: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    })
    await addArtwork({
      id: '2',
      title: 'Regular Art',
      artist: 'Artist',
      description: 'Description',
      price: 200,
      imageUrl: 'https://example.com/2.jpg',
      featured: false,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    })

    const request = new NextRequest('http://localhost:3000/api/artworks?featured=true')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.artworks).toHaveLength(1)
    expect(data.artworks[0].featured).toBe(true)
  })

  it('should paginate results', async () => {
    // Add multiple artworks
    for (let i = 0; i < 5; i++) {
      await addArtwork({
        id: `${i}`,
        title: `Artwork ${i}`,
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: `https://example.com/${i}.jpg`,
        featured: false,
        created_at: `2024-01-0${i + 1}T00:00:00Z`,
        updated_at: `2024-01-0${i + 1}T00:00:00Z`,
      })
    }

    const request = new NextRequest('http://localhost:3000/api/artworks?page=1&limit=2')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.artworks).toHaveLength(2)
    expect(data.page).toBe(1)
    expect(data.limit).toBe(2)
    expect(data.total).toBe(5)
    expect(data.hasMore).toBe(true)
  })
})

describe('POST /api/artworks', () => {
  beforeEach(async () => {
    await saveArtworks([])
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should require authentication', async () => {
    const formData = new FormData()
    formData.append('title', 'Test')
    formData.append('artist', 'Artist')
    formData.append('description', 'Description')
    formData.append('price', '100')
    formData.append('image', new File([''], 'test.jpg'))

    const request = new NextRequest('http://localhost:3000/api/artworks', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should create artwork with valid session', async () => {
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const formData = new FormData()
    formData.append('title', 'Test Artwork')
    formData.append('artist', 'Test Artist')
    formData.append('description', 'Test Description')
    formData.append('price', '100')
    formData.append('featured', 'false')
    formData.append('image', new File(['image content'], 'test.jpg', { type: 'image/jpeg' }))

    const request = new NextRequest('http://localhost:3000/api/artworks', {
      method: 'POST',
      body: formData,
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    
    const data = await response.json()
    expect(data.title).toBe('Test Artwork')
    expect(data.artist).toBe('Test Artist')
    expect(data.price).toBe(100)
  })

  it('should reject missing required fields', async () => {
    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const formData = new FormData()
    formData.append('title', 'Test')

    const request = new NextRequest('http://localhost:3000/api/artworks', {
      method: 'POST',
      body: formData,
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

describe('GET /api/artworks/[id]', () => {
  beforeEach(async () => {
    await saveArtworks([])
  })

  it('should return 404 for non-existent artwork', async () => {
    const request = new NextRequest('http://localhost:3000/api/artworks/non-existent')
    const response = await GET_ID(request, { params: Promise.resolve({ id: 'non-existent' }) })
    
    expect(response.status).toBe(404)
  })

  it('should return artwork by ID', async () => {
    const artwork: Artwork = {
      id: 'test-id',
      title: 'Test',
      artist: 'Artist',
      description: 'Description',
      price: 100,
      imageUrl: 'https://example.com/image.jpg',
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    await addArtwork(artwork)

    const request = new NextRequest('http://localhost:3000/api/artworks/test-id')
    const response = await GET_ID(request, { params: Promise.resolve({ id: 'test-id' }) })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBe('test-id')
  })
})

describe('PATCH /api/artworks/[id]', () => {
  beforeEach(async () => {
    await saveArtworks([])
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/artworks/test-id', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'test-id' }) })
    expect(response.status).toBe(401)
  })

  it('should update artwork with valid session', async () => {
    const artwork: Artwork = {
      id: 'test-id',
      title: 'Original',
      artist: 'Artist',
      description: 'Description',
      price: 100,
      imageUrl: 'https://example.com/image.jpg',
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    await addArtwork(artwork)

    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const formData = new FormData()
    formData.append('title', 'Updated Title')

    const request = new NextRequest('http://localhost:3000/api/artworks/test-id', {
      method: 'PATCH',
      body: formData,
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'test-id' }) })
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.title).toBe('Updated Title')
  })
})

describe('DELETE /api/artworks/[id]', () => {
  beforeEach(async () => {
    await saveArtworks([])
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/artworks/test-id', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) })
    expect(response.status).toBe(401)
  })

  it('should delete artwork with valid session', async () => {
    const artwork: Artwork = {
      id: 'test-id',
      title: 'Test',
      artist: 'Artist',
      description: 'Description',
      price: 100,
      imageUrl: 'https://example.com/image.jpg',
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    await addArtwork(artwork)

    const token = createSessionToken()
    const cookie = buildSessionCookie(token)

    const request = new NextRequest('http://localhost:3000/api/artworks/test-id', {
      method: 'DELETE',
      headers: {
        cookie: `${cookie.name}=${cookie.value}`,
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) })
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)

    const artworks = await getAllArtworks()
    expect(artworks).toHaveLength(0)
  })
})

