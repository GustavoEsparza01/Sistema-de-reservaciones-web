// Nueva contraseña: aquí llega el enlace del correo de recuperación.
// Supabase abre una sesión temporal con ese enlace y con ella se cambia la contraseña.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../lib/authErrors'
import { Button, Spinner, useToast } from '../../components/ui'
import PasswordInput from '../../components/account/PasswordInput'

export default function Restablecer() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  if (loading) {
    return <div className="flex justify-center py-space-xl text-on-surface-variant"><Spinner size={24} /></div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center text-center gap-space-md">
        <span className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center">
          <CircleAlert size={28} strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="font-headline-page text-headline-page">El enlace ya no es válido</h1>
        <p className="text-body-default text-on-surface-variant">Puede que haya expirado o que ya lo hayas usado. Pide uno nuevo.</p>
        <Button as={Link} to="/recuperar" className="justify-center w-full">Pedir otro enlace</Button>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (form.password.length < 8) found.password = 'Usa al menos 8 caracteres.'
    if (form.confirm !== form.password) found.confirm = 'Las contraseñas no coinciden.'
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setSaving(false)
    if (error) {
      setErrors({ password: authErrorMessage(error) })
      return
    }
    toast({ title: 'Contraseña actualizada', description: 'Ya puedes usar tu nueva contraseña.' })
    navigate('/inicio', { replace: true })
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page text-headline-page">Crea una nueva contraseña</h1>
        <p className="text-body-default text-on-surface-variant">Para la cuenta {session.user.email}.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <PasswordInput label="Nueva contraseña" autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} hint="Mínimo 8 caracteres." autoFocus />
        <PasswordInput label="Confirmar contraseña" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />
        <Button type="submit" loading={saving} size="lg" className="justify-center">Guardar contraseña</Button>
      </form>
    </div>
  )
}
