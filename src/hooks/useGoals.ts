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
            .order('orden', { ascending: true })
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

        // Get max orden for this estado
        const goalsInEstado = goals.filter(g => g.estado === (goal.estado || 'no_iniciada'))
        const maxOrden = goalsInEstado.length > 0
            ? Math.max(...goalsInEstado.map(g => g.orden || 0))
            : 0

        const { data, error } = await supabase
            .from('goals')
            .insert({ ...goal, user_id: user.id, orden: maxOrden + 1 })
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

    // Reorder goals within a column (estado)
    const reorderGoals = async (reorderedGoals: { id: string; orden: number }[]) => {
        // Update local state optimistically
        setGoals(prev => {
            const updated = [...prev]
            reorderedGoals.forEach(({ id, orden }) => {
                const goal = updated.find(g => g.id === id)
                if (goal) goal.orden = orden
            })
            return updated.sort((a, b) => (a.orden || 0) - (b.orden || 0))
        })

        // Update in database
        const updates = reorderedGoals.map(({ id, orden }) =>
            supabase.from('goals').update({ orden }).eq('id', id)
        )

        await Promise.all(updates)
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
        reorderGoals,
        refresh: fetchGoals
    }
}
