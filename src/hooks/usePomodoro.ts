import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']

export function usePomodoro() {
    const { user } = useAuth()
    const [sessions, setSessions] = useState<PomodoroSession[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSessions = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('pomodoro_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error fetching pomodoro sessions:', error)
            return
        }

        setSessions(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    const createSession = async (
        duracion: number,
        tipo: 'focus' | 'short_break' | 'long_break',
        taskId?: string | null,
        completada: boolean = true
    ) => {
        if (!user) return { error: new Error('No user'), data: null }

        const { data, error } = await supabase
            .from('pomodoro_sessions')
            .insert({
                user_id: user.id,
                task_id: taskId || null,
                duracion,
                tipo,
                completada
            })
            .select()
            .single()

        if (!error) {
            await fetchSessions()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    // Statistics
    const todaySessions = sessions.filter(s => {
        const today = new Date().toISOString().split('T')[0]
        return s.created_at.startsWith(today) && s.tipo === 'focus' && s.completada
    })

    const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duracion, 0)

    const totalFocusMinutes = sessions
        .filter(s => s.tipo === 'focus' && s.completada)
        .reduce((acc, s) => acc + s.duracion, 0)

    const getTaskFocusTime = (taskId: string) => {
        return sessions
            .filter(s => s.task_id === taskId && s.tipo === 'focus' && s.completada)
            .reduce((acc, s) => acc + s.duracion, 0)
    }

    return {
        sessions,
        loading,
        createSession,
        todaySessions,
        todayFocusMinutes,
        totalFocusMinutes,
        getTaskFocusTime,
        refresh: fetchSessions
    }
}
