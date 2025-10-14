'use client'

import { useEffect, useState } from 'react'
import { 
  ImageIcon, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Stats {
  totalArtworks: number
  totalOrders: number
  totalRevenue: number
  featuredArtworks: number
}

interface RecentArtwork {
  id: string
  title: string
  artist: string
  image: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArtworks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    featuredArtworks: 0
  })
  const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load artworks
      const artworksResponse = await fetch('/api/artworks')
      const artworksData = await artworksResponse.json()
      
      if (artworksData.success) {
        const artworks = artworksData.data
        setStats(prev => ({
          ...prev,
          totalArtworks: artworks.length,
          featuredArtworks: artworks.filter((a: any) => a.isFeatured).length
        }))
        
        setRecentArtworks(artworks.slice(0, 5))
      }

      // TODO: Load orders and revenue when implemented
      setStats(prev => ({
        ...prev,
        totalOrders: 12,
        totalRevenue: 2450
      }))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Artworks',
      value: stats.totalArtworks,
      icon: ImageIcon,
      color: 'from-blue-500 to-blue-600',
      change: '+2 this week'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      change: '+5 this week'
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      change: '+12% this month'
    },
    {
      name: 'Featured Items',
      value: stats.featuredArtworks,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: `${stats.featuredArtworks} active`
    }
  ]

  if (isLoading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Welcome back! Here's what's happening with your art store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-black dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Artworks */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">Recent Artworks</h2>
            <a
              href="/admin/artworks"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </a>
          </div>

          <div className="space-y-4">
            {recentArtworks.map((artwork) => (
              <div key={artwork.id} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    {artwork.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    by {artwork.artist}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-neutral-400 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-green-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <a
              href="/admin/artworks/new"
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Artwork
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-4">
            <a
              href="/admin/artworks/new"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black dark:text-white">Add New Artwork</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Upload and configure a new piece</p>
              </div>
            </a>

            <a
              href="/admin/orders"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl hover:from-green-100 hover:to-teal-100 dark:hover:from-green-900/30 dark:hover:to-teal-900/30 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black dark:text-white">Manage Orders</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">View and update order status</p>
              </div>
            </a>

            <a
              href="/admin/settings"
              className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black dark:text-white">Store Settings</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure store preferences</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
