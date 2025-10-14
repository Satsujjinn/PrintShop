'use client'

import { ShoppingCart, Square, Menu, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useState } from 'react'

export function Header() {
  const { toggleCart, getTotalItems } = useStore()
  const totalItems = getTotalItems()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Square className="h-8 w-8 text-black" />
              <h1 className="text-xl font-bold text-black tracking-wide">ART GALLERY</h1>
            </div>

            {/* Desktop Navigation - Hidden for minimal design */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#gallery" className="text-gray-600 hover:text-black font-medium transition-colors text-sm tracking-wide">
                COLLECTION
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-3 border border-black hover:bg-black hover:text-white transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-mono font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 border border-black hover:bg-black hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed right-0 top-16 bottom-0 w-64 bg-white border-l-2 border-black">
            <nav className="flex flex-col p-6 space-y-4">
              <a 
                href="#gallery" 
                className="text-gray-600 hover:text-black font-medium py-3 border-b border-gray-200 transition-colors text-sm tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                COLLECTION
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
