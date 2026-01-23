import { useState, useEffect, useRef } from 'react'
import { useBreathing } from '../../hooks/useBreathing'
import { Wind, Play, Pause, RotateCcw, Trophy, Clock, Zap } from 'lucide-react'

type Phase = 'idle' | 'breathe_in' | 'breathe_out' | 'hold' | 'recovery' | 'complete'

export function WimHofBreathing() {
    const { saveSession, totalSessions, totalRounds, bestRetention } = useBreathing()

    const [phase, setPhase] = useState<Phase>('idle')
    const [breathCount, setBreaCount] = useState(0)
    const [round, setRound] = useState(1)
    const [totalRoundsTarget, setTotalRoundsTarget] = useState(3)
    const [holdTime, setHoldTime] = useState(0)
    const [maxHoldTime, setMaxHoldTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)

    const intervalRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    const BREATHS_PER_ROUND = 30
    const BREATH_IN_DURATION = 2000 // 2 seconds
    const BREATH_OUT_DURATION = 2000 // 2 seconds
    const RECOVERY_BREATH_DURATION = 15000 // 15 seconds

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (audioContextRef.current) audioContextRef.current.close()
        }
    }, [])

    // Session timer
    useEffect(() => {
        if (isRunning && phase !== 'idle' && phase !== 'complete') {
            const timer = setInterval(() => {
                setSessionTime(prev => prev + 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isRunning, phase])

    // Hold timer
    useEffect(() => {
        if (phase === 'hold' && isRunning) {
            const timer = setInterval(() => {
                setHoldTime(prev => {
                    const newTime = prev + 1
                    if (newTime > maxHoldTime) setMaxHoldTime(newTime)
                    return newTime
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [phase, isRunning, maxHoldTime])

    const playBreathSound = (type: 'in' | 'out') => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            }
            const ctx = audioContextRef.current
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            if (type === 'in') {
                oscillator.frequency.setValueAtTime(200, ctx.currentTime)
                oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.5)
                gainNode.gain.setValueAtTime(0, ctx.currentTime)
                gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5)
                gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
            } else {
                oscillator.frequency.setValueAtTime(400, ctx.currentTime)
                oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5)
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
                gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
            }

            oscillator.start()
            oscillator.stop(ctx.currentTime + 2)
        } catch (e) {
            console.error('Audio error:', e)
        }
    }

    const startSession = () => {
        setIsRunning(true)
        setPhase('breathe_in')
        setBreaCount(1)
        setRound(1)
        setHoldTime(0)
        setMaxHoldTime(0)
        setSessionTime(0)
        playBreathSound('in')
        runBreathingCycle()
    }

    const runBreathingCycle = () => {
        let currentBreath = 1
        let currentPhase: 'in' | 'out' = 'in'

        const cycle = () => {
            if (!isRunning) return

            if (currentPhase === 'in') {
                playBreathSound('in')
                setPhase('breathe_in')
                setTimeout(() => {
                    currentPhase = 'out'
                    cycle()
                }, BREATH_IN_DURATION)
            } else {
                playBreathSound('out')
                setPhase('breathe_out')
                setTimeout(() => {
                    currentBreath++
                    setBreaCount(currentBreath)

                    if (currentBreath > BREATHS_PER_ROUND) {
                        // Start hold phase
                        setPhase('hold')
                        setHoldTime(0)
                    } else {
                        currentPhase = 'in'
                        cycle()
                    }
                }, BREATH_OUT_DURATION)
            }
        }

        cycle()
    }

    const endHold = () => {
        // Recovery breath
        setPhase('recovery')
        playBreathSound('in')

        setTimeout(() => {
            if (round < totalRoundsTarget) {
                // Next round
                setRound(prev => prev + 1)
                setBreaCount(1)
                setHoldTime(0)
                setPhase('breathe_in')
                playBreathSound('in')
                runBreathingCycle()
            } else {
                // Complete session
                setPhase('complete')
                setIsRunning(false)
                saveSession(totalRoundsTarget, sessionTime, maxHoldTime)
            }
        }, RECOVERY_BREATH_DURATION)
    }

    const resetSession = () => {
        setIsRunning(false)
        setPhase('idle')
        setBreaCount(0)
        setRound(1)
        setHoldTime(0)
        setMaxHoldTime(0)
        setSessionTime(0)
        if (intervalRef.current) clearInterval(intervalRef.current)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getPhaseInfo = () => {
        switch (phase) {
            case 'breathe_in':
                return { text: 'INHALA', color: 'from-blue-500 to-cyan-500', scale: 1.3 }
            case 'breathe_out':
                return { text: 'EXHALA', color: 'from-purple-500 to-pink-500', scale: 0.8 }
            case 'hold':
                return { text: 'RETÉN', color: 'from-orange-500 to-red-500', scale: 1 }
            case 'recovery':
                return { text: 'RECUPERACIÓN', color: 'from-green-500 to-emerald-500', scale: 1.2 }
            case 'complete':
                return { text: '¡COMPLETADO!', color: 'from-gold-400 to-gold-600', scale: 1.1 }
            default:
                return { text: 'LISTO', color: 'from-gray-400 to-gray-500', scale: 1 }
        }
    }

    const phaseInfo = getPhaseInfo()

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                    <Wind className="w-7 h-7 text-cyan-500" />
                    Respiración Wim Hof
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Técnica de respiración para energía y enfoque
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{totalSessions}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sesiones</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Wind className="w-6 h-6 mx-auto text-cyan-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{totalRounds}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rondas totales</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                    <Trophy className="w-6 h-6 mx-auto text-gold-500 mb-2" />
                    <p className="text-2xl font-bold dark:text-white">{formatTime(bestRetention)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Récord retención</p>
                </div>
            </div>

            {/* Round selector (only when idle) */}
            {phase === 'idle' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-center">
                        Número de rondas
                    </label>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setTotalRoundsTarget(n)}
                                className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${totalRoundsTarget === n
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Circle */}
            <div className={`relative bg-gradient-to-br ${phaseInfo.color} rounded-full mx-auto mb-8 flex items-center justify-center transition-all duration-1000`}
                style={{
                    width: `${250 * phaseInfo.scale}px`,
                    height: `${250 * phaseInfo.scale}px`,
                }}
            >
                <div className="text-center text-white">
                    <p className="text-2xl font-bold mb-1">{phaseInfo.text}</p>
                    {phase === 'breathe_in' || phase === 'breathe_out' ? (
                        <p className="text-5xl font-bold">{breathCount}/{BREATHS_PER_ROUND}</p>
                    ) : phase === 'hold' ? (
                        <p className="text-5xl font-bold font-mono">{formatTime(holdTime)}</p>
                    ) : phase === 'recovery' ? (
                        <p className="text-lg">Inhala profundo y retén 15s</p>
                    ) : phase === 'complete' ? (
                        <p className="text-lg">¡Excelente sesión!</p>
                    ) : null}
                    {phase !== 'idle' && phase !== 'complete' && (
                        <p className="text-sm opacity-75 mt-2">Ronda {round}/{totalRoundsTarget}</p>
                    )}
                </div>
            </div>

            {/* Session Info */}
            {phase !== 'idle' && (
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Tiempo: {formatTime(sessionTime)}</span>
                        {maxHoldTime > 0 && (
                            <>
                                <span className="mx-2">•</span>
                                <span>Mejor retención: {formatTime(maxHoldTime)}</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={resetSession}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>

                {phase === 'idle' && (
                    <button
                        onClick={startSession}
                        className="px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg transition-all"
                    >
                        <Play className="w-6 h-6" />
                        Iniciar Sesión
                    </button>
                )}

                {phase === 'hold' && (
                    <button
                        onClick={endHold}
                        className="px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all"
                    >
                        <Wind className="w-6 h-6" />
                        Respiración de Recuperación
                    </button>
                )}

                {phase === 'complete' && (
                    <button
                        onClick={resetSession}
                        className="px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 hover:shadow-lg transition-all"
                    >
                        <Play className="w-6 h-6" />
                        Nueva Sesión
                    </button>
                )}
            </div>

            {/* Instructions */}
            {phase === 'idle' && (
                <div className="mt-8 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                    <h3 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">Instrucciones:</h3>
                    <ol className="text-sm text-cyan-600 dark:text-cyan-300 space-y-1 list-decimal list-inside">
                        <li>Respira profundamente 30 veces siguiendo el ritmo</li>
                        <li>Después de la última exhalación, retén la respiración el mayor tiempo posible</li>
                        <li>Cuando necesites respirar, inhala profundo y retén 15 segundos</li>
                        <li>Repite según el número de rondas seleccionado</li>
                    </ol>
                </div>
            )}
        </div>
    )
}
