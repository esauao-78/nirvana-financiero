import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type BreathingSession = Database['public']['Tables']['breathing_sessions']['Row']

export function useBreathing() {
    const { user } = useAuth()
    const [sessions, setSessions] = useState<BreathingSession[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSessions = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('breathing_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching breathing sessions:', error)
            return
        }

        setSessions(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    const saveSession = async (
        rondas: number,
        tiempoTotal: number,
        retencionMaxima?: number
    ) => {
        if (!user) return { error: new Error('No user'), data: null }

        const { data, error } = await supabase
            .from('breathing_sessions')
            .insert({
                user_id: user.id,
                tipo: 'wim_hof',
                rondas,
                tiempo_total: tiempoTotal,
                retencion_maxima: retencionMaxima || null
            })
            .select()
            .single()

        if (!error) {
            await fetchSessions()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    const totalSessions = sessions.length
    const totalRounds = sessions.reduce((acc, s) => acc + s.rondas, 0)
    const bestRetention = Math.max(...sessions.map(s => s.retencion_maxima || 0), 0)

    return {
        sessions,
        loading,
        saveSession,
        totalSessions,
        totalRounds,
        bestRetention,
        refresh: fetchSessions
    }
}
