import { ArtworkItem } from './store'

export const sampleArtworks: ArtworkItem[] = [
  {
    id: '1',
    title: 'Ethereal Landscape',
    artist: 'Luna Morrison',
    price: 45,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    description: 'A dreamlike landscape that captures the essence of twilight serenity. This piece evokes a sense of wonder and tranquility.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  },
  {
    id: '2',
    title: 'Urban Symphony',
    artist: 'Marcus Chen',
    price: 55,
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
    description: 'A vibrant abstract interpretation of city life, with bold colors representing the energy and rhythm of urban existence.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  },
  {
    id: '3',
    title: 'Ocean Dreams',
    artist: 'Isabella Rodriguez',
    price: 65,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    description: 'Flowing waves of blue and turquoise that seem to dance across the canvas, bringing the calming essence of the ocean to any space.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  },
  {
    id: '4',
    title: 'Golden Hour',
    artist: 'David Kim',
    price: 50,
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80',
    description: 'Warm, golden tones that capture the magic of sunset. A perfect piece to add warmth and sophistication to any room.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  },
  {
    id: '5',
    title: 'Botanical Harmony',
    artist: 'Sarah Williams',
    price: 40,
    image: 'https://images.unsplash.com/photo-1578662015462-dad49c43c872?w=800&q=80',
    description: 'Delicate botanical elements arranged in perfect harmony. This piece brings nature indoors with subtle elegance.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  },
  {
    id: '6',
    title: 'Cosmic Dance',
    artist: 'Elena Volkov',
    price: 70,
    image: 'https://images.unsplash.com/photo-1578662996308-4c4c8e3b9c7e?w=800&q=80',
    description: 'An exploration of space and time through swirling galaxies and celestial bodies. A conversation starter for any modern space.',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', priceMultiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', priceMultiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', priceMultiplier: 3.8 }
    ]
  }
]

export const artistBio = {
  name: "Curated Collection",
  description: "Our gallery features emerging and established artists from around the world. Each piece is carefully selected for its unique perspective and quality. We work directly with artists to ensure authentic, high-quality prints that bring their vision to your space.",
  story: "Founded in 2024, our mission is to make beautiful art accessible to everyone. We believe that art has the power to transform spaces and inspire daily life. Every purchase supports the artists directly, helping them continue their creative journey."
}
