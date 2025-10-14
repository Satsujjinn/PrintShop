'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Trash2,
  Save,
  ArrowLeft,
  Star
} from 'lucide-react'

interface ArtworkSize {
  name: string
  dimensions: string
  price_multiplier: number
}

interface FormData {
  title: string
  artist: string
  description: string
  base_price: string
  category: string
  tags: string[]
  is_featured: boolean
  image_url: string
  image_key: string
  sizes: ArtworkSize[]
}

export default function NewArtwork() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    description: '',
    base_price: '',
    category: '',
    tags: [],
    is_featured: false,
    image_url: '',
    image_key: '',
    sizes: [
      { name: 'Small', dimensions: '8" × 10"', price_multiplier: 1 },
      { name: 'Medium', dimensions: '16" × 20"', price_multiplier: 2.2 },
      { name: 'Large', dimensions: '24" × 30"', price_multiplier: 3.8 }
    ]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSizeChange = (index: number, field: keyof ArtworkSize, value: any) => {
    const updatedSizes = [...formData.sizes]
    updatedSizes[index] = { ...updatedSizes[index], [field]: value }
    setFormData(prev => ({ ...prev, sizes: updatedSizes }))
  }

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', dimensions: '', price_multiplier: 1 }]
    }))
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const uploadImage = async (): Promise<{ url: string; key: string } | null> => {
    if (!imageFile) return null

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()
      if (result.success) {
        return { url: result.data.url, key: result.data.key }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageFile) {
      alert('Please select an image')
      return
    }

    if (!formData.title || !formData.artist || !formData.description || !formData.base_price) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      // Upload image first
      const imageResult = await uploadImage()
      if (!imageResult) {
        setIsSaving(false)
        return
      }

      // Create artwork
      const artworkData = {
        ...formData,
        image_url: imageResult.url,
        image_key: imageResult.key,
        base_price: parseFloat(formData.base_price)
      }

      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artworkData),
      })

      const result = await response.json()
      if (result.success) {
        router.push('/admin/artworks')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save artwork')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Add New Artwork</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Upload and configure a new piece for your collection
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">Artwork Image</h2>
          
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md mx-auto rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview('')
                }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                {isDragActive ? 'Drop your image here' : 'Upload artwork image'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Drag and drop your image, or click to browse
              </p>
              <p className="text-neutral-500 dark:text-neutral-500 text-xs mt-2">
                Supports: JPEG, PNG, WebP, GIF (max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                placeholder="Artwork title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                Artist *
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => handleInputChange('artist', e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                placeholder="Artist name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                Base Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price}
                onChange={(e) => handleInputChange('base_price', e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                placeholder="e.g. Abstract, Landscape, Portrait"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white h-32 resize-none"
              placeholder="Describe the artwork, its inspiration, techniques used..."
              required
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Feature this artwork
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">Tags</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-xl text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">Available Sizes</h2>
            <button
              type="button"
              onClick={addSize}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Size
            </button>
          </div>

          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Size Name
                  </label>
                  <input
                    type="text"
                    value={size.name}
                    onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white"
                    placeholder="Small"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={size.dimensions}
                    onChange={(e) => handleSizeChange(index, 'dimensions', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white"
                    placeholder='8" × 10"'
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Price Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={size.price_multiplier}
                    onChange={(e) => handleSizeChange(index, 'price_multiplier', parseFloat(e.target.value) || 1)}
                    className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    disabled={formData.sizes.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed button-hover"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Artwork
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
