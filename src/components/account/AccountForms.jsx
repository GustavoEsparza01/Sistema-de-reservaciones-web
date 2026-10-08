// Formularios de la cuenta, compartidos por Configuración (panel) y Mi perfil (cliente).
import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Badge, Button, Card, CardHeader, Input, useToast } from '../ui'

/** Datos personales: nombre, teléfono, fecha de nacimiento y correo (solo lectura). */
export function ProfileForm({ title = 'Mi perfil', description = 'Así te ven tu equipo y tus clientes.', subtitle, showRoles = true }) {
  const { session, profile, refreshProfile, isAdmin, isBarber } = useAuth()
  const toast = useToast()
  const initial = () => ({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '', birthdate: profile?.birthdate ?? '' })
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(initial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const original = initial()
  const dirty = Object.keys(form).some((k) => form[k] !== original[k])

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    const name = form.full_name.trim()
    const phone = form.phone.trim()
    if (!name) found.full_name = 'Escribe tu nombre.'
    if (phone && phone.replace(/\D/g, '').length < 10) found.phone = 'El teléfono debe tener al menos 10 dígitos.'
    if (form.birthdate && new Date(form.birthdate) > new Date()) found.birthdate = 'La fecha no puede ser futura.'
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, phone: phone || null, birthdate: form.birthdate || null })
      .eq('id', session.user.id)
    setSaving(false)
    if (error) {
      toast({ tone: 'error', title: 'No se pudieron guardar tus datos', description: error.message })
      return
    }
    await refreshProfile()
    toast({ title: 'Datos actualizados' })
  }

  return (
    <Card className="flex flex-col gap-space-lg">
      <CardHeader title={title} description={description} />
      <div className="flex items-center gap-space-md">
        <Avatar name={form.full_name || 'Usuario'} size="lg" />
        <div>
          <p className="font-body-semibold">{profile?.full_name || 'Sin nombre'}</p>
          {subtitle && <p className="text-body-sm text-on-surface-variant">{subtitle}</p>}
          {showRoles && (isAdmin || isBarber) && (
            <div className="flex gap-space-xs mt-1">
              {isAdmin && <Badge tone="primary">Administrador</Badge>}
              {isBarber && <Badge tone="success">Barbero</Badge>}
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Input label="Nombre completo" required autoComplete="name" value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
        <Input label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" placeholder="938 123 4567" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <Input label="Fecha de nacimiento" type="date" max={new Date().toISOString().slice(0, 10)} value={form.birthdate} onChange={set('birthdate')} error={errors.birthdate} hint="Opcional." />
        <Input label="Correo" value={session?.user?.email ?? ''} disabled readOnly hint="Se usa para iniciar sesión; no se puede cambiar aquí." />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={saving} disabled={!dirty}>Guardar cambios</Button>
        </div>
      </form>
    </Card>
  )
}

/** Cambio de contraseña del usuario con sesión. */
export function PasswordForm() {
  const toast = useToast()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

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
      toast({ tone: 'error', title: 'No se pudo cambiar la contraseña', description: error.message })
      return
    }
    setForm({ password: '', confirm: '' })
    toast({ title: 'Contraseña actualizada' })
  }

  return (
    <Card className="flex flex-col gap-space-lg">
      <CardHeader title="Seguridad" description="Cambia la contraseña con la que inicias sesión." />
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Input label="Nueva contraseña" type="password" autoComplete="new-password" icon={KeyRound} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} hint="Mínimo 8 caracteres." />
        <Input label="Confirmar contraseña" type="password" autoComplete="new-password" icon={KeyRound} value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={saving} disabled={!form.password}>Cambiar contraseña</Button>
        </div>
      </form>
    </Card>
  )
}
