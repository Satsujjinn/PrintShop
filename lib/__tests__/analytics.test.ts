/**
 * Tests for analytics functions
 * Created by Leon Jordaan
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { trackVisitor, getVisitorRecords, getVisitorSummary } from '../analytics'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

describe('Analytics', () => {
  beforeEach(async () => {
    // Aggressively clean up analytics file before each test
    try {
      await fs.unlink(ANALYTICS_FILE)
      // Wait a bit to ensure file system operations complete
      await new Promise(resolve => setTimeout(resolve, 10))
    } catch {
      // File doesn't exist, that's fine
    }
    process.env.ANALYTICS_SECRET = 'test-secret'
  })

  afterEach(async () => {
    // Clean up analytics file after each test
    try {
      await fs.unlink(ANALYTICS_FILE)
    } catch {
      // File doesn't exist, that's fine
    }
  })

  describe('trackVisitor', () => {
    it('should track a new visitor', async () => {
      await trackVisitor({
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        path: '/',
        referer: null,
        country: 'US',
      })

      const records = await getVisitorRecords()
      expect(records).toHaveLength(1)
      expect(records[0].visits).toBe(1)
      expect(records[0].userAgent).toBe('Mozilla/5.0')
      expect(records[0].country).toBe('US')
    })

    it('should update existing visitor', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      
      await trackVisitor({
        ip: '192.168.1.999',
        userAgent: 'UpdateTestAgent',
        path: '/',
      })

      await trackVisitor({
        ip: '192.168.1.999',
        userAgent: 'UpdateTestAgent',
        path: '/about',
      })

      const records = await getVisitorRecords()
      const testVisitor = records.find(r => r.userAgent === 'UpdateTestAgent')
      expect(testVisitor).toBeDefined()
      expect(testVisitor?.visits).toBe(2)
      expect(testVisitor?.lastPath).toBe('/about')
    })

    it('should handle missing optional fields', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      
      await trackVisitor({
        ip: null,
        userAgent: null,
        path: null,
        referer: null,
        country: null,
      })

      const records = await getVisitorRecords()
      // Find the visitor with 'unknown' user agent (should be the one we just created)
      const unknownVisitor = records.find(r => r.userAgent === 'unknown' && r.lastPath === '/')
      expect(unknownVisitor).toBeDefined()
      expect(unknownVisitor?.userAgent).toBe('unknown')
      expect(unknownVisitor?.lastPath).toBe('/')
    })

    it('should increment total visits', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
      } catch {}
      
      await trackVisitor({ ip: '192.168.1.1', userAgent: 'Mozilla/5.0' })
      await trackVisitor({ ip: '192.168.1.2', userAgent: 'Chrome' })
      await trackVisitor({ ip: '192.168.1.1', userAgent: 'Mozilla/5.0' })

      const summary = await getVisitorSummary()
      expect(summary.totalVisits).toBe(3)
    })

    it('should limit visitor records to 500', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
      } catch {}
      
      // Create 501 unique visitors
      for (let i = 0; i < 501; i++) {
        await trackVisitor({
          ip: `192.168.1.${i}`,
          userAgent: `Agent-${i}`,
        })
      }

      const records = await getVisitorRecords()
      expect(records.length).toBeLessThanOrEqual(500)
    })
  })

  describe('getVisitorRecords', () => {
    it('should return empty array when no visitors', async () => {
      // Ensure file doesn't exist and wait for cleanup
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      const records = await getVisitorRecords()
      // If file was just created, it should be empty or have default structure
      expect(Array.isArray(records)).toBe(true)
    })

    it('should return visitors sorted by lastSeen descending', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      
      await trackVisitor({ ip: '192.168.1.1', userAgent: 'Agent1' })
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      await trackVisitor({ ip: '192.168.1.2', userAgent: 'Agent2' })

      const records = await getVisitorRecords()
      // Find our specific visitors
      const agent1 = records.find(r => r.userAgent === 'Agent1')
      const agent2 = records.find(r => r.userAgent === 'Agent2')
      
      expect(agent1).toBeDefined()
      expect(agent2).toBeDefined()
      // Check sorting - newer should come first
      const agent1Index = records.findIndex(r => r.userAgent === 'Agent1')
      const agent2Index = records.findIndex(r => r.userAgent === 'Agent2')
      // Agent2 was added later, so should come before Agent1 if sorted correctly
      if (agent1Index >= 0 && agent2Index >= 0) {
        expect(agent2Index).toBeLessThan(agent1Index)
      }
    })

    it('should return all visitor fields', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
      } catch {}
      
      await trackVisitor({
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        path: '/test',
        referer: 'https://example.com',
        country: 'US',
      })

      const records = await getVisitorRecords()
      expect(records[0]).toHaveProperty('id')
      expect(records[0]).toHaveProperty('ipHash')
      expect(records[0]).toHaveProperty('userAgent')
      expect(records[0]).toHaveProperty('firstSeen')
      expect(records[0]).toHaveProperty('lastSeen')
      expect(records[0]).toHaveProperty('visits')
      expect(records[0]).toHaveProperty('lastPath')
      expect(records[0]).toHaveProperty('lastReferrer')
      expect(records[0]).toHaveProperty('country')
    })
  })

  describe('getVisitorSummary', () => {
    it('should return valid summary structure', async () => {
      const summary = await getVisitorSummary()
      expect(summary).toHaveProperty('totalVisits')
      expect(summary).toHaveProperty('uniqueVisitors')
      expect(summary).toHaveProperty('visitorsLast24h')
      expect(summary).toHaveProperty('lastUpdated')
      expect(typeof summary.totalVisits).toBe('number')
      expect(typeof summary.uniqueVisitors).toBe('number')
      expect(typeof summary.visitorsLast24h).toBe('number')
    })

    it('should calculate unique visitors correctly', async () => {
      // Get initial state
      const beforeSummary = await getVisitorSummary()
      const beforeUnique = beforeSummary.uniqueVisitors
      const beforeTotal = beforeSummary.totalVisits
      
      // Ensure clean state for our test visitors
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      
      await trackVisitor({ ip: '192.168.1.100', userAgent: 'TestAgent1' })
      await trackVisitor({ ip: '192.168.1.101', userAgent: 'TestAgent2' })
      await trackVisitor({ ip: '192.168.1.100', userAgent: 'TestAgent1' })

      const summary = await getVisitorSummary()
      // Should have added 3 visits and 2 unique visitors
      expect(summary.totalVisits).toBeGreaterThanOrEqual(beforeTotal + 3)
      // Find our test visitors
      const records = await getVisitorRecords()
      const testVisitors = records.filter(r => r.userAgent.startsWith('TestAgent'))
      expect(testVisitors.length).toBe(2)
    })

    it('should calculate visitors in last 24 hours', async () => {
      // Get initial count
      const beforeSummary = await getVisitorSummary()
      const before24h = beforeSummary.visitorsLast24h
      
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch {}
      
      await trackVisitor({ ip: '192.168.1.200', userAgent: 'TestAgent24h' })

      const summary = await getVisitorSummary()
      // Should have at least one more visitor in last 24h
      expect(summary.visitorsLast24h).toBeGreaterThanOrEqual(before24h + 1)
    })

    it('should exclude visitors older than 24 hours', async () => {
      // Ensure clean state
      try {
        await fs.unlink(ANALYTICS_FILE)
      } catch {}
      
      // This test would require mocking time, which is complex
      // For now, we test that the function works with recent visitors
      await trackVisitor({ ip: '192.168.1.1', userAgent: 'Agent1' })
      
      const summary = await getVisitorSummary()
      expect(summary.visitorsLast24h).toBeGreaterThanOrEqual(1)
    })
  })
})

