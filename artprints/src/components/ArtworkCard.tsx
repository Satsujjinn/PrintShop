'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArtworkItem, useStore } from '@/lib/store'

interface ArtworkCardProps {
  artwork: ArtworkItem
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [selectedSize, setSelectedSize] = useState(artwork.sizes?.[0]?.name || '')
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useStore((state) => state.addToCart)
  const toggleCart = useStore((state) => state.toggleCart)

  const currentSize = artwork.sizes?.find(s => s.name === selectedSize)
  const finalPrice = artwork.price * (currentSize?.priceMultiplier || 1)

  const handleAddToCart = () => {
    addToCart(artwork, selectedSize, 1)
    toggleCart()
  }

  return (
    <div 
      className="group relative bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 minimal-shadow hover:minimal-shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={artwork.image}
          alt={artwork.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300`} />

        {/* Quick Add Button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            className="bg-white border-2 border-black text-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-wide"
          >
            ADD TO CART
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Artist */}
        <div>
          <h3 className="text-lg font-bold text-black mb-1 line-clamp-1 tracking-wide">
            {artwork.title.toUpperCase()}
          </h3>
          <p className="text-gray-600 text-sm font-mono">BY {artwork.artist.toUpperCase()}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-black font-mono">
            ${finalPrice.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {selectedSize}
          </div>
        </div>

        {/* Size Selector - Minimal */}
        {artwork.sizes && artwork.sizes.length > 0 && (
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full p-2 bg-white border border-gray-300 focus:border-black text-black transition-all duration-300 text-sm font-mono"
          >
            {artwork.sizes.map((size) => (
              <option key={size.name} value={size.name}>
                {size.name} - {size.dimensions}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
