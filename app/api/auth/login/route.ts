import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCredentials, createUserSessionToken, buildSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const isValid = await verifyAdminCredentials(email, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = createUserSessionToken('admin', 'admin')
    const response = NextResponse.json({
      success: true,
      user: {
        id: 'admin',
        email: email,
        role: 'admin',
      },
    })
    response.cookies.set(buildSessionCookie(token))

    return response
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unable to process login request'
    
    // Provide more specific error messages for common issues
    if (errorMessage.includes('ADMIN_EMAIL') || errorMessage.includes('ADMIN_PASSWORD_HASH') || errorMessage.includes('AUTH_SECRET')) {
      return NextResponse.json(
        { error: 'Server configuration error. Please check environment variables.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

