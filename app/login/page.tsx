/**
 * Login/Signup page for users
 * Created by Leon Jordaan
 */

'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, Lock, AlertCircle, Mail, User, Key, Shield } from 'lucide-react'

type Mode = 'signin' | 'signup'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = searchParams?.get('admin') === 'true'
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Disable signup mode for admin login
  useEffect(() => {
    if (isAdmin && mode === 'signup') {
      setMode('signin')
    }
  }, [isAdmin, mode])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Admin login uses different endpoint
      const endpoint = isAdmin 
        ? '/api/auth/login' 
        : mode === 'signup' 
          ? '/api/auth/signup' 
          : '/api/auth/signin'
      
      const body = mode === 'signup' 
        ? { email, name, password }
        : { email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Unable to ${isAdmin ? 'login as admin' : mode === 'signup' ? 'create account' : 'sign in'}`)
      }

      const data = await response.json()
      
      // Redirect based on mode and admin status
      if (isAdmin) {
        router.push('/admin')
        router.refresh()
      } else if (mode === 'signup') {
        router.push('/')
        router.refresh()
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || `Unable to ${isAdmin ? 'login as admin' : mode === 'signup' ? 'create account' : 'sign in'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {isAdmin ? (
            <Shield className="h-12 w-12 text-black" />
          ) : (
            <Lock className="h-12 w-12 text-black" />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
          {isAdmin ? 'Admin Login' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isAdmin 
            ? 'Access the admin control center'
            : mode === 'signup' 
              ? 'Join our art gallery community'
              : 'Welcome back to the gallery'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Mode Toggle - Hidden for admin */}
        {!isAdmin && (
        <div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError(null)
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </span>
          </button>
        </div>
        )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  minLength={mode === 'signup' ? 6 : undefined}
                />
              </div>
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {mode === 'signup' ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
            Back to gallery
          </Link>
          {!isAdmin && (
            <div className="text-xs text-gray-500">
              Admin? <Link href="/login?admin=true" className="text-black hover:underline">Admin Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
