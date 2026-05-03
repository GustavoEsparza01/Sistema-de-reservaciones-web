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
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test_schema_check@test.com',
    password: 'password123',
  })
  if (authError) {
    console.log("Auth Error:", authError)
    // If user already exists, login
    await supabase.auth.signInWithPassword({ email: 'test_schema_check@test.com', password: 'password123' })
  }

  const { data, error } = await supabase.from('profiles').insert([
    {
      id: authData?.user?.id,
      full_name: 'Test',
      phone: '123',
      birthdate: '2000-01-01',
      role: 'client'
    }
  ])
  console.log("Insert Error:", error)
}
test()
