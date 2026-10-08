// Descarga de archivos CSV que se abren bien en Excel.

const cell = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** header: arreglo de títulos; rows: arreglo de arreglos con los valores. */
export function downloadCsv(fileName, header, rows) {
  const text = [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  // BOM para que Excel reconozca los acentos
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** "citas-2026-10-07.csv" */
export const datedFileName = (base) => `${base}-${new Date().toISOString().slice(0, 10)}.csv`
