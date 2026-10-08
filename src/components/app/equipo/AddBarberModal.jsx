import { useEffect, useMemo, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Avatar, Button, EmptyState, Input, Modal, Spinner } from '../../ui'
import { cn } from '../../../lib/cn'
import { fetchCandidates } from '../../../lib/team'

/** Elegir a un usuario registrado para agregarlo al equipo como barbero. */
export default function AddBarberModal({ open, saving, onClose, onAdd }) {
  const [candidates, setCandidates] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!open) return
    setSearch('')
    setSelectedId(null)
    setCandidates(null)
    setError(null)
    fetchCandidates().then(setCandidates).catch(setError)
  }, [open])

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (candidates ?? []).filter(
      (c) => !q || c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q)
    )
  }, [candidates, search])

  const selected = candidates?.find((c) => c.id === selectedId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar barbero"
      description="Elige a una persona que ya tenga cuenta. Si aún no la tiene, pídele que se registre en la página de reservas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button icon={UserPlus} disabled={!selected} loading={saving} onClick={() => onAdd(selected)}>
            Agregar al equipo
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-space-md">
        <Input
          aria-label="Buscar persona"
          icon={Search}
          placeholder="Buscar por nombre o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {error ? (
          <p className="text-body-sm text-error">No se pudo cargar la lista: {error.message}</p>
        ) : candidates == null ? (
          <div className="py-space-lg flex justify-center text-on-surface-variant"><Spinner /></div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Search}
            title={candidates.length === 0 ? 'No hay personas disponibles' : 'Sin resultados'}
            description={candidates.length === 0 ? 'Todas las cuentas registradas ya son parte del equipo.' : 'Prueba con otro nombre.'}
            className="py-space-md"
          />
        ) : (
          <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1" role="listbox" aria-label="Personas registradas">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'w-full flex items-center gap-space-sm p-2 rounded-lg text-left transition-colors border',
                    c.id === selectedId
                      ? 'border-primary bg-primary-fixed/40'
                      : 'border-transparent hover:bg-surface-container-low'
                  )}
                >
                  <Avatar name={c.full_name ?? '?'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-body-medium text-body-sm truncate">{c.full_name ?? 'Sin nombre'}</p>
                    <p className="text-[12px] text-on-surface-variant tabular-nums">
                      {c.phone ?? 'Sin teléfono'}{c.role === 'admin' ? ' · Administrador' : ''}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
