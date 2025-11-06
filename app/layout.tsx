/**
 * Root layout for the application
 * Created by Leon Jordaan
 */

import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Art Gallery - Monochrome',
    template: '%s | Art Gallery',
  },
  description: 'Curated collection of premium art prints. Created by Leon Jordaan.',
  keywords: ['art', 'gallery', 'prints', 'artwork', 'monochrome', 'curated'],
  authors: [{ name: 'Leon Jordaan' }],
  creator: 'Leon Jordaan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'Art Gallery',
    title: 'Art Gallery - Monochrome',
    description: 'Curated collection of premium art prints.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Gallery - Monochrome',
    description: 'Curated collection of premium art prints.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AnalyticsTracker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
