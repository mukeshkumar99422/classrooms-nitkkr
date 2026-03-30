'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Department, Schedule } from '@/lib/types'

interface UserContextType {
  department: Department | null
  // The Cache: Key is roomId, Value is array of Schedules
  scheduleCache: Record<string, Schedule[]>
  setRoomInCache: (roomId: string, schedules: Schedule[]) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ 
  children, 
  initialDepartment 
}: { 
  children: ReactNode, 
  initialDepartment: Department | null 
}) {
  const [department] = useState(initialDepartment)
  const [scheduleCache, setScheduleCache] = useState<Record<string, Schedule[]>>({})

  const setRoomInCache = (roomId: string, schedules: Schedule[]) => {
    setScheduleCache((prev) => ({ ...prev, [roomId]: schedules }))
  }

  return (
    <UserContext.Provider value={{ department, scheduleCache, setRoomInCache }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}