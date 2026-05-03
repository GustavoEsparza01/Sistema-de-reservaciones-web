import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      services ( name, price ),
      barbers ( profiles ( full_name ) ),
      client:profiles!client_id ( full_name, phone )
    `)
    .limit(1)

  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}

test()
