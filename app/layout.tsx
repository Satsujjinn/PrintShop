/**
 * Root layout for the application
 * Created by Leon Jordaan
 */

import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Art Gallery - Monochrome',
  description: 'Curated collection of premium art prints. Created by Leon Jordaan.',
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
