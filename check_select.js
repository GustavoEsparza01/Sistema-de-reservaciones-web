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
  await supabase.auth.signUp({
    email: email,
    password: 'password123',
  })
  
  const { data, error } = await supabase.from('profiles').select('*')
  console.log("Logged in - Error:", error)
  console.log("Logged in - Data count:", data?.length)
}

test()
