import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Production fallback values (anon key is public by design)
const PRODUCTION_SUPABASE_URL = 'https://kniogteqfxcfadjomxls.supabase.co'
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaW9ndGVxZnhjZmFkam9teGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNDg4MDYsImV4cCI6MjA4NDYyNDgwNn0.0oygP8UywmlkE2SFKOilRELk4B-xFvHS6HJPgowMjhE'

// Use environment variables if available, otherwise use production values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PRODUCTION_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PRODUCTION_SUPABASE_ANON_KEY

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'juega-tu-juego-auth',
        storage: {
            getItem: (key) => {
                try {
                    const item = localStorage.getItem(key)
                    console.log(`[Storage] getItem(${key}):`, item ? 'found' : 'not found')
                    return item
                } catch (error) {
                    console.error('[Storage] getItem error:', error)
                    return null
                }
            },
            setItem: (key, value) => {
                try {
                    console.log(`[Storage] setItem(${key})`)
                    localStorage.setItem(key, value)
                } catch (error) {
                    console.error('[Storage] setItem error:', error)
                }
            },
            removeItem: (key) => {
                try {
                    console.log(`[Storage] removeItem(${key})`)
                    localStorage.removeItem(key)
                } catch (error) {
                    console.error('[Storage] removeItem error:', error)
                }
            }
        }
    }
})

// Log storage status on init
console.log('[Supabase] Initialized with URL:', supabaseUrl)
console.log('[Supabase] localStorage available:', typeof localStorage !== 'undefined')

