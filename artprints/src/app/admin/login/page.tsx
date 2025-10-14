'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, Palette } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        const session = await getSession()
        if (session?.user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          setError('Unauthorized access')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-black dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            ArtPrints Admin
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to manage your art collection
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-soft border border-neutral-200/50 dark:border-neutral-800/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                  placeholder="admin@artprints.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed button-hover"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Default credentials: admin@artprints.com / admin123
            </p>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors text-sm"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}
