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

// Artwork database functions
export async function createArtwork(data: {
  title: string
  artist: string
  description: string
  base_price: number
  image_url: string
  image_key?: string
  category?: string
  tags?: string[]
  is_featured?: boolean
}) {
  const result = await sql`
    INSERT INTO artworks (
      title, artist, description, base_price, image_url, image_key, 
      category, tags, is_featured
    ) VALUES (
      ${data.title}, ${data.artist}, ${data.description}, ${data.base_price}, 
      ${data.image_url}, ${data.image_key || ''}, ${data.category || ''}, 
      ${data.tags || []}, ${data.is_featured || false}
    ) RETURNING *
  `
  return result.rows[0]
}

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

export async function updateArtwork(id: number, data: Partial<{
  title: string
  artist: string
  description: string
  base_price: number
  image_url: string
  image_key: string
  category: string
  tags: string[]
  is_featured: boolean
  is_active: boolean
}>) {
  const setClauses = []
  const values = []
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = $${values.length + 1}`)
      values.push(value)
    }
  })
  
  if (setClauses.length === 0) return null
  
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)
  
  const query = `
    UPDATE artworks 
    SET ${setClauses.join(', ')} 
    WHERE id = $${values.length}
    RETURNING *
  `
  
  const result = await sql.query(query, values)
  return result.rows[0]
}

export async function deleteArtwork(id: number) {
  const result = await sql`
    DELETE FROM artworks WHERE id = ${id} RETURNING *
  `
  return result.rows[0]
}

// Artwork sizes functions
export async function createArtworkSizes(artworkId: number, sizes: Array<{
  name: string
  dimensions: string
  price_multiplier: number
}>) {
  const results = []
  for (const size of sizes) {
    const result = await sql`
      INSERT INTO artwork_sizes (artwork_id, name, dimensions, price_multiplier)
      VALUES (${artworkId}, ${size.name}, ${size.dimensions}, ${size.price_multiplier})
      RETURNING *
    `
    results.push(result.rows[0])
  }
  return results
}

export async function updateArtworkSizes(artworkId: number, sizes: Array<{
  name: string
  dimensions: string
  price_multiplier: number
}>) {
  // Delete existing sizes
  await sql`DELETE FROM artwork_sizes WHERE artwork_id = ${artworkId}`
  
  // Create new sizes
  return createArtworkSizes(artworkId, sizes)
}

// Order functions
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

export async function getOrders() {
  const result = await sql`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'id', oi.id,
               'artwork_id', oi.artwork_id,
               'artwork_title', oi.artwork_title,
               'artwork_artist', oi.artwork_artist,
               'size_name', oi.size_name,
               'size_dimensions', oi.size_dimensions,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total_price', oi.total_price
             )
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
  return result.rows
}

export async function updateOrderStatus(id: number, status: string) {
  const result = await sql`
    UPDATE orders 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

// User functions
export async function createUser(email: string, passwordHash: string, role = 'user') {
  const result = await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email}, ${passwordHash}, ${role})
    RETURNING id, email, role, created_at
  `
  return result.rows[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return result.rows[0]
}
