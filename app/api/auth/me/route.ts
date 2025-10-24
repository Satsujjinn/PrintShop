import { NextRequest, NextResponse } from 'next/server'
import { validateRequestSession } from '@/lib/auth'

export function GET(request: NextRequest) {
  const session = validateRequestSession(request)

  if (!session.valid || !session.payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      role: session.payload.sub,
    },
  })
}

export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

