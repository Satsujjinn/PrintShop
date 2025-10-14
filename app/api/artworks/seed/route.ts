/**
 * API route for seeding artworks with existing blob URLs
 * Created by Leon Jordaan
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllArtworks, addArtwork } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { Artwork } from '@/types'

/**
 * POST /api/artworks/seed
 * Create sample artworks using existing blob images
 */
export async function POST(request: NextRequest) {
  try {
    const sampleArtworks = [
      {
        title: "Space Odyssey",
        artist: "Leon Jordaan",
        description: "A stunning space landscape featuring cosmic elements and vibrant colors that capture the mystery of the universe.",
        price: 599.99,
        imageUrl: "https://blob.vercel-storage.com/Art/2001%20(1).jpg",
        featured: true,
      },
      {
        title: "Portrait Study",
        artist: "Leon Jordaan", 
        description: "An intimate portrait capturing emotion and character through careful composition and lighting.",
        price: 399.99,
        imageUrl: "https://blob.vercel-storage.com/Art/Photo_2024-01-19_105134.jpg",
        featured: false,
      },
      {
        title: "Musical Expression",
        artist: "Leon Jordaan",
        description: "A dynamic composition celebrating the power of music and artistic expression.",
        price: 449.99,
        imageUrl: "https://blob.vercel-storage.com/Art/Singer%20(1).jpg",
        featured: true,
      },
      {
        title: "Wildlife Portrait",
        artist: "Leon Jordaan",
        description: "A detailed study of wildlife showcasing the beauty and majesty of nature.",
        price: 549.99,
        imageUrl: "https://blob.vercel-storage.com/Art/Slunga.jpg",
        featured: false,
      },
      {
        title: "Citrus Dreams",
        artist: "Leon Jordaan",
        description: "A vibrant still life featuring bold colors and organic shapes that bring energy to any space.",
        price: 299.99,
        imageUrl: "https://blob.vercel-storage.com/Art/orange%20(1).jpg",
        featured: false,
      },
    ]

    const createdArtworks: Artwork[] = []

    for (const sample of sampleArtworks) {
      const artwork: Artwork = {
        id: generateId(),
        title: sample.title,
        artist: sample.artist,
        description: sample.description,
        price: sample.price,
        imageUrl: sample.imageUrl,
        featured: sample.featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await addArtwork(artwork)
      createdArtworks.push(artwork)
    }

    return NextResponse.json({
      message: `Successfully created ${createdArtworks.length} sample artworks`,
      artworks: createdArtworks,
    }, { status: 201 })
  } catch (error) {
    console.error('Error seeding artworks:', error)
    return NextResponse.json(
      { error: 'Failed to seed artworks' },
      { status: 500 }
    )
  }
}
