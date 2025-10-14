/**
 * Header component with modern gradient design
 * Created by Leon Jordaan
 */

'use client'

import { Menu, X, Palette } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useState } from 'react'

export function Header() {
  const { getTotalItems } = useStore()
  const totalItems = getTotalItems()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Leon Jordaan
                </h1>
                <p className="text-xs text-gray-500">Digital Art Studio</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#gallery" 
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm"
              >
                Collection
              </a>
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full">
                E-commerce Coming Soon!
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Coming Soon Badge - Mobile */}
              <div className="md:hidden px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                Coming Soon
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-16 bottom-0 w-64 bg-white shadow-2xl">
            <nav className="flex flex-col p-6 space-y-4">
              <a 
                href="#gallery" 
                className="text-gray-600 hover:text-purple-600 font-medium py-3 border-b border-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Collection
              </a>
              <div className="py-3">
                <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold rounded-full text-center">
                  E-commerce Coming Soon!
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
