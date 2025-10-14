/**
 * Simple JSON-based database for artwork metadata
 * Created by Leon Jordaan
 */

import { Artwork } from '@/types'
import { put, list, del } from '@vercel/blob'

const DB_FILENAME = 'artworks-db.json'

// Temporary in-memory storage for development
let artworksCache: Artwork[] = []

/**
 * Get all artworks from the database
 */
export async function getAllArtworks(): Promise<Artwork[]> {
  try {
    // For development, use in-memory cache
    return artworksCache
    
    // Original blob-based approach (commented for now)
    // const blobs = await list({ prefix: DB_FILENAME })
    // 
    // if (blobs.blobs.length === 0) {
    //   return []
    // }
    //
    // const dbBlob = blobs.blobs[0]
    // const response = await fetch(dbBlob.url)
    // const data = await response.json()
    // 
    // return data.artworks || []
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return []
  }
}

/**
 * Save artworks to the database
 */
export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  // For development, update in-memory cache
  artworksCache = artworks
  
  // Original blob-based approach (commented for now)
  // const data = JSON.stringify({ artworks, updated_at: new Date().toISOString() })
  // 
  // await put(DB_FILENAME, data, {
  //   access: 'public',
  //   contentType: 'application/json',
  // })
}

/**
 * Add a new artwork
 */
export async function addArtwork(artwork: Artwork): Promise<Artwork> {
  const artworks = await getAllArtworks()
  artworks.push(artwork)
  await saveArtworks(artworks)
  return artwork
}

/**
 * Update an existing artwork
 */
export async function updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork | null> {
  const artworks = await getAllArtworks()
  const index = artworks.findIndex(a => a.id === id)
  
  if (index === -1) {
    return null
  }
  
  artworks[index] = { ...artworks[index], ...updates, updated_at: new Date().toISOString() }
  await saveArtworks(artworks)
  
  return artworks[index]
}

/**
 * Delete an artwork
 */
export async function deleteArtwork(id: string): Promise<boolean> {
  const artworks = await getAllArtworks()
  const artwork = artworks.find(a => a.id === id)
  
  if (!artwork) {
    return false
  }
  
  // Delete the image from blob storage
  try {
    await del(artwork.imageUrl)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
  
  // Remove from database
  const filtered = artworks.filter(a => a.id !== id)
  await saveArtworks(filtered)
  
  return true
}

/**
 * Get a single artwork by ID
 */
export async function getArtworkById(id: string): Promise<Artwork | null> {
  const artworks = await getAllArtworks()
  return artworks.find(a => a.id === id) || null
}

