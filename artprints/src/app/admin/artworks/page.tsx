'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react'

interface Artwork {
  id: string
  title: string
  artist: string
  image: string
  price: number
  description: string
  category: string
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  sizes: Array<{
    id: number
    name: string
    dimensions: string
    price_multiplier: number
  }>
}

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive, featured
  const [showActions, setShowActions] = useState<string | null>(null)

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      const response = await fetch('/api/artworks?includeInactive=true')
      const data = await response.json()
      
      if (data.success) {
        setArtworks(data.data)
      }
    } catch (error) {
      console.error('Error loading artworks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setArtworks(artworks.filter(artwork => artwork.id !== id))
      } else {
        alert('Failed to delete artwork')
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
      alert('Failed to delete artwork')
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: !currentStatus }),
      })

      if (response.ok) {
        setArtworks(artworks.map(artwork => 
          artwork.id === id ? { ...artwork, isFeatured: !currentStatus } : artwork
        ))
      }
    } catch (error) {
      console.error('Error updating artwork:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        setArtworks(artworks.map(artwork => 
          artwork.id === id ? { ...artwork, isActive: !currentStatus } : artwork
        ))
      }
    } catch (error) {
      console.error('Error updating artwork:', error)
    }
  }

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && artwork.isActive) ||
      (filterStatus === 'inactive' && !artwork.isActive) ||
      (filterStatus === 'featured' && artwork.isFeatured)

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Artworks</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your art collection ({filteredArtworks.length} items)
          </p>
        </div>
        <a
          href="/admin/artworks/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold button-hover"
        >
          <Plus className="h-5 w-5" />
          Add Artwork
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white appearance-none"
            >
              <option value="all">All Items</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-24 w-24 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No artworks found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first artwork.'
            }
          </p>
          <a
            href="/admin/artworks/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Your First Artwork
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden hover:shadow-soft-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {artwork.isFeatured && (
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    artwork.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {artwork.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === artwork.id ? null : artwork.id)}
                      className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-black transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    
                    {showActions === artwork.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-2xl shadow-soft-lg border border-neutral-200 dark:border-neutral-700 py-2 z-10">
                        <button
                          onClick={() => window.open(`/?id=${artwork.id}`, '_blank')}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Eye className="h-4 w-4" />
                          View in Store
                        </button>
                        <button
                          onClick={() => window.location.href = `/admin/artworks/${artwork.id}/edit`}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Artwork
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(artwork.id, artwork.isFeatured)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Star className="h-4 w-4" />
                          {artwork.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(artwork.id, artwork.isActive)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Eye className="h-4 w-4" />
                          {artwork.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
                        <button
                          onClick={() => handleDeleteArtwork(artwork.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-1 line-clamp-1">
                  {artwork.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                  by {artwork.artist}
                </p>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4 line-clamp-2">
                  {artwork.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-black dark:text-white">
                      ${artwork.price}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {artwork.sizes.length} size{artwork.sizes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/admin/artworks/${artwork.id}/edit`}
                      className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArtwork(artwork.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
