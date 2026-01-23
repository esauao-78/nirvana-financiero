import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Brain, Calendar, Save, Check, Sparkles, Target, FileText, CheckSquare } from 'lucide-react'

const CHECKLIST_PREGUNTAS = [
    { id: 'silencio', label: '¿Tuve un momento de silencio o gratitud al despertar?' },
    { id: 'producir_dinero', label: '¿Produje algo que acerque dinero a mi vida?' },
    { id: 'gasto_consciente', label: '¿Gasté con consciencia o desde la emoción?' },
    { id: 'ahorro_20', label: '¿Separé mi 20% de ahorro o al menos una pequeña cantidad?' },
    { id: 'registro_financiero', label: '¿Registré mis movimientos financieros del día?' },
    { id: 'paz_noche', label: '¿Dormí con paz y no con culpa?' },
]

export function DailyCheckIn() {
    const { user } = useAuth()
    const today = new Date().toISOString().split('T')[0]

    const [fecha, setFecha] = useState(today)
    const [estadoEmocional, setEstadoEmocional] = useState(7)
    const [energia, setEnergia] = useState(7)
    const [gratitudes, setGratitudes] = useState<string[]>(['', '', ''])
    const [reflexion, setReflexion] = useState('')
    const [wins, setWins] = useState<string[]>([''])
    const [tmi, setTmi] = useState('')
    const [afirmaciones, setAfirmaciones] = useState<string[]>(['', ''])
    const [retos, setRetos] = useState<string[]>([''])
    const [notasAdicionales, setNotasAdicionales] = useState('')
    const [checklistConciencia, setChecklistConciencia] = useState<Record<string, boolean>>({})

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [entryId, setEntryId] = useState<string | null>(null)

    useEffect(() => {
        fetchEntry()
    }, [fecha, user])

    const fetchEntry = async () => {
        if (!user) return
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('daily_diary')
            .select('*')
            .eq('user_id', user.id)
            .eq('fecha', fecha)
            .maybeSingle()

        if (error) {
            console.error('Error fetching entry:', error)
            setLoading(false)
            return
        }

        if (data) {
            setEntryId(data.id)
            setEstadoEmocional(data.estado_emocional || 7)
            setEnergia(data.energia || 7)
            setGratitudes(data.gratitudes?.length ? data.gratitudes : ['', '', ''])
            setReflexion(data.reflexion || '')
            setWins(data.wins?.length ? data.wins : [''])
            setTmi((data as any).tmi || '')
            setAfirmaciones((data as any).afirmaciones?.length ? (data as any).afirmaciones : ['', ''])
            setRetos((data as any).retos?.length ? (data as any).retos : [''])
            setNotasAdicionales((data as any).notas_adicionales || '')
            setChecklistConciencia((data as any).checklist_conciencia || {})
        } else {
            setEntryId(null)
            setEstadoEmocional(7)
            setEnergia(7)
            setGratitudes(['', '', ''])
            setReflexion('')
            setWins([''])
            setTmi('')
            setAfirmaciones(['', ''])
            setRetos([''])
            setNotasAdicionales('')
            setChecklistConciencia({})
        }

        setLoading(false)
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        setError('')
        setSaved(false)

        const entryData = {
            user_id: user.id,
            fecha,
            estado_emocional: estadoEmocional,
            energia,
            gratitudes: gratitudes.filter(g => g.trim()),
            reflexion,
            wins: wins.filter(w => w.trim()),
            tmi,
            afirmaciones: afirmaciones.filter(a => a.trim()),
            retos: retos.filter(r => r.trim()),
            notas_adicionales: notasAdicionales,
            checklist_conciencia: checklistConciencia,
        }

        let result
        if (entryId) {
            result = await supabase
                .from('daily_diary')
                .update(entryData)
                .eq('id', entryId)
        } else {
            result = await supabase
                .from('daily_diary')
                .insert(entryData)
                .select()
                .single()

            if (result.data) {
                setEntryId(result.data.id)
            }
        }

        if (result.error) {
            setError(result.error.message)
        } else {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }

        setSaving(false)
    }

    const updateGratitude = (index: number, value: string) => {
        const newGratitudes = [...gratitudes]
        newGratitudes[index] = value
        setGratitudes(newGratitudes)
    }

    const updateAfirmacion = (index: number, value: string) => {
        const newAfirmaciones = [...afirmaciones]
        newAfirmaciones[index] = value
        setAfirmaciones(newAfirmaciones)
    }

    const updateReto = (index: number, value: string) => {
        const newRetos = [...retos]
        newRetos[index] = value
        setRetos(newRetos)
    }

    const updateWin = (index: number, value: string) => {
        const newWins = [...wins]
        newWins[index] = value
        setWins(newWins)
    }

    const toggleChecklistItem = (id: string) => {
        setChecklistConciencia(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }

    const completedChecks = Object.values(checklistConciencia).filter(Boolean).length
    const totalChecks = CHECKLIST_PREGUNTAS.length

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-purple-500" />
                        Diario de Conciencia
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Reflexión diaria para tu crecimiento integral
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* TMI - Tarea más importante */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        TMI - Tarea Más Importante del Día
                    </h3>
                    <input
                        type="text"
                        value={tmi}
                        onChange={(e) => setTmi(e.target.value)}
                        placeholder="¿Cuál es la tarea más importante que debo completar hoy?"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-lg"
                    />
                </div>

                {/* Estado Emocional y Energía */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                        <h3 className="font-semibold mb-3 dark:text-white">💖 Estado Emocional: {estadoEmocional}/10</h3>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={estadoEmocional}
                            onChange={(e) => setEstadoEmocional(parseInt(e.target.value))}
                            className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                        <h3 className="font-semibold mb-3 dark:text-white">⚡ Nivel de Energía: {energia}/10</h3>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={energia}
                            onChange={(e) => setEnergia(parseInt(e.target.value))}
                            className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-gray-400 via-blue-400 to-purple-500"
                        />
                    </div>
                </div>

                {/* Gratitudes */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white">🙏 3 Gratitudes</h3>
                    <div className="space-y-2">
                        {gratitudes.map((g, i) => (
                            <input
                                key={i}
                                type="text"
                                value={g}
                                onChange={(e) => updateGratitude(i, e.target.value)}
                                placeholder={`Gratitud ${i + 1}...`}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        ))}
                    </div>
                </div>

                {/* Afirmaciones */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold-500" />
                        Afirmaciones
                    </h3>
                    <div className="space-y-2">
                        {afirmaciones.map((a, i) => (
                            <input
                                key={i}
                                type="text"
                                value={a}
                                onChange={(e) => updateAfirmacion(i, e.target.value)}
                                placeholder={`Yo soy...`}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        ))}
                        <button
                            onClick={() => setAfirmaciones([...afirmaciones, ''])}
                            className="text-sm text-purple-500 hover:underline"
                        >
                            + Agregar afirmación
                        </button>
                    </div>
                </div>

                {/* Retos */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white">🎯 Retos del Día</h3>
                    <div className="space-y-2">
                        {retos.map((r, i) => (
                            <input
                                key={i}
                                type="text"
                                value={r}
                                onChange={(e) => updateReto(i, e.target.value)}
                                placeholder={`Reto ${i + 1}...`}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        ))}
                        <button
                            onClick={() => setRetos([...retos, ''])}
                            className="text-sm text-purple-500 hover:underline"
                        >
                            + Agregar reto
                        </button>
                    </div>
                </div>

                {/* Wins */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white">🏆 Victorias del Día</h3>
                    <div className="space-y-2">
                        {wins.map((w, i) => (
                            <input
                                key={i}
                                type="text"
                                value={w}
                                onChange={(e) => updateWin(i, e.target.value)}
                                placeholder={`Victoria ${i + 1}...`}
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        ))}
                        <button
                            onClick={() => setWins([...wins, ''])}
                            className="text-sm text-purple-500 hover:underline"
                        >
                            + Agregar victoria
                        </button>
                    </div>
                </div>

                {/* Checklist de Conciencia */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-500" />
                        Checklist de Conciencia ({completedChecks}/{totalChecks})
                    </h3>
                    <div className="space-y-3">
                        {CHECKLIST_PREGUNTAS.map(pregunta => (
                            <button
                                key={pregunta.id}
                                onClick={() => toggleChecklistItem(pregunta.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${checklistConciencia[pregunta.id]
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checklistConciencia[pregunta.id]
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 dark:border-gray-500'
                                    }`}>
                                    {checklistConciencia[pregunta.id] && <Check className="w-4 h-4" />}
                                </div>
                                <span className="flex-1 text-sm">{pregunta.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reflexión */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white">💭 Reflexión del Día</h3>
                    <textarea
                        value={reflexion}
                        onChange={(e) => setReflexion(e.target.value)}
                        placeholder="¿Qué aprendí hoy? ¿Qué haré diferente mañana?"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-32 resize-none"
                    />
                </div>

                {/* Notas Adicionales */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Notas Adicionales
                    </h3>
                    <textarea
                        value={notasAdicionales}
                        onChange={(e) => setNotasAdicionales(e.target.value)}
                        placeholder="Cualquier otra cosa que quieras registrar..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-24 resize-none"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full py-4 rounded-2xl font-semibold text-white text-lg flex items-center justify-center gap-2 transition-all ${saved
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                        } disabled:opacity-50`}
                >
                    {saving ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Guardando...
                        </>
                    ) : saved ? (
                        <>
                            <Check className="w-5 h-5" />
                            ¡Guardado!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Guardar Diario
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
