import { NextRequest, NextResponse } from 'next/server'
import { validateRequestSession } from '@/lib/auth'
import { getVisitorRecords, getVisitorSummary } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const session = validateRequestSession(request)

  if (!session.valid) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const [summary, visitors] = await Promise.all([
      getVisitorSummary(),
      getVisitorRecords(),
    ])

    return NextResponse.json({
      summary,
      visitors,
    })
  } catch (error) {
    console.error('Failed to load visitor analytics:', error)
    return NextResponse.json(
      { error: 'Unable to load analytics' },
      { status: 500 }
    )
  }
}

export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

