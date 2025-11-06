#!/usr/bin/env node
/**
 * Setup script to create .env.local from .env.example
 * Created by Leon Jordaan
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { randomBytes } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const envExamplePath = path.join(rootDir, '.env.example')
const envLocalPath = path.join(rootDir, '.env.local')

// Generate a random AUTH_SECRET
function generateAuthSecret() {
  return randomBytes(32).toString('hex')
}

// Check if .env.local already exists
if (existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('If you want to recreate it, delete the existing file first.')
  process.exit(1)
}

// Check if .env.example exists
if (!existsSync(envExamplePath)) {
  console.error('❌ .env.example not found!')
  process.exit(1)
}

try {
  // Read .env.example
  const exampleContent = readFileSync(envExamplePath, 'utf8')
  
  // Generate AUTH_SECRET
  const authSecret = generateAuthSecret()
  
  // Replace placeholder AUTH_SECRET
  const envContent = exampleContent.replace(
    'AUTH_SECRET=your_random_secret_here_minimum_32_characters',
    `AUTH_SECRET=${authSecret}`
  )
  
  // Write .env.local
  writeFileSync(envLocalPath, envContent, 'utf8')
  
  console.log('✅ Created .env.local successfully!')
  console.log('')
  console.log('📝 Next steps:')
  console.log('1. Edit .env.local and add your BLOB_READ_WRITE_TOKEN')
  console.log('2. Get your token from: https://vercel.com/dashboard/stores')
  console.log('3. Restart your development server')
  console.log('')
  console.log('🔐 Admin credentials:')
  console.log('   Email: leonjordaan10@gmail.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('✨ AUTH_SECRET has been automatically generated!')
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  process.exit(1)
}

