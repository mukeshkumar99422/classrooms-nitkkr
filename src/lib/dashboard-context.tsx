'use client'

import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'

interface DashboardContextType {
  user: User | null
  department: {
    id: string
    name: string
    email: string
    is_admin: boolean
  } | null
  isAdmin: boolean
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

export { DashboardContext }