import { useState, useEffect } from 'react'
import { useFinances } from '../../hooks/useFinances'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, PiggyBank, Tag } from 'lucide-react'

const CATEGORIAS_INGRESO_DEFAULT = ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros ingresos']
const CATEGORIAS_GASTO_DEFAULT = ['Vivienda', 'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Servicios', 'Ahorro', 'Otros gastos']

export function FinancesDashboard() {
    const { user } = useAuth()
    const { transactions, createTransaction, deleteTransaction, getMonthlyBalance, loading, refresh } = useFinances()
    const [showForm, setShowForm] = useState(false)
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [showSavingsForm, setShowSavingsForm] = useState(false)

    const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso')
    const [categoria, setCategoria] = useState('')
    const [monto, setMonto] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

    const [nuevaCategoria, setNuevaCategoria] = useState('')
    const [tipoCategoriaCustom, setTipoCategoriaCustom] = useState<'ingreso' | 'gasto'>('gasto')

    const [customCategories, setCustomCategories] = useState<{ id: string, nombre: string, tipo: string }[]>([])
    const [savings, setSavings] = useState<{ id: string, mes: string, monto: number, meta_ahorro: number }[]>([])

    const [savingMonto, setSavingMonto] = useState('')
    const [savingMeta, setSavingMeta] = useState('')
    const [savingMes, setSavingMes] = useState(new Date().toISOString().slice(0, 7) + '-01')

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const monthlyData = getMonthlyBalance()

    useEffect(() => {
        fetchCustomCategories()
        fetchSavings()
    }, [user])

    const fetchCustomCategories = async () => {
        if (!user) return
        const { data } = await supabase
            .from('custom_categories')
            .select('*')
            .eq('user_id', user.id)
        if (data) setCustomCategories(data)
    }

    const fetchSavings = async () => {
        if (!user) return
        const { data } = await supabase
            .from('savings')
            .select('*')
            .eq('user_id', user.id)
            .order('mes', { ascending: false })
        if (data) setSavings(data)
    }

    const allCategorias = tipo === 'ingreso'
        ? [...CATEGORIAS_INGRESO_DEFAULT, ...customCategories.filter(c => c.tipo === 'ingreso').map(c => c.nombre)]
        : [...CATEGORIAS_GASTO_DEFAULT, ...customCategories.filter(c => c.tipo === 'gasto').map(c => c.nombre)]

    const handleSubmit = async () => {
        if (!monto || !categoria) {
            setError('Monto y categoría son requeridos')
            return
        }

        setSaving(true)
        setError('')

        const result = await createTransaction({
            tipo,
            categoria,
            monto: parseFloat(monto),
            descripcion,
            fecha
        })

        if (result.error) {
            setError(result.error.message)
        } else {
            setMonto('')
            setDescripcion('')
            setCategoria('')
            setShowForm(false)
            await refresh()
        }
        setSaving(false)
    }

    const handleAddCategory = async () => {
        if (!nuevaCategoria.trim() || !user) return

        const { error } = await supabase
            .from('custom_categories')
            .insert({
                user_id: user.id,
                nombre: nuevaCategoria.trim(),
                tipo: tipoCategoriaCustom
            })

        if (!error) {
            setNuevaCategoria('')
            setShowCategoryForm(false)
            await fetchCustomCategories()
        }
    }

    const handleAddSaving = async () => {
        if (!savingMonto || !user) return

        const { error } = await supabase
            .from('savings')
            .upsert({
                user_id: user.id,
                mes: savingMes,
                monto: parseFloat(savingMonto),
                meta_ahorro: parseFloat(savingMeta) || 0
            }, { onConflict: 'user_id,mes' })

        if (!error) {
            setSavingMonto('')
            setSavingMeta('')
            setShowSavingsForm(false)
            await fetchSavings()
        }
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }

    const totalSavings = savings.reduce((acc, s) => acc + Number(s.monto), 0)
    const currentMonthSaving = savings.find(s => s.mes.startsWith(new Date().toISOString().slice(0, 7)))

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <DollarSign className="w-7 h-7 text-emerald-500" />
                        Control Financiero
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona tus ingresos, gastos y ahorro
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSavingsForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <PiggyBank className="w-5 h-5" />
                        Ahorro
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Ingresos del Mes</span>
                    </div>
                    <p className="text-2xl font-bold">{formatMoney(monthlyData.ingresos)}</p>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-medium">Gastos del Mes</span>
                    </div>
                    <p className="text-2xl font-bold">{formatMoney(monthlyData.gastos)}</p>
                </div>

                <div className={`p-5 rounded-2xl text-white ${monthlyData.balance >= 0
                        ? 'bg-gradient-to-r from-brand-blue to-indigo-600'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Balance del Mes</span>
                    </div>
                    <p className="text-2xl font-bold">{formatMoney(monthlyData.balance)}</p>
                </div>

                <div className="bg-gradient-to-r from-gold-400 to-gold-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="w-5 h-5" />
                        <span className="font-medium">Ahorro Total</span>
                    </div>
                    <p className="text-2xl font-bold">{formatMoney(totalSavings)}</p>
                    {currentMonthSaving && currentMonthSaving.meta_ahorro > 0 && (
                        <p className="text-xs mt-1 opacity-80">
                            Meta: {formatMoney(currentMonthSaving.meta_ahorro)} ({Math.round((Number(currentMonthSaving.monto) / currentMonthSaving.meta_ahorro) * 100)}%)
                        </p>
                    )}
                </div>
            </div>

            {/* Transaction Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-slide-up">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Nueva Transacción</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => { setTipo('ingreso'); setCategoria('') }}
                                className={`flex-1 py-2 rounded-xl font-medium transition-all ${tipo === 'ingreso'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                💰 Ingreso
                            </button>
                            <button
                                onClick={() => { setTipo('gasto'); setCategoria('') }}
                                className={`flex-1 py-2 rounded-xl font-medium transition-all ${tipo === 'gasto'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                💸 Gasto
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto *</label>
                                <input
                                    type="number"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-xl font-bold"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-medium dark:text-gray-300">Categoría *</label>
                                    <button
                                        onClick={() => setShowCategoryForm(true)}
                                        className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                                    >
                                        <Tag className="w-3 h-3" /> Nueva categoría
                                    </button>
                                </div>
                                <select
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Selecciona...</option>
                                    {allCategorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Opcional..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowForm(false); setError('') }}
                                className="flex-1 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className={`flex-1 py-2 text-white rounded-xl font-medium disabled:opacity-50 ${tipo === 'ingreso' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                {saving ? 'Guardando...' : 'Registrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Form Modal */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Nueva Categoría</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                <input
                                    type="text"
                                    value={nuevaCategoria}
                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                    placeholder="Nombre de la categoría"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo</label>
                                <select
                                    value={tipoCategoriaCustom}
                                    onChange={(e) => setTipoCategoriaCustom(e.target.value as 'ingreso' | 'gasto')}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="ingreso">Ingreso</option>
                                    <option value="gasto">Gasto</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCategoryForm(false)}
                                className="flex-1 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="flex-1 py-2 bg-brand-blue text-white rounded-xl font-medium"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Form Modal */}
            {showSavingsForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
                        <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                            <PiggyBank className="w-5 h-5 text-gold-500" />
                            Registrar Ahorro Mensual
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mes</label>
                                <input
                                    type="month"
                                    value={savingMes.slice(0, 7)}
                                    onChange={(e) => setSavingMes(e.target.value + '-01')}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Monto Ahorrado</label>
                                <input
                                    type="number"
                                    value={savingMonto}
                                    onChange={(e) => setSavingMonto(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meta de Ahorro (opcional)</label>
                                <input
                                    type="number"
                                    value={savingMeta}
                                    onChange={(e) => setSavingMeta(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSavingsForm(false)}
                                className="flex-1 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddSaving}
                                className="flex-1 py-2 bg-gold-500 text-white rounded-xl font-medium"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold dark:text-white">Transacciones Recientes</h3>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {transactions.slice(0, 15).map(tx => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.tipo === 'ingreso'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                    {tx.tipo === 'ingreso' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium dark:text-white">{tx.categoria}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {tx.descripcion || formatDate(tx.fecha)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold ${tx.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.tipo === 'ingreso' ? '+' : '-'}{formatMoney(Number(tx.monto))}
                                </span>
                                <button
                                    onClick={() => deleteTransaction(tx.id)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {transactions.length === 0 && !loading && (
                        <div className="p-8 text-center">
                            <DollarSign className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No hay transacciones</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
