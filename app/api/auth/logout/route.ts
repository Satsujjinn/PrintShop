import { NextRequest, NextResponse } from 'next/server'
import { buildExpiredSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set(buildExpiredSessionCookie())
  return response
}

export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

