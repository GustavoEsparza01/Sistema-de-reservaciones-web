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
  // we need the admin email and password. I don't know it.
  // But wait, what are the RLS policies on profiles?
  const { data, error } = await supabase.from('profiles').select('*')
  console.log("No session - Profiles count:", data?.length)
}
test()
