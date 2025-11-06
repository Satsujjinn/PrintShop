/**
 * Simple visitor analytics backed by a JSON file.
 * Identifiers are hashed to avoid storing raw IP addresses.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { createHash, randomUUID } from 'crypto'
import type { VisitorRecord, VisitorSummary } from '@/types'

// Use /tmp in serverless environments (Vercel, Lambda), otherwise use project data dir
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME
const DATA_DIR = isServerless 
  ? '/tmp/data' 
  : path.join(process.cwd(), 'data')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

interface AnalyticsStore {
  version: number
  lastUpdated: string
  totalVisits: number
  visitors: VisitorRecord[]
}

interface TrackVisitorInput {
  ip?: string | null
  userAgent?: string | null
  path?: string | null
  referer?: string | null
  country?: string | null
}

const DEFAULT_STORE: AnalyticsStore = {
  version: 1,
  lastUpdated: new Date(0).toISOString(),
  totalVisits: 0,
  visitors: [],
}

function getAnalyticsSecret(): string {
  return process.env.ANALYTICS_SECRET || process.env.AUTH_SECRET || 'printshop-analytics'
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error: any) {
    // In serverless, /tmp might already exist, ignore EEXIST errors
    if (error.code !== 'EEXIST') {
      console.error('Failed to create data directory:', error)
      throw error
    }
  }
}

async function readStore(): Promise<AnalyticsStore> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf8')
    // Handle empty or whitespace-only files
    if (!raw || !raw.trim()) {
      return { ...DEFAULT_STORE }
    }
    const parsed = JSON.parse(raw) as AnalyticsStore
    if (!parsed.visitors || !Array.isArray(parsed.visitors)) {
      return { ...DEFAULT_STORE }
    }
    return parsed
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { ...DEFAULT_STORE }
    }
    // Handle JSON parsing errors gracefully
    if (error instanceof SyntaxError) {
      // File exists but is corrupted, return default and let it be rewritten
      return { ...DEFAULT_STORE }
    }
    console.error('Failed to read analytics store:', error)
    return { ...DEFAULT_STORE }
  }
}

async function writeStore(store: AnalyticsStore): Promise<void> {
  await ensureDataDir()
  const payload = JSON.stringify(store, null, 2)
  await fs.writeFile(ANALYTICS_FILE, payload, 'utf8')
}

function buildVisitorKey(input: TrackVisitorInput): string {
  const secret = getAnalyticsSecret()
  const components = [
    input.ip || 'unknown-ip',
    input.userAgent || 'unknown-agent',
    secret,
  ]

  return createHash('sha256').update(components.join('|')).digest('hex')
}

/**
 * Record a visitor hit.
 */
export async function trackVisitor(input: TrackVisitorInput): Promise<void> {
  const visitorKey = buildVisitorKey(input)
  const now = new Date().toISOString()

  const store = await readStore()
  store.totalVisits += 1
  store.lastUpdated = now

  const existing = store.visitors.find((visitor) => visitor.ipHash === visitorKey)

  if (existing) {
    existing.lastSeen = now
    existing.visits += 1
    if (input.path) existing.lastPath = input.path
    if (input.referer !== undefined) existing.lastReferrer = input.referer || null
    if (input.country) existing.country = input.country
  } else {
    const record: VisitorRecord = {
      id: randomUUID(),
      ipHash: visitorKey,
      userAgent: input.userAgent || 'unknown',
      firstSeen: now,
      lastSeen: now,
      visits: 1,
      lastPath: input.path || '/',
      lastReferrer: input.referer || null,
      country: input.country || null,
    }
    store.visitors.push(record)
  }

  // Keep the array size manageable (e.g. last 500 unique visitors)
  if (store.visitors.length > 500) {
    store.visitors = store.visitors
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .slice(0, 500)
  }

  await writeStore(store)
}

/**
 * Retrieve visitor records for the admin dashboard.
 */
export async function getVisitorRecords(): Promise<VisitorRecord[]> {
  const store = await readStore()
  return store.visitors
    .slice()
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
}

/**
 * Derive aggregate stats for quick display.
 */
export async function getVisitorSummary(): Promise<VisitorSummary> {
  const store = await readStore()
  const uniqueVisitors = store.visitors.length

  const last24h = Date.now() - 24 * 60 * 60 * 1000
  const visitors24h = store.visitors.filter(
    (visitor) => new Date(visitor.lastSeen).getTime() >= last24h
  ).length

  return {
    totalVisits: store.totalVisits,
    uniqueVisitors,
    visitorsLast24h: visitors24h,
    lastUpdated: store.lastUpdated,
  }
}

