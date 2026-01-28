import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type ProsperityPillar = Database['public']['Tables']['prosperity_pillars']['Row']
type ProsperityInsert = Database['public']['Tables']['prosperity_pillars']['Insert']

const DEFAULT_PILLARS: Array<{ pilar: ProsperityPillar['pilar'], valor_actual: number, valor_deseado: number }> = [
    { pilar: 'economica', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'emocional', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'fisica', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'relacional', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'entorno', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'salud', valor_actual: 5, valor_deseado: 10 },
    { pilar: 'desarrollo_personal', valor_actual: 5, valor_deseado: 10 },
]

export function useProsperity() {
    const { user } = useAuth()
    const [pillars, setPillars] = useState<ProsperityPillar[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPillars = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('prosperity_pillars')
            .select('*')
            .eq('user_id', user.id)
            .order('pilar')

        if (error) {
            console.error('Error fetching pillars:', error)
            return
        }

        setPillars(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchPillars()
    }, [fetchPillars])

    const initializePillars = async () => {
        if (!user) return { error: new Error('No user') }

        const inserts: ProsperityInsert[] = DEFAULT_PILLARS.map(p => ({
            user_id: user.id,
            ...p
        }))

        const { error } = await supabase
            .from('prosperity_pillars')
            .upsert(inserts, { onConflict: 'user_id,pilar' })

        if (!error) {
            await fetchPillars()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const updatePillar = async (pilar: ProsperityPillar['pilar'], valor_actual: number, valor_deseado: number) => {
        if (!user) return { error: new Error('No user') }

        const { error } = await supabase
            .from('prosperity_pillars')
            .upsert({
                user_id: user.id,
                pilar,
                valor_actual,
                valor_deseado,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,pilar' })

        if (!error) {
            await fetchPillars()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const getCriticalArea = () => {
        if (pillars.length === 0) return null

        let maxGap = 0
        let critical: ProsperityPillar | null = null

        for (const p of pillars) {
            const gap = p.valor_deseado - p.valor_actual
            if (gap > maxGap) {
                maxGap = gap
                critical = p
            }
        }

        return critical
    }

    return {
        pillars,
        loading,
        initializePillars,
        updatePillar,
        getCriticalArea,
        refresh: fetchPillars
    }
}
