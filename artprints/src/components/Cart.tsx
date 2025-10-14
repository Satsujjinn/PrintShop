'use client'

import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useStore } from '@/lib/store'

export function Cart() {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useStore()

  if (!isCartOpen) return null

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error during checkout:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" onClick={toggleCart} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l-2 border-black minimal-shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b-2 border-black px-6 py-6">
            <div>
              <h2 className="text-xl font-bold text-black tracking-wide">CART</h2>
              <p className="text-sm text-gray-600 font-mono">
                {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
              </p>
            </div>
            <button
              onClick={toggleCart}
              className="p-3 border border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-black text-xl font-bold mb-2 tracking-wide">CART IS EMPTY</h3>
                <p className="text-gray-600 text-sm mb-6 font-mono">ADD ITEMS TO GET STARTED</p>
                <button 
                  onClick={toggleCart}
                  className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors text-sm tracking-wide"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-4 border border-gray-200 hover:border-black transition-colors">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-gray-300">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-black tracking-wide">{item.title.toUpperCase()}</h3>
                        <p className="text-xs text-gray-600 font-mono">BY {item.artist.toUpperCase()}</p>
                        <p className="text-xs text-black bg-gray-100 px-2 py-1 inline-block mt-1 font-mono">{item.selectedSize}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="p-2 hover:bg-black hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-black min-w-[20px] text-center font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="p-2 hover:bg-black hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-black font-mono">${(item.price * item.quantity).toFixed(0)}</p>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="text-xs text-black hover:bg-black hover:text-white px-2 py-1 border border-gray-300 font-mono"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t-2 border-black px-6 py-6 space-y-6 bg-gray-50">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-600">SUBTOTAL</span>
                  <span className="text-black font-bold">${getTotalPrice().toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-600">SHIPPING</span>
                  <span className="text-black font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-3 font-mono">
                  <span className="text-black">TOTAL</span>
                  <span className="text-black">${getTotalPrice().toFixed(0)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 px-6 hover:bg-gray-800 transition-colors font-bold text-sm tracking-wide"
                >
                  SECURE CHECKOUT
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-white text-black py-3 px-4 border border-gray-300 hover:bg-black hover:text-white transition-colors font-bold text-sm tracking-wide"
                >
                  CLEAR CART
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-600 font-mono">
                  SECURE PAYMENTS POWERED BY STRIPE
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
