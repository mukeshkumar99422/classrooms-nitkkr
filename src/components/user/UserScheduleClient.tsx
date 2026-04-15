"use client";
import { useState } from "react";
import { Download, Save, Loader2, Pencil } from "lucide-react";
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import { DAYS, PERIODS } from "@/types";
import type { Room, Schedule } from "@/types";

interface Props {
  room: Room;
  schedules: Schedule[];
  currentDeptId: string;
  currentDeptName: string;
}

type CellMap = { [day: string]: { [period: number]: Schedule | null } };

function buildMap(schedules: Schedule[]): CellMap {
  const map: CellMap = {};
  for (const day of DAYS) { map[day] = {}; for (const p of PERIODS) map[day][p] = null; }
  for (const s of schedules) if (map[s.day_of_week]) map[s.day_of_week][s.period_number] = s;
  return map;
}

interface EditForm { course: string; branch: string; section: string; subsection: string; professor_name: string; }

export default function UserScheduleClient({ room, schedules, currentDeptId, currentDeptName }: Props) {
  const [cellMap, setCellMap] = useState<CellMap>(buildMap(schedules));
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState<EditForm>({ course: "", branch: "", section: "", subsection: "", professor_name: "" });

  // Open edit dialog for a schedule slot
  const openEdit = (s: Schedule) => {
    setEditSchedule(s);
    setForm({ course: s.course ?? "", branch: s.branch ?? "", section: s.section ?? "", subsection: s.subsection ?? "", professor_name: s.professor_name ?? "" });
    setEditOpen(true);
  };


  // Save edits to a schedule slot
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSchedule) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule_id: editSchedule.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCellMap(prev => {
        const next = { ...prev, [editSchedule.day_of_week]: { ...prev[editSchedule.day_of_week] } };
        next[editSchedule.day_of_week][editSchedule.period_number] = { ...editSchedule, ...form };
        return next;
      });
      setEditOpen(false);
      toast({ variant: "success", title: "Schedule updated!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setSaving(false); }
  };


  // Generate and download Excel of the schedule
  const handleDownload = async () => {
    const exportData: any = {};

    for (const day of DAYS) {
      exportData[day] = {};
      for (const p of PERIODS) {
        const cell = cellMap[day][p];
        if (cell) {
          const parts = [
            cell.departments?.name,
            cell.course,
            cell.branch && `${cell.branch}-${cell.section}${cell.subsection ? `-${cell.subsection}` : ""}`,
            cell.professor_name
          ].filter(Boolean);
          exportData[day][p] = { 
            content: parts.join(" \n")
          };
        }
      }
    }

    const { generateScheduleExcel } = await import("@/lib/excel");
    const blob = generateScheduleExcel(room.name, exportData);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${room.name}_schedule.xlsx`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Legend + Download */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-blue-900 border border-blue-800" />
          <span className="text-muted-foreground">Your dept ({currentDeptName})</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span className="text-muted-foreground">Other departments</span>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> Download Excel
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/60">
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground w-20 border-b border-border">Period</th>
              {DAYS.map(day => (
                <th key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-b border-l border-border">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="hover:bg-muted/10 transition-colors">
                <td className="p-3 border-b border-border">
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">P{period}</span>
                </td>
                {DAYS.map(day => {
                  const cell = cellMap[day][period];
                  const isOwn = cell?.department_id === currentDeptId;
                  const isOther = cell?.department_id && !isOwn;
                  return (
                    <td key={day} className="border-b border-l border-border p-1.5">
                      <div
                        onClick={() => isOwn && openEdit(cell!)}
                        className={`rounded-lg min-h-[68px] flex flex-col items-center justify-center p-2 relative transition-all ${
                          isOwn ? "bg-blue-900 text-white border border-blue-800 cursor-pointer hover:bg-blue-800"
                          : isOther ? "bg-gray-50 border border-gray-200 text-gray-700"
                          : "bg-background border border-dashed border-border"
                        }`}>
                        {cell?.department_id ? (
                          <>
                            <p className={`text-xs font-semibold text-center leading-tight ${isOwn ? "text-white" : "text-gray-800"}`}>
                              {cell.departments?.name}
                            </p>
                            {(cell.course || cell.branch || cell.section || cell.subsection) && (
                              <p className={`text-[10px] text-center mt-0.5 leading-tight ${isOwn ? "text-blue-200" : "text-gray-500"}`}>
                                {[cell.course, cell.branch, cell.section, cell.subsection].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            {cell.professor_name && (
                              <p className={`text-[9px] mt-0.5 ${isOwn ? "text-blue-300" : "text-gray-400"}`}>
                                {cell.professor_name}
                              </p>
                            )}
                            {isOwn && <Pencil className="absolute top-1.5 right-1.5 h-3 w-3 text-blue-300" />}
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Slot — {editSchedule?.day_of_week}, Period {editSchedule?.period_number}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Course <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., B.Tech" value={form.course}
                  onChange={e => setForm(p => ({ ...p, course: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Branch <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., IT" value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Section <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., A" value={form.section}
                  onChange={e => setForm(p => ({ ...p, section: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Subsection <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input placeholder="e.g., 02" value={form.subsection}
                  onChange={e => setForm(p => ({ ...p, subsection: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Professor Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input placeholder="e.g., Dr. Sharma" value={form.professor_name}
                onChange={e => setForm(p => ({ ...p, professor_name: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
