import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export function useFinances() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTransactions = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('fecha', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error fetching transactions:', error)
            return
        }

        setTransactions(data || [])
        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const createTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>) => {
        if (!user) return { error: new Error('No user'), data: null }

        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transaction, user_id: user.id })
            .select()
            .single()

        if (!error) {
            await fetchTransactions()
        }

        return { error: error ? new Error(error.message) : null, data }
    }

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (!error) {
            await fetchTransactions()
        }

        return { error: error ? new Error(error.message) : null }
    }

    const getMonthlyBalance = (month?: number, year?: number) => {
        const now = new Date()
        const targetMonth = month ?? now.getMonth()
        const targetYear = year ?? now.getFullYear()

        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.fecha)
            return date.getMonth() === targetMonth && date.getFullYear() === targetYear
        })

        const ingresos = monthlyTransactions
            .filter(t => t.tipo === 'ingreso')
            .reduce((sum, t) => sum + Number(t.monto), 0)

        const gastos = monthlyTransactions
            .filter(t => t.tipo === 'gasto')
            .reduce((sum, t) => sum + Number(t.monto), 0)

        return {
            ingresos,
            gastos,
            balance: ingresos - gastos,
            transactions: monthlyTransactions
        }
    }

    const getByCategory = () => {
        const categories: Record<string, { ingresos: number, gastos: number }> = {}

        for (const t of transactions) {
            if (!categories[t.categoria]) {
                categories[t.categoria] = { ingresos: 0, gastos: 0 }
            }
            if (t.tipo === 'ingreso') {
                categories[t.categoria].ingresos += Number(t.monto)
            } else {
                categories[t.categoria].gastos += Number(t.monto)
            }
        }

        return categories
    }

    const totalBalance = transactions.reduce((sum, t) => {
        return t.tipo === 'ingreso' ? sum + Number(t.monto) : sum - Number(t.monto)
    }, 0)

    return {
        transactions,
        loading,
        createTransaction,
        deleteTransaction,
        getMonthlyBalance,
        getByCategory,
        totalBalance,
        refresh: fetchTransactions
    }
}
