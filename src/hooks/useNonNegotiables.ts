import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type NonNegotiable = Database['public']['Tables']['non_negotiables']['Row']

export function useNonNegotiables() {
    const { user } = useAuth()
    const [items, setItems] = useState<NonNegotiable[]>([])
    const [loading, setLoading] = useState(true)

    const fetchItems = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('non_negotiables')
            .select('*')
            .eq('user_id', user.id)
            .order('orden')

        if (error) {
            console.error('Error fetching non-negotiables:', error)
            return
        }

        setItems(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const addItem = async (descripcion: string) => {
        if (!user) return { error: new Error('No user') }

        const { error } = await supabase
            .from('non_negotiables')
            .insert({
                user_id: user.id,
                descripcion,
                orden: items.length
            })

        if (!error) {
            await fetchItems()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const removeItem = async (id: string) => {
        const { error } = await supabase
            .from('non_negotiables')
            .delete()
            .eq('id', id)

        if (!error) {
            await fetchItems()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const updateItems = async (newItems: string[]) => {
        if (!user) return { error: new Error('No user') }

        // Delete all existing
        await supabase
            .from('non_negotiables')
            .delete()
            .eq('user_id', user.id)

        // Insert new ones
        if (newItems.length > 0) {
            const inserts = newItems.map((descripcion, orden) => ({
                user_id: user.id,
                descripcion,
                orden
            }))

            const { error } = await supabase
                .from('non_negotiables')
                .insert(inserts)

            if (error) {
                return { error: new Error(error.message) }
            }
        }

        await fetchItems()
        return { error: null }
    }

    return {
        items,
        loading,
        addItem,
        removeItem,
        updateItems,
        refresh: fetchItems
    }
}
