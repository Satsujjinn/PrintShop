/**
 * Tests for use-artworks hook
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useArtworks } from '../use-artworks'

// Mock fetch
global.fetch = vi.fn()

describe('useArtworks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should fetch artworks successfully', async () => {
    const mockArtworks = {
      artworks: [
        {
          id: '1',
          title: 'Test',
          artist: 'Artist',
          description: 'Description',
          price: 100,
          imageUrl: 'https://example.com/image.jpg',
          featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      hasMore: false,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArtworks,
    } as Response)

    const { result } = renderHook(() => useArtworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockArtworks)
  })

  it('should pass query parameters to API', async () => {
    const mockArtworks = {
      artworks: [],
      total: 0,
      page: 1,
      limit: 50,
      hasMore: false,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArtworks,
    } as Response)

    renderHook(
      () =>
        useArtworks({
          search: 'test',
          featured: true,
          sortBy: 'price',
          sortOrder: 'asc',
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })

    const callUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(callUrl).toContain('search=test')
    expect(callUrl).toContain('featured=true')
    expect(callUrl).toContain('sortBy=price')
    expect(callUrl).toContain('sortOrder=asc')
  })

  it('should handle fetch errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useArtworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const { result } = renderHook(() => useArtworks(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

