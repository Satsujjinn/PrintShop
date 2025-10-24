import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSessionFromCookies } from '@/lib/auth'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies()
  const session = validateSessionFromCookies(cookieStore)

  if (!session.valid) {
    redirect('/login')
  }

  return <>{children}</>
}

