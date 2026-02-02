import { createClient } from '@supabase/supabase-js'

// TODO: Replace these with your Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
