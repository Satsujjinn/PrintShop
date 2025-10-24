/**
 * Utility script to generate ADMIN_PASSWORD_HASH values.
 * Usage: node scripts/hash-password.mjs "your-strong-password"
 */

import { randomBytes, scryptSync } from 'crypto'

const PASSWORD_KEY_LENGTH = 64

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-strong-password"')
  process.exit(1)
}

try {
  const hash = hashPassword(password)
  console.log(hash)
} catch (error) {
  console.error('Unable to hash password:', error)
  process.exit(1)
}

