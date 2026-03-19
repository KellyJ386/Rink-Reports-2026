import { jsPDF } from 'jspdf'

export function generateReportPDF(title: string, data: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.text('Max Facility Rink Reports', 20, 20)
  doc.setFontSize(14)
  doc.text(title, 20, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38)

  // Table header
  let y = 50
  doc.setFontSize(10)
  doc.setFont(undefined as unknown as string, 'bold')
  columns.forEach((col, i) => {
    doc.text(col.label, 20 + (i * 40), y)
  })

  // Table rows
  doc.setFont(undefined as unknown as string, 'normal')
  data.forEach((row) => {
    y += 8
    if (y > 270) { doc.addPage(); y = 20 }
    columns.forEach((col, i) => {
      doc.text(String(row[col.key] ?? ''), 20 + (i * 40), y)
    })
  })

  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(`${filename}.pdf`)
}
