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
  const { data: authData } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
  })
  
  if (authData?.user) {
    // Insert profile so we can read it
    await supabase.from('profiles').insert([{
      id: authData.user.id,
      full_name: 'Test Columns',
      phone: '12345678',
      role: 'client'
    }])
  }

  const { data, error } = await supabase.from('profiles').select('*')
  console.log("Logged in - Error:", error)
  console.log("Logged in - Data count:", data?.length)
  const { data: blockedData, error: blockedError } = await supabase.from('blocked_slots').select('*').limit(1)
  console.log("Blocked slots table error:", blockedError)
  console.log("Blocked slots table exists?", blockedError === null)
}

test()
