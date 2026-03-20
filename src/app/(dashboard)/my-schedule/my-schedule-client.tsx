'use client'

import { Department, Room, Schedule, DAYS_OF_WEEK, PERIODS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Download, Calendar, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface MyScheduleClientProps {
  department: Department
  schedules: Schedule[]
  rooms: Room[]
}

export default function MyScheduleClient({
  department,
  schedules,
  rooms
}: MyScheduleClientProps) {
  // Group schedules by room
  const byRoom = schedules.reduce<Record<string, Schedule[]>>((acc, s) => {
    if (!acc[s.room_id]) acc[s.room_id] = []
    acc[s.room_id].push(s)
    return acc
  }, {})

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || roomId
  }

  const getSlot = (roomSchedules: Schedule[], day: string, period: number) => {
    return roomSchedules.find(
      (s) => s.day_of_week === day && s.period_number === period
    )
  }

  const handleDownloadAll = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()

    Object.entries(byRoom).forEach(([roomId, roomSchedules]) => {
      const roomName = getRoomName(roomId)
      const header = ['Day / Period', ...PERIODS.map((p) => `P${p}`)]
      const rows = DAYS_OF_WEEK.map((day) => {
        const row: string[] = [day]
        PERIODS.forEach((period) => {
          const slot = getSlot(roomSchedules, day, period)
          if (slot) {
            let cell = department.name
            if (slot.course) {
              cell += ` | ${slot.course}`
              if (slot.branch) cell += ` - ${slot.branch}`
              if (slot.section) cell += ` (${slot.section})`
              if (slot.professor_name) cell += ` | ${slot.professor_name}`
            }
            row.push(cell)
          } else {
            row.push('')
          }
        })
        return row
      })

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = [{ wch: 12 }, ...PERIODS.map(() => ({ wch: 30 }))]
      XLSX.utils.book_append_sheet(wb, ws, roomName.slice(0, 31))
    })

    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${department.name}_full_schedule.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Full schedule downloaded')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-7 w-7 text-amber-400" />
            My Schedule
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            All scheduled classes for <span className="text-amber-400 font-medium">{department.name}</span> across all rooms
          </p>
        </div>
        {Object.keys(byRoom).length > 0 && (
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      {Object.keys(byRoom).length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No classes scheduled for your department yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byRoom).map(([roomId, roomSchedules]) => (
            <div key={roomId}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                  <DoorOpen className="h-4 w-4 text-amber-400" />
                </div>
                <Link
                  href={`/rooms/${roomId}`}
                  className="text-lg font-bold text-white hover:text-amber-400 transition-colors"
                >
                  Room {getRoomName(roomId)}
                </Link>
                <span className="text-xs text-slate-500">
                  {roomSchedules.length} slot{roomSchedules.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="rounded-xl border border-slate-700/50 overflow-x-auto bg-slate-800/30">
                <table className="w-full border-collapse min-w-[700px] text-sm">
                  <thead>
                    <tr>
                      <th className="p-2.5 text-left text-slate-400 font-semibold bg-slate-700/30 border-b border-slate-700/50 sticky left-0 z-10">
                        Day
                      </th>
                      {PERIODS.map((p) => (
                        <th
                          key={p}
                          className="p-2.5 text-center text-slate-400 font-semibold bg-slate-700/30 border-b border-slate-700/50 min-w-[100px]"
                        >
                          P{p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_OF_WEEK.map((day) => (
                      <tr key={day} className="border-b border-slate-700/20 last:border-0">
                        <td className="p-2.5 text-white font-medium bg-slate-800/80 sticky left-0 z-10">
                          {day.slice(0, 3)}
                        </td>
                        {PERIODS.map((period) => {
                          const slot = getSlot(roomSchedules, day, period)
                          return (
                            <td
                              key={period}
                              className={`p-2 text-center ${
                                slot
                                  ? 'bg-amber-500/10'
                                  : ''
                              }`}
                            >
                              {slot ? (
                                <div className="space-y-0.5">
                                  {slot.course ? (
                                    <>
                                      <div className="text-xs font-semibold text-amber-400">
                                        {slot.course}
                                      </div>
                                      {slot.branch && (
                                        <div className="text-[10px] text-slate-400">
                                          {slot.branch}
                                          {slot.section && ` - ${slot.section}`}
                                          {slot.subsection && `/${slot.subsection}`}
                                        </div>
                                      )}
                                      {slot.professor_name && (
                                        <div className="text-[10px] text-blue-400">
                                          {slot.professor_name}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-amber-500/60 italic">
                                      Allotted
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
