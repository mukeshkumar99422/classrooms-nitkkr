"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Trash2, Loader2, Search, DoorOpen, ArrowRight, Building } from "lucide-react";
import { Button, Input, Label, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import type { Room, Department } from "@/types";

interface Props { initialRooms: Room[]; departments: Pick<Department, "id" | "name">[]; }

export default function RoomsAdminClient({ initialRooms, departments }: Props) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const grouped = useMemo(() => {
    const map = new Map<string, Room[]>();
    for (const room of filtered) {
      const prefix = room.name.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? "OTHER";
      if (!map.has(prefix)) map.set(prefix, []);
      map.get(prefix)!.push(room);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const handleAdd = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRooms(prev => [...prev, data.room].sort((a, b) => a.name.localeCompare(b.name)));
      setRoomName(""); setAddOpen(false);
      toast({ variant: "success", title: "Room added" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setRooms(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteOpen(false);
      toast({ variant: "success", title: "Room deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(215,14%,50%)" }} />
          <Input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </Button>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-20" style={{ color: "hsl(215,14%,50%)" }}>
          <DoorOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No rooms found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([prefix, groupRooms]) => (
            <div key={prefix}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <Building className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">{prefix} Block</h2>
                <div className="flex-1 h-px" style={{ background: "hsl(222, 14%, 24%)" }} />
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ color: "hsl(215,14%,55%)", background: "hsl(222,16%,22%)", border: "1px solid hsl(222,14%,26%)" }}>
                  {groupRooms.length} room{groupRooms.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {groupRooms.map(room => (
                  <div key={room.id} className="group relative">
                    <Link href={`/admin/rooms/${room.id}`}>
                      <Card className="hover:border-[hsl(217,80%,50%,0.5)] transition-all cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <DoorOpen className="h-7 w-7 mx-auto text-emerald-400 mb-2 group-hover:text-emerald-300 transition-colors" />
                          <p className="font-bold text-white text-sm">{room.name}</p>
                          <p className="text-xs flex items-center justify-center gap-0.5 mt-1"
                            style={{ color: "hsl(215,14%,50%)" }}>
                            Schedule <ArrowRight className="h-3 w-3" />
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                    <button
                      onClick={e => { e.preventDefault(); setDeleteTarget(room); setDeleteOpen(true); }}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ background: "hsl(222,18%,22%)", border: "1px solid hsl(222,14%,28%)" }}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Room Name</Label>
            <Input placeholder="e.g., M312, E201, L102, MCA302" value={roomName}
              onChange={e => setRoomName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} />
            <p className="text-xs" style={{ color: "hsl(215,14%,50%)" }}>Building prefix + room number (auto-uppercased)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading || !roomName.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Room</DialogTitle></DialogHeader>
          <p className="text-sm py-2" style={{ color: "hsl(215,14%,55%)" }}>
            Permanently delete <strong className="text-white">{deleteTarget?.name}</strong>? All schedule data will be lost.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
