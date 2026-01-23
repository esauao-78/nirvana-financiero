import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitInsert = Database['public']['Tables']['habits']['Insert']
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']

export function useHabits() {
    const { user } = useAuth()
    const [habits, setHabits] = useState<Habit[]>([])
    const [completions, setCompletions] = useState<HabitCompletion[]>([])
    const [loading, setLoading] = useState(true)

    const fetchHabits = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .eq('activo', true)
            .order('created_at')

        if (error) {
            console.error('Error fetching habits:', error)
            return
        }

        setHabits(data || [])
        setLoading(false)
    }, [user])

    const fetchTodayCompletions = useCallback(async () => {
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('fecha', today)

        if (error) {
            console.error('Error fetching completions:', error)
            return
        }

        setCompletions(data || [])
    }, [user])

    useEffect(() => {
        fetchHabits()
        fetchTodayCompletions()
    }, [fetchHabits, fetchTodayCompletions])

    const createHabit = async (habit: Omit<HabitInsert, 'user_id'>) => {
        if (!user) return { error: new Error('No user'), data: null }

        const { data, error } = await supabase
            .from('habits')
            .insert({ ...habit, user_id: user.id })
            .select()
            .single()

        if (!error) {
            await fetchHabits()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    const toggleHabitCompletion = async (habitId: string) => {
        if (!user) return { error: new Error('No user') }

        const today = new Date().toISOString().split('T')[0]
        const existing = completions.find(c => c.habit_id === habitId)

        if (existing) {
            // Toggle existing
            const { error } = await supabase
                .from('habit_completions')
                .update({ completado: !existing.completado })
                .eq('id', existing.id)

            if (!error) {
                await fetchTodayCompletions()
                await updateStreaks(habitId, !existing.completado)
            }

            return { error: error ? new Error(error.message) : null }
        } else {
            // Create new completion
            const { error } = await supabase
                .from('habit_completions')
                .insert({
                    habit_id: habitId,
                    user_id: user.id,
                    fecha: today,
                    completado: true
                })

            if (!error) {
                await fetchTodayCompletions()
                await updateStreaks(habitId, true)
            }

            return { error: error ? new Error(error.message) : null }
        }
    }

    const updateStreaks = async (habitId: string, completed: boolean) => {
        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        if (completed) {
            const newStreak = habit.racha_actual + 1
            const newRecord = Math.max(habit.racha_record, newStreak)

            await supabase
                .from('habits')
                .update({ racha_actual: newStreak, racha_record: newRecord })
                .eq('id', habitId)
        } else {
            await supabase
                .from('habits')
                .update({ racha_actual: Math.max(0, habit.racha_actual - 1) })
                .eq('id', habitId)
        }

        await fetchHabits()
    }

    const deleteHabit = async (id: string) => {
        const { error } = await supabase
            .from('habits')
            .update({ activo: false })
            .eq('id', id)

        if (!error) {
            await fetchHabits()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const updateHabit = async (id: string, updates: Partial<Omit<HabitInsert, 'user_id'>>) => {
        const { error } = await supabase
            .from('habits')
            .update(updates as any)
            .eq('id', id)

        if (!error) {
            await fetchHabits()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const isHabitCompletedToday = (habitId: string) => {
        const completion = completions.find(c => c.habit_id === habitId)
        return completion?.completado ?? false
    }

    const maxStreak = habits.length > 0
        ? Math.max(...habits.map(h => h.racha_actual))
        : 0

    const maxRecord = habits.length > 0
        ? Math.max(...habits.map(h => h.racha_record))
        : 0

    // Count today's completed habits
    const todayCompleted = completions.filter(c => c.completado).length

    // Calculate overall streak (average of active habits)
    const overallStreak = habits.length > 0
        ? Math.round(habits.reduce((sum, h) => sum + h.racha_actual, 0) / habits.length)
        : 0

    return {
        habits,
        completions,
        loading,
        createHabit,
        updateHabit,
        toggleHabitCompletion,
        deleteHabit,
        isHabitCompletedToday,
        maxStreak,
        maxRecord,
        todayCompleted,
        overallStreak,
        refresh: fetchHabits
    }
}
