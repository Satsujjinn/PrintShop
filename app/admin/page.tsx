/**
 * Admin panel for managing artworks
 * Created by Leon Jordaan
 */

'use client'

import { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react'
import { Upload, Plus, CheckCircle, AlertCircle, ArrowLeft, BarChart3, Users, Clock, LogOut, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { VisitorRecord, VisitorSummary } from '@/types'

interface FormData {
  title: string
  artist: string
  description: string
  price: string
  featured: boolean
  image: File | null
}

interface UploadStatus {
  type: 'success' | 'error' | null
  message: string
}

export default function AdminPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    description: '',
    price: '',
    featured: false,
    image: null,
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    type: null,
    message: '',
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [analyticsSummary, setAnalyticsSummary] = useState<VisitorSummary | null>(null)
  const [visitorRecords, setVisitorRecords] = useState<VisitorRecord[]>([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true)
    setAnalyticsError(null)

    try {
      const response = await fetch('/api/analytics/visitors', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load analytics')
      }

      const data = await response.json()
      setAnalyticsSummary(data.summary || null)
      setVisitorRecords(Array.isArray(data.visitors) ? data.visitors : [])
    } catch (error: any) {
      setAnalyticsError(error.message || 'Failed to load analytics')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleAnalyticsRefresh = () => {
    fetchAnalytics()
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout failures, we will still redirect
    } finally {
      setIsLoggingOut(false)
      router.push('/login')
    }
  }

  const formatDateTime = (value: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const formatNumber = (value: number | null | undefined) => {
    try {
      return new Intl.NumberFormat('en-US').format(value ?? 0)
    } catch {
      return `${value ?? 0}`
    }
  }

  const maskHash = (hash: string) => {
    if (!hash) return 'unknown'
    if (hash.length <= 12) return hash
    return `${hash.slice(0, 8)}…${hash.slice(-4)}`
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadStatus({ type: null, message: '' })

    try {
      // Validate form data
      if (!formData.title || !formData.artist || !formData.description || !formData.price || !formData.image) {
        throw new Error('Please fill in all required fields')
      }

      const price = parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price')
      }

      // Create form data for upload
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('artist', formData.artist)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('price', price.toString())
      uploadFormData.append('featured', formData.featured.toString())
      uploadFormData.append('image', formData.image)

      // Submit to API
      const response = await fetch('/api/artworks', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload artwork')
      }

      // Success!
      setUploadStatus({
        type: 'success',
        message: 'Artwork uploaded successfully!',
      })

      // Reset form
      setFormData({
        title: '',
        artist: '',
        description: '',
        price: '',
        featured: false,
        image: null,
      })
      setImagePreview(null)

      // Clear file input
      const fileInput = document.getElementById('image') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              Printshop Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-black">Admin Control Center</h1>
            <p className="text-sm text-gray-600">
              Securely manage artworks and monitor visitor activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-black hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Gallery
            </Link>
            <button
              type="button"
              onClick={handleAnalyticsRefresh}
              disabled={isLoadingAnalytics}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingAnalytics ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Analytics
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoggingOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Signing out
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="bg-white border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-black" />
              <div>
                <h2 className="text-xl font-bold text-black">Visitor Insights</h2>
                <p className="text-sm text-gray-600">
                  Hashed visitor data updated on each page load.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded border border-gray-200 p-4">
              <div className="flex items-center gap-3 text-gray-600">
                <BarChart3 className="h-4 w-4" />
                <p className="text-xs font-semibold tracking-[0.2em]">TOTAL VISITS</p>
              </div>
              <p className="mt-3 text-2xl font-bold text-black">
                {isLoadingAnalytics && !analyticsSummary
                  ? '—'
                  : formatNumber(analyticsSummary?.totalVisits)}
              </p>
            </div>
            <div className="rounded border border-gray-200 p-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-4 w-4" />
                <p className="text-xs font-semibold tracking-[0.2em]">VISITORS (24H)</p>
              </div>
              <p className="mt-3 text-2xl font-bold text-black">
                {isLoadingAnalytics && !analyticsSummary
                  ? '—'
                  : formatNumber(analyticsSummary?.visitorsLast24h)}
              </p>
            </div>
            <div className="rounded border border-gray-200 p-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-4 w-4" />
                <p className="text-xs font-semibold tracking-[0.2em]">UNIQUE VISITORS</p>
              </div>
              <p className="mt-3 text-2xl font-bold text-black">
                {isLoadingAnalytics && !analyticsSummary
                  ? '—'
                  : formatNumber(analyticsSummary?.uniqueVisitors)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            {analyticsSummary?.lastUpdated
              ? `Last update: ${formatDateTime(analyticsSummary.lastUpdated)}`
              : isLoadingAnalytics
              ? 'Collecting latest metrics...'
              : 'No analytics recorded yet.'}
          </p>

          <div className="mt-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="h-4 w-4" />
              Recent Visitor Sessions
            </h3>
            <div className="overflow-hidden border border-gray-200">
              {isLoadingAnalytics ? (
                <div className="p-6 text-sm text-gray-500">Loading analytics...</div>
              ) : analyticsError ? (
                <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{analyticsError}</p>
                    <button
                      type="button"
                      onClick={handleAnalyticsRefresh}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-800 underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </button>
                  </div>
                </div>
              ) : visitorRecords.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No visits recorded yet. The tracker updates automatically as visitors browse the site.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Identifier</th>
                      <th className="px-4 py-3">Last Path</th>
                      <th className="px-4 py-3">Last Seen</th>
                      <th className="px-4 py-3">Visits</th>
                      <th className="px-4 py-3">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {visitorRecords.slice(0, 10).map((visitor) => (
                      <tr key={visitor.id}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {maskHash(visitor.ipHash)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{visitor.lastPath}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{formatDateTime(visitor.lastSeen)}</div>
                          <div className="text-xs text-gray-500">
                            First: {formatDateTime(visitor.firstSeen)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatNumber(visitor.visits)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {visitor.country || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {uploadStatus.type && (
          <div
            className={`flex items-center gap-3 rounded-md border-2 p-4 ${
              uploadStatus.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-red-500 bg-red-50 text-red-800'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="font-medium">{uploadStatus.message}</p>
          </div>
        )}

        <section className="bg-white border-2 border-gray-200 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Plus className="h-6 w-6 text-black" />
            <h2 className="text-2xl font-bold text-black">Add New Artwork</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                TITLE *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black transition-colors text-base"
                placeholder="Enter artwork title"
              />
            </div>

            {/* Artist */}
            <div>
              <label htmlFor="artist" className="block text-sm font-bold text-gray-700 mb-2">
                ARTIST *
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black transition-colors text-base"
                placeholder="Enter artist name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                DESCRIPTION *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black transition-colors text-base resize-none"
                placeholder="Enter artwork description"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">
                PRICE (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black transition-colors text-base"
                placeholder="0.00"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700">
                FEATURED ARTWORK
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-bold text-gray-700 mb-2">
                IMAGE *
              </label>
              <div className="border-2 border-dashed border-gray-300 hover:border-black transition-colors p-8">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square max-w-md mx-auto bg-gray-100">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData((prev) => ({ ...prev, image: null }))
                        const fileInput = document.getElementById('image') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                      className="w-full py-2 text-sm font-mono text-gray-600 hover:text-black transition-colors"
                    >
                      CHANGE IMAGE
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm font-bold text-gray-700 mb-1">
                      CLICK TO UPLOAD IMAGE
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  </label>
                )}
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 px-6 font-bold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  UPLOADING...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  UPLOAD ARTWORK
                </>
              )}
            </button>
          </form>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-600">
          &copy; 2025 Created by Leon Jordaan. All rights reserved.
        </footer>
      </main>
    </div>
  )
}
