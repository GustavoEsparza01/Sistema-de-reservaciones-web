// Crear cuenta de cliente (variante de registro de design/stitch/14-login).
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, MailCheck, Mail, Phone, User } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { safeReturnPath } from '../../lib/roles'
import { authErrorMessage, isValidEmail } from '../../lib/authErrors'
import { Button, Input } from '../../components/ui'
import PasswordInput from '../../components/account/PasswordInput'
import { withReturn } from './Login'

const EMPTY = { full_name: '', phone: '', email: '', password: '', birthdate: '' }

export default function Registro() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnPath(params.get('volver')) ?? '/inicio'

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState(null)

  if (!loading && session && !submitting) return <Navigate to={returnTo} replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!form.full_name.trim()) found.full_name = 'Escribe tu nombre.'
    if (form.phone.replace(/\D/g, '').length < 10) found.phone = 'Escribe un teléfono de 10 dígitos.'
    if (!isValidEmail(form.email)) found.email = 'Escribe un correo válido.'
    if (form.password.length < 8) found.password = 'Usa al menos 8 caracteres.'
    if (form.birthdate && new Date(form.birthdate) > new Date()) found.birthdate = 'La fecha no puede ser futura.'
    setErrors(found)
    setSubmitError(null)
    if (Object.keys(found).length) return

    const profile = { full_name: form.full_name.trim(), phone: form.phone.trim(), birthdate: form.birthdate || null }
    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: profile,
        // Al confirmar el correo vuelve al sitio (debe estar permitido en Supabase → Auth → URL Configuration)
        emailRedirectTo: `${window.location.origin}${returnTo}`,
      },
    })
    if (error) {
      setSubmitting(false)
      setSubmitError(authErrorMessage(error))
      return
    }

    // Igual que la versión anterior: se crea el perfil del cliente
    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, ...profile, role: 'client' }])
      if (profileError) console.error('Error al crear el perfil:', profileError)
    }

    // Si Supabase no pide confirmar el correo, ya hay sesión y se continúa
    if (data?.session) {
      navigate(returnTo, { replace: true })
      return
    }
    setSubmitting(false)
    setSentTo(form.email.trim())
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center text-center gap-space-md">
        <span className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
          <MailCheck size={28} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="font-headline-page text-headline-page">Revisa tu correo</h1>
        <p className="text-body-default text-on-surface-variant">
          Te enviamos un enlace a <span className="font-body-medium text-on-surface">{sentTo}</span> para confirmar tu cuenta. Después podrás iniciar sesión.
        </p>
        <Button as={Link} to={withReturn('/login', params)} variant="secondary" className="justify-center w-full">Ir a iniciar sesión</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page text-headline-page">Crea tu cuenta</h1>
        <p className="text-body-default text-on-surface-variant">Es gratis y te sirve para reservar y consultar tus citas.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <Input label="Nombre completo" required autoComplete="name" icon={User} value={form.full_name} onChange={set('full_name')} error={errors.full_name} autoFocus />
        <Input label="Teléfono" required type="tel" inputMode="tel" autoComplete="tel" icon={Phone} placeholder="938 123 4567" value={form.phone} onChange={set('phone')} error={errors.phone} hint="Para avisarte sobre tus citas." />
        <Input label="Correo electrónico" required type="email" autoComplete="email" icon={Mail} placeholder="tu@correo.com" value={form.email} onChange={set('email')} error={errors.email} />
        <PasswordInput label="Contraseña" required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="Mínimo 8 caracteres." />
        <Input label="Fecha de nacimiento" type="date" max={new Date().toISOString().slice(0, 10)} value={form.birthdate} onChange={set('birthdate')} error={errors.birthdate} hint="Opcional." />

        {submitError && <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>}

        <Button type="submit" loading={submitting} iconRight={ArrowRight} className="justify-center h-11">Crear cuenta</Button>
      </form>

      <p className="text-body-sm text-center text-on-surface-variant">
        ¿Ya tienes cuenta?{' '}
        <Link to={withReturn('/login', params)} className="font-body-medium text-primary hover:underline">Inicia sesión</Link>
      </p>
    </div>
  )
}
