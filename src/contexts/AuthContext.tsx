import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

type AppState = 'loading' | 'unauthenticated' | 'profile_loading' | 'profile_error' | 'authenticated'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    appState: AppState
    errorMessage: string | null
    signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
    retryLoadProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [appState, setAppState] = useState<AppState>('loading')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Clear all auth data from localStorage
    const clearAuthData = useCallback(() => {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
    }, [])

    // Fetch profile with timeout
    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
                .abortSignal(controller.signal)

            clearTimeout(timeoutId)

            if (error) {
                console.error('Error fetching profile:', error)
                return null
            }
            return data
        } catch (err) {
            clearTimeout(timeoutId)
            console.error('Exception fetching profile:', err)
            return null
        }
    }, [])

    // Retry loading profile
    const retryLoadProfile = useCallback(async () => {
        if (!user) return

        setAppState('profile_loading')
        setErrorMessage(null)

        const profileData = await fetchProfile(user.id)

        if (profileData) {
            setProfile(profileData)
            setAppState('authenticated')
        } else {
            setErrorMessage('No se pudo cargar tu perfil. Por favor, intenta de nuevo.')
            setAppState('profile_error')
        }
    }, [user, fetchProfile])

    // Initialize session on mount
    useEffect(() => {
        let isMounted = true

        // Safety timeout - if we're still loading after 15 seconds, something is wrong
        const safetyTimeout = setTimeout(() => {
            if (isMounted && appState === 'loading') {
                console.warn('Safety timeout triggered - clearing auth data')
                clearAuthData()
                setAppState('unauthenticated')
            }
        }, 15000)

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (!isMounted) return

                if (error || !session) {
                    // Check if there's stale data in localStorage
                    const hasStoredData = Object.keys(localStorage).some(key =>
                        key.startsWith('sb-') || key.includes('supabase')
                    )
                    if (hasStoredData && !session) {
                        console.warn('Clearing stale auth data')
                        clearAuthData()
                    }
                    setAppState('unauthenticated')
                    return
                }

                setSession(session)
                setUser(session.user)
                setAppState('profile_loading')

                // Load profile
                const profileData = await fetchProfile(session.user.id)

                if (!isMounted) return

                if (profileData) {
                    setProfile(profileData)
                    setAppState('authenticated')
                } else {
                    setErrorMessage('Error al cargar el perfil')
                    setAppState('profile_error')
                }
            } catch (err) {
                console.error('Fatal error during auth initialization:', err)
                if (isMounted) {
                    clearAuthData()
                    setAppState('unauthenticated')
                }
            }
        }

        initializeAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('Auth event:', event)

                if (!isMounted) return

                if (event === 'SIGNED_OUT' || !newSession) {
                    setSession(null)
                    setUser(null)
                    setProfile(null)
                    setAppState('unauthenticated')
                    return
                }

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    setSession(newSession)
                    setUser(newSession.user)

                    // Only reload profile on sign in, not on token refresh
                    if (event === 'SIGNED_IN') {
                        setAppState('profile_loading')
                        const profileData = await fetchProfile(newSession.user.id)

                        if (!isMounted) return

                        if (profileData) {
                            setProfile(profileData)
                            setAppState('authenticated')
                        } else {
                            setErrorMessage('Error al cargar el perfil')
                            setAppState('profile_error')
                        }
                    }
                }
            }
        )

        return () => {
            isMounted = false
            clearTimeout(safetyTimeout)
            subscription.unsubscribe()
        }
    }, [fetchProfile, clearAuthData])

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
        setAppState('loading')
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) {
            setAppState('unauthenticated')
        }
        return { error }
    }

    const signOut = async () => {
        try {
            setUser(null)
            setProfile(null)
            setSession(null)

            await supabase.auth.signOut({ scope: 'local' })
            clearAuthData()

            // Force full page reload
            window.location.href = window.location.origin
        } catch (error) {
            console.error('Error during sign out:', error)
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
            appState,
            errorMessage,
            signUp,
            signIn,
            signOut,
            updateProfile,
            retryLoadProfile
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
