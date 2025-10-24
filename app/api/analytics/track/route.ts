import { NextRequest, NextResponse } from 'next/server'
import { trackVisitor } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    let payload: { path?: string; referer?: string | null } = {}
    try {
      payload = await request.json()
    } catch {
      // Ignore JSON parsing errors – treat as empty payload
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || request.ip || null
    const userAgent = request.headers.get('user-agent')
    const referer = payload.referer ?? request.headers.get('referer')
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      null

    await trackVisitor({
      ip,
      userAgent,
      path: payload.path || request.nextUrl.pathname,
      referer,
      country,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Visitor tracking failed:', error)
    return NextResponse.json(
      { error: 'Unable to record visit' },
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

