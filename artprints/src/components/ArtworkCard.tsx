'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { ArtworkItem, useStore } from '@/lib/store'

interface ArtworkCardProps {
  artwork: ArtworkItem
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [selectedSize, setSelectedSize] = useState(artwork.sizes[0].name)
  const [isHovered, setIsHovered] = useState(false)
  const addToCart = useStore((state) => state.addToCart)
  const toggleCart = useStore((state) => state.toggleCart)

  const currentSize = artwork.sizes.find(s => s.name === selectedSize)
  const finalPrice = artwork.price * (currentSize?.priceMultiplier || 1)

  const handleAddToCart = () => {
    addToCart(artwork, selectedSize, 1)
    toggleCart()
  }

  return (
    <div 
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <Image
          src={artwork.image}
          alt={artwork.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Coming Soon Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 font-bold rounded-lg shadow-lg text-sm backdrop-blur-sm">
            🚀 Purchase Coming Soon!
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title and Artist */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-purple-600 text-sm font-medium">by {artwork.artist}</p>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ${finalPrice.toFixed(0)}
          </div>
          <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {selectedSize}
          </div>
        </div>

        {/* Size Selector */}
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-lg text-gray-700 transition-all duration-300 text-sm"
        >
          {artwork.sizes.map((size) => (
            <option key={size.name} value={size.name}>
              {size.name} - {size.dimensions}
            </option>
          ))}
        </select>
        
        {/* Demo Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            💎 Portfolio Demo
          </span>
        </div>
      </div>
    </div>
  )
}
