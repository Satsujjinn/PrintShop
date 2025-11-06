/**
 * React Query provider for the application
 * Created by Leon Jordaan
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - increased for better performance
            cacheTime: 10 * 60 * 1000, // 10 minutes cache
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1, // Reduce retries for faster failure handling
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

