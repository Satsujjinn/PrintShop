// API client functions for artwork management

export interface Artwork {
  id: string
  title: string
  artist: string
  price: number
  image: string
  description: string
  category?: string
  tags?: string[]
  isFeatured?: boolean
  isActive?: boolean
  sizes: Array<{
    id?: number
    name: string
    dimensions: string
    price_multiplier: number
  }>
  createdAt?: string
  updatedAt?: string
}

// Fetch all artworks
export async function fetchArtworks(includeInactive = false): Promise<Artwork[]> {
  try {
    const response = await fetch(`/api/artworks${includeInactive ? '?includeInactive=true' : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to fetch artworks:', data.error)
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return []
  }
}

// Fetch single artwork by ID
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  try {
    const response = await fetch(`/api/artworks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to fetch artwork:', data.error)
      return null
    }

    return data.data
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return null
  }
}

