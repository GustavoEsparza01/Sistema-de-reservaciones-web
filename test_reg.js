import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const envLines = envContent.split('\n')
let url = ''
let key = ''
envLines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim()
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim()
})

const supabase = createClient(url, key)

async function test() {
  const email = `test_${Date.now()}@test.com`
  console.log("Registering", email)
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
    options: { data: { full_name: 'Test', phone: '123', birthdate: '2000-01-01' } },
  })
  
  if (error) {
    console.log("Sign up error:", error)
    return
  }
  
  console.log("User created:", data?.user?.id)
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: data.user.id,
        full_name: 'Test',
        phone: '123',
        birthdate: '2000-01-01',
        role: 'client'
      }
    ])
    
  console.log("Profile insert error:", profileError)
  
  const { data: pData } = await supabase.from('profiles').select('*').eq('id', data.user.id)
  console.log("Profile in DB:", pData)
}

test()
