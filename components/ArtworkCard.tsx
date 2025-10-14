/**
 * Artwork card component for displaying individual artworks
 * Created by Leon Jordaan
 */

'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Artwork } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ArtworkCardProps {
  artwork: Artwork
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <div className="group bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        
        {/* Featured Badge */}
        {artwork.featured && (
          <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 text-xs font-bold tracking-wide">
            FEATURED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-black line-clamp-1 group-hover:text-gray-700 transition-colors">
            {artwork.title}
          </h3>
          <p className="text-sm text-gray-600 font-mono">
            {artwork.artist}
          </p>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 min-h-[2.5rem]">
          {artwork.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xl font-bold text-black">
            {formatPrice(artwork.price)}
          </span>
          
          <button className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            BUY
          </button>
        </div>
      </div>
    </div>
  )
}

