'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/store'

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const clearCart = useStore((state) => state.clearCart)

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const sid = urlParams.get('session_id')
    setSessionId(sid)
    
    // Clear the cart after successful purchase
    if (sid) {
      clearCart()
    }
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your art prints are being prepared for shipping.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">What happens next?</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• Your prints will be prepared within 2-3 business days</li>
            <li>• You'll get a tracking number when shipped</li>
          </ul>
        </div>

        {sessionId && (
          <div className="text-xs text-gray-400 mb-6">
            Order ID: {sessionId.slice(-8).toUpperCase()}
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
