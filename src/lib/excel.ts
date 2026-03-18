import * as XLSX from 'xlsx'
import { Department, Schedule, DAYS_OF_WEEK, PERIODS } from './types'

interface ParseResult {
  schedules: Array<{
    day_of_week: string
    period_number: number
    department_name: string
  }>
  errors: string[]
}

export function parseScheduleExcel(
  data: ArrayBuffer,
  departments: Department[]
): ParseResult {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

  const schedules: ParseResult['schedules'] = []
  const errors: string[] = []
  const deptNames = departments.map((d) => d.name.toLowerCase())

  // Expected format:
  // Row 0: Header row (Day/Period, 1, 2, 3, 4, 5, 6, 7, 8)
  // Rows 1-6: Monday-Saturday with department names

  for (let rowIdx = 1; rowIdx < jsonData.length && rowIdx <= 6; rowIdx++) {
    const row = jsonData[rowIdx]
    if (!row || !row[0]) continue
    
    const dayName = String(row[0]).trim()
    const matchedDay = DAYS_OF_WEEK.find(
      (d) => d.toLowerCase() === dayName.toLowerCase()
    )

    if (!matchedDay) {
      errors.push(`Row ${rowIdx + 1}: Invalid day "${dayName}"`)
      continue
    }

    for (let colIdx = 1; colIdx <= 8; colIdx++) {
      const cellValue = row[colIdx]
      if (!cellValue || String(cellValue).trim() === '') continue

      const deptName = String(cellValue).trim()
      if (!deptNames.includes(deptName.toLowerCase())) {
        errors.push(
          `Row ${rowIdx + 1}, Period ${colIdx}: Department "${deptName}" not found in system`
        )
        continue
      }

      schedules.push({
        day_of_week: matchedDay,
        period_number: colIdx,
        department_name: deptName,
      })
    }
  }

  return { schedules, errors }
}

export function generateScheduleExcel(
  roomName: string,
  schedules: Schedule[]
) {
  const header = ['Day / Period', ...PERIODS.map((p) => `Period ${p}`)]
  const rows = DAYS_OF_WEEK.map((day) => {
    const row: string[] = [day]
    PERIODS.forEach((period) => {
      const slot = schedules.find(
        (s) => s.day_of_week === day && s.period_number === period
      )
      if (slot) {
        let cell = slot.department?.name || ''
        if (slot.course) {
          cell += `\n${slot.course}`
          if (slot.branch) cell += ` - ${slot.branch}`
          if (slot.section) cell += ` (${slot.section}${slot.subsection ? '/' + slot.subsection : ''})`
          if (slot.professor_name) cell += `\n${slot.professor_name}`
        }
        row.push(cell)
      } else {
        row.push('')
      }
    })
    return row
  })

  const wsData = [header, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },
    ...PERIODS.map(() => ({ wch: 20 })),
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, roomName)

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}
