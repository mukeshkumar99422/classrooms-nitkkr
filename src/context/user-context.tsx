'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Department, Room, Schedule } from '@/lib/types'

interface UserContextType {
  department: Department | null
  // The Cache: Key is roomId, Value is array of Schedules
  scheduleCache: Record<string, Schedule[]>
  setRoomScheduleInCache: (roomId: string, schedules: Schedule[]) => void
  updateScheduleInCache: (roomId: string, scheduleId: string, updatedDetails: Partial<Schedule>) => void

  roomsCache: Room[] | null
  setRoomsInCache: (rooms: Room[]) => void

  departmentsCache: Department[] | null
  setDepartmentsInCache: (departments: Department[]) => void

  departmentScheduleCache: Record<string, Schedule[]>
  setDepartmentScheduleInCache: (departmentId: string, schedules: Schedule[]) => void
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

  //2. cache all rooms at once
  const [roomsCache, setRoomsCache] = useState<Room[] | null>(null)
  const setRoomsInCache = (rooms: Room[]) => setRoomsCache(rooms)

  //3. departments cache
  const [departmentsCache, setDepartmentsCache] = useState<Department[] | null>(null)
  const setDepartmentsInCache = (departments: Department[]) => setDepartmentsCache(departments)

  return (
    <UserContext.Provider value={{ department, scheduleCache, setRoomScheduleInCache, roomsCache, setRoomsInCache, departmentsCache, setDepartmentsInCache, updateScheduleInCache, departmentScheduleCache, setDepartmentScheduleInCache }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}