import { useProsperity } from '../../hooks/useProsperity'
import { useGoals } from '../../hooks/useGoals'
import { useHabits } from '../../hooks/useHabits'
import { useDiary } from '../../hooks/useDiary'
import { useFinances } from '../../hooks/useFinances'
import { TrendingUp, Target, CheckSquare, Heart, DollarSign } from 'lucide-react'

export function StatsDashboard() {
    const { pillars } = useProsperity()
    const { goals, completedGoals, activeGoals } = useGoals()
    const { habits, maxStreak, maxRecord } = useHabits()
    const { entries, averageEmotionalState, getEmotionalTrend } = useDiary()
    const { getMonthlyBalance, totalBalance } = useFinances()

    const emotionalTrend = getEmotionalTrend(7)
    const monthlyBalance = getMonthlyBalance()

    const pilarLabels: Record<string, string> = {
        economica: 'Económica',
        emocional: 'Emocional',
        fisica: 'Salud Física',
        relacional: 'Relaciones',
        entorno: 'Entorno',
        salud: 'Salud',
        desarrollo_personal: 'Desarrollo Personal'
    }

    const completionRate = goals.length > 0
        ? Math.round((completedGoals.length / goals.length) * 100)
        : 0

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2 mb-6">
                <TrendingUp className="w-7 h-7 text-orange-500" />
                Estadísticas y Análisis
            </h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Target className="w-8 h-8 mx-auto text-gold-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{completionRate}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Metas completadas</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <CheckSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{maxRecord}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Récord de racha</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Heart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{averageEmotionalState.toFixed(1)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Promedio emocional</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <DollarSign className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className={`text-2xl font-bold ${monthlyBalance.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {monthlyBalance.balance >= 0 ? '+' : ''}{Math.round(monthlyBalance.balance)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Balance mensual</p>
                </div>
            </div>

            {/* Prosperity Radar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">📊 Prosperidad por Pilar</h3>
                <div className="space-y-4">
                    {pillars.map(pillar => {
                        const percentage = (pillar.valor_actual / 10) * 100
                        const gap = pillar.valor_deseado - pillar.valor_actual

                        return (
                            <div key={pillar.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">
                                        {pilarLabels[pillar.pilar]}
                                    </span>
                                    <div className="text-sm">
                                        <span className="text-brand-blue font-semibold">{pillar.valor_actual}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        <span className="text-gold-500 font-semibold">{pillar.valor_deseado}</span>
                                        <span className={`ml-2 text-xs ${gap > 3 ? 'text-red-500' : 'text-green-500'}`}>
                                            (Gap: {gap})
                                        </span>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div
                                        className="absolute top-0 h-full w-0.5 bg-gold-500"
                                        style={{ left: `${(pillar.valor_deseado / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Emotional Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">💖 Tendencia Emocional (7 días)</h3>
                {emotionalTrend.length > 0 ? (
                    <div className="flex items-end justify-between gap-2 h-40">
                        {emotionalTrend.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg transition-all"
                                    style={{ height: `${((day.estado || 5) / 10) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500 mt-2">
                                    {new Date(day.fecha).toLocaleDateString('es', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-8">No hay datos suficientes</p>
                )}
            </div>

            {/* Goals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        🎯 Resumen de Metas
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Total de metas</span>
                            <span className="font-bold dark:text-white">{goals.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Activas</span>
                            <span className="font-bold text-brand-blue">{activeGoals.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Completadas</span>
                            <span className="font-bold text-green-500">{completedGoals.length}</span>
                        </div>
                        <div className="pt-3 border-t dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Tasa de éxito</span>
                                <span className="font-bold text-gold-500">{completionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        ✅ Resumen de Hábitos
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Hábitos activos</span>
                            <span className="font-bold dark:text-white">{habits.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Racha actual máxima</span>
                            <span className="font-bold text-orange-500">{maxStreak} días 🔥</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Récord histórico</span>
                            <span className="font-bold text-gold-500">{maxRecord} días 🏆</span>
                        </div>
                        <div className="pt-3 border-t dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Check-ins totales</span>
                                <span className="font-bold text-pink-500">{entries.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
