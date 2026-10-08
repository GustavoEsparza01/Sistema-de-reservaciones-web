import { useAuth } from '../../context/AuthContext'
import { formatDate, greeting } from '../../lib/format'

// Pantalla Resumen (design/stitch/01-resumen). El contenido se construye en el paso 6.
export default function Resumen() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-space-xl">
      <header className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page text-headline-page text-on-surface">
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-body-default text-on-surface-variant">{formatDate(new Date())}</p>
      </header>
    </div>
  )
}
