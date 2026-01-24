import { useState, DragEvent } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useGoals } from '../../hooks/useGoals'
import { DateInput } from '../ui/DateInput'
import { Plus, ListTodo, Trash2, Edit2, Check, Calendar, Clock, Bell, Target, List, LayoutGrid, Sun, Moon, Sunset, ChevronUp, ChevronDown } from 'lucide-react'

type ViewMode = 'list' | 'kanban'
type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'

export function TasksList() {
    const { tasks, createTask, updateTask, deleteTask, reorderTasks, loading } = useTasks()
    const { goals } = useGoals()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('kanban')
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

    // Form state
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [horaPreferida, setHoraPreferida] = useState<'mañana' | 'tarde' | 'noche' | 'cualquiera'>('cualquiera')
    const [fechaLimite, setFechaLimite] = useState('')
    const [plazoTiempo, setPlazoTiempo] = useState('')
    const [recordatorio, setRecordatorio] = useState(false)
    const [recordatorioMinutos, setRecordatorioMinutos] = useState('30')
    const [goalId, setGoalId] = useState('')
    const [estado, setEstado] = useState<EstadoTarea>('pendiente')

    const horasOpciones = [
        { value: 'mañana', label: '🌅 Mañana', icon: <Sun className="w-4 h-4" /> },
        { value: 'tarde', label: '☀️ Tarde', icon: <Sunset className="w-4 h-4" /> },
        { value: 'noche', label: '🌙 Noche', icon: <Moon className="w-4 h-4" /> },
        { value: 'cualquiera', label: '🕐 Cualquiera', icon: <Clock className="w-4 h-4" /> },
    ]

    const estados: { value: EstadoTarea; label: string; color: string }[] = [
        { value: 'pendiente', label: 'Pendiente', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
        { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
        { value: 'completada', label: 'Completada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
        { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
    ]

    const resetForm = () => {
        setNombre('')
        setDescripcion('')
        setHoraPreferida('cualquiera')
        setFechaLimite('')
        setPlazoTiempo('')
        setRecordatorio(false)
        setRecordatorioMinutos('30')
        setGoalId('')
        setEstado('pendiente')
        setShowForm(false)
        setEditingId(null)
    }

    const handleSubmit = async () => {
        if (!nombre.trim()) return

        const taskData = {
            nombre,
            descripcion: descripcion || null,
            hora_preferida: horaPreferida,
            fecha_limite: fechaLimite || null,
            plazo_tiempo: parseInt(plazoTiempo) || null,
            recordatorio,
            recordatorio_minutos: parseInt(recordatorioMinutos) || 30,
            goal_id: goalId || null,
            estado,
        }

        if (editingId) {
            await updateTask(editingId, taskData)
        } else {
            await createTask(taskData)
        }

        resetForm()
    }

    const startEdit = (task: typeof tasks[0]) => {
        setNombre(task.nombre)
        setDescripcion(task.descripcion || '')
        setHoraPreferida(task.hora_preferida)
        setFechaLimite(task.fecha_limite || '')
        setPlazoTiempo(task.plazo_tiempo?.toString() || '')
        setRecordatorio(task.recordatorio)
        setRecordatorioMinutos(task.recordatorio_minutos?.toString() || '30')
        setGoalId(task.goal_id || '')
        setEstado(task.estado)
        setEditingId(task.id)
        setShowForm(true)
    }

    const changeEstado = async (taskId: string, newEstado: EstadoTarea) => {
        await updateTask(taskId, { estado: newEstado })
    }

    // Drag and Drop handlers
    const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
        setDraggedTaskId(taskId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: DragEvent<HTMLDivElement>, newEstado: EstadoTarea) => {
        e.preventDefault()
        if (draggedTaskId) {
            await changeEstado(draggedTaskId, newEstado)
            setDraggedTaskId(null)
        }
    }

    const handleDragEnd = () => {
        setDraggedTaskId(null)
    }

    const tasksByEstado: Record<EstadoTarea, typeof tasks> = {
        pendiente: tasks.filter(t => t.estado === 'pendiente'),
        en_progreso: tasks.filter(t => t.estado === 'en_progreso'),
        completada: tasks.filter(t => t.estado === 'completada'),
        cancelada: tasks.filter(t => t.estado === 'cancelada'),
    }

    // Move task up or down within its column
    const moveTask = async (taskId: string, direction: 'up' | 'down') => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const estado = task.estado
        const tasksInColumn = tasksByEstado[estado].sort((a, b) => (a.orden || 0) - (b.orden || 0))
        const currentIndex = tasksInColumn.findIndex(t => t.id === taskId)

        if (direction === 'up' && currentIndex > 0) {
            const prevTask = tasksInColumn[currentIndex - 1]
            await reorderTasks([
                { id: taskId, orden: prevTask.orden || 0 },
                { id: prevTask.id, orden: task.orden || 0 }
            ])
        } else if (direction === 'down' && currentIndex < tasksInColumn.length - 1) {
            const nextTask = tasksInColumn[currentIndex + 1]
            await reorderTasks([
                { id: taskId, orden: nextTask.orden || 0 },
                { id: nextTask.id, orden: task.orden || 0 }
            ])
        }
    }

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const TaskCard = ({ task }: { task: typeof tasks[0] }) => {
        const linkedGoal = goals.find(g => g.id === task.goal_id)
        const horaInfo = horasOpciones.find(h => h.value === task.hora_preferida)

        return (
            <div
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition-all ${draggedTaskId === task.id ? 'opacity-50 scale-95' : 'hover:shadow-xl'
                    }`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => changeEstado(task.id, task.estado === 'completada' ? 'pendiente' : 'completada')}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.estado === 'completada'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                            }`}
                    >
                        {task.estado === 'completada' && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {horaInfo && task.hora_preferida !== 'cualquiera' && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">{horaInfo.label}</span>
                            )}
                            {task.fecha_limite && (
                                <span className="flex items-center gap-1 text-xs text-orange-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.fecha_limite).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
                                </span>
                            )}
                            {task.recordatorio && (
                                <Bell className="w-3 h-3 text-purple-500" />
                            )}
                        </div>

                        <h4 className={`font-medium dark:text-white ${task.estado === 'completada' ? 'line-through opacity-60' : ''}`}>
                            {task.nombre}
                        </h4>

                        {task.descripcion && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.descripcion}</p>
                        )}

                        {linkedGoal && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gold-600 dark:text-gold-400">
                                <Target className="w-3 h-3" />
                                {linkedGoal.titulo}
                            </div>
                        )}

                        {task.tiempo_dedicado > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-brand-blue">
                                <Clock className="w-3 h-3" />
                                {formatTime(task.tiempo_dedicado)} dedicados
                            </div>
                        )}

                        <div className="flex items-center gap-1 mt-3">
                            <button
                                onClick={() => moveTask(task.id, 'up')}
                                className="p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                title="Mover arriba"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => moveTask(task.id, 'down')}
                                className="p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                title="Mover abajo"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                            <button
                                onClick={() => startEdit(task)}
                                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Editar tarea"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                        <ListTodo className="w-7 h-7 text-indigo-500" />
                        Mis Tareas
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {tasks.length} tareas en total {viewMode === 'kanban' && '• Arrastra las tarjetas para cambiar el estado'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                        >
                            <LayoutGrid className={`w-4 h-4 ${viewMode === 'kanban' ? 'text-indigo-500' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                        >
                            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-indigo-500' : 'text-gray-500'}`} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg my-8 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">
                            {editingId ? 'Editar Tarea' : 'Nueva Tarea'}
                        </h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre *</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="¿Qué necesitas hacer?"
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descripción</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Detalles adicionales..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Hora preferida</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {horasOpciones.map(h => (
                                        <button
                                            key={h.value}
                                            onClick={() => setHoraPreferida(h.value as any)}
                                            className={`p-2 rounded-xl text-sm font-medium transition-all ${horaPreferida === h.value
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                        >
                                            {h.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha Límite</label>
                                    <DateInput
                                        value={fechaLimite}
                                        onChange={setFechaLimite}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tiempo estimado (min)</label>
                                    <input
                                        type="number"
                                        value={plazoTiempo}
                                        onChange={(e) => setPlazoTiempo(e.target.value)}
                                        placeholder="30"
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Vincular a Meta (opcional)</label>
                                <select
                                    value={goalId}
                                    onChange={(e) => setGoalId(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Sin vincular</option>
                                    {goals.filter(g => !g.completada).map(g => (
                                        <option key={g.id} value={g.id}>🎯 {g.titulo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-purple-500" />
                                    <span className="font-medium dark:text-white">Recordatorio</span>
                                </div>
                                <button
                                    onClick={() => setRecordatorio(!recordatorio)}
                                    className={`w-12 h-6 rounded-full transition-colors ${recordatorio ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${recordatorio ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {recordatorio && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Recordar antes (min)</label>
                                    <input
                                        type="number"
                                        value={recordatorioMinutos}
                                        onChange={(e) => setRecordatorioMinutos(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value as EstadoTarea)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    {estados.map(e => (
                                        <option key={e.value} value={e.value}>{e.label}</option>
                                    ))}
                                </select>
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
                                className="flex-1 py-2 bg-indigo-500 text-white rounded-xl font-medium"
                            >
                                {editingId ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KANBAN VIEW with Drag & Drop */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estados.filter(e => e.value !== 'cancelada').map(estadoCol => (
                        <div
                            key={estadoCol.value}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, estadoCol.value)}
                            className={`flex flex-col min-h-[200px] ${draggedTaskId ? 'bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
                        >
                            <div className={`p-3 rounded-xl mb-3 ${estadoCol.color}`}>
                                <div className="flex items-center justify-between font-semibold">
                                    {estadoCol.label}
                                    <span className="text-sm opacity-75">
                                        {tasksByEstado[estadoCol.value].length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                                {tasksByEstado[estadoCol.value].map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                                {tasksByEstado[estadoCol.value].length === 0 && (
                                    <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-sm text-gray-400">
                                        {draggedTaskId ? 'Suelta aquí' : 'Sin tareas'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="space-y-3">
                    {tasks.filter(t => t.estado !== 'cancelada').map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}

                    {tasks.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <ListTodo className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No tienes tareas</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-indigo-500 font-medium hover:underline"
                            >
                                Crear tu primera tarea
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
