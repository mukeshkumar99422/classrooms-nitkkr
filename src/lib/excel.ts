import * as XLSX from "xlsx";
import { DAYS, PERIODS } from "@/types";

export function parseScheduleExcel(buffer: ArrayBuffer, validDepts: string[]) {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const data: { day: string; period: number; departmentName: string }[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx <= 8; rowIdx++) {
    const row = rows[rowIdx];
    if (!row) continue;
    const period = rowIdx;
    for (let colIdx = 1; colIdx <= 6; colIdx++) {
      const day = DAYS[colIdx - 1];
      const cellValue = row[colIdx];
      if (!cellValue || String(cellValue).trim() === "") continue;
      const deptName = String(cellValue).trim();
      const match = validDepts.find(d => d.toLowerCase() === deptName.toLowerCase());
      if (!match) errors.push(`Row ${rowIdx + 1}, ${day}: "${deptName}" not found`);
      else data.push({ day, period, departmentName: match });
    }
  }
  return { data, errors };
}

export function generateScheduleExcel(roomName: string, scheduleData: any) {
  const wb = XLSX.utils.book_new();
  const headers = ["Period", ...DAYS];
  const rows = [headers];
  for (const period of PERIODS) {
    const row: string[] = [`Period ${period}`];
    for (const day of DAYS) {
      const cell = scheduleData[day]?.[period];
      row.push(cell?.content ?? "");
    }
    rows.push(row);
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 12 }, ...DAYS.map(() => ({ wch: 30 }))];
  XLSX.utils.book_append_sheet(wb, ws, `${roomName}`);
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function generateTemplateExcel() {
  const wb = XLSX.utils.book_new();
  const rows = [["Period", ...DAYS]];
  for (let p = 1; p <= 8; p++) rows.push([`Period ${p}`, "", "", "", "", "", ""]);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 12 }, ...DAYS.map(() => ({ wch: 20 }))];
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
