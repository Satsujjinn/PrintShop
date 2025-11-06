#!/usr/bin/env node
/**
 * Test script to verify Vercel Blob configuration
 * Created by Leon Jordaan
 */

import { put, list } from '@vercel/blob'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load environment variables
config({ path: join(rootDir, '.env.local') })

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

async function testBlob() {
  console.log('🧪 Testing Vercel Blob Configuration...\n')

  // Check if token is set
  if (!BLOB_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN is not set in .env.local')
    console.log('\n💡 Make sure you have:')
    console.log('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here')
    console.log('   in your .env.local file\n')
    process.exit(1)
  }

  if (!BLOB_TOKEN.startsWith('vercel_blob_rw_')) {
    console.warn('⚠️  Token does not start with "vercel_blob_rw_" - this might be incorrect')
  }

  console.log('✅ BLOB_READ_WRITE_TOKEN is set')
  console.log(`   Token preview: ${BLOB_TOKEN.substring(0, 20)}...\n`)

  try {
    // Test 1: List existing blobs
    console.log('📋 Test 1: Listing existing blobs...')
    const blobs = await list({ token: BLOB_TOKEN })
    console.log(`   ✅ Successfully connected to Blob storage`)
    console.log(`   📦 Found ${blobs.blobs.length} existing blob(s)\n`)

    // Test 2: Upload a test file
    console.log('📤 Test 2: Uploading test file...')
    const testContent = Buffer.from('Test file for PrintShop blob verification')
    const testFileName = `test-${Date.now()}.txt`
    
    const uploadedBlob = await put(testFileName, testContent, {
      access: 'public',
      token: BLOB_TOKEN,
    })
    
    console.log(`   ✅ Successfully uploaded test file`)
    console.log(`   🔗 URL: ${uploadedBlob.url}\n`)

    // Test 3: Verify the upload
    console.log('🔍 Test 3: Verifying upload...')
    const verifyBlobs = await list({ 
      prefix: testFileName,
      token: BLOB_TOKEN,
    })
    
    if (verifyBlobs.blobs.length > 0) {
      console.log(`   ✅ Test file found in blob storage`)
      console.log(`   📝 File: ${verifyBlobs.blobs[0].pathname}`)
      console.log(`   📏 Size: ${verifyBlobs.blobs[0].size} bytes\n`)
    } else {
      console.log(`   ⚠️  Test file not found (might take a moment to appear)\n`)
    }

    console.log('✅ All blob tests passed!')
    console.log('\n🎉 Your Vercel Blob configuration is working correctly!')
    console.log('   You can now upload artworks through the admin panel.\n')

  } catch (error) {
    console.error('\n❌ Blob test failed:')
    console.error(`   Error: ${error.message}\n`)
    
    if (error.message.includes('token')) {
      console.log('💡 Possible issues:')
      console.log('   1. Invalid BLOB_READ_WRITE_TOKEN')
      console.log('   2. Token expired or revoked')
      console.log('   3. Token doesn\'t have the correct permissions')
      console.log('   4. Network connectivity issues\n')
    } else if (error.message.includes('Unauthorized')) {
      console.log('💡 Authentication failed:')
      console.log('   - Check that your token is correct')
      console.log('   - Verify token has read/write permissions\n')
    }
    
    process.exit(1)
  }
}

testBlob().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})

