'use client'

import { useState, useRef } from 'react'
import { createRoom, deleteRoom } from '@/app/actions/rooms'
import { bulkUpsertSchedules } from '@/app/actions/schedules'
import { parseScheduleExcel } from '@/lib/excel'
import { Department, Room, Schedule, DAYS_OF_WEEK, PERIODS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, DoorOpen, Upload, Grid3X3, Search, Calendar, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RoomsClientProps {
  rooms: Room[]
  departments: Department[]
  schedules: Schedule[]
}

type ScheduleGrid = Record<string, Record<number, string | null>>

function createEmptyGrid(): ScheduleGrid {
  const grid: ScheduleGrid = {}
  DAYS_OF_WEEK.forEach((day) => {
    grid[day] = {}
    PERIODS.forEach((p) => {
      grid[day][p] = null
    })
  })
  return grid
}

function populateGrid(schedules: Schedule[]): ScheduleGrid {
  const grid = createEmptyGrid()
  schedules.forEach((s) => {
    if (grid[s.day_of_week]) {
      grid[s.day_of_week][s.period_number] = s.department_id
    }
  })
  return grid
}

export default function RoomsClient({
  rooms,
  departments,
  schedules,
}: RoomsClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [grid, setGrid] = useState<ScheduleGrid>(createEmptyGrid())
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const nonAdminDepts = departments.filter((d) => !d.is_admin)
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (formData: FormData) => {
    setLoading(true)
    const result = await createRoom(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Room created successfully')
      setAddOpen(false)
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!selectedRoom) return
    setLoading(true)
    const result = await deleteRoom(selectedRoom.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Room deleted successfully')
      setDeleteOpen(false)
      setSelectedRoom(null)
      router.refresh()
    }
  }

  const openScheduleEditor = (room: Room) => {
    const roomSchedules = schedules.filter((s) => s.room_id === room.id)
    setSelectedRoom(room)
    setGrid(roomSchedules.length > 0 ? populateGrid(roomSchedules) : createEmptyGrid())
    setUploadErrors([])
    setScheduleOpen(true)
  }

  const handleSaveSchedule = async () => {
    if (!selectedRoom) return
    setLoading(true)

    const scheduleData: Array<{
      day_of_week: string
      period_number: number
      department_id: string | null
    }> = []

    DAYS_OF_WEEK.forEach((day) => {
      PERIODS.forEach((period) => {
        scheduleData.push({
          day_of_week: day,
          period_number: period,
          department_id: grid[day][period] || null,
        })
      })
    })

    const result = await bulkUpsertSchedules(selectedRoom.id, scheduleData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Schedule saved successfully')
      setScheduleOpen(false)
      router.refresh()
    }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const data = await file.arrayBuffer()
    const result = parseScheduleExcel(data, nonAdminDepts)

    if (result.errors.length > 0) {
      setUploadErrors(result.errors)
      toast.error(`Found ${result.errors.length} error(s) in Excel file`)
      return
    }

    // Map department names to IDs
    const newGrid = createEmptyGrid()
    result.schedules.forEach((s) => {
      const dept = nonAdminDepts.find(
        (d) => d.name.toLowerCase() === s.department_name.toLowerCase()
      )
      if (dept && newGrid[s.day_of_week]) {
        newGrid[s.day_of_week][s.period_number] = dept.id
      }
    })

    setGrid(newGrid)
    setUploadErrors([])
    toast.success('Excel file parsed successfully. Review and save.')

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const updateCell = (day: string, period: number, value: string | null) => {
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: value === '__empty__' ? null : value,
      },
    }))
  }

  const getRoomScheduleCount = (roomId: string) => {
    return schedules.filter((s) => s.room_id === roomId).length
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DoorOpen className="h-7 w-7 text-amber-400" />
            Rooms
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage classrooms and their weekly schedules
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={<Button className="bg-amber-600 hover:bg-amber-500 text-white" />}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the room name with building prefix (e.g., M312, E201, L102).
              </DialogDescription>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Room Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., M312"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Room'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search rooms (e.g., M3, E2)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 max-w-sm"
        />
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          {search ? 'No rooms match your search' : 'No rooms added yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const slotCount = getRoomScheduleCount(room.id)
            return (
              <div
                key={room.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-amber-500/10 p-2.5 rounded-lg">
                    <DoorOpen className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 h-8 w-8 p-0"
                      onClick={() => openScheduleEditor(room)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedRoom(room)
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg">{room.name}</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {slotCount > 0 ? `${slotCount} slots assigned` : 'No schedule yet'}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 w-full justify-start px-0"
                  onClick={() => openScheduleEditor(room)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {slotCount > 0 ? 'Edit Schedule' : 'Set Schedule'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule Editor Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-amber-400" />
              Schedule — {selectedRoom?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Set the weekly schedule by selecting departments for each slot, or upload an Excel file.
            </DialogDescription>
          </DialogHeader>

          {/* Upload Area */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3 px-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Upload className="h-4 w-4" />
              Upload Excel:
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-500 file:cursor-pointer"
            />
          </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 font-medium text-sm mb-1">Errors found in Excel:</p>
              <ul className="text-red-400/80 text-xs space-y-1">
                {uploadErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-400 font-semibold bg-slate-700/30 rounded-tl-lg sticky left-0 z-10 min-w-[90px]">
                    Day / Period
                  </th>
                  {PERIODS.map((p) => (
                    <th key={p} className="p-2 text-center text-slate-400 font-semibold bg-slate-700/30 min-w-[130px]">
                      P{p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => (
                  <tr key={day} className="border-t border-slate-700/30">
                    <td className="p-2 text-white font-medium bg-slate-800/50 sticky left-0 z-10">
                      {day.slice(0, 3)}
                    </td>
                    {PERIODS.map((period) => (
                      <td key={period} className="p-1.5">
                        <Select
                          value={grid[day]?.[period] || '__empty__'}
                          onValueChange={(val) => updateCell(day, period, val)}
                        >
                          <SelectTrigger className="bg-slate-700/30 border-slate-600/50 text-white text-xs h-9 hover:bg-slate-700/60 transition-colors">
                            <span>
                              {grid[day]?.[period]
                                ? nonAdminDepts.find((d) => d.id === grid[day][period])?.name || '—'
                                : '—'}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="__empty__" className="text-slate-500">
                              — Empty —
                            </SelectItem>
                            {nonAdminDepts.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id} className="text-white">
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setScheduleOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchedule}
              className="bg-amber-600 hover:bg-amber-500"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will permanently delete room &quot;{selectedRoom?.name}&quot; and all its schedule data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
