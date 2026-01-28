import { useState, useEffect } from 'react'
import { useGoals } from '../../hooks/useGoals'
import { useHabits } from '../../hooks/useHabits'
import { useTasks } from '../../hooks/useTasks'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { CharacterStats } from '../gamification/CharacterStats'
import {
    BarChart3, Target, Zap, Flame, AlertTriangle, CheckSquare, Clock,
    Heart, Sparkles, Brain, Sun, Shield, TrendingUp, Smile, Star,
    Activity, Compass, Eye, BookOpen, Dumbbell, Coffee, Edit2, Check, X, Sliders
} from 'lucide-react'

const ESTADOS_ECUALIZADOR = [
    { id: 'gratitud', label: 'Gratitud', icon: Heart },
    { id: 'sabiduria', label: 'Sabiduría', icon: BookOpen },
    { id: 'plenitud', label: 'Plenitud', icon: Sparkles },
    { id: 'energia', label: 'Energía', icon: Zap },
    { id: 'coraje', label: 'Coraje', icon: Shield },
    { id: 'crecimiento', label: 'Crecimiento', icon: TrendingUp },
    { id: 'salud', label: 'Salud', icon: Activity },
    { id: 'pasion', label: 'Pasión', icon: Flame },
    { id: 'experiencias', label: 'Experiencias', icon: Compass },
    { id: 'disciplina', label: 'Disciplina', icon: Target },
    { id: 'enfoque', label: 'Enfoque', icon: Eye },
    { id: 'sin_miedo', label: 'Perder el Miedo', icon: Sun },
]

const RUTINA_MILLONARIA = [
    { id: 'agradecer', label: 'Agradecer', icon: Heart },
    { id: 'meditar', label: 'Meditar', icon: Brain },
    { id: 'automotivarte', label: 'Automotivarte', icon: Zap },
    { id: 'risas', label: 'Risas', icon: Smile },
    { id: 'entrenar', label: 'Entrenar', icon: Dumbbell },
    { id: 'lectura', label: 'Lectura', icon: BookOpen },
]

const PILARES_CONFIG = [
    { id: 'economica', name: '💰 Económica', color: 'bg-emerald-500', emoji: '💰' },
    { id: 'emocional', name: '💖 Emocional', color: 'bg-pink-500', emoji: '💖' },
    { id: 'fisica', name: '💪 Física', color: 'bg-orange-500', emoji: '💪' },
    { id: 'relacional', name: '👥 Relacional', color: 'bg-blue-500', emoji: '👥' },
    { id: 'entorno', name: '🏠 Entorno', color: 'bg-purple-500', emoji: '🏠' },
    { id: 'salud', name: '🩺 Salud', color: 'bg-teal-500', emoji: '🩺' },
    { id: 'desarrollo_personal', name: '📚 Desarrollo Personal', color: 'bg-indigo-500', emoji: '📚' },
]

interface DashboardProps {
    onEmergency: () => void
}

export function Dashboard({ onEmergency }: DashboardProps) {
    const { user, profile, updateProfile, retryLoadProfile } = useAuth()
    const { goals, activeGoals, completedGoals } = useGoals()
    const { habits, todayCompleted, overallStreak } = useHabits()
    const { pendingTasks, inProgressTasks } = useTasks()

    const [ecualizadorEstados, setEcualizadorEstados] = useState<Record<string, boolean>>({})
    const [rutinaMilionaria, setRutinaMilionaria] = useState<Record<string, boolean>>({})
    const [editingIdentity, setEditingIdentity] = useState(false)
    const [editingPilares, setEditingPilares] = useState(false)
    const [nombre, setNombre] = useState('')
    const [palabraDelAno, setPalabraDelAno] = useState('')
    const [pilares, setPilares] = useState<Record<string, number>>({
        economica: 50,
        emocional: 50,
        fisica: 50,
        relacional: 50,
        entorno: 50,
        salud: 50,
        desarrollo_personal: 50,
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (profile) {
            // Load ecualizador as boolean (checkbox style)
            const ecStates = profile.ecualizador_estados || {}
            const boolStates: Record<string, boolean> = {}
            for (const key in ecStates) {
                boolStates[key] = (ecStates as any)[key] > 5 || (ecStates as any)[key] === true
            }
            setEcualizadorEstados(boolStates)
            setRutinaMilionaria(profile.rutina_millonaria || {})
            setNombre(profile.nombre || '')
            setPalabraDelAno(profile.palabra_del_año || '')

            // Load pilares from profile or calculate from goals
            if (profile.pilares_prosperidad) {
                setPilares(prev => ({
                    ...prev,
                    ...(profile.pilares_prosperidad as Record<string, number>)
                }))
            }
        }
    }, [profile])

    // Calculate pillar progress from goals
    const calculatePilaresFromGoals = () => {
        const pilarProgress: Record<string, { total: number; completed: number }> = {
            economica: { total: 0, completed: 0 },
            emocional: { total: 0, completed: 0 },
            fisica: { total: 0, completed: 0 },
            relacional: { total: 0, completed: 0 },
            entorno: { total: 0, completed: 0 },
            salud: { total: 0, completed: 0 },
            desarrollo_personal: { total: 0, completed: 0 },
        }

        goals.forEach(goal => {
            const pilar = goal.pilar
            if (pilar && pilarProgress[pilar]) {
                pilarProgress[pilar].total++
                if (goal.completada || goal.estado === 'completada') {
                    pilarProgress[pilar].completed++
                } else if (goal.valor_objetivo > 0) {
                    // Add partial progress
                    pilarProgress[pilar].completed += goal.valor_actual / goal.valor_objetivo
                } else if (goal.progreso) {
                    pilarProgress[pilar].completed += goal.progreso / 100
                }
            }
        })

        const calculatedPilares: Record<string, number> = {}
        for (const pilar in pilarProgress) {
            const { total, completed } = pilarProgress[pilar]
            calculatedPilares[pilar] = total > 0 ? Math.round((completed / total) * 100) : pilares[pilar] || 50
        }
        return calculatedPilares
    }

    const pillaresData = editingPilares ? pilares : calculatePilaresFromGoals()

    const saveEcualizador = async (newEstados: Record<string, boolean>) => {
        if (!user) return
        await supabase
            .from('profiles')
            .update({ ecualizador_estados: newEstados } as any)
            .eq('id', user.id)
    }

    const saveRutina = async (newRutina: Record<string, boolean>) => {
        if (!user) return
        await supabase
            .from('profiles')
            .update({ rutina_millonaria: newRutina } as any)
            .eq('id', user.id)
    }

    const savePilares = async (newPilares: Record<string, number>) => {
        if (!user) return
        await supabase
            .from('profiles')
            .update({ pilares_prosperidad: newPilares } as any)
            .eq('id', user.id)
    }

    const toggleEstado = (id: string) => {
        const newEstados = { ...ecualizadorEstados, [id]: !ecualizadorEstados[id] }
        setEcualizadorEstados(newEstados)
        saveEcualizador(newEstados)
    }

    const toggleRutinaItem = (id: string) => {
        const newRutina = { ...rutinaMilionaria, [id]: !rutinaMilionaria[id] }
        setRutinaMilionaria(newRutina)
        saveRutina(newRutina)
    }

    const handlePilarChange = (pilarId: string, value: number) => {
        const newPilares = { ...pilares, [pilarId]: value }
        setPilares(newPilares)
    }

    const handleSavePilares = async () => {
        setSaving(true)
        await savePilares(pilares)
        setEditingPilares(false)
        setSaving(false)
    }

    const handleSaveIdentity = async () => {
        setSaving(true)
        await updateProfile({
            nombre,
            palabra_del_año: palabraDelAno
        })
        await retryLoadProfile()
        setEditingIdentity(false)
        setSaving(false)
    }

    const completedEstados = Object.values(ecualizadorEstados).filter(Boolean).length
    const completedRutinaCount = Object.values(rutinaMilionaria).filter(Boolean).length

    const pillarDisplayData = PILARES_CONFIG.map(p => ({
        ...p,
        value: pillaresData[p.id] || 0
    }))

    const lowestPillar = pillarDisplayData.reduce((min, p) => p.value < min.value ? p : min, pillarDisplayData[0])

    return (
        <div className="p-6">
            {/* Header with Identity */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    {editingIdentity ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white font-bold text-xl"
                            />
                            <input
                                type="text"
                                value={palabraDelAno}
                                onChange={(e) => setPalabraDelAno(e.target.value)}
                                placeholder="Palabra del año"
                                className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-gold-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveIdentity}
                                    disabled={saving}
                                    className="p-2 bg-green-500 text-white rounded-lg"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditingIdentity(false)}
                                    className="p-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div>
                                <h1 className="text-2xl font-bold dark:text-white">
                                    ¡Hola, {profile?.nombre || 'Guerrero'}! 👋
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tu palabra del año: <span className="font-semibold text-gold-500">{profile?.palabra_del_año || 'Prosperidad'}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingIdentity(true)}
                                className="p-2 text-gray-400 hover:text-brand-blue rounded-lg"
                                title="Editar identidad"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={onEmergency}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Modo Emergencia
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-gold-500 mb-2">
                        <Target className="w-5 h-5" />
                        <span className="font-medium">Metas Activas</span>
                    </div>
                    <p className="text-3xl font-bold dark:text-white">{activeGoals.length}</p>
                    <p className="text-sm text-gray-500">{completedGoals.length} completadas</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <CheckSquare className="w-5 h-5" />
                        <span className="font-medium">Hábitos Hoy</span>
                    </div>
                    <p className="text-3xl font-bold dark:text-white">{todayCompleted}/{habits.length}</p>
                    <p className="text-sm text-gray-500">Racha: {overallStreak} días</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Tareas</span>
                    </div>
                    <p className="text-3xl font-bold dark:text-white">{inProgressTasks.length}</p>
                    <p className="text-sm text-gray-500">{pendingTasks.length} pendientes</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                        <Flame className="w-5 h-5" />
                        <span className="font-medium">Área Crítica</span>
                    </div>
                    <p className="text-xl font-bold dark:text-white">{lowestPillar.name.split(' ')[1]}</p>
                    <p className="text-sm text-gray-500">{lowestPillar.value}% de prosperidad</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Character Stats */}
                <CharacterStats />

                {/* Ecualizador de Estados - Now as checkboxes */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-gold-500" />
                            Ecualizador de Estados
                        </h3>
                        <span className="text-sm font-medium text-gold-500">
                            {completedEstados}/{ESTADOS_ECUALIZADOR.length}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Selecciona los estados que tienes activos hoy
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ESTADOS_ECUALIZADOR.map(estado => {
                            const IconComponent = estado.icon
                            const isActive = ecualizadorEstados[estado.id]
                            return (
                                <button
                                    key={estado.id}
                                    onClick={() => toggleEstado(estado.id)}
                                    className={`p-3 rounded-xl text-center transition-all ${isActive
                                        ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <IconComponent className={`w-5 h-5 mx-auto mb-1 ${isActive ? 'text-white' : ''}`} />
                                    <span className="text-xs font-medium">{estado.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Rutina Millonaria */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-gold-500" />
                        Rutina Millonaria
                    </h3>
                    <span className="text-sm font-medium text-gold-500">
                        {completedRutinaCount}/{RUTINA_MILLONARIA.length}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Hábitos diarios que construyen riqueza
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {RUTINA_MILLONARIA.map(item => {
                        const IconComponent = item.icon
                        const isCompleted = rutinaMilionaria[item.id]
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleRutinaItem(item.id)}
                                className={`p-4 rounded-xl text-center transition-all ${isCompleted
                                    ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <IconComponent className={`w-6 h-6 mx-auto mb-2 ${isCompleted ? 'text-white' : ''}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Prosperity Pillars - Now Editable */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Pilares de Prosperidad
                    </h3>
                    {editingPilares ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSavePilares}
                                disabled={saving}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setEditingPilares(false)}
                                className="p-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditingPilares(true)}
                            className="p-2 text-gray-400 hover:text-purple-500 rounded-lg"
                            title="Editar pilares manualmente"
                        >
                            <Sliders className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {!editingPilares && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Calculado automáticamente desde tus metas • Haz clic en ⚙ para ajustar manualmente
                    </p>
                )}

                <div className="space-y-4">
                    {pillarDisplayData.map(pillar => (
                        <div key={pillar.id}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium dark:text-gray-300">{pillar.name}</span>
                                <span className="text-sm font-bold dark:text-white">{pillar.value}%</span>
                            </div>
                            {editingPilares ? (
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={pilares[pillar.id] || 0}
                                    onChange={(e) => handlePilarChange(pillar.id, parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                                />
                            ) : (
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${pillar.color} rounded-full transition-all duration-500`}
                                        style={{ width: `${pillar.value}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Goals by Pillar Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Metas por Pilar</h4>
                    <div className="grid grid-cols-5 gap-2">
                        {PILARES_CONFIG.map(p => {
                            const pilarGoals = goals.filter(g => g.pilar === p.id)
                            const completed = pilarGoals.filter(g => g.completada || g.estado === 'completada').length
                            return (
                                <div key={p.id} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-lg">{p.emoji}</span>
                                    <p className="text-xs font-medium dark:text-white">{completed}/{pilarGoals.length}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
