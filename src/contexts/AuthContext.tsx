import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signInWithGoogle: () => Promise<{ error: AuthError | null }>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data
    }

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    useEffect(() => {
        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn('Session initialization timed out after 10 seconds')
                setLoading(false)
                // Clear potentially corrupted auth data
                supabase.auth.signOut().catch(console.error)
            }
        }, 10000)

        // Helper function to clear auth data
        const clearAuthData = () => {
            const keysToRemove: string[] = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
        }

        // Get initial session with improved error handling
        const initializeSession = async () => {
            try {
                // Check if there's existing auth data that might be corrupted
                const hasStoredSession = Object.keys(localStorage).some(key =>
                    key.startsWith('sb-') || key.includes('supabase')
                )

                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error getting session:', error)
                    clearAuthData()
                    setLoading(false)
                    clearTimeout(safetyTimeout)
                    return
                }

                // If we had stored data but no valid session, clear the corrupted data
                if (hasStoredSession && !session) {
                    console.warn('Stored session data exists but session is invalid, clearing...')
                    clearAuthData()
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    try {
                        const profileData = await fetchProfile(session.user.id)
                        setProfile(profileData)
                    } catch (profileError) {
                        console.error('Error fetching profile during init:', profileError)
                    }
                }
                setLoading(false)
            } catch (error) {
                console.error('Fatal error initializing session:', error)
                clearAuthData()
                setLoading(false)
            } finally {
                clearTimeout(safetyTimeout)
            }
        }

        initializeSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event)

                // Handle token refresh
                if (event === 'TOKEN_REFRESHED') {
                    console.log('Token refreshed successfully')
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    try {
                        const profileData = await fetchProfile(session.user.id)
                        setProfile(profileData)
                    } catch (error) {
                        console.error('Error fetching profile on auth change:', error)
                        setProfile(null)
                    }
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        // Auto refresh session every 10 minutes to prevent token expiration
        const refreshInterval = setInterval(async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession) {
                const { error } = await supabase.auth.refreshSession()
                if (error) {
                    console.error('Session refresh error:', error)
                } else {
                    console.log('Session refreshed proactively')
                }
            }
        }, 10 * 60 * 1000) // 10 minutes

        return () => {
            subscription.unsubscribe()
            clearInterval(refreshInterval)
        }
    }, [])

    const signUp = async (email: string, password: string, name?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name || email.split('@')[0] }
            }
        })
        return { error }
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { error }
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        })
        return { error }
    }

    const signOut = async () => {
        try {
            // Clear all state first
            setUser(null)
            setProfile(null)
            setSession(null)

            // Sign out from Supabase
            await supabase.auth.signOut({ scope: 'local' })

            // Clear all Supabase-related localStorage items
            const keysToRemove: string[] = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))

            // Force page reload to ensure clean state
            window.location.href = window.location.origin
        } catch (error) {
            console.error('Error during sign out:', error)
            // Even if there's an error, clear local state and reload
            localStorage.clear()
            window.location.href = window.location.origin
        }
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: new Error('No user logged in') }

        const updateData = { ...updates, updated_at: new Date().toISOString() }

        const { error } = await supabase
            .from('profiles')
            .update(updateData as Database['public']['Tables']['profiles']['Update'])
            .eq('id', user.id)

        if (!error) {
            setProfile(prev => prev ? { ...prev, ...updates } : null)
        }

        return { error: error ? new Error(error.message) : null }
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut,
            updateProfile,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
