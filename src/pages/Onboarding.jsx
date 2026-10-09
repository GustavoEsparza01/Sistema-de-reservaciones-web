// Alta del negocio (design/stitch/15-onboarding). Solo frontend: el borrador se
// guarda en el navegador y crear el negocio en Supabase llega con la Fase 5.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, RotateCcw, Store } from 'lucide-react'
import { cn } from '../lib/cn'
import { STEPS, clearDraft, emptyDraft, loadDraft, saveDraft, stepErrors } from '../lib/onboarding'
import Logo from '../components/app/Logo'
import { Button, Modal } from '../components/ui'
import { StepEquipo, StepHorario, StepNegocio, StepServicios, StepVista } from '../components/onboarding/OnboardingSteps'

const STEP_COMPONENTS = [StepNegocio, StepHorario, StepServicios, StepEquipo, StepVista]
const LAST = STEPS.length - 1

export default function Onboarding() {
  const [draft, setDraft] = useState(() => loadDraft() ?? emptyDraft())
  // Tras el primer intento de continuar, los errores del paso se recalculan en vivo
  const [attempted, setAttempted] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const step = Math.min(draft.step ?? 0, LAST)
  const errors = attempted ? stepErrors(step, draft) : {}

  // El borrador se guarda en el navegador en cada cambio
  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  useEffect(() => {
    const previous = document.title
    document.title = 'Crea tu barbería · Barber OS'
    return () => { document.title = previous }
  }, [])

  const update = (fn) => setDraft((d) => fn(d))
  const goTo = (n) => {
    setAttempted(false)
    setDraft((d) => ({ ...d, step: n }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function next() {
    const found = stepErrors(step, draft)
    setAttempted(true)
    if (Object.keys(found).length === 0) goTo(step + 1)
  }

  // Se puede saltar a un paso anterior, o a uno posterior si los de en medio están completos
  const canJumpTo = (n) => n <= step || [...Array(n).keys()].every((i) => Object.keys(stepErrors(i, draft)).length === 0)

  const Current = STEP_COMPONENTS[step]
  const progress = Math.round((Math.min(step, 4) / 4) * 100)

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col">
      <header className="h-16 border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-[760px] mx-auto h-full px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <Link to="/barber-os" aria-label="Barber OS"><Logo /></Link>
            <span className="hidden sm:inline text-body-sm text-on-surface-variant border-l border-outline-variant pl-space-md">Crea tu barbería</span>
          </div>
          <Button as={Link} to="/barber-os" variant="ghost" size="sm">Guardar y salir</Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[760px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg">
        {/* Progreso */}
        <nav aria-label="Pasos" className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between text-body-sm">
            <span className="font-body-semibold">{step < LAST ? `Paso ${step + 1} de 4 · ${STEPS[step].label}` : 'Revisión final'}</span>
            <span className="text-on-surface-variant tabular-nums">{progress}% completado</span>
          </div>
          <ol className="grid grid-cols-5 gap-1.5">
            {STEPS.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  disabled={!canJumpTo(i)}
                  onClick={() => goTo(i)}
                  aria-current={i === step ? 'step' : undefined}
                  className="w-full flex flex-col gap-1 text-left disabled:cursor-not-allowed"
                >
                  <span className={cn('h-1.5 rounded-full', i <= step ? 'bg-primary' : 'bg-surface-container-high')} />
                  <span className={cn('hidden sm:flex items-center gap-1 text-[12px]', i === step ? 'text-primary font-semibold' : i < step ? 'text-on-surface' : 'text-outline')}>
                    {i < step && <Check size={12} strokeWidth={2.5} aria-hidden />} {s.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-space-lg md:p-space-xl min-w-0">
          <Current draft={draft} update={update} errors={errors} />
        </section>

        {/* Navegación */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          {step > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(step - 1)}>Atrás</Button>
          ) : (
            <Button variant="ghost" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Empezar de nuevo</Button>
          )}
          {step < LAST ? (
            <Button iconRight={ArrowRight} onClick={next} size="lg">
              {step === LAST - 1 ? 'Ver vista previa' : `Continuar a ${STEPS[step + 1].label.toLowerCase()}`}
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button icon={Store} disabled size="lg">Crear mi barbería</Button>
              <span className="text-[12px] text-on-surface-variant">Disponible cuando se conecte la base de datos</span>
            </div>
          )}
        </div>
        {step === LAST && (
          <Button variant="ghost" icon={RotateCcw} className="self-start" onClick={() => setConfirmReset(true)}>Empezar de nuevo</Button>
        )}
      </main>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="¿Empezar de nuevo?"
        description="Se borrarán los datos que capturaste en este navegador."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>Volver</Button>
            <Button
              variant="danger"
              onClick={() => {
                clearDraft()
                setDraft(emptyDraft())
                setAttempted(false)
                setConfirmReset(false)
              }}
            >
              Borrar y empezar
            </Button>
          </>
        }
      />
    </div>
  )
}
