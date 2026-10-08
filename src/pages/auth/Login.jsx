// Iniciar sesión (design/stitch/14-login).
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { safeReturnPath } from '../../lib/roles'
import { authErrorMessage, isValidEmail } from '../../lib/authErrors'
import { Button, Input } from '../../components/ui'
import PasswordInput from '../../components/account/PasswordInput'

/** Conserva ?volver= al pasar entre login, registro y recuperar contraseña. */
export function withReturn(path, params) {
  const volver = params.get('volver')
  return volver ? `${path}?volver=${encodeURIComponent(volver)}` : path
}

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnPath(params.get('volver')) ?? '/inicio'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión, no tiene sentido mostrar el formulario
  if (!loading && session && !submitting) return <Navigate to={returnTo} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!isValidEmail(form.email)) found.email = 'Escribe un correo válido.'
    if (!form.password) found.password = 'Escribe tu contraseña.'
    setErrors(found)
    setSubmitError(null)
    if (Object.keys(found).length) return

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
    if (error) {
      setSubmitting(false)
      setSubmitError(authErrorMessage(error))
      return
    }
    navigate(returnTo, { replace: true })
  }

  const fromBooking = returnTo.includes('/reservar')

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page text-headline-page">Inicia sesión</h1>
        <p className="text-body-default text-on-surface-variant">
          {fromBooking ? 'Entra a tu cuenta para confirmar tu reserva. Tu selección se conserva.' : 'Entra para ver tus citas o administrar tu barbería.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="tu@correo.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="Contraseña"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
          />
          <Link to={withReturn('/recuperar', params)} className="self-end text-body-sm text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {submitError && <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>}

        <Button type="submit" loading={submitting} iconRight={ArrowRight} className="justify-center h-11">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-body-sm text-center text-on-surface-variant">
        ¿No tienes cuenta?{' '}
        <Link to={withReturn('/registro', params)} className="font-body-medium text-primary hover:underline">Crea una gratis</Link>
      </p>
    </div>
  )
}
