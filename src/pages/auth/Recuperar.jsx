// "¿Olvidaste tu contraseña?": envía el enlace para restablecerla.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { authErrorMessage, isValidEmail } from '../../lib/authErrors'
import { Button, Input } from '../../components/ui'
import { withReturn } from './Login'

export default function Recuperar() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Escribe un correo válido.')
      return
    }
    setSending(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // Debe estar permitido en Supabase → Auth → URL Configuration → Redirect URLs
      redirectTo: `${window.location.origin}/restablecer`,
    })
    setSending(false)
    if (err) {
      setError(authErrorMessage(err))
      return
    }
    // Se muestra lo mismo exista o no la cuenta, para no revelar qué correos están registrados
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-space-md">
        <span className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
          <MailCheck size={28} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="font-headline-page text-headline-page">Revisa tu correo</h1>
        <p className="text-body-default text-on-surface-variant">
          Si <span className="font-body-medium text-on-surface">{email.trim()}</span> tiene una cuenta, recibirás un enlace para crear una nueva contraseña.
        </p>
        <Button as={Link} to={withReturn('/login', params)} variant="secondary" className="justify-center w-full">Volver a iniciar sesión</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page text-headline-page">Restablece tu contraseña</h1>
        <p className="text-body-default text-on-surface-variant">Escribe el correo de tu cuenta y te enviaremos un enlace.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <Input label="Correo electrónico" type="email" autoComplete="email" icon={Mail} placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} autoFocus />
        <Button type="submit" loading={sending} size="lg" className="justify-center">Enviar enlace</Button>
      </form>
      <Link to={withReturn('/login', params)} className="self-center inline-flex items-center gap-1 text-body-sm text-primary hover:underline">
        <ArrowLeft size={14} aria-hidden /> Volver a iniciar sesión
      </Link>
    </div>
  )
}
