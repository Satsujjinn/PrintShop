/**
 * Tests for database functions
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllArtworks,
  addArtwork,
  updateArtwork,
  deleteArtwork,
  getArtworkById,
  saveArtworks,
} from '../db'
import { Artwork } from '@/types'

describe('Database operations', () => {
  beforeEach(async () => {
    // Reset the in-memory cache before each test
    await saveArtworks([])
  })

  describe('getAllArtworks', () => {
    it('should return empty array when no artworks exist', async () => {
      const artworks = await getAllArtworks()
      expect(artworks).toEqual([])
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await addArtwork(artwork)
      const artworks = await getAllArtworks()
      expect(artworks).toHaveLength(1)
      expect(artworks[0]).toEqual(artwork)
    })
  })

  describe('addArtwork', () => {
    it('should add a new artwork', async () => {
      const artwork: Artwork = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: 'https://example.com/image.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const result = await addArtwork(artwork)
      expect(result).toEqual(artwork)
      
      const artworks = await getAllArtworks()
      expect(artworks).toHaveLength(1)
      expect(artworks[0]).toEqual(artwork)
    })

    it('should add multiple artworks', async () => {
      const artwork1: Artwork = {
        id: '1',
        title: 'Test 1',
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: 'https://example.com/image1.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const artwork2: Artwork = {
        id: '2',
        title: 'Test 2',
        artist: 'Artist',
        description: 'Description',
        price: 200,
        imageUrl: 'https://example.com/image2.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      await addArtwork(artwork1)
      await addArtwork(artwork2)
      
      const artworks = await getAllArtworks()
      expect(artworks).toHaveLength(2)
    })
  })

  describe('getArtworkById', () => {
    it('should return null for non-existent artwork', async () => {
      const artwork = await getArtworkById('non-existent')
      expect(artwork).toBeNull()
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await addArtwork(artwork)
      
      const result = await getArtworkById('test-id')
      expect(result).toEqual(artwork)
    })
  })

  describe('updateArtwork', () => {
    it('should return null for non-existent artwork', async () => {
      const result = await updateArtwork('non-existent', { title: 'New Title' })
      expect(result).toBeNull()
    })

    it('should update artwork fields', async () => {
      const artwork: Artwork = {
        id: 'test-id',
        title: 'Original Title',
        artist: 'Original Artist',
        description: 'Original Description',
        price: 100,
        imageUrl: 'https://example.com/image.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await addArtwork(artwork)
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updated = await updateArtwork('test-id', {
        title: 'New Title',
        price: 200,
      })
      
      expect(updated).not.toBeNull()
      expect(updated?.title).toBe('New Title')
      expect(updated?.price).toBe(200)
      expect(updated?.artist).toBe('Original Artist') // Should remain unchanged
      expect(updated?.updated_at).not.toBe(artwork.updated_at)
    })

    it('should update updated_at timestamp', async () => {
      const artwork: Artwork = {
        id: 'test-id',
        title: 'Test',
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: 'https://example.com/image.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: '2024-01-01T00:00:00Z',
      }
      await addArtwork(artwork)
      
      const updated = await updateArtwork('test-id', { title: 'New Title' })
      expect(updated?.updated_at).not.toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('deleteArtwork', () => {
    it('should return false for non-existent artwork', async () => {
      const result = await deleteArtwork('non-existent')
      expect(result).toBe(false)
    })

    it('should delete artwork', async () => {
      const artwork: Artwork = {
        id: 'test-id',
        title: 'Test',
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: 'https://example.com/image.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await addArtwork(artwork)
      
      const result = await deleteArtwork('test-id')
      expect(result).toBe(true)
      
      const artworks = await getAllArtworks()
      expect(artworks).toHaveLength(0)
    })

    it('should delete correct artwork from multiple', async () => {
      const artwork1: Artwork = {
        id: '1',
        title: 'Test 1',
        artist: 'Artist',
        description: 'Description',
        price: 100,
        imageUrl: 'https://example.com/image1.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const artwork2: Artwork = {
        id: '2',
        title: 'Test 2',
        artist: 'Artist',
        description: 'Description',
        price: 200,
        imageUrl: 'https://example.com/image2.jpg',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      await addArtwork(artwork1)
      await addArtwork(artwork2)
      
      await deleteArtwork('1')
      
      const artworks = await getAllArtworks()
      expect(artworks).toHaveLength(1)
      expect(artworks[0].id).toBe('2')
    })
  })
})

