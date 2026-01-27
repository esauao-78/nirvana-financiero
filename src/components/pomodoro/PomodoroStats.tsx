import { useState, useMemo } from 'react'
import { usePomodoro } from '../../hooks/usePomodoro'
import { useTasks } from '../../hooks/useTasks'
import { BarChart3, Calendar, Clock, Trophy } from 'lucide-react'

type TimeRange = 'today' | 'all_time'

export function PomodoroStats() {
    const { sessions } = usePomodoro()
    const { tasks } = useTasks()
    const [range, setRange] = useState<TimeRange>('today')

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]

        // Filter sessions based on range
        const filteredSessions = sessions.filter(session => {
            if (!session.completada || session.tipo !== 'focus') return false
            if (range === 'today') {
                return session.created_at.startsWith(today)
            }
            return true
        })

        // Aggregate by task
        const taskStats = new Map<string, { duration: number; count: number }>()
        let totalDuration = 0
        let totalSessions = 0

        filteredSessions.forEach(session => {
            totalDuration += session.duracion
            totalSessions += 1

            if (session.task_id) {
                const current = taskStats.get(session.task_id) || { duration: 0, count: 0 }
                taskStats.set(session.task_id, {
                    duration: current.duration + session.duracion,
                    count: current.count + 1
                })
            }
        })

        // Process tasks for display
        const taskList = Array.from(taskStats.entries())
            .map(([taskId, stat]) => {
                const task = tasks.find(t => t.id === taskId)
                return {
                    id: taskId,
                    name: task?.nombre || 'Tarea eliminada',
                    duration: stat.duration,
                    sessions: stat.count
                }
            })
            .sort((a, b) => b.duration - a.duration)

        return {
            totalDuration,
            totalSessions,
            taskList
        }
    }, [sessions, tasks, range])

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) return `${hours}h ${mins}m`
        return `${mins}m`
    }

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-blue" />
                    Estadísticas
                </h3>

                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                        onClick={() => setRange('today')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === 'today'
                                ? 'bg-white dark:bg-gray-600 text-brand-blue shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setRange('all_time')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === 'all_time'
                                ? 'bg-white dark:bg-gray-600 text-brand-blue shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        Total
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Tiempo Enfoque</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {formatMinutes(stats.totalDuration)}
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-medium">Sesiones</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {stats.totalSessions}
                    </p>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Desglose por Tarea
                </h4>

                {stats.taskList.length > 0 ? (
                    <div className="space-y-3">
                        {stats.taskList.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.sessions} sesiones
                                    </p>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        {formatMinutes(item.duration)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No hay actividad registrada en este periodo</p>
                    </div>
                )}
            </div>
        </div>
    )
}
