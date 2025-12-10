
'use client'

import { AlertCircle, RefreshCw, Square } from 'lucide-react'

/**
 * Loading skeleton for artwork cards
 */
export function ArtworkSkeleton() {
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
export function ErrorState({
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
export function EmptyState() {
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
