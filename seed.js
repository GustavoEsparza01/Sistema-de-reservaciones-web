import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lxpaxknkfdbnmarglwor.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGF4a25rZmRibm1hcmdsd29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU3MjcyNiwiZXhwIjoyMDkzMTQ4NzI2fQ.L994SxohtApzDjnPgqITSUpli6aneHANuHXggPB1Yb8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seed() {
  console.log("Iniciando carga de datos...")

  // 1. Insertar Servicios
  console.log("Creando servicios...")
  const services = [
    { name: 'Corte Clásico', description: 'Corte a tijera o máquina tradicional', price: 200, duration_min: 60, is_active: true },
    { name: 'Corte + Barba', description: 'Paquete completo de corte y arreglo de barba', price: 350, duration_min: 60, is_active: true },
    { name: 'Perfilado de Barba', description: 'Arreglo, delineado y toalla caliente', price: 150, duration_min: 60, is_active: true }
  ]
  // const { error: errSrv } = await supabase.from('services').insert(services)
  // if (errSrv) console.error("Error al insertar servicios:", errSrv.message)
  // else console.log("Servicios insertados correctamente.")

  // 2. Insertar Barberos
  console.log("Creando barberos...")
  const barbersData = [
    { email: 'barbero100@peludos.com', name: 'Carlos (Barbero)', phone: '9991112233' },
    { email: 'barbero200@peludos.com', name: 'Luis (Barbero)', phone: '9994445566' }
  ]

  for (const b of barbersData) {
    // a) Crear en Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: b.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: b.name, phone: b.phone }
    })
    
    if (authErr) {
      console.error("Error creando auth user para", b.name, ":", authErr.message)
      continue
    }

    if (authData?.user) {
      // b) Insertar en profiles
      const { error: profErr } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: b.name,
        phone: b.phone,
        role: 'barber',
        birthdate: '1995-01-01'
      }])
      
      if (profErr) {
        console.error("Error insertando profile para", b.name, ":", profErr.message)
        continue
      }

      // c) Insertar en barbers
      const { error: barbErr } = await supabase.from('barbers').insert([{
        profile_id: authData.user.id,
        bio: 'Barbero experto de Peludos Barber Shop',
        is_active: true
      }])

      if (barbErr) console.error("Error insertando barber para", b.name, ":", barbErr.message)
      else console.log("Barbero creado correctamente:", b.name)
    }
  }

  console.log("Carga de datos finalizada.")
}

seed()
