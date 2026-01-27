import { useState, useEffect, useRef } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { usePomodoro } from '../../hooks/usePomodoro'
import { PomodoroStats } from './PomodoroStats'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'

type TimerMode = 'focus' | 'short_break' | 'long_break'

const STORAGE_KEY = 'pomodoro_state'

interface PomodoroState {
    mode: TimerMode
    endTime: number | null
    timeLeft: number
    isRunning: boolean
    taskId: string | null
    sessionsCompleted: number
    lastUpdated: number
}

export function PomodoroTimer() {
    const { tasks } = useTasks()
    const { createSession } = usePomodoro()

    const durations: Record<TimerMode, number> = {
        focus: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60,
    }

    const modeInfo: Record<TimerMode, { label: string; color: string; icon: React.ReactNode }> = {
        focus: { label: 'Enfoque', color: 'from-red-500 to-orange-500', icon: <Brain className="w-6 h-6" /> },
        short_break: { label: 'Descanso', color: 'from-green-500 to-emerald-500', icon: <Coffee className="w-6 h-6" /> },
        long_break: { label: 'Descanso Largo', color: 'from-blue-500 to-indigo-500', icon: <Coffee className="w-6 h-6" /> },
    }

    // Lazy initialization logic
    const getInitialState = (): Partial<PomodoroState> => {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (!savedState) return {}

        try {
            const parsed: PomodoroState = JSON.parse(savedState)
            // Calculate remaining time if it was running
            if (parsed.isRunning && parsed.endTime) {
                const now = Date.now()
                const remaining = Math.ceil((parsed.endTime - now) / 1000)
                return {
                    ...parsed,
                    timeLeft: remaining > 0 ? remaining : 0,
                    // If time passed, we might want to auto-complete or pause? 
                    // For now, let the effect handle completion if timeLeft becomes 0
                }
            }
            return parsed
        } catch (e) {
            console.error('Error parsing pomodoro state:', e)
            return {}
        }
    }

    const initialState = getInitialState()

    // State with lazy initialization
    const [mode, setMode] = useState<TimerMode>(initialState.mode || 'focus')
    const [timeLeft, setTimeLeft] = useState(initialState.timeLeft !== undefined ? initialState.timeLeft : durations.focus)
    const [isRunning, setIsRunning] = useState(initialState.isRunning || false)
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialState.taskId || null)
    const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted || 0)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleywLPpfWz7BuJQpAktLIpWMWCEqT0MSkYBMGTZHQw6JfEgZOj87BoVwPB1CMzb+gWg0HUorMvp5YCwdUiMu8nFYKCFaGybqaVAgIV4TIuJhSBwhZgsW2llAGCV2BwrSTTQUJYH+/s5FLBApjfLywjkkDCmZ6ua6MRwILaXi3q4lGAQxsdLWpikQBDW9ysqaIPwEOcm+wp4c9AQ91bK6lhTsBD3hqq6OEOQURP2emmYIzAA==')
    }, [])

    // Persist state whenever it changes
    useEffect(() => {
        const state: PomodoroState = {
            mode,
            endTime: isRunning ? Date.now() + timeLeft * 1000 : null,
            timeLeft,
            isRunning,
            taskId: selectedTaskId,
            sessionsCompleted,
            lastUpdated: Date.now()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, [mode, timeLeft, isRunning, selectedTaskId, sessionsCompleted])

    // Timer Loop
    useEffect(() => {
        if (!isRunning) return

        let animationFrameId: number
        const endTime = Date.now() + timeLeft * 1000

        const tick = () => {
            const now = Date.now()
            const remaining = Math.ceil((endTime - now) / 1000)

            if (remaining <= 0) {
                setTimeLeft(0)
                setIsRunning(false)
                handleTimerComplete(mode, selectedTaskId)
            } else {
                setTimeLeft(remaining)
                animationFrameId = requestAnimationFrame(tick)
            }
        }

        animationFrameId = requestAnimationFrame(tick)

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
        }
    }, [isRunning, mode]) // Intentionally not including timeLeft

    const handleTimerComplete = async (currentMode: TimerMode, taskId: string | null) => {
        setIsRunning(false)
        if (audioRef.current) audioRef.current.play().catch(() => { })

        // Save session if it was a focus session
        if (currentMode === 'focus') {
            const durationMinutes = Math.round(durations.focus / 60)
            await createSession(durationMinutes, 'focus', taskId, true)

            setSessionsCompleted(prev => {
                const newValue = prev + 1
                // Determine next mode logic inside the update to ensure fresh state
                if ((newValue) % 4 === 0) {
                    setMode('long_break')
                    setTimeLeft(durations.long_break)
                } else {
                    setMode('short_break')
                    setTimeLeft(durations.short_break)
                }
                return newValue
            })
        } else {
            // Break is over, back to focus
            setMode('focus')
            setTimeLeft(durations.focus)
        }
    }

    const toggleTimer = () => {
        setIsRunning(prev => !prev)
    }

    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(durations[mode])
    }

    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false)
        setMode(newMode)
        setTimeLeft(durations[newMode])
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const activeTasks = tasks.filter(t => t.estado !== 'completada' && t.estado !== 'cancelada')
    const progress = Math.max(0, Math.min(100, ((durations[mode] - timeLeft) / durations[mode]) * 100))

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                    <Timer className="w-7 h-7 text-red-500" />
                    Temporizador Pomodoro
                </h2>
            </div>

            {/* Task Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Tarea actual (opcional)</label>
                <select
                    value={selectedTaskId || ''}
                    onChange={(e) => setSelectedTaskId(e.target.value || null)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Sin tarea específica</option>
                    {activeTasks.map(task => (
                        <option key={task.id} value={task.id}>
                            📋 {task.nombre} {task.tiempo_dedicado > 0 ? `(${formatMinutes(task.tiempo_dedicado)})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-8 justify-center">
                {(['focus', 'short_break', 'long_break'] as TimerMode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === m
                            ? `bg-gradient-to-r ${modeInfo[m].color} text-white`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        {modeInfo[m].label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className={`bg-gradient-to-br ${modeInfo[mode].color} p-8 rounded-3xl text-white text-center mb-8 relative overflow-hidden shadow-xl`}>
                {/* Background Progress Circle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Timer className="w-64 h-64" />
                </div>

                {/* Progress ring using SVG for precise control */}
                <svg className="absolute inset-4 sm:inset-8 w-[calc(100%-2rem)] h-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] sm:h-[calc(100%-4rem)] pointer-events-none" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-300 ease-linear"
                    />
                </svg>

                <div className="relative z-10 py-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {modeInfo[mode].icon}
                        <span className="text-lg font-medium opacity-90">{modeInfo[mode].label}</span>
                    </div>
                    <p className="text-7xl sm:text-8xl font-bold font-mono tracking-tight my-4">
                        {formatTime(timeLeft)}
                    </p>
                    <p className="text-sm opacity-75 mt-2 bg-black/10 inline-block px-3 py-1 rounded-full">
                        {sessionsCompleted} sesiones hoy
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={resetTimer}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${isRunning
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Pause className="w-6 h-6" />
                            Pausar
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6" />
                            Iniciar
                        </>
                    )}
                </button>
            </div>

            <hr className="my-8 border-gray-200 dark:border-gray-700" />

            {/* Dashboard Integration */}
            <PomodoroStats />
        </div>
    )
}
