import { useState } from 'react'
import { useHabits } from '../../hooks/useHabits'
import { Plus, CheckSquare, Flame, Trash2, Edit2, Sun, Moon, Sunset, Clock, Heart, Activity, TrendingUp, X, Shield, Skull, Zap, ArrowRight, Check, XCircle, CheckCircle } from 'lucide-react'

type HoraPreferida = 'mañana' | 'tarde' | 'noche' | 'cualquiera'
type HabitType = 'good' | 'bad'
type Attribute = 'fuerza' | 'sabiduria' | 'carisma' | 'disciplina' | 'salud'

export function HabitTracker() {
    const { habits, createHabit, updateHabit, toggleHabitCompletion, deleteHabit, isHabitCompletedToday, logHabitReflection, maxStreak, maxRecord, loading } = useHabits()
    const [activeTab, setActiveTab] = useState<HabitType>('good')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [icono, setIcono] = useState('✓')
    const [color, setColor] = useState('#10B981')
    const [estadoAnimoFavorece, setEstadoAnimoFavorece] = useState('')
    const [beneficioSalud, setBeneficioSalud] = useState('')
    const [beneficioProductividad, setBeneficioProductividad] = useState('')
    const [vecesPorSemana, setVecesPorSemana] = useState(7)
    const [horaPreferida, setHoraPreferida] = useState<HoraPreferida>('cualquiera')
    const [vecesPorDia, setVecesPorDia] = useState(1)

    // New fields
    const [habitType, setHabitType] = useState<HabitType>('good')
    const [attribute, setAttribute] = useState<Attribute | null>(null)

    // Micro-Habits Fields
    const [microStep, setMicroStep] = useState('')
    const [anchor, setAnchor] = useState('')
    const [identityAffirmation, setIdentityAffirmation] = useState('')

    // Nightly Review State
    const [showNightlyReview, setShowNightlyReview] = useState(false)
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
    const [reviewFriction, setReviewFriction] = useState('')
    const [reviewStep, setReviewStep] = useState<'question' | 'friction'>('question') // 'question' (Did you do it?) or 'friction' (Why not?)

    const iconOptions = ['✓', '🏃', '📚', '💧', '🧘', '💪', '🎯', '💤', '🥗', '💊', '🧠', '🎨', '🙏', '📝', '💰', '🌅', '🚫', '🚬', '🎮', '📱', '🍬', '🍺']
    const colorOptions = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#64748B', '#111827']

    const horasOpciones = [
        { value: 'mañana' as HoraPreferida, label: '🌅 Mañana', icon: <Sun className="w-4 h-4" /> },
        { value: 'tarde' as HoraPreferida, label: '☀️ Tarde', icon: <Sunset className="w-4 h-4" /> },
        { value: 'noche' as HoraPreferida, label: '🌙 Noche', icon: <Moon className="w-4 h-4" /> },
        { value: 'cualquiera' as HoraPreferida, label: '🕐 Cualquiera', icon: <Clock className="w-4 h-4" /> },
    ]

    const estadosAnimo = ['Paz', 'Energía', 'Claridad', 'Motivación', 'Gratitud', 'Confianza', 'Alegría', 'Calma', 'Enfoque']

    const attributesList: { id: Attribute; label: string; icon: any; color: string }[] = [
        { id: 'fuerza', label: 'Fuerza', icon: Activity, color: 'text-red-500' },
        { id: 'sabiduria', label: 'Sabiduría', icon: Zap, color: 'text-blue-500' }, // Using Zap as placeholder/example
        { id: 'salud', label: 'Salud', icon: Heart, color: 'text-green-500' },
        { id: 'disciplina', label: 'Disciplina', icon: Shield, color: 'text-gray-500' },
        { id: 'carisma', label: 'Carisma', icon: Sun, color: 'text-yellow-500' },
    ]

    const resetForm = () => {
        setNombre('')
        setDescripcion('')
        setIcono('✓')
        setColor('#10B981')
        setEstadoAnimoFavorece('')
        setBeneficioSalud('')
        setBeneficioProductividad('')
        setVecesPorSemana(7)
        setHoraPreferida('cualquiera')
        setVecesPorDia(1)
        setHabitType(activeTab) // Default to current tab
        setAttribute(null)
        setMicroStep('')
        setAnchor('')
        setIdentityAffirmation('')
        setShowForm(false)
        setEditingId(null)
    }

    const startEdit = (habit: typeof habits[0]) => {
        setNombre(habit.nombre)
        setDescripcion(habit.descripcion || '')
        setIcono(habit.icono)
        setColor(habit.color)
        setEstadoAnimoFavorece(habit.estado_animo_favorece || '')
        setBeneficioSalud(habit.beneficio_salud || '')
        setBeneficioProductividad(habit.beneficio_productividad || '')
        setVecesPorSemana(habit.veces_por_semana || 7)
        setHoraPreferida(habit.hora_preferida || 'cualquiera')
        setVecesPorDia(habit.veces_por_dia || 1)
        setHabitType(habit.type || 'good')
        setAttribute(habit.attribute as Attribute || null)
        setMicroStep(habit.micro_step || '')
        setAnchor(habit.anchor || '')
        setIdentityAffirmation(habit.identity_affirmation || '')
        setEditingId(habit.id)
        setShowForm(true)
    }

    const handleSubmit = async () => {
        if (!nombre.trim()) return

        const habitData = {
            nombre,
            descripcion: descripcion || null,
            icono,
            color,
            estado_animo_favorece: estadoAnimoFavorece || null,
            beneficio_salud: beneficioSalud || null,
            beneficio_productividad: beneficioProductividad || null,
            veces_por_semana: vecesPorSemana,
            hora_preferida: horaPreferida,
            veces_por_dia: vecesPorDia,
            type: habitType,
            attribute: attribute,
            micro_step: microStep || null,
            anchor: anchor || null,
            identity_affirmation: identityAffirmation || null
        }

        if (editingId) {
            await updateHabit(editingId, habitData)
        } else {
            await createHabit(habitData)
        }

        resetForm()
    }

    const filteredHabits = habits.filter(h => (h.type || 'good') === activeTab)
    const todayCompletedCount = habits.filter(h => isHabitCompletedToday(h.id) && (h.type || 'good') === 'good').length // Only count good habits for "Completed today" metric? Or separate?
    // Let's count "Successes" (Good done + Bad avoided)
    const todaySuccessCount = habits.filter(h => isHabitCompletedToday(h.id)).length

    // Nightly Review Logic
    const uncompletedHabits = habits.filter(h => !isHabitCompletedToday(h.id) && (h.type || 'good') === 'good')
    const currentReviewHabit = uncompletedHabits[currentReviewIndex]

    const handleStartReview = () => {
        if (uncompletedHabits.length === 0) return
        setCurrentReviewIndex(0)
        setReviewFriction('')
        setReviewStep('question')
        setShowNightlyReview(true)
    }

    const handleReviewAction = async (completed: boolean) => {
        if (completed) {
            // User did it! Mark complete and move on.
            await logHabitReflection(currentReviewHabit.id, "Nightly Review: Done", true)
            nextReviewStep()
        } else {
            // User didn't do it. Ask why.
            setReviewStep('friction')
        }
    }

    const handleSubmitFriction = async () => {
        await logHabitReflection(currentReviewHabit.id, reviewFriction || "No reason provided", false)
        nextReviewStep()
    }

    const nextReviewStep = () => {
        setReviewFriction('')
        setReviewStep('question')
        if (currentReviewIndex < uncompletedHabits.length - 1) {
            setCurrentReviewIndex(prev => prev + 1)
        } else {
            setShowNightlyReview(false) // Done!
        }
    }


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        {activeTab === 'good' ? (
                            <CheckSquare className="w-7 h-7 text-green-500" />
                        ) : (
                            <Shield className="w-7 h-7 text-red-500" />
                        )}
                        {activeTab === 'good' ? 'Rutina Diaria (Hábitos)' : 'Modo Sombra (Anti-Hábitos)'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {todaySuccessCount} victorias hoy
                    </p>
                </div>
                <button
                    onClick={handleStartReview}
                    disabled={uncompletedHabits.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-gray-200"
                >
                    <Moon className="w-5 h-5" />
                    Revisión Nocturna
                    {uncompletedHabits.length > 0 && (
                        <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-xs">
                            {uncompletedHabits.length}
                        </span>
                    )}
                </button>
            </div >
            <div className="flex gap-2">
                <button
                    onClick={handleStartReview}
                    disabled={uncompletedHabits.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-gray-200"
                >
                    <Moon className="w-5 h-5" />
                    Revisión Nocturna
                    {uncompletedHabits.length > 0 && (
                        <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-xs">
                            {uncompletedHabits.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => {
                        setHabitType(activeTab)
                        setShowForm(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold hover:shadow-lg transition-all bg-blue-500"
                >
                    <Plus className="w-5 h-5" />
                    {activeTab === 'good' ? 'Nuevo Hábito' : 'Nuevo Anti-Hábito'}
                </button>
            </div>


            {/* Tabs */}
            < div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit" >
                <button
                    onClick={() => setActiveTab('good')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'good'
                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        } `}
                >
                    Buenos Hábitos
                </button>
                <button
                    onClick={() => setActiveTab('bad')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bad'
                        ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        } `}
                >
                    Anti-Hábitos
                </button>
            </div >

            {/* Stats cards (Only show for good habits mostly? Or maybe separate stats?) */}
            {
                activeTab === 'good' && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-5 h-5" />
                                <span className="font-medium">Racha Actual</span>
                            </div>
                            <p className="text-3xl font-bold">{maxStreak} días</p>
                        </div>
                        <div className="bg-gradient-to-r from-gold-400 to-gold-500 p-4 rounded-2xl text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">🏆</span>
                                <span className="font-medium">Récord Personal</span>
                            </div>
                            <p className="text-3xl font-bold">{maxRecord} días</p>
                        </div>
                    </div>
                )
            }

            {/* Form Modal */}
            {
                showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg my-8 animate-slide-up">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold dark:text-white">
                                    {editingId ? 'Editar' : 'Nuevo'} {habitType === 'good' ? 'Hábito' : 'Anti-Hábito'}
                                </h3>
                                <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Type Selector in Form */}
                            <div className="flex gap-4 mb-4 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 flex-1">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={habitType === 'good'}
                                        onChange={() => setHabitType('good')}
                                        className="text-green-500 focus:ring-green-500"
                                    />
                                    <span className="dark:text-white font-medium">Hábito Positivo</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 flex-1">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={habitType === 'bad'}
                                        onChange={() => setHabitType('bad')}
                                        className="text-red-500 focus:ring-red-500"
                                    />
                                    <span className="dark:text-white font-medium">Anti-Hábito</span>
                                </label>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre *</label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder={habitType === 'good' ? "Ej: Meditar 10 minutos" : "Ej: No ver TikTok antes de dormir"}
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Attribute Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Atributo Principal</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {attributesList.map(attr => (
                                            <button
                                                key={attr.id}
                                                onClick={() => setAttribute(attr.id)}
                                                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all ${attribute === attr.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'
                                                    } `}
                                            >
                                                <attr.icon className={`w-4 h-4 ${attr.color} `} />
                                                {attr.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Micro-Habits Section (Only for Good Habits) */}
                            {habitType === 'good' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-4 border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Diseño de Micro-Hábito
                                    </h4>

                                    {/* Micro Step */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            Micro-Paso (&lt; 2 min)
                                        </label>
                                        <input
                                            type="text"
                                            value={microStep}
                                            onChange={(e) => setMicroStep(e.target.value)}
                                            placeholder="Ej: Ponerse las zapatillas"
                                            className="w-full px-4 py-2 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
                                        />
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            La acción más pequeña e irreductible para empezar.
                                        </p>
                                    </div>

                                    {/* Anchor */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            Ancla (Hábito existente)
                                        </label>
                                        <input
                                            type="text"
                                            value={anchor}
                                            onChange={(e) => setAnchor(e.target.value)}
                                            placeholder="Ej: Después de cepillarme los dientes"
                                            className="w-full px-4 py-2 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
                                        />
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            "Después de [ANCLA], haré [MICRO-PASO]".
                                        </p>
                                    </div>

                                    {/* Identity Affirmation */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            Afirmación de Identidad
                                        </label>
                                        <input
                                            type="text"
                                            value={identityAffirmation}
                                            onChange={(e) => setIdentityAffirmation(e.target.value)}
                                            placeholder="Ej: Soy una persona atlética"
                                            className="w-full px-4 py-2 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
                                        />
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            ¿Quién es el tipo de persona que hace esto?
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Detalles adicionales..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-20 resize-none"
                                />
                            </div>

                            {/* Icono */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Icono</label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setIcono(icon)}
                                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${icono === icon
                                                ? 'bg-brand-blue text-white scale-110'
                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                } `}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                                } `}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Frecuencia (Simplified for now, keeps existing logic) */}
                            {habitType === 'good' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Veces por semana</label>
                                        <select
                                            value={vecesPorSemana}
                                            onChange={(e) => setVecesPorSemana(parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                <option key={n} value={n}>{n} {n === 1 ? 'vez' : 'veces'}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Veces por día</label>
                                        <select
                                            value={vecesPorDia}
                                            onChange={(e) => setVecesPorDia(parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                        >
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <option key={n} value={n}>{n} {n === 1 ? 'vez' : 'veces'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={resetForm}
                                className="flex-1 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`flex-1 py-2 text-white rounded-xl font-medium ${habitType === 'good' ? 'bg-green-500' : 'bg-red-500'
                                    } `}
                            >
                                {editingId ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Nightly Review Modal */}
            {
                showNightlyReview && currentReviewHabit && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-lg animate-slide-up relative overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">
                                        Hábito {currentReviewIndex + 1} de {uncompletedHabits.length}
                                    </span>
                                    <button onClick={() => setShowNightlyReview(false)} className="text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold dark:text-white mb-2">
                                    {currentReviewHabit.nombre}
                                </h3>

                                {currentReviewHabit.micro_step && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50 mb-4">
                                        <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                                            🎯 Micro-Paso: {currentReviewHabit.micro_step}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {reviewStep === 'question' ? (
                                <div className="space-y-4">
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        ¿Completaste al menos el micro-paso hoy?
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleReviewAction(false)}
                                            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                                        >
                                            <X className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-red-500" />
                                            <span className="block font-medium dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">No, hubo fricción</span>
                                        </button>
                                        <button
                                            onClick={() => handleReviewAction(true)}
                                            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                                        >
                                            <Check className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-green-500" />
                                            <span className="block font-medium dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">¡Sí, hecho!</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                                            ¿Qué te detuvo hoy? (Detecta la fricción)
                                        </label>
                                        <textarea
                                            value={reviewFriction}
                                            onChange={(e) => setReviewFriction(e.target.value)}
                                            placeholder="Ej: Estaba muy cansado, no tenía el equipo listo, se me olvidó..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white h-32 resize-none focus:border-indigo-500 focus:ring-0"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmitFriction}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        Guardar y Continuar
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 flex justify-center">
                                <div className="flex gap-1">
                                    {uncompletedHabits.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentReviewIndex
                                                ? 'bg-indigo-500 w-4'
                                                : idx < currentReviewIndex ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-gray-200 dark:bg-gray-700'
                                                } `}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Habits List */}
            <div className="space-y-3">
                {filteredHabits.map(habit => {
                    const completed = isHabitCompletedToday(habit.id)
                    const horaInfo = horasOpciones.find(h => h.value === habit.hora_preferida)
                    const isGood = (habit.type || 'good') === 'good'

                    return (
                        <div
                            key={habit.id}
                            className={`
p-4 rounded-2xl shadow-lg transition-all border
                                ${isGood
                                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                    : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                }
                                ${completed ? (isGood ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-500 bg-red-100 dark:bg-red-900/40') : ''}
`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleHabitCompletion(habit.id)}
                                    className={`
w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all
                                        ${completed
                                            ? (isGood ? 'bg-green-500 text-white celebrate' : 'bg-red-500 text-white celebrate')
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }
`}
                                    style={{ backgroundColor: completed ? (isGood ? habit.color : '#EF4444') : undefined }}
                                >
                                    {completed ? (isGood ? '✓' : '🛡️') : habit.icono}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className={`font-semibold dark:text-white ${completed ? 'line-through opacity-75' : ''} `}>
                                            {habit.nombre}
                                        </h4>
                                        {habit.attribute && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                                                {habit.attribute}
                                            </span>
                                        )}
                                    </div>
                                    {habit.descripcion && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{habit.descripcion}</p>
                                    )}

                                    {/* Micro-Habit Details Display */}
                                    {isGood && (habit.micro_step || habit.anchor || habit.identity_affirmation) && (
                                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs space-y-1 border border-blue-100 dark:border-blue-800">
                                            {habit.micro_step && (
                                                <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                                    <span className="font-bold">Micro-Paso:</span> {habit.micro_step}
                                                </div>
                                            )}
                                            {habit.anchor && (
                                                <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                                    <span className="font-bold">Ancla:</span> {habit.anchor}
                                                </div>
                                            )}
                                            {habit.identity_affirmation && (
                                                <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300 italic">
                                                    "{habit.identity_affirmation}"
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {habit.racha_actual > 0 && (
                                            <span className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-orange-500' : 'text-red-500'} `}>
                                                <Flame className="w-3 h-3" />
                                                {habit.racha_actual} días {isGood ? 'seguidos' : 'limpio'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => startEdit(habit)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteHabit(habit.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {filteredHabits.length === 0 && !loading && (
                    <div className="text-center py-12">
                        {activeTab === 'good' ? (
                            <CheckSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        ) : (
                            <Skull className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        )}
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === 'good' ? 'No tienes hábitos configurados' : 'No tienes anti-hábitos configurados'}
                        </p>
                        <button
                            onClick={() => {
                                setHabitType(activeTab)
                                setShowForm(true)
                            }}
                            className={`mt-4 font-medium hover:underline ${activeTab === 'good' ? 'text-green-500' : 'text-red-500'} `}
                        >
                            {activeTab === 'good' ? 'Crear tu primer hábito' : 'Identificar un enemigo'}
                        </button>
                    </div>
                )}
            </div>
        </div >


    )
}
