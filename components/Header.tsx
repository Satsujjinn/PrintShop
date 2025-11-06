/**
 * Header component with navigation and auth buttons
 * Created by Leon Jordaan
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus, LogOut, User, Settings } from 'lucide-react'

interface UserInfo {
  id: string
  email?: string
  name?: string
  role?: 'user' | 'admin'
}

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setUser(data.user || null)
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-black">ART GALLERY</span>
          </Link>

          <nav className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600" />
            ) : user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    ADMIN
                  </Link>
                )}
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name || user.email || 'Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  LOGIN
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  SIGN UP
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

