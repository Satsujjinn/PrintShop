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
 * Also discovers images from the Art/ folder in blob storage
 */
export async function getAllArtworks(): Promise<Artwork[]> {
  try {
    // Get artworks from cache/database
    const cachedArtworks = artworksCache
    
    // Discover images from Art/ folder in blob storage
    try {
      const artBlobs = await list({ prefix: 'Art/' })
      
      // Filter for image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
      const imageBlobs = artBlobs.blobs.filter(blob => {
        const pathname = blob.pathname.toLowerCase()
        return imageExtensions.some(ext => pathname.endsWith(ext))
      })
      
      // Create artworks for images that aren't already in cache
      const existingUrls = new Set(cachedArtworks.map(a => a.imageUrl))
      const discoveredArtworks: Artwork[] = []
      
      for (const blob of imageBlobs) {
        // Skip if already in cache
        if (existingUrls.has(blob.url)) {
          continue
        }
        
        // Extract filename without extension for title
        const filename = blob.pathname.replace('Art/', '').replace(/\.[^/.]+$/, '')
        const decodedFilename = decodeURIComponent(filename)
        
        // Create a basic artwork entry for discovered images
        const now = new Date().toISOString()
        discoveredArtworks.push({
          id: blob.pathname, // Use pathname as ID for discovered artworks
          title: decodedFilename,
          artist: 'Unknown',
          description: `Artwork discovered from Art/ folder: ${decodedFilename}`,
          price: 0,
          imageUrl: blob.url,
          featured: false,
          created_at: (blob as any).uploadedAt || (blob as any).createdAt || now,
          updated_at: (blob as any).uploadedAt || (blob as any).createdAt || now,
        })
      }
      
      // Merge discovered artworks with cached ones
      if (discoveredArtworks.length > 0) {
        const merged = [...cachedArtworks, ...discoveredArtworks]
        artworksCache = merged
        return merged
      }
    } catch (blobError) {
      console.error('Error discovering artworks from Art/ folder:', blobError)
      // Continue with cached artworks if blob discovery fails
    }
    
    return cachedArtworks
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

