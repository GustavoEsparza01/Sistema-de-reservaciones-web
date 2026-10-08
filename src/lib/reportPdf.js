// Exportación del reporte a PDF. jsPDF se carga solo al exportar para no
// aumentar el tamaño inicial de la app.
import { getStatus } from './appointmentStatus'
import { formatDate, formatMoneyMXN, formatPercent, formatTime } from './format'

const PRIMARY = [37, 99, 235] // #2563EB
const INK = [15, 23, 42]
const MUTED = [71, 85, 105]

/**
 * report: { businessName, rangeLabel, filtersLabel, kpis, compareLabel, services, barbers, appointments }
 */
export async function downloadReportPdf(report, fileName) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const left = 40
  let y = 48

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text(`${report.businessName} · Reporte`, left, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(`Periodo: ${report.rangeLabel}${report.filtersLabel ? ` · ${report.filtersLabel}` : ''}`, left, y)
  y += 14
  doc.text(`Generado el ${formatDate(new Date())} a las ${formatTime(new Date())}`, left, y)
  y += 20

  const k = report.kpis
  const change = (v, suffix = '%') => (v == null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}${suffix}`)
  autoTable(doc, {
    startY: y,
    head: [['Indicador', 'Valor', report.compareLabel]],
    body: [
      ['Ingresos (citas completadas)', formatMoneyMXN(k.revenue), change(k.revenueChange)],
      ['Citas completadas', String(k.completed), change(k.completedChange)],
      ['Ticket promedio', k.avgTicket == null ? '—' : formatMoneyMXN(Math.round(k.avgTicket)), change(k.avgTicketChange)],
      ['Tasa de cancelación', k.cancelRate == null ? '—' : formatPercent(k.cancelRate), change(k.cancelDiffPoints, ' pts')],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5, textColor: INK },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left, right: left },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Barbero', 'Completadas', 'Ingresos', 'Ticket prom.', 'Cancelaciones']],
    body: [
      ...report.barbers.rows.map((b) => [
        b.name, b.completed, formatMoneyMXN(b.revenue), b.avgTicket == null ? '—' : formatMoneyMXN(Math.round(b.avgTicket)),
        `${b.cancelled}${b.cancelRate != null ? ` (${formatPercent(b.cancelRate)})` : ''}`,
      ]),
      [
        { content: 'Total', styles: { fontStyle: 'bold' } },
        report.barbers.totals.completed,
        formatMoneyMXN(report.barbers.totals.revenue),
        report.barbers.totals.avgTicket == null ? '—' : formatMoneyMXN(Math.round(report.barbers.totals.avgTicket)),
        report.barbers.totals.cancelled,
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5, textColor: INK },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left, right: left },
  })

  if (report.services.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [['Servicio', 'Citas completadas', 'Ingresos']],
      body: report.services.map((s) => [s.name, s.count, formatMoneyMXN(s.revenue)]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, textColor: INK },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left, right: left },
    })
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Fecha', 'Hora', 'Cliente', 'Barbero', 'Servicio', 'Precio', 'Estado']],
    body: report.appointments.map((a) => [
      formatDate(a.start), formatTime(a.start), a.clientName, a.barberName, a.serviceName, formatMoneyMXN(a.price), getStatus(a.status).label,
    ]),
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 4, textColor: INK },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    columnStyles: { 5: { halign: 'right' } },
    margin: { left, right: left },
  })

  doc.save(fileName)
}
