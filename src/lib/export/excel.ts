import * as XLSX from 'xlsx'

export function generateExcel(sheetName: string, data: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const headers = columns.map(c => c.label)
  const rows = data.map(row => columns.map(col => row[col.key] ?? ''))

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  return wb
}

export function downloadExcel(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
