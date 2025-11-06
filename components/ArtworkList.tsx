/**
 * Artwork list component for admin with delete functionality
 * Created by Leon Jordaan
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Artwork } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ArtworkListProps {
  artworks: Artwork[]
  onDelete?: () => void
}

export function ArtworkList({ artworks, onDelete }: ArtworkListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    setError(null)

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete artwork')
      }

      // Refresh the page or call callback
      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete artwork')
    } finally {
      setDeletingId(null)
    }
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No artworks found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="bg-white border-2 border-gray-200 hover:border-black transition-all"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {artwork.featured && (
                <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold">
                  FEATURED
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <div>
                <h3 className="font-bold text-lg text-black line-clamp-1">
                  {artwork.title}
                </h3>
                <p className="text-sm text-gray-600 font-mono">{artwork.artist}</p>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">
                {artwork.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-bold text-black">
                  {formatPrice(artwork.price)}
                </span>
                <button
                  onClick={() => handleDelete(artwork.id)}
                  disabled={deletingId === artwork.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === artwork.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      DELETING...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      DELETE
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

