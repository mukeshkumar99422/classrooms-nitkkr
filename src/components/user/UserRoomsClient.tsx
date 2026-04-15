"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DoorOpen, Search, ArrowRight, Building } from "lucide-react";
import { Input, Card, CardContent } from "@/components/ui/index";
import type { Room } from "@/types";

export default function UserRoomsClient({ rooms }: { rooms: Room[] }) {
  const [search, setSearch] = useState("");

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  // Group by prefix (letters before first digit)
  const grouped = useMemo(() => {
    const map = new Map<string, Room[]>();
    for (const room of filtered) {
      const prefix = room.name.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? "OTHER";
      if (!map.has(prefix)) map.set(prefix, []);
      map.get(prefix)!.push(room);
    }
    // Sort groups alphabetically
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(215, 14%, 50%)" }} />
        <Input placeholder="Search rooms (e.g. M312)..." value={search}
          onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-20" style={{ color: "hsl(215, 14%, 50%)" }}>
          <DoorOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No rooms found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([prefix, groupRooms]) => (
            <div key={prefix}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Building className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">{prefix} Block</h2>
                <div className="flex-1 h-px" style={{ background: "hsl(222, 14%, 24%)" }} />
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ color: "hsl(215, 14%, 55%)", background: "hsl(222, 16%, 22%)", border: "1px solid hsl(222, 14%, 26%)" }}>
                  {groupRooms.length} room{groupRooms.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Rooms grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {groupRooms.map(room => (
                  <Link key={room.id} href={`/dashboard/rooms/${room.id}`}>
                    <Card className="hover:border-[hsl(217,80%,50%,0.5)] transition-all cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <DoorOpen className="h-7 w-7 mx-auto text-blue-400 mb-2 group-hover:text-blue-300 transition-colors" />
                        <p className="font-bold text-white text-sm">{room.name}</p>
                        <p className="text-xs flex items-center justify-center gap-0.5 mt-1"
                          style={{ color: "hsl(215, 14%, 50%)" }}>
                          View <ArrowRight className="h-3 w-3" />
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
