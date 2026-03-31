'use client'

import { useState } from 'react'
import { updateScheduleDetails } from '@/app/actions/schedules'
import { Room, Schedule, DAYS_OF_WEEK, PERIODS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, ArrowLeft, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/context/user-context'
import { getAllDepartments } from '@/app/actions/departments'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface RoomDetailClientProps {
  room: Room
  schedules: Schedule[]
  currentDepartmentId: string
}


// Main component ----------------------------------------
export default function RoomDetailClient({
  room,
  schedules: initialSchedules,
  currentDepartmentId,
}: RoomDetailClientProps) {

  const { departmentsCache, setDepartmentsInCache,setDepartmentScheduleInCache} = useUser()
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(!departmentsCache)
  const router = useRouter()

  // ------------------------------------------------
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules)
  useEffect(() => {
    setSchedules(initialSchedules)
  }, [initialSchedules])

  //-------------------------------------------------
  //set departments chache on load
  useEffect(()=>{
    async function initDepartments() {
      if (departmentsCache) return // Skip if we already have them
      try {
        const data = await getAllDepartments()
        setDepartmentsInCache(data)
      } catch (e) {
        console.error("Failed to fetch departments", e)
      }
      finally {        
        setLoadingDepartments(false)
      }
    }
    initDepartments()
  }, [departmentsCache, setDepartmentsInCache])
  const departments = departmentsCache || []

  //----------------------------------------------
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return null
    return departments.find((d) => d.id === deptId)?.name || null
  }

  const getSlot = (day: string, period: number): Schedule | undefined => {
    return schedules.find(
      (s) => s.day_of_week === day && s.period_number === period
    )
  }

  //-----------------------------------------------
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSchedule) return
    
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const updatedDetails = {
      course: formData.get('course') as string,
      branch: formData.get('branch') as string,
      section: formData.get('section') as string,
      subsection: formData.get('subsection') as string,
      professor_name: formData.get('professor_name') as string,
    }

    // --- OPTIMISTIC UPDATE START ---
    const previousSchedules = [...schedules]
    const optimisticData = schedules.map((s) =>
      s.id === selectedSchedule.id ? { ...s, ...updatedDetails } : s
    )
    setSchedules(optimisticData)
    setEditOpen(false) 
    // --- OPTIMISTIC UPDATE END ---

    //UPDATE CACHE
    setDepartmentScheduleInCache(selectedSchedule.department_id || '', [])

    try {
      const result = await updateScheduleDetails(selectedSchedule.id, updatedDetails)

      if (result.error) {
        // Handle specific server-returned errors
        toast.error(result.error)
        setSchedules(previousSchedules) // Rollback UI
      } else {
        toast.success('Schedule updated successfully')
        router.refresh() 
      }
    } catch (err) {
      console.error("Update failed:", err)
      toast.error("Network error: Failed to save changes.")
      setSchedules(previousSchedules) // Rollback UI
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    const { generateScheduleExcel } = await import('@/lib/excel')
    const excelData = generateScheduleExcel(room.name, schedules.map(s => ({
      ...s,
      department: departments.find(d => d.id === s.department_id),
    })))
    const blob = new Blob([excelData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${room.name}_schedule.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Schedule downloaded')
  }

  //if departments are still loading, show a loader
  if(loadingDepartments) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href='/rooms'
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <DoorOpen className="h-6 w-6 text-amber-400" />
              Room {room.name}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Weekly Schedule</p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
          <span className="text-slate-400">Your Department</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600/50" />
          <span className="text-slate-400">Other Departments</span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="rounded-xl border border-slate-700/50 overflow-x-auto bg-slate-800/30">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 text-left text-slate-400 font-semibold bg-slate-700/30 border-b border-slate-700/50 sticky left-0 z-10 min-w-[100px]">
                Day
              </th>
              {PERIODS.map((p) => (
                <th
                  key={p}
                  className="p-3 text-center text-slate-400 font-semibold bg-slate-700/30 border-b border-slate-700/50 min-w-[120px]"
                >
                  Period {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day, dayIdx) => (
              <tr key={day} className={dayIdx < DAYS_OF_WEEK.length - 1 ? 'border-b border-slate-700/30' : ''}>
                <td className="p-3 text-white font-semibold bg-slate-800/80 sticky left-0 z-10 border-r border-slate-700/30">
                  {day}
                </td>
                {PERIODS.map((period) => {
                  const slot = getSlot(day, period)
                  const deptName = slot ? getDeptName(slot.department_id) : null
                  const isOwnDept = slot?.department_id === currentDepartmentId
                  const canEdit = isOwnDept

                  return (
                    <td
                      key={period}
                      className={`p-2 text-center border-r border-slate-700/20 transition-colors ${
                        isOwnDept
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : slot?.department_id
                          ? 'bg-slate-700/20'
                          : ''
                      } ${canEdit ? 'cursor-pointer hover:bg-amber-500/20' : ''}`}
                      onClick={() => {
                        if (canEdit && slot) {
                          setSelectedSchedule(slot)
                          setEditOpen(true)
                        }
                      }}
                    >
                      {deptName ? (
                        <div className="space-y-0.5">
                          <div
                            className={`text-xs font-semibold ${
                              isOwnDept ? 'text-amber-400' : 'text-slate-300'
                            }`}
                          >
                            {deptName}
                          </div>
                          {slot?.course && (
                            <div className="text-[10px] text-slate-500">
                              {slot.course}
                              {slot.branch && ` - ${slot.branch}`}
                            </div>
                          )}
                          {slot?.section && (
                            <div className="text-[10px] text-slate-500">
                              {slot.section}
                              {slot.subsection && `/${slot.subsection}`}
                            </div>
                          )}
                          {slot?.professor_name && (
                            <div className="text-[10px] text-blue-400">
                              {slot.professor_name}
                            </div>
                          )}
                          {canEdit && !slot?.course && (
                            <div className="text-[10px] text-amber-500/60 italic">
                              Click to edit
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              Edit Schedule — {selectedSchedule?.day_of_week} Period{' '}
              {selectedSchedule?.period_number}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Course *</Label>
              <Input
                name="course"
                defaultValue={selectedSchedule?.course || ''}
                required
                placeholder="e.g., Data Structures"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Branch *</Label>
              <Input
                name="branch"
                defaultValue={selectedSchedule?.branch || ''}
                required
                placeholder="e.g., CSE"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Section *</Label>
                <Input
                  name="section"
                  defaultValue={selectedSchedule?.section || ''}
                  required
                  placeholder="e.g., A"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Subsection</Label>
                <Input
                  name="subsection"
                  defaultValue={selectedSchedule?.subsection || ''}
                  placeholder="Optional"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Professor Name</Label>
              <Input
                name="professor_name"
                defaultValue={selectedSchedule?.professor_name || ''}
                placeholder="Optional"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
                className="text-slate-400 hover:text-white"
                disabled={loading} // Disable cancel while saving
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-600 hover:bg-amber-500 min-w-[80px]" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
