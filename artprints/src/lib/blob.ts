/**
 * Vercel Blob storage utilities for artwork images
 * Created by Leon Jordaan
 */

import { put, del, list } from '@vercel/blob'

/**
 * Upload a file to Vercel Blob
 */
export async function uploadToBlob(
  file: File | Buffer,
  filename: string,
  contentType?: string
): Promise<{ url: string; key: string }> {
  try {
    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const extension = filename.split('.').pop()
    const uniqueFilename = `artworks/${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const blob = await put(uniqueFilename, file, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
    })

    return {
      url: blob.url,
      key: uniqueFilename,
    }
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error('Failed to upload image to Vercel Blob')
  }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFromBlob(key: string): Promise<void> {
  try {
    await del(key)
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error)
    throw new Error('Failed to delete image from Vercel Blob')
  }
}

/**
 * List files in Vercel Blob
 */
export async function listBlobFiles(prefix?: string) {
  try {
    const { blobs } = await list({
      prefix: prefix || 'artworks/',
    })
    return blobs
  } catch (error) {
    console.error('Error listing Vercel Blob files:', error)
    throw new Error('Failed to list images from Vercel Blob')
  }
}

/**
 * Get file URL from Vercel Blob key
 */
export function getBlobUrl(key: string): string {
  // Vercel Blob URLs are returned directly from the upload
  // This is a helper function for consistency
  return key.startsWith('https://') ? key : `https://your-blob-store.vercel-storage.com/${key}`
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, WebP, or GIF' }
  }

  return { valid: true }
}

/**
 * Process image for optimal storage
 */
export async function processImageFile(file: File): Promise<{
  processedFile: File
  metadata: {
    originalSize: number
    processedSize: number
    width?: number
    height?: number
  }
}> {
  // For now, return the original file
  // In the future, you could add image compression/resizing here
  return {
    processedFile: file,
    metadata: {
      originalSize: file.size,
      processedSize: file.size,
    },
  }
}
