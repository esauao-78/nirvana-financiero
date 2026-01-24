import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export function useTasks() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('orden', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
            return
        }

        setTasks(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const createTask = async (task: Omit<TaskInsert, 'user_id'>) => {
        if (!user) return { error: new Error('No user'), data: null }

        // Get max orden for this estado
        const tasksInEstado = tasks.filter(t => t.estado === (task.estado || 'pendiente'))
        const maxOrden = tasksInEstado.length > 0
            ? Math.max(...tasksInEstado.map(t => t.orden || 0))
            : 0

        const { data, error } = await supabase
            .from('tasks')
            .insert({ ...task, user_id: user.id, orden: maxOrden + 1 })
            .select()
            .single()

        if (!error) {
            await fetchTasks()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    const updateTask = async (id: string, updates: TaskUpdate) => {
        const { error } = await supabase
            .from('tasks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            await fetchTasks()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (!error) {
            await fetchTasks()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const addTimeToTask = async (id: string, minutes: number) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        await updateTask(id, {
            tiempo_dedicado: (task.tiempo_dedicado || 0) + minutes
        })
    }

    // Reorder tasks within a column (estado)
    const reorderTasks = async (reorderedTasks: { id: string; orden: number }[]) => {
        // Update local state optimistically
        setTasks(prev => {
            const updated = [...prev]
            reorderedTasks.forEach(({ id, orden }) => {
                const task = updated.find(t => t.id === id)
                if (task) task.orden = orden
            })
            return updated.sort((a, b) => (a.orden || 0) - (b.orden || 0))
        })

        // Update in database
        const updates = reorderedTasks.map(({ id, orden }) =>
            supabase.from('tasks').update({ orden }).eq('id', id)
        )

        await Promise.all(updates)
    }

    const pendingTasks = tasks.filter(t => t.estado === 'pendiente')
    const inProgressTasks = tasks.filter(t => t.estado === 'en_progreso')
    const completedTasks = tasks.filter(t => t.estado === 'completada')

    return {
        tasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        addTimeToTask,
        reorderTasks,
        refresh: fetchTasks
    }
}
