import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']
type GoalUpdate = Database['public']['Tables']['goals']['Update']

export function useGoals() {
    const { user } = useAuth()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)

    const fetchGoals = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('archivada', false)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching goals:', error)
            return
        }

        setGoals(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchGoals()
    }, [fetchGoals])

    const createGoal = async (goal: Omit<GoalInsert, 'user_id'>) => {
        if (!user) return { error: new Error('No user'), data: null }

        const { data, error } = await supabase
            .from('goals')
            .insert({ ...goal, user_id: user.id })
            .select()
            .single()

        if (!error) {
            await fetchGoals()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    const updateGoal = async (id: string, updates: GoalUpdate) => {
        const { error } = await supabase
            .from('goals')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            await fetchGoals()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const deleteGoal = async (id: string) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id)

        if (!error) {
            await fetchGoals()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const toggleComplete = async (id: string, completada: boolean) => {
        return updateGoal(id, { completada, progreso: completada ? 100 : undefined })
    }

    const activeGoals = goals.filter(g => !g.completada)
    const completedGoals = goals.filter(g => g.completada)

    return {
        goals,
        activeGoals,
        completedGoals,
        loading,
        createGoal,
        updateGoal,
        deleteGoal,
        toggleComplete,
        refresh: fetchGoals
    }
}
