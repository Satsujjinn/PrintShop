/**
 * Tests for ArtworkCard component
 * Created by Leon Jordaan
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArtworkCard } from '../ArtworkCard'
import { Artwork } from '@/types'

const mockArtwork: Artwork = {
  id: '1',
  title: 'Test Artwork',
  artist: 'Test Artist',
  description: 'This is a test description for the artwork',
  price: 99.99,
  imageUrl: 'https://example.com/image.jpg',
  featured: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ArtworkCard', () => {
  it('should render artwork information', () => {
    render(<ArtworkCard artwork={mockArtwork} />)
    
    expect(screen.getByText('Test Artwork')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
    expect(screen.getByText('This is a test description for the artwork')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('should display featured badge when artwork is featured', () => {
    const featuredArtwork = { ...mockArtwork, featured: true }
    render(<ArtworkCard artwork={featuredArtwork} />)
    
    expect(screen.getByText('FEATURED')).toBeInTheDocument()
  })

  it('should not display featured badge when artwork is not featured', () => {
    render(<ArtworkCard artwork={mockArtwork} />)
    
    expect(screen.queryByText('FEATURED')).not.toBeInTheDocument()
  })

  it('should render image with correct alt text', () => {
    render(<ArtworkCard artwork={mockArtwork} />)
    
    const image = screen.getByAltText('Test Artwork by Test Artist')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should render buy button', () => {
    render(<ArtworkCard artwork={mockArtwork} />)
    
    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument()
  })

  it('should format price correctly', () => {
    const expensiveArtwork = { ...mockArtwork, price: 1234.56 }
    render(<ArtworkCard artwork={expensiveArtwork} />)
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })
})

