import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elmpssjaoxzpqxizpspa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbXBzc2phb3h6cHF4aXpwc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjQ0NDgsImV4cCI6MjA4NTYwMDQ0OH0.acsLRtibNM4MHF-9wfCsnMagdRjo2WSte_K3LjKpMFA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
