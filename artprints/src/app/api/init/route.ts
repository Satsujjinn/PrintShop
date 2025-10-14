import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function POST() {
  try {
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to initialize database',
        details: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
