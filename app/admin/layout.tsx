import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSessionFromCookies } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const session = validateSessionFromCookies(cookieStore)

  // Check if session is valid and user is admin
  if (!session.valid || !session.payload) {
    redirect('/login?admin=true')
  }

  // Verify admin role
  if (session.payload.role !== 'admin' && session.payload.sub !== 'admin') {
    redirect('/login?admin=true')
  }

  return <>{children}</>
}

