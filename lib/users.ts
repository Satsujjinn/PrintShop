/**
 * User database functions
 * Created by Leon Jordaan
 */

import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { User, CreateUserInput } from '@/types'

// Use /tmp in serverless environments (Vercel, Lambda), otherwise use project data dir
const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME
const DATA_DIR = isServerless 
  ? '/tmp/data' 
  : path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

interface UsersStore {
  version: number
  users: User[]
}

const DEFAULT_STORE: UsersStore = {
  version: 1,
  users: [],
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

async function readStore(): Promise<UsersStore> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as UsersStore
    if (!parsed.users) {
      return { ...DEFAULT_STORE }
    }
    return parsed
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { ...DEFAULT_STORE }
    }
    console.error('Failed to read users store:', error)
    return { ...DEFAULT_STORE }
  }
}

async function writeStore(store: UsersStore): Promise<void> {
  await ensureDataDir()
  const payload = JSON.stringify(store, null, 2)
  await fs.writeFile(USERS_FILE, payload, 'utf8')
}

/**
 * Get all users (for admin purposes)
 */
export async function getAllUsers(): Promise<User[]> {
  const store = await readStore()
  return store.users.map(({ passwordHash, ...user }) => ({
    ...user,
    passwordHash, // Keep hash for verification, but don't expose in API
  }))
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const store = await readStore()
  return store.users.find(u => u.id === id) || null
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const store = await readStore()
  const normalizedEmail = email.trim().toLowerCase()
  return store.users.find(u => u.email.toLowerCase() === normalizedEmail) || null
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput, passwordHash: string): Promise<User> {
  const store = await readStore()
  const normalizedEmail = input.email.trim().toLowerCase()
  
  // Check if user already exists
  const existing = store.users.find(u => u.email.toLowerCase() === normalizedEmail)
  if (existing) {
    throw new Error('User with this email already exists')
  }
  
  const now = new Date().toISOString()
  const user: User = {
    id: randomUUID(),
    email: normalizedEmail,
    name: input.name.trim(),
    passwordHash,
    createdAt: now,
    updatedAt: now,
  }
  
  store.users.push(user)
  await writeStore(store)
  
  return user
}

/**
 * Update user information
 */
export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>): Promise<User | null> {
  const store = await readStore()
  const index = store.users.findIndex(u => u.id === id)
  
  if (index === -1) {
    return null
  }
  
  store.users[index] = {
    ...store.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  await writeStore(store)
  return store.users[index]
}

/**
 * Update user password
 */
export async function updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
  const store = await readStore()
  const index = store.users.findIndex(u => u.id === id)
  
  if (index === -1) {
    return false
  }
  
  store.users[index].passwordHash = passwordHash
  store.users[index].updatedAt = new Date().toISOString()
  
  await writeStore(store)
  return true
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const store = await readStore()
  const initialLength = store.users.length
  store.users = store.users.filter(u => u.id !== id)
  
  if (store.users.length === initialLength) {
    return false
  }
  
  await writeStore(store)
  return true
}

