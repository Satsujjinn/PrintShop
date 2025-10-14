/**
 * Admin panel for managing artworks
 * Created by Leon Jordaan
 */

'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { Upload, Plus, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-sm">BACK TO GALLERY</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-black mb-2">ADMIN PANEL</h1>
          <p className="text-gray-600">Upload and manage artworks</p>
        </div>

        {/* Upload Status */}
        {uploadStatus.type && (
          <div
            className={`mb-6 p-4 border-2 flex items-center gap-3 ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
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

        {/* Upload Form */}
        <div className="bg-white border-2 border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="h-6 w-6 text-black" />
            <h2 className="text-2xl font-bold text-black">ADD NEW ARTWORK</h2>
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; 2025 Created by Leon Jordaan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

