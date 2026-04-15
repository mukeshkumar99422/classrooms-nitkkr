"use client";
import { useState, useRef } from "react";
import { Upload, Download, Loader2, FileSpreadsheet, Info, Save } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import { DAYS, PERIODS } from "@/types";
import type { Room, Schedule, Department } from "@/types";

interface Props {
  room: Room;
  schedules: Schedule[];
  departments: Pick<Department, "id" | "name">[];
}

type CellMap = { [day: string]: { [period: number]: Schedule | null } };

function buildMap(schedules: Schedule[]): CellMap {
  const map: CellMap = {};
  for (const day of DAYS) { map[day] = {}; for (const p of PERIODS) map[day][p] = null; }
  for (const s of schedules) if (map[s.day_of_week]) map[s.day_of_week][s.period_number] = s;
  return map;
}

const COLORS = [
  "bg-blue-100 text-blue-900 border-blue-200",
  "bg-emerald-100 text-emerald-900 border-emerald-200",
  "bg-amber-100 text-amber-900 border-amber-200",
  "bg-purple-100 text-purple-900 border-purple-200",
  "bg-rose-100 text-rose-900 border-rose-200",
  "bg-cyan-100 text-cyan-900 border-cyan-200",
  "bg-orange-100 text-orange-900 border-orange-200",
  "bg-indigo-100 text-indigo-900 border-indigo-200",
  "bg-teal-100 text-teal-900 border-teal-200",
  "bg-pink-100 text-pink-900 border-pink-200",
];

export default function AdminScheduleClient({ room, schedules, departments }: Props) {
  const [cellMap, setCellMap] = useState<CellMap>(buildMap(schedules));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCell, setEditCell] = useState<{ day: string; period: number } | null>(null);
  const [selectedDept, setSelectedDept] = useState("none");
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const deptColorMap: Record<string, string> = {};
  departments.forEach((d, i) => { deptColorMap[d.id] = COLORS[i % COLORS.length]; });

  // Open edit dialog for a specific cell
  const openEdit = (day: string, period: number) => {
    setEditCell({ day, period });
    setSelectedDept(cellMap[day][period]?.department_id ?? "none");
    setEditOpen(true);
  };

  // Save changes to a schedule cell
  const handleSaveCell = async () => {
    if (!editCell) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          day_of_week: editCell.day,
          period_number: editCell.period,
          department_id: selectedDept === "none" ? null : selectedDept,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const dept = departments.find(d => d.id === selectedDept);
      setCellMap(prev => {
        const next = { ...prev, [editCell.day]: { ...prev[editCell.day] } };
        next[editCell.day][editCell.period] = selectedDept === "none" ? null : {
          ...data.schedule,
          departments: dept ? { id: dept.id, name: dept.name } : null,
        };
        return next;
      });
      setEditOpen(false);
      toast({ variant: "success", title: "Schedule updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setSaving(false); }
  };

  //upload excel file and update schedule
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("room_id", room.id);
    try {
      const res = await fetch("/api/admin/schedules/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.errors?.length) { setUploadErrors(data.errors); setErrorsOpen(true); }
      if (data.schedules) {
        setCellMap(buildMap(data.schedules));
        toast({ variant: "success", title: "Schedule uploaded", description: `${data.updated} slots updated` });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // download template for schedule upload
  const handleDownloadTemplate = async () => {
    const { generateTemplateExcel } = await import("@/lib/excel");
    const blob = generateTemplateExcel();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "schedule_template.xlsx"; a.click();
    URL.revokeObjectURL(url);
  };

  // download Excel of the current schedule
  const handleExport = async () => {
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
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Download Template
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
          <Info className="h-3.5 w-3.5" /> Click a cell to assign department
        </span>
      </div>

      {/* Legend */}
      {departments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {departments.map(d => (
            <span key={d.id} className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${deptColorMap[d.id]}`}>
              {d.name}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/60">
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground w-20 border-b border-border">Period</th>
              {DAYS.map(day => (
                <th key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-b border-l border-border w-28">{day}</th>
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
                  const color = cell?.department_id ? deptColorMap[cell.department_id] : "";
                  return (
                    <td key={day} className="border-b border-l border-border p-1.5 cursor-pointer w-28" onClick={() => openEdit(day, period)}>
                      <div className={`rounded-lg min-h-[64px] flex items-center justify-center p-2 transition-all hover:opacity-80 ${
                        cell?.department_id
                          ? `${color} border`
                          : "bg-background hover:bg-muted/60 border border-dashed border-border"
                      }`}>
                        {cell?.department_id ? (
                          <div className="text-center">
                            <p className="text-xs font-semibold leading-tight">{cell.departments?.name}</p>
                            {(cell.section || cell.branch || cell.subsection) && (
                              <p className="text-[10px] opacity-70 mt-0.5">{[cell.branch, cell.section, cell.subsection].filter(Boolean).join(" - ")}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
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

      {/* Edit Cell Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Department — {editCell?.day}, Period {editCell?.period}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Select which department occupies this slot.</p>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCell} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Errors Dialog */}
      <Dialog open={errorsOpen} onOpenChange={setErrorsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Warnings</DialogTitle></DialogHeader>
          <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
            {uploadErrors.map((e, i) => (
              <div key={i} className="text-sm text-amber-800 bg-amber-50 rounded p-2">{e}</div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => setErrorsOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
