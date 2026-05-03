import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const C = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
}

const s = {
  card: {
    background: C.card,
    border: `0.5px solid ${C.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20
  },
  title: { fontSize: 18, color: '#e8dcc8', marginBottom: 16, marginTop: 0 },
  select: {
    padding: '10px 14px',
    background: '#0d0d0d',
    border: `0.5px solid ${C.border}`,
    color: C.text,
    borderRadius: 8,
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    outline: 'none',
    width: '100%',
    maxWidth: 250,
  },
  btnGroup: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 },
  btn: (type) => ({
    padding: '10px 20px',
    background: type === 'pdf' ? '#e05c5c' : type === 'excel' ? '#6db98a' : C.gold,
    color: type === 'primary' ? '#000' : '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    fontSize: 14,
  }),
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 20 },
  statBox: { background: '#0d0d0d', border: `0.5px solid ${C.border}`, padding: 16, borderRadius: 8 },
}

export default function Reports() {
  const [reportType, setReportType] = useState('daily')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({ revenue: 0, count: 0, pending: 0, cancelled: 0 })

  useEffect(() => {
    fetchData()
  }, [reportType])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        services ( name, price ),
        barbers ( profiles ( full_name ) ),
        client:profiles!appointments_client_id_fkey ( full_name )
      `)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    // Filtrar por fechas
    const now = new Date()
    let filtered = []

    if (reportType === 'daily') {
      const todayStr = now.toISOString().split('T')[0]
      filtered = data.filter(app => app.scheduled_at.startsWith(todayStr))
    } else if (reportType === 'weekly') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      filtered = data.filter(app => new Date(app.scheduled_at) >= oneWeekAgo && new Date(app.scheduled_at) <= now)
    } else if (reportType === 'monthly') {
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      filtered = data.filter(app => {
        const d = new Date(app.scheduled_at)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
    }

    setAppointments(filtered)

    // Resumen
    let rev = 0, count = 0, pend = 0, canc = 0
    filtered.forEach(app => {
      const price = Array.isArray(app.services) ? app.services[0]?.price : app.services?.price || 0
      if (app.status === 'completed') {
        rev += price
        count++
      } else if (app.status === 'pending') {
        pend++
      } else {
        canc++
      }
    })

    setSummary({ revenue: rev, count, pending: pend, cancelled: canc })
    setLoading(false)
  }

  // --- Exportar a PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text("Peludos Barber Shop - Reporte", 14, 20)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const typeStr = reportType === 'daily' ? 'Diario' : reportType === 'weekly' ? 'Semanal' : 'Mensual'
    doc.text(`Tipo de Reporte: ${typeStr}`, 14, 30)
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 36)

    doc.text(`Ingresos: $${summary.revenue} | Atendidas: ${summary.count} | Pendientes: ${summary.pending}`, 14, 46)

    const tableColumn = ["Fecha", "Cliente", "Barbero", "Servicio", "Precio", "Estado"]
    const tableRows = []

    appointments.forEach(app => {
      const clientName = app.client?.full_name || (Array.isArray(app.profiles) ? app.profiles[0]?.full_name : app.profiles?.full_name) || 'N/A'
      const barberName = app.barbers?.profiles?.full_name || 'N/A'
      const serviceName = Array.isArray(app.services) ? app.services[0]?.name : app.services?.name || 'N/A'
      const price = Array.isArray(app.services) ? app.services[0]?.price : app.services?.price || 0
      const dateStr = new Date(app.scheduled_at).toLocaleDateString('es-ES') + " " + new Date(app.scheduled_at).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})
      
      const statusMap = { 'completed': 'Completada', 'pending': 'Pendiente', 'cancelled': 'Cancelada' }
      
      tableRows.push([
        dateStr,
        clientName,
        barberName,
        serviceName,
        `$${price}`,
        statusMap[app.status] || app.status
      ])
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [184, 150, 62] } // Color dorado
    })

    doc.save(`reporte_${typeStr.toLowerCase()}_peludos_barber.pdf`)
  }

  // --- Exportar a Excel (CSV) ---
  const handleExportExcel = () => {
    let csvContent = "Fecha,Cliente,Barbero,Servicio,Precio,Estado\n"

    appointments.forEach(app => {
      const clientName = app.client?.full_name || (Array.isArray(app.profiles) ? app.profiles[0]?.full_name : app.profiles?.full_name) || 'N/A'
      const barberName = app.barbers?.profiles?.full_name || 'N/A'
      const serviceName = Array.isArray(app.services) ? app.services[0]?.name : app.services?.name || 'N/A'
      const price = Array.isArray(app.services) ? app.services[0]?.price : app.services?.price || 0
      const dateStr = new Date(app.scheduled_at).toLocaleDateString('es-ES') + " " + new Date(app.scheduled_at).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})
      const statusMap = { 'completed': 'Completada', 'pending': 'Pendiente', 'cancelled': 'Cancelada' }

      // Escapar comas en los nombres
      const safeClient = `"${clientName}"`
      const safeBarber = `"${barberName}"`
      const safeService = `"${serviceName}"`

      csvContent += `"${dateStr}",${safeClient},${safeBarber},${safeService},${price},"${statusMap[app.status] || app.status}"\n`
    })

    // Añadir resumen al final
    csvContent += `\n\nRESUMEN\nIngresos Totales,$${summary.revenue}\nCitas Atendidas,${summary.count}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reporte_peludos_barber.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={s.card}>
      <h2 style={s.title}>Generación de Reportes</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
        Selecciona el rango de tiempo para visualizar el resumen financiero y descarga un reporte detallado con todas las transacciones.
      </p>

      <select style={s.select} value={reportType} onChange={(e) => setReportType(e.target.value)}>
        <option value="daily">Reporte Diario (Hoy)</option>
        <option value="weekly">Reporte Semanal (Últimos 7 días)</option>
        <option value="monthly">Reporte Mensual (Mes Actual)</option>
      </select>

      {loading ? (
        <p style={{ color: C.gold, marginTop: 20 }}>Calculando...</p>
      ) : (
        <>
          <div style={s.summaryGrid}>
            <div style={s.statBox}>
              <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Ingresos</div>
              <div style={{ fontSize: 24, color: C.gold, fontWeight: 'bold' }}>${summary.revenue}</div>
            </div>
            <div style={s.statBox}>
              <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Atendidas</div>
              <div style={{ fontSize: 24, color: '#e8dcc8', fontWeight: 'bold' }}>{summary.count}</div>
            </div>
            <div style={s.statBox}>
              <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Pendientes</div>
              <div style={{ fontSize: 24, color: '#e8dcc8', fontWeight: 'bold' }}>{summary.pending}</div>
            </div>
          </div>

          <div style={s.btnGroup}>
            <button style={s.btn('pdf')} onClick={handleExportPDF}>
              📄 Descargar PDF
            </button>
            <button style={s.btn('excel')} onClick={handleExportExcel}>
              📊 Descargar Excel (CSV)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
