'use client'

import { useState, useRef, useEffect } from 'react'
import { createRoom, deleteRoom } from '@/app/actions/rooms'
import { bulkUpsertSchedules, getRoomSchedule } from '@/app/actions/schedules'
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
} from '@/components/ui/select'
import { Plus, Trash2, DoorOpen, Upload, Grid3X3, Search, Calendar, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/user-context'

interface RoomsClientProps {
  rooms: Room[]
  departments: Department[]
  initialScheduleCounts?: Record<string, number> // Optional: Pass counts from server for better UX
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

// Main component -----------------------------------------------------------------------------
export default function RoomsClient({
  rooms,
  departments,
  initialScheduleCounts = {},
}: RoomsClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [grid, setGrid] = useState<ScheduleGrid>(createEmptyGrid())
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [isFetching, setIsFetching] = useState<string | null>(null) // Stores ID of room being fetched
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { scheduleCache, setRoomInCache } = useUser()

  const nonAdminDepts = departments.filter((d) => !d.is_admin)


  //optimistic ui change
  const [optimisticRooms, setOptimisticRooms] = useState<Room[]>(rooms)

  useEffect(() => {
    setOptimisticRooms(rooms)
  }, [rooms])

  const filteredRooms = optimisticRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  //-----------
  const handleAdd = async (formData: FormData) => {
    const name = formData.get('name') as string
    if (!name) return

    const tempRoom: Room = {
      id: Math.random().toString(), // Temporary ID
      name: name,
    }

    setOptimisticRooms((prev) => [...prev, tempRoom])
    setAddOpen(false)

    const result = await createRoom(formData)

    if (result.error) {
      toast.error(result.error)
      // ROLLBACK: Reset to the official rooms prop from server
      setOptimisticRooms(rooms)
    } else {
      toast.success('Room created successfully')
      router.refresh() // This will eventually update 'rooms' prop and our useEffect
    }
  }

  //-----------
  const handleDelete = async () => {
    if (!selectedRoom) return

    const previousRooms = [...optimisticRooms]

    setOptimisticRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id))
    setDeleteOpen(false)

    const result = await deleteRoom(selectedRoom.id)

    if (result.error) {
      toast.error(result.error)
      // ROLLBACK: Restore the list if the server failed
      setOptimisticRooms(previousRooms)
    } else {
      toast.success('Room deleted successfully')
      setSelectedRoom(null)
      router.refresh()
    }
  }

  //-----------
  const openScheduleEditor = async (room: Room) => {
    setSelectedRoom(room)
    
    if (scheduleCache[room.id]) {
      setGrid(populateGrid(scheduleCache[room.id]))
      setScheduleOpen(true)
      return
    }

    setIsFetching(room.id)
    const result = await getRoomSchedule(room.id)
    setIsFetching(null)

    if (result && 'data' in result && result.data) {
      const fetchedData = result.data as Schedule[]
      
      setRoomInCache(room.id, fetchedData) 
      
      setGrid(populateGrid(fetchedData))
      setScheduleOpen(true)
    } else if (result && 'error' in result) {
      toast.error(result.error as string)
    }
  }

  //-----------
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
      const savedSchedules = scheduleData
        .filter(s => s.department_id !== null)
        .map(s => ({ 
          ...s, 
          id: Math.random().toString(),
          room_id: selectedRoom.id 
        })) as Schedule[]
      
      setRoomInCache(selectedRoom.id, savedSchedules)
      
      toast.success('Schedule saved and synchronized')
      setScheduleOpen(false)
    }
  }

  //-----------
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { parseScheduleExcel } = await import('@/lib/excel')
    const data = await file.arrayBuffer()
    const result = parseScheduleExcel(data, nonAdminDepts)

    if (result.errors.length > 0) {
      setUploadErrors(result.errors)
      toast.error(`Found ${result.errors.length} error(s) in Excel file`)
      return
    }

    // 1. PRE-INDEX DEPARTMENTS: Create a Map for O(1) lookups
    const deptMap = new Map(
      nonAdminDepts.map((d) => [d.name.toLowerCase().trim(), d.id])
    )

    const newGrid = createEmptyGrid()
    const unrecognizedDepts = new Set<string>()

    // 2. EFFICIENT MAPPING: Loop through Excel rows
    result.schedules.forEach((s) => {
      const normalizedName = s.department_name.toLowerCase().trim()
      const deptId = deptMap.get(normalizedName)
      
      if (deptId && newGrid[s.day_of_week]) {
        newGrid[s.day_of_week][s.period_number] = deptId
      } else if (normalizedName !== "") {
        // Collect names that didn't match for a helpful warning
        unrecognizedDepts.add(s.department_name)
      }
    })

    // 3. UI UPDATES
    setGrid(newGrid)
    setUploadErrors([])
    
    if (unrecognizedDepts.size > 0) {
      const names = Array.from(unrecognizedDepts).join(', ')
      toast.warning(`Excel parsed, but some departments weren't recognized: ${names}`)
    } else {
      toast.success('Excel file parsed successfully. Review and save.')
    }

    // Reset file input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }


  //-----------
  const updateCell = (day: string, period: number, value: string | null) => {
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: value === '__empty__' ? null : value,
      },
    }))
  }


  //-----------
  const getRoomScheduleCount = (roomId: string) => {
    if (scheduleCache[roomId]) return scheduleCache[roomId].length
    return initialScheduleCounts[roomId] || 0
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
          <p className="text-slate-400 text-sm mt-1">Manage classrooms and their weekly schedules</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Room
              </Button>
            }
          />
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription className="text-slate-400">Enter the room name with building prefix.</DialogDescription>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Room Name</Label>
                <Input name="name" placeholder="e.g., M312" required className="bg-slate-700/50 border-slate-600 text-white" />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500" disabled={loading}>{loading ? 'Adding...' : 'Add Room'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 max-w-sm"
        />
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-16 text-slate-500">{search ? 'No match found' : 'No rooms added yet'}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const slotCount = getRoomScheduleCount(room.id)
            const currentlyFetching = isFetching === room.id
            return (
              <div key={room.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-amber-500/10 p-2.5 rounded-lg">
                    <DoorOpen className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm" variant="ghost" className="text-slate-400 hover:text-amber-400 h-8 w-8 p-0"
                      disabled={currentlyFetching}
                      onClick={() => openScheduleEditor(room)}
                    >
                      {currentlyFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
                      onClick={() => { setSelectedRoom(room); setDeleteOpen(true); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg">{room.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{slotCount > 0 ? `${slotCount} slots assigned` : 'No schedule yet'}</p>
                <Button
                  size="sm" variant="ghost" className="mt-3 text-amber-400 hover:text-amber-300 w-full justify-start px-0"
                  disabled={currentlyFetching}
                  onClick={() => openScheduleEditor(room)}
                >
                  {currentlyFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                  {slotCount > 0 ? 'Edit Schedule' : 'Set Schedule'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule Editor Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white w-[95vw] max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {uploadErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs font-bold mb-1">Excel Errors:</p>
              <ul className="list-disc list-inside">
                {uploadErrors.map((err, i) => (
                  <li key={i} className="text-red-400/80 text-[10px]">{err}</li>
                ))}
              </ul>
            </div>
          )}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-amber-400" /> Schedule — {selectedRoom?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3 py-3 px-4 bg-slate-700/30 rounded-lg mb-4">
            <Upload className="h-4 w-4 text-slate-300" />
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="text-sm text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            {/* Container with horizontal scroll */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-slate-700 rounded-lg">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-700/50">
                        {/* Sticky Day/Period Header */}
                        <th className="sticky left-0 z-20 p-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border-r border-b border-slate-700 min-w-[100px]">
                          Day / Period
                        </th>
                        {PERIODS.map((p) => (
                          <th key={p} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 min-w-[140px]">
                            Period {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/30">
                      {DAYS_OF_WEEK.map((day) => (
                        <tr key={day} className="hover:bg-slate-700/20 transition-colors">
                          {/* Sticky Day Name Cell */}
                          <td className="sticky left-0 z-10 p-3 text-sm font-semibold text-white bg-slate-800 border-r border-b border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                            {day}
                          </td>
                          {PERIODS.map((period) => (
                            <td key={period} className="p-2 border-b border-slate-700">
                              <Select 
                                value={grid[day]?.[period] || '__empty__'} 
                                onValueChange={(val) => updateCell(day, period, val)}
                              >
                                <SelectTrigger className="w-full bg-slate-900/50 border-slate-600/50 text-white text-xs h-10 hover:bg-slate-700/50 focus:ring-amber-500/50">
                                  <span className="truncate">
                                    {grid[day]?.[period] 
                                      ? nonAdminDepts.find(d => d.id === grid[day][period])?.name 
                                      : '—'}
                                  </span>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="__empty__" className="text-slate-500">Empty</SelectItem>
                                  {nonAdminDepts.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="text-white">
                                      {d.name}
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
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule} className="bg-amber-600 hover:bg-amber-500" disabled={loading}>{loading ? 'Saving...' : 'Save Schedule'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Delete Room</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-500" disabled={loading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}