export interface Department {
  id: string
  name: string
  email: string
  is_admin: boolean
}

export interface Room {
  id: string
  name: string
}

export interface Schedule {
  id: string
  room_id: string
  day_of_week: string
  period_number: number
  department_id: string | null
  course: string | null
  branch: string | null
  section: string | null
  subsection: string | null
  professor_name: string | null
  department?: Department
  room?: Room
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
