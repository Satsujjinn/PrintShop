/**
 * Database related types and interfaces
 * Created by Leon Jordaan
 */

/**
 * Database query result
 */
export interface QueryResult<T = unknown> {
  /** Query result rows */
  rows: T[]
  /** Number of affected rows */
  rowCount: number
  /** Command that was executed */
  command: string
  /** Query execution time in milliseconds */
  duration?: number
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  /** Database host */
  host: string
  /** Database port */
  port: number
  /** Database name */
  database: string
  /** Username */
  username: string
  /** Password */
  password: string
  /** SSL configuration */
  ssl: boolean
  /** Connection pool size */
  poolSize: number
  /** Connection timeout */
  connectionTimeoutMillis: number
  /** Idle timeout */
  idleTimeoutMillis: number
}

/**
 * Database transaction interface
 */
export interface DatabaseTransaction {
  /** Execute query within transaction */
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
  /** Commit transaction */
  commit(): Promise<void>
  /** Rollback transaction */
  rollback(): Promise<void>
}

/**
 * Database migration interface
 */
export interface DatabaseMigration {
  /** Migration version */
  version: string
  /** Migration name */
  name: string
  /** Up migration SQL */
  up: string
  /** Down migration SQL */
  down: string
  /** Migration timestamp */
  timestamp: string
}

/**
 * Database table schemas
 */
export interface DatabaseSchemas {
  users: {
    id: number
    email: string
    password_hash: string
    role: string
    name?: string
    image?: string
    created_at: string
    updated_at: string
    email_verified?: boolean
    last_login_at?: string
  }
  
  artworks: {
    id: number
    title: string
    artist: string
    description: string
    base_price: number
    image_url: string
    image_key?: string
    category?: string
    tags?: string[]
    is_featured: boolean
    is_active: boolean
    created_at: string
    updated_at: string
  }
  
  artwork_sizes: {
    id: number
    artwork_id: number
    name: string
    dimensions: string
    price_multiplier: number
    created_at: string
  }
  
  orders: {
    id: number
    stripe_session_id?: string
    customer_email: string
    customer_name?: string
    shipping_address?: Record<string, unknown>
    billing_address?: Record<string, unknown>
    total_amount: number
    status: string
    tracking_number?: string
    shipping_method?: string
    notes?: string
    created_at: string
    updated_at: string
  }
  
  order_items: {
    id: number
    order_id: number
    artwork_id: number
    artwork_title: string
    artwork_artist: string
    size_name: string
    size_dimensions: string
    quantity: number
    unit_price: number
    total_price: number
    created_at: string
  }
}

/**
 * Database query builder interface
 */
export interface QueryBuilder {
  /** SELECT query */
  select(columns: string[] | string): QueryBuilder
  /** FROM clause */
  from(table: string): QueryBuilder
  /** WHERE clause */
  where(condition: string, value?: unknown): QueryBuilder
  /** JOIN clause */
  join(table: string, condition: string): QueryBuilder
  /** LEFT JOIN clause */
  leftJoin(table: string, condition: string): QueryBuilder
  /** ORDER BY clause */
  orderBy(column: string, direction?: 'ASC' | 'DESC'): QueryBuilder
  /** LIMIT clause */
  limit(count: number): QueryBuilder
  /** OFFSET clause */
  offset(count: number): QueryBuilder
  /** GROUP BY clause */
  groupBy(columns: string[] | string): QueryBuilder
  /** HAVING clause */
  having(condition: string, value?: unknown): QueryBuilder
  /** Build and return SQL string */
  toSQL(): string
  /** Execute query */
  execute<T>(): Promise<QueryResult<T>>
}

/**
 * Database connection pool interface
 */
export interface ConnectionPool {
  /** Get connection from pool */
  connect(): Promise<DatabaseConnection>
  /** Execute query using pool */
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
  /** Begin transaction */
  beginTransaction(): Promise<DatabaseTransaction>
  /** Close pool */
  end(): Promise<void>
  /** Get pool statistics */
  getStats(): {
    totalConnections: number
    activeConnections: number
    idleConnections: number
    waitingClients: number
  }
}

/**
 * Database connection interface
 */
export interface DatabaseConnection {
  /** Execute query */
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
  /** Begin transaction */
  beginTransaction(): Promise<DatabaseTransaction>
  /** Release connection back to pool */
  release(): void
  /** Close connection */
  end(): Promise<void>
}

/**
 * Database backup configuration
 */
export interface BackupConfig {
  /** Backup destination */
  destination: string
  /** Backup frequency */
  frequency: 'daily' | 'weekly' | 'monthly'
  /** Number of backups to retain */
  retention: number
  /** Whether to compress backups */
  compress: boolean
  /** Encryption settings */
  encryption?: {
    enabled: boolean
    key: string
  }
}

/**
 * Database health check result
 */
export interface DatabaseHealth {
  /** Whether database is healthy */
  healthy: boolean
  /** Response time in milliseconds */
  responseTime: number
  /** Current active connections */
  activeConnections: number
  /** Database version */
  version: string
  /** Last check timestamp */
  timestamp: string
  /** Error message if unhealthy */
  error?: string
}
