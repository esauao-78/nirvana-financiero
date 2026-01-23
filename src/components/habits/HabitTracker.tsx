import { useState } from 'react'
import { useHabits } from '../../hooks/useHabits'
import { Plus, CheckSquare, Flame, Trash2, Edit2, Sun, Moon, Sunset, Clock, Heart, Activity, TrendingUp, X } from 'lucide-react'

type HoraPreferida = 'mañana' | 'tarde' | 'noche' | 'cualquiera'

export function HabitTracker() {
    const { habits, createHabit, updateHabit, toggleHabitCompletion, deleteHabit, isHabitCompletedToday, maxStreak, maxRecord, loading } = useHabits()
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

    const iconOptions = ['✓', '🏃', '📚', '💧', '🧘', '💪', '🎯', '💤', '🥗', '💊', '🧠', '🎨', '🙏', '📝', '💰', '🌅']
    const colorOptions = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

    const horasOpciones = [
        { value: 'mañana' as HoraPreferida, label: '🌅 Mañana', icon: <Sun className="w-4 h-4" /> },
        { value: 'tarde' as HoraPreferida, label: '☀️ Tarde', icon: <Sunset className="w-4 h-4" /> },
        { value: 'noche' as HoraPreferida, label: '🌙 Noche', icon: <Moon className="w-4 h-4" /> },
        { value: 'cualquiera' as HoraPreferida, label: '🕐 Cualquiera', icon: <Clock className="w-4 h-4" /> },
    ]

    const estadosAnimo = ['Paz', 'Energía', 'Claridad', 'Motivación', 'Gratitud', 'Confianza', 'Alegría', 'Calma', 'Enfoque']

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
        }

        if (editingId) {
            await updateHabit(editingId, habitData)
        } else {
            await createHabit(habitData)
        }

        resetForm()
    }

    const todayCompletedCount = habits.filter(h => isHabitCompletedToday(h.id)).length

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-7 h-7 text-green-500" />
                        Rutina Diaria
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {todayCompletedCount}/{habits.length} hábitos completados hoy
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Hábito
                </button>
            </div>

            {/* Stats cards */}
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg my-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold dark:text-white">
                                {editingId ? 'Editar Hábito' : 'Nuevo Hábito'}
                            </h3>
                            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre del hábito *</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Meditar 10 minutos"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Detalles adicionales del hábito..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-20 resize-none"
                                />
                            </div>

                            {/* Estado de ánimo que favorece */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-pink-500" />
                                    ¿Qué estado de ánimo favorece?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {estadosAnimo.map(estado => (
                                        <button
                                            key={estado}
                                            onClick={() => setEstadoAnimoFavorece(estado)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${estadoAnimoFavorece === estado
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                        >
                                            {estado}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={estadoAnimoFavorece}
                                    onChange={(e) => setEstadoAnimoFavorece(e.target.value)}
                                    placeholder="O escribe otro..."
                                    className="w-full mt-2 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-sm"
                                />
                            </div>

                            {/* Beneficio en salud */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-500" />
                                    ¿En salud qué favorece?
                                </label>
                                <input
                                    type="text"
                                    value={beneficioSalud}
                                    onChange={(e) => setBeneficioSalud(e.target.value)}
                                    placeholder="Ej: Reduce estrés, mejora sueño, fortalece corazón..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Beneficio en productividad */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    ¿En productividad qué favorece?
                                </label>
                                <input
                                    type="text"
                                    value={beneficioProductividad}
                                    onChange={(e) => setBeneficioProductividad(e.target.value)}
                                    placeholder="Ej: Mayor enfoque, más energía, mejor toma de decisiones..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Frecuencia semanal y diaria */}
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

                            {/* Hora preferida */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Hora del día preferida</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {horasOpciones.map(h => (
                                        <button
                                            key={h.value}
                                            onClick={() => setHoraPreferida(h.value)}
                                            className={`p-2 rounded-xl text-sm font-medium transition-all ${horaPreferida === h.value
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                        >
                                            {h.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
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
                                                }`}
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
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
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
                                className="flex-1 py-2 bg-green-500 text-white rounded-xl font-medium"
                            >
                                {editingId ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Habits List */}
            <div className="space-y-3">
                {habits.map(habit => {
                    const completed = isHabitCompletedToday(habit.id)
                    const horaInfo = horasOpciones.find(h => h.value === habit.hora_preferida)
                    return (
                        <div
                            key={habit.id}
                            className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg transition-all ${completed ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleHabitCompletion(habit.id)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${completed
                                        ? 'bg-green-500 text-white celebrate'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                    style={{ backgroundColor: completed ? habit.color : undefined }}
                                >
                                    {completed ? '✓' : habit.icono}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className={`font-semibold dark:text-white ${completed ? 'line-through opacity-75' : ''}`}>
                                            {habit.nombre}
                                        </h4>
                                        {horaInfo && habit.hora_preferida !== 'cualquiera' && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{horaInfo.label}</span>
                                        )}
                                    </div>
                                    {habit.descripcion && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{habit.descripcion}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {habit.racha_actual > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                                <Flame className="w-3 h-3" />
                                                {habit.racha_actual} días
                                            </span>
                                        )}
                                        {habit.estado_animo_favorece && (
                                            <span className="flex items-center gap-1 text-xs text-pink-500">
                                                <Heart className="w-3 h-3" />
                                                {habit.estado_animo_favorece}
                                            </span>
                                        )}
                                        {habit.veces_por_semana < 7 && (
                                            <span className="text-xs text-gray-400">
                                                {habit.veces_por_semana}x/sem
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

                {habits.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <CheckSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No tienes hábitos configurados</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-green-500 font-medium hover:underline"
                        >
                            Crear tu primer hábito
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
