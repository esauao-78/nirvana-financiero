import { useState, useEffect, useRef } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { usePomodoro } from '../../hooks/usePomodoro'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Clock, Target, BarChart3 } from 'lucide-react'

type TimerMode = 'focus' | 'short_break' | 'long_break'

export function PomodoroTimer() {
    const { tasks } = useTasks()
    const { createSession, todayFocusMinutes, totalFocusMinutes, getTaskFocusTime, todaySessions } = usePomodoro()

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [mode, setMode] = useState<TimerMode>('focus')
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false)
    const [sessionsCompleted, setSessionsCompleted] = useState(0)

    const intervalRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const [tickEnabled, setTickEnabled] = useState(true)

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

    const playTickSound = () => {
        if (!tickEnabled) return
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            }
            const ctx = audioContextRef.current
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.frequency.setValueAtTime(800, ctx.currentTime)
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.05)
        } catch (e) {
            // Audio not supported
        }
    }

    useEffect(() => {
        // Create audio element for notifications
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleywLPpfWz7BuJQpAktLIpWMWCEqT0MSkYBMGTZHQw6JfEgZOj87BoVwPB1CMzb+gWg0HUorMvp5YCwdUiMu8nFYKCFaGybqaVAgIV4TIuJhSBwhZgsW2llAGCV2BwrSTTQUJYH+/s5FLBApjfLywjkkDCmZ6ua6MRwILaXi3q4lGAQxsdLWpikQBDW9ysqaIPwEOcm+wp4c9AQ91bK6lhTsBD3hqq6OEOQURP2emmYIzAA==')
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (audioContextRef.current) audioContextRef.current.close()
        }
    }, [])

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1)
                if (mode === 'focus') {
                    playTickSound()
                }
            }, 1000)
        } else if (timeLeft === 0) {
            handleTimerComplete()
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, timeLeft, tickEnabled])

    const handleTimerComplete = async () => {
        setIsRunning(false)

        // Play sound
        if (audioRef.current) {
            audioRef.current.play().catch(() => { })
        }

        // Save session
        const durationMinutes = Math.round((durations[mode] - timeLeft) / 60)
        if (durationMinutes > 0) {
            await createSession(durationMinutes, mode, selectedTaskId, true)
        }

        if (mode === 'focus') {
            setSessionsCompleted(prev => prev + 1)
            // After 4 focus sessions, suggest long break
            if ((sessionsCompleted + 1) % 4 === 0) {
                setMode('long_break')
                setTimeLeft(durations.long_break)
            } else {
                setMode('short_break')
                setTimeLeft(durations.short_break)
            }
        } else {
            setMode('focus')
            setTimeLeft(durations.focus)
        }
    }

    const toggleTimer = () => {
        if (!isRunning) {
            startTimeRef.current = Date.now()
        }
        setIsRunning(!isRunning)
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

    const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100
    const activeTasks = tasks.filter(t => t.estado !== 'completada' && t.estado !== 'cancelada')

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                    <Timer className="w-7 h-7 text-red-500" />
                    Temporizador Pomodoro
                </h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Clock className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{formatMinutes(todayFocusMinutes)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hoy</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <BarChart3 className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{todaySessions.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sesiones hoy</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Target className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{formatMinutes(totalFocusMinutes)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
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
            <div className={`bg-gradient-to-br ${modeInfo[mode].color} p-8 rounded-3xl text-white text-center mb-8 relative overflow-hidden`}>
                {/* Progress ring */}
                <div className="absolute inset-4 rounded-full border-4 border-white/20" />
                <svg className="absolute inset-4" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                    />
                </svg>

                <div className="relative z-10 py-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {modeInfo[mode].icon}
                        <span className="text-lg font-medium opacity-90">{modeInfo[mode].label}</span>
                    </div>
                    <p className="text-7xl font-bold font-mono tracking-tight">{formatTime(timeLeft)}</p>
                    <p className="text-sm opacity-75 mt-2">
                        {sessionsCompleted} sesiones completadas
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={resetTimer}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 transition-all ${isRunning
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

            {/* Selected task time */}
            {selectedTaskId && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tiempo total en esta tarea:{' '}
                        <span className="font-bold text-brand-blue">
                            {formatMinutes(getTaskFocusTime(selectedTaskId))}
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}
