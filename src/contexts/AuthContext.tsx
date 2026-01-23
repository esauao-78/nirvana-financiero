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
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                const profileData = await fetchProfile(session.user.id)
                setProfile(profileData)
            }
            setLoading(false)
        }).catch((error) => {
            console.error('Error getting session:', error)
            setLoading(false)
        })

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
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setSession(null)
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
