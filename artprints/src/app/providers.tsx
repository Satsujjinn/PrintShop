/**
 * Application providers with React Query, Session, and Toast notifications
 * Created by Leon Jordaan
 */

'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Create React Query client with optimized configuration
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache time: how long data stays in cache when not being used
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        // Retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for critical data
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect unless data is stale
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Show error notifications for failed mutations
        onError: (error: any) => {
          console.error('Mutation error:', error)
        },
      },
    },
  })
}

export function Providers({ children }: ProvidersProps) {
  // Create query client once per component instance
  const [queryClient] = useState(() => createQueryClient())

  return (
    <SessionProvider
      // Re-fetch session if window is focused and session is older than 5 minutes
      refetchInterval={5 * 60}
      // Re-fetch session when window is focused
      refetchOnWindowFocus={true}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            // Default options for all toasts
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'var(--font-geist-sans)',
            },
            // Success toast styling
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            // Error toast styling
            error: {
              duration: 6000,
              style: {
                background: '#ef4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            // Loading toast styling
            loading: {
              style: {
                background: '#6b7280',
              },
            },
          }}
        />
        
        {/* React Query DevTools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </SessionProvider>
  )
}
