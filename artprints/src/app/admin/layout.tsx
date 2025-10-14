'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { 
  Palette, 
  LayoutDashboard, 
  ImageIcon, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Artworks', href: '/admin/artworks', icon: ImageIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Skip auth check for login page
    if (pathname === '/admin/login') return

    if (!session?.user || session.user.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router, pathname])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login page
  if (pathname === '/admin/login' || !session?.user || session.user.role !== 'admin') {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-neutral-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-neutral-900">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
          <SidebarContent navigation={navigation} pathname={pathname} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-neutral-50 dark:bg-neutral-950">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  navigation, 
  pathname, 
  onSignOut 
}: { 
  navigation: any[], 
  pathname: string, 
  onSignOut: () => void 
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6 py-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-black dark:text-white">ArtPrints</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 pb-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-soft'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-500'
                }`}
              />
              {item.name}
            </a>
          )
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 flex border-t border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {/* session?.user?.email */} admin@artprints.com
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="ml-3 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <LogOut className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>
    </>
  )
}
