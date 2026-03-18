'use client'

import { useState } from 'react'
import { Room } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { DoorOpen, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RoomsBrowseClientProps {
  rooms: Room[]
}

export default function RoomsBrowseClient({ rooms }: RoomsBrowseClientProps) {
  const [search, setSearch] = useState('')

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  // Group rooms by building prefix
  const grouped = filteredRooms.reduce<Record<string, Room[]>>((acc, room) => {
    const prefix = room.name.replace(/[0-9]/g, '') || 'Other'
    if (!acc[prefix]) acc[prefix] = []
    acc[prefix].push(room)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <DoorOpen className="h-7 w-7 text-amber-400" />
          Classrooms
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse all available rooms and view their schedules
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search rooms by name or building (e.g., M3, E2, LT)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 max-w-md"
        />
      </div>

      {filteredRooms.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          {search ? 'No rooms match your search' : 'No rooms available'}
        </div>
      ) : (
        Object.entries(grouped).map(([prefix, groupRooms]) => (
          <div key={prefix} className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="bg-slate-700/50 px-2 py-0.5 rounded">{prefix}</span>
              <span className="text-slate-600">({groupRooms.length} rooms)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groupRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 hover:bg-slate-800/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500/10 p-2 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                        <DoorOpen className="h-4 w-4 text-amber-400" />
                      </div>
                      <span className="text-white font-bold text-lg">{room.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
