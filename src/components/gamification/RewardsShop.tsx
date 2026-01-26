import { useState, useEffect } from 'react'
import { ShoppingBag, Star, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGamification } from '../../contexts/GamificationContext'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

type Reward = Database['public']['Tables']['rewards']['Row']

export function RewardsShop() {
    const { user, profile } = useAuth()
    const { spendCoins } = useGamification()
    const [rewards, setRewards] = useState<Reward[]>([])
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [cost, setCost] = useState(50)
    const [icon, setIcon] = useState('🎁')

    useEffect(() => {
        if (user) {
            fetchRewards()
        }
    }, [user])

    const fetchRewards = async () => {
        const { data } = await supabase
            .from('rewards')
            .select('*')
            .order('cost', { ascending: true })

        if (data) setRewards(data)
    }

    const handleCreateReward = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !title) return

        const { error } = await supabase
            .from('rewards')
            .insert({
                user_id: user.id,
                title,
                cost,
                icon
            })

        if (!error) {
            fetchRewards()
            setShowForm(false)
            setTitle('')
            setCost(50)
            setIcon('🎁')
        }
    }

    const handleDeleteReward = async (id: string) => {
        const { error } = await supabase
            .from('rewards')
            .delete()
            .eq('id', id)

        if (!error) {
            fetchRewards()
        }
    }

    const handlePurchase = async (reward: Reward) => {
        // Logic: Try to spend coins. If success, maybe log it? 
        // For now: Just spend coins and show a success alert.
        const success = await spendCoins(reward.cost)
        if (success) {
            alert(`¡Compraste "${reward.title}"! Disfrútalo.`)
        } else {
            alert('No tienes suficientes monedas.')
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-teal-500" />
                    Tienda de Recompensas
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Usa tus monedas ganadas con esfuerzo para comprar premios reales para ti mismo.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full font-bold">
                    <Star className="w-5 h-5 fill-current" />
                    {profile?.coins || 0} Monedas Disponibles
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Card */}
                <button
                    onClick={() => setShowForm(true)}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                        <Plus className="w-8 h-8 text-gray-400 group-hover:text-teal-500" />
                    </div>
                    <span className="font-semibold text-gray-500 group-hover:text-teal-600 dark:text-gray-400">
                        Crear Nueva Recompensa
                    </span>
                </button>

                {/* Reward Cards */}
                {rewards.map(reward => (
                    <div
                        key={reward.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative group"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteReward(reward.id); }}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="text-6xl mb-4">{reward.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {reward.title}
                        </h3>
                        <div className="text-yellow-500 font-bold flex items-center gap-1 mb-6">
                            <Star className="w-4 h-4 fill-current" />
                            {reward.cost}
                        </div>

                        <button
                            onClick={() => handlePurchase(reward)}
                            disabled={(profile?.coins || 0) < reward.cost}
                            className={`
                                w-full py-2 rounded-xl font-bold transition-all
                                ${(profile?.coins || 0) >= reward.cost
                                    ? 'bg-teal-500 text-white hover:bg-teal-600 hover:shadow-lg transform hover:-translate-y-1'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {(profile?.coins || 0) >= reward.cost ? 'Comprar' : 'Insuficiente'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-slide-up">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Nueva Recompensa</h2>
                        <form onSubmit={handleCreateReward} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: Ver una película"
                                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Costo</label>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={e => setCost(Number(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Icono</label>
                                    <input
                                        value={icon}
                                        onChange={e => setIcon(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
