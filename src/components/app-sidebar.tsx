'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  DoorOpen,
  LogOut,
  Settings,
  Calendar,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  isAdmin: boolean
  departmentName?: string
}

export function AppSidebar({ isAdmin, departmentName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const adminLinks = [
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/rooms', label: 'Rooms', icon: DoorOpen },
  ]

  const userLinks = [
    { href: '/rooms', label: 'All Rooms', icon: DoorOpen },
    { href: '/my-schedule', label: 'My Schedule', icon: Calendar },
  ]

  const links = isAdmin ? adminLinks : userLinks

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + Title */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="NIT Kurukshetra"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">NIT Kurukshetra</h1>
            <p className="text-xs text-slate-400">Classroom Scheduler</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3">
        <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {isAdmin ? 'Administrator' : `${departmentName || 'Department'}`}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-700/50 space-y-1">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'bg-amber-500/10 text-amber-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          'lg:hidden fixed top-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 text-white transition-all duration-300',
          mobileOpen ? 'left-[216px]' : 'left-4'
        )}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
