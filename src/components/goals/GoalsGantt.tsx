import { useMemo } from 'react'
import type { Database } from '../../types/database'
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalsGanttProps {
    goals: Goal[]
}

export function GoalsGantt({ goals }: GoalsGanttProps) {
    const sortedGoals = useMemo(() => {
        return [...goals].sort((a, b) => {
            if (!a.fecha_limite) return 1
            if (!b.fecha_limite) return -1
            return new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime()
        })
    }, [goals])

    const calculateTimeProgress = (createdAt: string, deadline: string) => {
        const start = new Date(createdAt).getTime()
        const end = new Date(deadline).getTime()
        const now = new Date().getTime()

        if (now < start) return 0
        if (now > end) return 100
        if (end === start) return 100

        return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
    }

    const getStatusColor = (goal: Goal, timeProgress: number) => {
        const actualProgress = goal.progreso || 0

        if (goal.completada) return 'bg-green-500'

        // If actual is significantly behind time
        if (actualProgress < timeProgress - 20) return 'bg-red-500' // Far behind
        if (actualProgress < timeProgress - 10) return 'bg-yellow-500' // Slightly behind
        return 'bg-blue-500' // On track or ahead
    }

    return (
        <div className="space-y-6 overflow-x-auto pb-4">
            <div className="min-w-[600px]">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500 dark:text-gray-400 px-4">
                    <div className="col-span-4">Meta</div>
                    <div className="col-span-6">Progreso vs Tiempo</div>
                    <div className="col-span-2 text-right">Fecha Límite</div>
                </div>

                <div className="space-y-4">
                    {sortedGoals.map(goal => {
                        const timeProgress = goal.fecha_limite
                            ? calculateTimeProgress(goal.created_at, goal.fecha_limite)
                            : 0

                        const actualProgress = goal.progreso || 0
                        const statusColor = getStatusColor(goal, timeProgress)

                        return (
                            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Goal Info */}
                                    <div className="col-span-4 pr-4">
                                        <h4 className="font-semibold dark:text-white truncate" title={goal.titulo}>
                                            {goal.titulo}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${goal.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
                                                    goal.estado === 'completada' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {goal.estado?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gantt / Progress Bars */}
                                    <div className="col-span-6 relative">
                                        <div className="flex flex-col gap-2">
                                            {/* Actual Progress */}
                                            <div className="relative pt-1">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-600 dark:text-gray-300">Avance Real</span>
                                                    <span className="font-bold dark:text-white">{actualProgress}%</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                                                        style={{ width: `${actualProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Time Progress (Expected) */}
                                            {goal.fecha_limite && !goal.completada && (
                                                <div className="relative pt-1 opacity-75">
                                                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                                                        <span className="text-gray-500 uppercase tracking-wider">Tiempo Transcurrido</span>
                                                        <span className="text-gray-500">{timeProgress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gray-400 dark:bg-gray-500 rounded-full"
                                                            style={{ width: `${timeProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="col-span-2 text-right">
                                        {goal.fecha_limite ? (
                                            <div className={`flex flex-col items-end ${new Date(goal.fecha_limite) < new Date() && !goal.completada
                                                    ? 'text-red-500'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                <span className="text-sm font-medium">
                                                    {new Date(goal.fecha_limite).toLocaleDateString('es-MX', {
                                                        day: '2-digit',
                                                        month: 'short'
                                                    })}
                                                </span>
                                                <span className="text-xs opacity-75">
                                                    {new Date(goal.fecha_limite).getFullYear()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin fecha</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
