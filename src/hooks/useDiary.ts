import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type DailyDiary = Database['public']['Tables']['daily_diary']['Row']
type DailyDiaryInsert = Database['public']['Tables']['daily_diary']['Insert']

export function useDiary() {
    const { user } = useAuth()
    const [entries, setEntries] = useState<DailyDiary[]>([])
    const [todayEntry, setTodayEntry] = useState<DailyDiary | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchEntries = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('daily_diary')
            .select('*')
            .eq('user_id', user.id)
            .order('fecha', { ascending: false })
            .limit(30)

        if (error) {
            console.error('Error fetching diary entries:', error)
            return
        }

        setEntries(data || [])

        const today = new Date().toISOString().split('T')[0]
        const todayData = data?.find(e => e.fecha === today) || null
        setTodayEntry(todayData)

        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    const saveTodayEntry = async (entry: Omit<DailyDiaryInsert, 'user_id' | 'fecha'>) => {
        if (!user) return { error: new Error('No user') }

        const today = new Date().toISOString().split('T')[0]

        const { error } = await supabase
            .from('daily_diary')
            .upsert({
                user_id: user.id,
                fecha: today,
                ...entry
            }, { onConflict: 'user_id,fecha' })

        if (!error) {
            await fetchEntries()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const getEmotionalTrend = (days: number = 7) => {
        const recentEntries = entries.slice(0, days).reverse()
        return recentEntries.map(e => ({
            fecha: e.fecha,
            estado: e.estado_emocional,
            energia: e.energia
        }))
    }

    const averageEmotionalState = entries.length > 0
        ? entries.reduce((sum, e) => sum + (e.estado_emocional || 0), 0) / entries.filter(e => e.estado_emocional).length
        : 0

    const hasCheckedInToday = todayEntry !== null && todayEntry.estado_emocional !== null

    return {
        entries,
        todayEntry,
        loading,
        saveTodayEntry,
        getEmotionalTrend,
        averageEmotionalState,
        hasCheckedInToday,
        refresh: fetchEntries
    }
}
