import { useState, DragEvent } from 'react'
import { useGoals } from '../../hooks/useGoals'
import { DateInput } from '../ui/DateInput'
import { Plus, Target, Trash2, Edit2, Check, Calendar, List, LayoutGrid, DollarSign, TrendingUp, Pause, Play, ChevronUp, ChevronDown } from 'lucide-react'
import { GoalsGantt } from './GoalsGantt'

type ViewMode = 'list' | 'kanban' | 'gantt'
type EstadoMeta = 'no_iniciada' | 'en_progreso' | 'completada' | 'en_pausa'

export function GoalsList() {
    const { goals, createGoal, updateGoal, deleteGoal, reorderGoals, loading } = useGoals()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('kanban')
    const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null)

    // Form state
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [pilar, setPilar] = useState<string>('economica')
    const [fechaLimite, setFechaLimite] = useState('')
    const [indicadorExito, setIndicadorExito] = useState('')
    const [valorObjetivo, setValorObjetivo] = useState('')
    const [valorActual, setValorActual] = useState('')
    const [progresoManual, setProgresoManual] = useState('')
    const [estado, setEstado] = useState<EstadoMeta>('no_iniciada')

    const pilares = [
        { value: 'economica', label: '💰 Económica' },
        { value: 'emocional', label: '💖 Emocional' },
        { value: 'fisica', label: '💪 Física' },
        { value: 'relacional', label: '👥 Relacional' },
        { value: 'entorno', label: '🏠 Entorno' },
        { value: 'salud', label: '🩺 Disciplina/Caracter' },
        { value: 'desarrollo_personal', label: '📚 Desarrollo Personal' },
    ]

    const estados: { value: EstadoMeta; label: string; color: string; icon: React.ReactNode }[] = [
        { value: 'no_iniciada', label: 'No Iniciada', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', icon: null },
        { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: <Play className="w-3 h-3" /> },
        { value: 'completada', label: 'Completada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: <Check className="w-3 h-3" /> },
        { value: 'en_pausa', label: 'En Pausa', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: <Pause className="w-3 h-3" /> },
    ]

    const resetForm = () => {
        setTitulo('')
        setDescripcion('')
        setPilar('economica')
        setFechaLimite('')
        setIndicadorExito('')
        setValorObjetivo('')
        setValorObjetivo('')
        setValorActual('')
        setProgresoManual('')
        setEstado('no_iniciada')
        setShowForm(false)
        setEditingId(null)
    }

    const handleSubmit = async () => {
        if (!titulo.trim()) return

        const goalData = {
            titulo,
            descripcion,
            pilar: pilar as any,
            fecha_limite: fechaLimite || null,
            indicador_exito: indicadorExito || null,
            valor_objetivo: parseFloat(valorObjetivo) || 0,
            valor_actual: parseFloat(valorActual) || 0,
            estado,
            progreso: progresoManual
                ? parseInt(progresoManual)
                : (estado === 'completada' ? 100 : Math.round((parseFloat(valorActual) / parseFloat(valorObjetivo)) * 100) || 0)
        }

        if (editingId) {
            await updateGoal(editingId, goalData)
        } else {
            await createGoal(goalData)
        }

        resetForm()
    }

    const startEdit = (goal: typeof goals[0]) => {
        setTitulo(goal.titulo)
        setDescripcion(goal.descripcion || '')
        setPilar(goal.pilar || 'economica')
        setFechaLimite(goal.fecha_limite || '')
        setIndicadorExito(goal.indicador_exito || '')
        setValorObjetivo(goal.valor_objetivo?.toString() || '')
        setValorActual(goal.valor_actual?.toString() || '')
        setProgresoManual(goal.progreso?.toString() || '')
        setEstado(goal.estado || 'no_iniciada')
        setEditingId(goal.id)
        setShowForm(true)
    }

    const changeEstado = async (goalId: string, newEstado: EstadoMeta) => {
        await updateGoal(goalId, {
            estado: newEstado,
            completada: newEstado === 'completada',
            progreso: newEstado === 'completada' ? 100 : undefined
        })
    }

    // Drag and Drop handlers
    const handleDragStart = (e: DragEvent<HTMLDivElement>, goalId: string) => {
        setDraggedGoalId(goalId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: DragEvent<HTMLDivElement>, newEstado: EstadoMeta) => {
        e.preventDefault()
        if (draggedGoalId) {
            await changeEstado(draggedGoalId, newEstado)
            setDraggedGoalId(null)
        }
    }

    const handleDragEnd = () => {
        setDraggedGoalId(null)
    }

    const pilarColors: Record<string, string> = {
        economica: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        emocional: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        fisica: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        relacional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        entorno: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        salud: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        desarrollo_personal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(amount)
    }

    // Group goals by estado for Kanban view
    const goalsByEstado: Record<EstadoMeta, typeof goals> = {
        no_iniciada: goals.filter(g => g.estado === 'no_iniciada' || (!g.estado && !g.completada)),
        en_progreso: goals.filter(g => g.estado === 'en_progreso'),
        en_pausa: goals.filter(g => g.estado === 'en_pausa'),
        completada: goals.filter(g => g.estado === 'completada' || g.completada),
    }

    // Move goal up or down within its column
    const moveGoal = async (goalId: string, direction: 'up' | 'down') => {
        const goal = goals.find(g => g.id === goalId)
        if (!goal) return

        const estado = goal.estado || 'no_iniciada'
        const goalsInColumn = [...goalsByEstado[estado as EstadoMeta]].sort((a, b) => (a.orden || 0) - (b.orden || 0))
        const currentIndex = goalsInColumn.findIndex(g => g.id === goalId)

        if (direction === 'up' && currentIndex > 0) {
            // Swap with previous: give current the previous index, give previous the current index
            const prevGoal = goalsInColumn[currentIndex - 1]
            await reorderGoals([
                { id: goalId, orden: currentIndex - 1 },
                { id: prevGoal.id, orden: currentIndex }
            ])
        } else if (direction === 'down' && currentIndex < goalsInColumn.length - 1) {
            // Swap with next: give current the next index, give next the current index  
            const nextGoal = goalsInColumn[currentIndex + 1]
            await reorderGoals([
                { id: goalId, orden: currentIndex + 1 },
                { id: nextGoal.id, orden: currentIndex }
            ])
        }
    }

    const GoalCard = ({ goal, compact = false }: { goal: typeof goals[0]; compact?: boolean }) => {
        const progress = goal.valor_objetivo > 0
            ? Math.min(100, Math.round((goal.valor_actual / goal.valor_objetivo) * 100))
            : goal.progreso

        return (
            <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition-all ${compact ? 'p-3' : 'p-4'
                    } ${draggedGoalId === goal.id ? 'opacity-50 scale-95' : 'hover:shadow-xl'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, goal.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {goal.pilar && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${pilarColors[goal.pilar]}`}>
                                    {pilares.find(p => p.value === goal.pilar)?.label.split(' ')[0]}
                                </span>
                            )}
                            {goal.fecha_limite && (
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(goal.fecha_limite).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
                                </span>
                            )}
                        </div>

                        <h4 className={`font-semibold dark:text-white ${compact ? 'text-sm' : ''} truncate`}>{goal.titulo}</h4>

                        {goal.indicador_exito && !compact && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {goal.indicador_exito}
                            </p>
                        )}

                        {goal.valor_objetivo > 0 && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {formatMoney(goal.valor_actual)}
                                    </span>
                                    <span className="text-gold-500 font-medium">{formatMoney(goal.valor_objetivo)}</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-blue to-gold-500 rounded-full progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Action buttons - always visible */}
                        <div className="flex items-center gap-1 mt-3">
                            <button
                                onClick={() => moveGoal(goal.id, 'up')}
                                className="p-1 text-gray-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded transition-colors"
                                title="Mover arriba"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => moveGoal(goal.id, 'down')}
                                className="p-1 text-gray-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded transition-colors"
                                title="Mover abajo"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                            <button
                                onClick={() => startEdit(goal)}
                                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar meta"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar meta"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Target className="w-7 h-7 text-gold-500" />
                        Mis Metas
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {goals.length} metas en total {viewMode === 'kanban' && '• Arrastra las tarjetas para cambiar el estado'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            title="Vista Kanban"
                        >
                            <LayoutGrid className={`w-4 h-4 ${viewMode === 'kanban' ? 'text-brand-blue' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            title="Vista Lista"
                        >
                            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-brand-blue' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'gantt' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                            title="Vista Gantt"
                        >
                            <TrendingUp className={`w-4 h-4 ${viewMode === 'gantt' ? 'text-brand-blue' : 'text-gray-500'}`} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Meta
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg my-8 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">
                            {editingId ? 'Editar Meta' : 'Nueva Meta'}
                        </h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título *</label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="¿Qué quieres lograr?"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Detalles de tu meta..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Pilar</label>
                                    <select
                                        value={pilar}
                                        onChange={(e) => setPilar(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    >
                                        {pilares.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado</label>
                                    <select
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value as EstadoMeta)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    >
                                        {estados.map(e => (
                                            <option key={e.value} value={e.value}>{e.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Indicador de Éxito</label>
                                <input
                                    type="text"
                                    value={indicadorExito}
                                    onChange={(e) => setIndicadorExito(e.target.value)}
                                    placeholder="¿Cómo sabrás que lo lograste?"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Valor Objetivo ($)</label>
                                    <input
                                        type="number"
                                        value={valorObjetivo}
                                        onChange={(e) => setValorObjetivo(e.target.value)}
                                        placeholder="0"
                                        step="1"
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Valor Actual ($)</label>
                                    <input
                                        type="number"
                                        value={valorActual}
                                        onChange={(e) => setValorActual(e.target.value)}
                                        placeholder="0"
                                        step="1"
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Límite</label>
                                <DateInput
                                    value={fechaLimite}
                                    onChange={setFechaLimite}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Progreso Manual (%) <span className="text-gray-400 font-normal">Opcional</span></label>
                                <input
                                    type="number"
                                    value={progresoManual}
                                    onChange={(e) => setProgresoManual(e.target.value)}
                                    placeholder="0-100"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Si dejas esto vacío, se calculará automáticamente basado en el valor objetivo.
                                </p>
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
                                className="flex-1 py-2 bg-brand-blue text-white rounded-xl font-medium"
                            >
                                {editingId ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KANBAN VIEW with Drag & Drop */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {estados.map(estadoCol => (
                        <div
                            key={estadoCol.value}
                            className={`flex flex-col min-w-[250px] ${draggedGoalId ? 'bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, estadoCol.value)}
                        >
                            <div className={`p-3 rounded-xl mb-3 ${estadoCol.color}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-semibold">
                                        {estadoCol.icon}
                                        {estadoCol.label}
                                    </div>
                                    <span className="text-sm opacity-75">
                                        {goalsByEstado[estadoCol.value].length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                                {goalsByEstado[estadoCol.value].map(goal => (
                                    <GoalCard key={goal.id} goal={goal} compact />
                                ))}
                                {goalsByEstado[estadoCol.value].length === 0 && (
                                    <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-sm text-gray-400">
                                        {draggedGoalId ? 'Suelta aquí' : 'Sin metas'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}

                    {goals.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Target className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No tienes metas</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-brand-blue font-medium hover:underline"
                            >
                                Crear tu primera meta
                            </button>
                        </div>
                    )}
                </div>
            )}
            {/* GANTT VIEW */}
            {viewMode === 'gantt' && (
                <GoalsGantt goals={goals} />
            )}
        </div>
    )
}
