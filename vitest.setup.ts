import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Vercel Blob to avoid errors in tests
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({
    url: 'https://example.com/test-blob.jpg',
    pathname: 'Art/test-blob.jpg',
  }),
  list: vi.fn().mockResolvedValue({
    blobs: [],
    hasMore: false,
    cursor: null,
  }),
  del: vi.fn().mockResolvedValue(undefined),
  head: vi.fn().mockResolvedValue({
    url: 'https://example.com/test-blob.jpg',
    pathname: 'Art/test-blob.jpg',
  }),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, react/jsx-props-no-spreading
    const { src, alt, fill, ...rest } = props
    // Filter out Next.js Image-specific props that aren't valid HTML attributes
    const htmlProps: any = { src, alt, ...rest }
    // Handle fill prop by setting appropriate styles
    if (fill) {
      htmlProps.style = { ...htmlProps.style, position: 'absolute', inset: 0, width: '100%', height: '100%' }
    }
    return require('react').createElement('img', htmlProps)
  },
}))

