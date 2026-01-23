import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Production fallback values (anon key is public by design)
const PRODUCTION_SUPABASE_URL = 'https://kniogteqfxcfadjomxls.supabase.co'
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaW9ndGVxZnhjZmFkam9teGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNDg4MDYsImV4cCI6MjA4NDYyNDgwNn0.0oygP8UywmlkE2SFKOilRELk4B-xFvHS6HJPgowMjhE'

// Use environment variables if available, otherwise use production values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PRODUCTION_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PRODUCTION_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})
