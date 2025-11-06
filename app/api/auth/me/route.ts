import { NextRequest, NextResponse } from 'next/server'
import { validateRequestSession } from '@/lib/auth'
import { getUserById } from '@/lib/users'

export async function GET(request: NextRequest) {
  const session = validateRequestSession(request)

  if (!session.valid || !session.payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // If admin, return admin info
  if (session.payload.sub === 'admin' || session.payload.role === 'admin') {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: 'admin',
        role: 'admin',
      },
    })
  }

  // Get user details
  const user = await getUserById(session.payload.sub)
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'user',
    },
  })
}

export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

