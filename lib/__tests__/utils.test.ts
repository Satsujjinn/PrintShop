/**
 * Tests for utility functions
 * Created by Leon Jordaan
 */

import { describe, it, expect } from 'vitest'
import { filterAndSortArtworks, formatPrice, generateId } from '../utils'
import { Artwork } from '@/types'

describe('filterAndSortArtworks', () => {
  const mockArtworks: Artwork[] = [
    {
      id: '1',
      title: 'Sunset',
      artist: 'John Doe',
      description: 'A beautiful sunset',
      price: 100,
      imageUrl: 'https://example.com/sunset.jpg',
      featured: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Mountain',
      artist: 'Jane Smith',
      description: 'Mountain landscape',
      price: 200,
      imageUrl: 'https://example.com/mountain.jpg',
      featured: false,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'Ocean',
      artist: 'John Doe',
      description: 'Ocean view',
      price: 150,
      imageUrl: 'https://example.com/ocean.jpg',
      featured: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ]

  it('should return all artworks when no filters applied', () => {
    const result = filterAndSortArtworks(mockArtworks, {})
    expect(result).toHaveLength(3)
    expect(result.length).toBe(mockArtworks.length)
    // Check that all artworks are present (order may differ due to default sorting)
    expect(result.map(a => a.id).sort()).toEqual(mockArtworks.map(a => a.id).sort())
  })

  it('should filter by search term in title', () => {
    const result = filterAndSortArtworks(mockArtworks, { search: 'Sunset' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Sunset')
  })

  it('should filter by search term in artist', () => {
    const result = filterAndSortArtworks(mockArtworks, { search: 'Jane' })
    expect(result).toHaveLength(1)
    expect(result[0].artist).toBe('Jane Smith')
  })

  it('should filter by search term in description', () => {
    const result = filterAndSortArtworks(mockArtworks, { search: 'landscape' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Mountain')
  })

  it('should be case-insensitive when searching', () => {
    const result = filterAndSortArtworks(mockArtworks, { search: 'SUNSET' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Sunset')
  })

  it('should filter featured artworks', () => {
    const result = filterAndSortArtworks(mockArtworks, { featured: true })
    expect(result).toHaveLength(2)
    expect(result.every(a => a.featured)).toBe(true)
  })

  it('should sort by price ascending', () => {
    const result = filterAndSortArtworks(mockArtworks, {
      sortBy: 'price',
      sortOrder: 'asc',
    })
    expect(result[0].price).toBe(100)
    expect(result[1].price).toBe(150)
    expect(result[2].price).toBe(200)
  })

  it('should sort by price descending', () => {
    const result = filterAndSortArtworks(mockArtworks, {
      sortBy: 'price',
      sortOrder: 'desc',
    })
    expect(result[0].price).toBe(200)
    expect(result[1].price).toBe(150)
    expect(result[2].price).toBe(100)
  })

  it('should sort by title ascending', () => {
    const result = filterAndSortArtworks(mockArtworks, {
      sortBy: 'title',
      sortOrder: 'asc',
    })
    expect(result[0].title).toBe('Mountain')
    expect(result[1].title).toBe('Ocean')
    expect(result[2].title).toBe('Sunset')
  })

  it('should sort by created_at descending by default', () => {
    const result = filterAndSortArtworks(mockArtworks, {})
    expect(result[0].id).toBe('3')
    expect(result[1].id).toBe('2')
    expect(result[2].id).toBe('1')
  })

  it('should combine search and featured filters', () => {
    const result = filterAndSortArtworks(mockArtworks, {
      search: 'John',
      featured: true,
    })
    expect(result).toHaveLength(2)
    expect(result.every(a => a.featured && a.artist.includes('John'))).toBe(true)
  })

  it('should handle empty array', () => {
    const result = filterAndSortArtworks([], {})
    expect(result).toHaveLength(0)
  })
})

describe('formatPrice', () => {
  it('should format price as USD currency', () => {
    expect(formatPrice(100)).toBe('$100.00')
    expect(formatPrice(99.99)).toBe('$99.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(1000)).toBe('$1,000.00')
  })

  it('should handle decimal prices', () => {
    expect(formatPrice(123.45)).toBe('$123.45')
    expect(formatPrice(0.99)).toBe('$0.99')
  })
})

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('should generate string IDs', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should generate IDs with timestamp and random component', () => {
    const id = generateId()
    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })
})

