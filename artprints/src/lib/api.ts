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

// Create new artwork (Admin only)
export async function createArtwork(artworkData: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artwork | null> {
  try {
    const response = await fetch('/api/artworks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artworkData),
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to create artwork:', data.error)
      return null
    }

    return data.data
  } catch (error) {
    console.error('Error creating artwork:', error)
    return null
  }
}

// Update artwork (Admin only)
export async function updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork | null> {
  try {
    const response = await fetch(`/api/artworks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to update artwork:', data.error)
      return null
    }

    return data.data
  } catch (error) {
    console.error('Error updating artwork:', error)
    return null
  }
}

// Delete artwork (Admin only)
export async function deleteArtwork(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/artworks/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to delete artwork:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return false
  }
}

// Upload image
export async function uploadImage(file: File): Promise<{ url: string; key: string } | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to upload image:', data.error)
      return null
    }

    return {
      url: data.data.url,
      key: data.data.key
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}
