/**
 * Home page with optimized artwork display and React Query integration
 * Created by Leon Jordaan
 */

'use client'

import { Suspense, useMemo, useState } from 'react'
import { Grid, Square, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react'
import { ArtworkCard } from '@/components/ArtworkCard'
import { useArtworks } from '@/hooks/use-artworks'
import type { Artwork, ArtworkFilters, ArtworkSortOptions } from '@/types'

/**
 * Loading skeleton for artwork cards
 */
function ArtworkSkeleton() {
  return (
    <div className="bg-gray-100 border-2 border-gray-200 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

/**
 * Error state component
 */
function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry: () => void 
}) {
  return (
    <div className="text-center py-20">
      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-black mb-2">
        FAILED TO LOAD ARTWORKS
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {error.message || 'An unexpected error occurred while loading the artworks.'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        TRY AGAIN
      </button>
    </div>
  )
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <Square className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-black mb-2">
        NO ARTWORKS AVAILABLE
      </h3>
      <p className="text-gray-600">
        Check back soon for new additions to our collection.
      </p>
    </div>
  )
}

/**
 * Filters component
 */
function ArtworkFilters({
  filters,
  onFiltersChange,
}: {
  filters: ArtworkFilters & ArtworkSortOptions
  onFiltersChange: (filters: ArtworkFilters & ArtworkSortOptions) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors text-sm font-mono"
      >
        <Filter className="h-4 w-4" />
        FILTER & SORT
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border-2 border-black z-20 p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-mono text-gray-700 mb-2">
                SEARCH
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artworks..."
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-mono text-gray-700 mb-2">
                SORT BY
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [any, 'asc' | 'desc']
                  onFiltersChange({ ...filters, sortBy, sortOrder })
                }}
                className="w-full p-2 border border-gray-300 focus:border-black text-sm font-mono"
              >
                <option value="created_at-desc">NEWEST FIRST</option>
                <option value="created_at-asc">OLDEST FIRST</option>
                <option value="title-asc">TITLE A-Z</option>
                <option value="title-desc">TITLE Z-A</option>
                <option value="artist-asc">ARTIST A-Z</option>
                <option value="artist-desc">ARTIST Z-A</option>
                <option value="price-asc">PRICE LOW-HIGH</option>
                <option value="price-desc">PRICE HIGH-LOW</option>
              </select>
            </div>

            {/* Featured filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured || false}
                onChange={(e) => {
                  const newFilters = { ...filters }
                  if (e.target.checked) {
                    newFilters.featured = true
                  } else {
                    delete newFilters.featured
                  }
                  onFiltersChange(newFilters)
                }}
                className="rounded border-gray-300 focus:ring-black focus:border-black"
              />
              <label htmlFor="featured" className="text-sm font-mono text-gray-700">
                FEATURED ONLY
              </label>
            </div>

            {/* Reset filters */}
            <button
              onClick={() => onFiltersChange({ sortBy: 'created_at', sortOrder: 'desc' })}
              className="w-full py-2 text-sm font-mono text-gray-600 hover:text-black transition-colors"
            >
              RESET FILTERS
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Main home page component
 */
export default function Home() {
  const [filters, setFilters] = useState<ArtworkFilters & ArtworkSortOptions>({
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
              <ErrorState error={error} onRetry={refetch} />
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
                      animationDelay: `${Math.min(index * 0.05, 1)}s`,
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