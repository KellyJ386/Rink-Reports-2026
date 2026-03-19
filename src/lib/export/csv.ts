export function generateCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const headers = columns.map(c => c.label).join(',')
  const rows = data.map(row =>
    columns.map(col => {
      const val = String(row[col.key] ?? '')
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(',')
  )
  return [headers, ...rows].join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
