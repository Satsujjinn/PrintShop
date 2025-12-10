/**
 * Home page with optimized artwork display and React Query integration
 * Created by Leon Jordaan
 */

'use client'

import { Suspense, useMemo, useState } from 'react'
import { Grid, Square } from 'lucide-react'
import { ArtworkCard } from '@/components/ArtworkCard'
import { Header } from '@/components/Header'
import { ArtworkFilters } from '@/components/ArtworkFilters'
import { ArtworkSkeleton, ErrorState, EmptyState } from '@/components/GalleryStates'
import { useArtworks } from '@/hooks/use-artworks'
import type { Artwork, ArtworkFilters as FiltersType, ArtworkSortOptions } from '@/types'

/**
 * Main home page component
 */
export default function Home() {
  const [filters, setFilters] = useState<FiltersType & ArtworkSortOptions>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Fetch artworks with React Query
  const {
    data: artworksData,
    isLoading,
    error,
    refetch,
  } = useArtworks({
    page: 1,
    limit: 50, // Load more items for better UX
    ...filters,
  })

  // Memoize artworks array to prevent unnecessary re-renders
  const artworks = useMemo(() => artworksData?.artworks || [], [artworksData])

  return (
    <div className="min-h-screen page-transition bg-white">
      <Header />

      {/* Minimal Hero Section */}
      <section className="geometric-pattern py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-black mb-4 tracking-tight">
              ART GALLERY
            </h1>

            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Curated collection of premium art prints
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Grid className="h-6 w-6 text-black" />
              <h2 className="text-2xl font-bold text-black tracking-wide">COLLECTION</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 font-mono">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                    LOADING...
                  </span>
                ) : (
                  `${artworks.length} WORKS`
                )}
              </div>

              <ArtworkFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <ArtworkSkeleton key={index} />
              ))}
            </div>
          }>
            {error ? (
              <ErrorState error={error as Error} onRetry={refetch} />
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <ArtworkSkeleton key={index} />
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((artwork: Artwork, index: number) => (
                  <div
                    key={artwork.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${Math.min(index * 0.03, 0.6)}s`, // Reduced delay for faster rendering
                      animationFillMode: 'both',
                    }}
                  >
                    <ArtworkCard artwork={artwork} />
                  </div>
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <Square className="h-6 w-6 text-black mr-2" />
              <span className="font-bold text-xl text-black">ART GALLERY</span>
            </div>
            <div className="text-sm text-gray-600 text-center sm:text-right">
              <p>&copy; 2025 Created by Leon Jordaan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

