'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Sends lightweight visit beacons to the analytics endpoint.
 */
export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) {
      return
    }

    lastTrackedPath.current = pathname
    const payload = JSON.stringify({
      path: pathname,
      referer: typeof document !== 'undefined' ? document.referrer || null : null,
    })

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const body = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', body)
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Ignore failures – analytics are best-effort
        })
      }
    } catch {
      // Avoid breaking the UI if analytics fail
    }
  }, [pathname])

  return null
}

