/**
 * Database utilities for ArtPrints - Read-only operations
 * Artwork management done via direct database access
 * Created by Leon Jordaan
 */

import { sql } from '@vercel/postgres'

// Database connection and utility functions
export { sql }

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create artworks table
    await sql`
      CREATE TABLE IF NOT EXISTS artworks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(255),
        category VARCHAR(100),
        tags TEXT[],
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create artwork sizes table
    await sql`
      CREATE TABLE IF NOT EXISTS artwork_sizes (
        id SERIAL PRIMARY KEY,
        artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        dimensions VARCHAR(100) NOT NULL,
        price_multiplier DECIMAL(3,2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        stripe_session_id VARCHAR(255) UNIQUE,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        shipping_address JSONB,
        billing_address JSONB,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        artwork_id INTEGER REFERENCES artworks(id),
        artwork_title VARCHAR(255) NOT NULL,
        artwork_artist VARCHAR(255) NOT NULL,
        size_name VARCHAR(100) NOT NULL,
        size_dimensions VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_artworks_active ON artworks(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(is_featured)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(stripe_session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`

    console.log('Database initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    return { success: false, error }
  }
}

// Read-only artwork database functions

export async function getArtworks(activeOnly = true) {
  const result = await sql`
    SELECT a.*, 
           json_agg(
             json_build_object(
               'id', s.id,
               'name', s.name,
               'dimensions', s.dimensions,
               'price_multiplier', s.price_multiplier
             ) ORDER BY s.price_multiplier
           ) as sizes
    FROM artworks a
    LEFT JOIN artwork_sizes s ON a.id = s.artwork_id
    ${activeOnly ? sql`WHERE a.is_active = true` : sql``}
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `
  return result.rows
}

export async function getArtworkById(id: number) {
  const result = await sql`
    SELECT a.*, 
           json_agg(
             json_build_object(
               'id', s.id,
               'name', s.name,
               'dimensions', s.dimensions,
               'price_multiplier', s.price_multiplier
             ) ORDER BY s.price_multiplier
           ) as sizes
    FROM artworks a
    LEFT JOIN artwork_sizes s ON a.id = s.artwork_id
    WHERE a.id = ${id}
    GROUP BY a.id
  `
  return result.rows[0]
}

// Order functions for checkout (kept for e-commerce functionality)
export async function createOrder(data: {
  stripe_session_id?: string
  customer_email: string
  customer_name?: string
  shipping_address?: any
  billing_address?: any
  total_amount: number
  status?: string
}) {
  const result = await sql`
    INSERT INTO orders (
      stripe_session_id, customer_email, customer_name, 
      shipping_address, billing_address, total_amount, status
    ) VALUES (
      ${data.stripe_session_id || null}, ${data.customer_email}, ${data.customer_name || ''}, 
      ${JSON.stringify(data.shipping_address || {})}, ${JSON.stringify(data.billing_address || {})}, 
      ${data.total_amount}, ${data.status || 'pending'}
    ) RETURNING *
  `
  return result.rows[0]
}

export async function createOrderItems(orderId: number, items: Array<{
  artwork_id: number
  artwork_title: string
  artwork_artist: string
  size_name: string
  size_dimensions: string
  quantity: number
  unit_price: number
  total_price: number
}>) {
  const results = []
  for (const item of items) {
    const result = await sql`
      INSERT INTO order_items (
        order_id, artwork_id, artwork_title, artwork_artist,
        size_name, size_dimensions, quantity, unit_price, total_price
      ) VALUES (
        ${orderId}, ${item.artwork_id}, ${item.artwork_title}, ${item.artwork_artist},
        ${item.size_name}, ${item.size_dimensions}, ${item.quantity}, 
        ${item.unit_price}, ${item.total_price}
      ) RETURNING *
    `
    results.push(result.rows[0])
  }
  return results
}
