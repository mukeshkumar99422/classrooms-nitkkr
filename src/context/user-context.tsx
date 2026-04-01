'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Department, Room, Schedule } from '@/lib/types'

interface UserContextType {
  department: Department | null
  scheduleCache: Record<string, Schedule[]>
  setRoomScheduleInCache: (roomId: string, schedules: Schedule[]) => void
  setScheduleCache: (cache: Record<string, Schedule[]>) => void
  updateScheduleInCache: (roomId: string, scheduleId: string, updatedDetails: Partial<Schedule>) => void

  roomsCache: Room[] | null
  setRoomsInCache: (rooms: Room[]) => void

  departmentsCache: Department[] | null
  setDepartmentsInCache: (departments: Department[]) => void

  departmentScheduleCache: Record<string, Schedule[]>
  setDepartmentScheduleInCache: (departmentId: string, schedules: Schedule[]) => void

  clearCache: () => void
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

  //1. schedule cache: { [roomId]: Schedule[] }
  const [scheduleCache, setScheduleCache] = useState<Record<string, Schedule[]>>({})
  const setRoomScheduleInCache = (roomId: string, schedules: Schedule[]) => {
    setScheduleCache((prev) => ({ ...prev, [roomId]: schedules }))
  }
  const updateScheduleInCache = (roomId: string, scheduleId: string, updatedDetails: Partial<Schedule>) => {
    setScheduleCache((prev) => {
      const currentRoomSchedules = prev[roomId] || [];
      const updatedSchedules = currentRoomSchedules.map((s) =>
        s.id === scheduleId ? { ...s, ...updatedDetails } : s
      );
      return { ...prev, [roomId]: updatedSchedules };
    });
  };

  //2. department schedule chache: { [departmentId]: Schedule[] }
  const [departmentScheduleCache, setDepartmentScheduleCache] = useState<Record<string, Schedule[]>>({})
  const setDepartmentScheduleInCache = (departmentId: string, schedules: Schedule[]) => {
    setDepartmentScheduleCache((prev) => ({ ...prev, [departmentId]: schedules || [] }))
  }

  //3. cache all rooms at once
  const [roomsCache, setRoomsCache] = useState<Room[] | null>(null)
  const setRoomsInCache = (rooms: Room[]) => setRoomsCache(rooms)

  //4. departments cache
  const [departmentsCache, setDepartmentsCache] = useState<Department[] | null>(null)
  const setDepartmentsInCache = (departments: Department[]) => setDepartmentsCache(departments)

  // --- CLEANUP FUNCTION ---
  const clearCache = () => {
    setScheduleCache({})
    setDepartmentScheduleCache({})
    setRoomsCache(null)
    setDepartmentsCache(null)
  }

  return (
    <UserContext.Provider value={{ department, 
    scheduleCache,
    setScheduleCache, 
    setRoomScheduleInCache, 
    roomsCache, 
    setRoomsInCache, 
    departmentsCache, 
    setDepartmentsInCache, 
    updateScheduleInCache, 
    departmentScheduleCache, 
    setDepartmentScheduleInCache, 
    clearCache,
   }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}