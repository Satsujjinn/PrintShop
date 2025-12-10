
'use client'

import { Filter, Search } from 'lucide-react'
import type { ArtworkFilters, ArtworkSortOptions } from '@/types'
import { useState } from 'react'

export function ArtworkFilters({
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
