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

const PASOS_BOB_PROCTOR = [
    {
        id: 'bob_paso_1',
        title: 'Paso 1.- Autogestión frente al espejo',
        description: ''
    },
    {
        id: 'bob_paso_2',
        title: 'Paso 2.- Escribe 30 veces tu meta',
        description: 'Ejemplo: Yo soy muy feliz y estoy agradecido porque he logrado vender dos propiedades al mes y gano 180,000 al mes y puedo viajar con mi familia de vacaciones cuando quiero, he logrado la libertada financiera al hacerme de propiedades y de crear varios negocios que funcionan sin mi, he podido darle a mi familia todo lo que necesita y he podido ayudar a otras personas a alcanzar sus metas y sueños a atraves de asesorarlos correctamente a elegir la propiedad ideal para ellos, ademas de ayudar a otras personas a lograr resultados en sus negocios a traves de consultorias de desarrollo personal.'
    },
    {
        id: 'bob_paso_3',
        title: 'Paso 3.- Lee la autoimagen en voz alta',
        description: 'Crea tu propia autoimagen: la descripción detallada de la persona en que te quieres convertir pero en estado presente.\nEjemplo: Yo soy muy feliz y agradecido ahora que soy disciplinado, enfocado en lo que en realidad me deja, amoroso, resiliente, gracias ya esta hecho.'
    },
    {
        id: 'bob_paso_4',
        title: 'Paso 4.- Escucha la grabación la palabra mágica',
        description: 'Link: https://www.youtube.com/watch?v=lHKF_cwmoYU'
    },
    {
        id: 'bob_paso_5',
        title: 'Paso 5.- Lee lleno de emoción, la fórmula de la confianza de Napoleon Hill',
        description: 'Fórmula para la confianza en mí mismo\nSé que tengo la capacidad de lograr el objetivo definido de mi propósito en la vida. Por lo tanto, exijo de mí mismo una acción persistente y continua hacia su consecución, y me prometo realizar tales acciones.\nEntiendo que los pensamientos dominantes en mi mente eventualmente se reproducirán en actos exteriores y se convertirán gradualmente en una realidad física. Por lo tanto, concentraré mis pensamientos durante 30 minutos diarios en la tarea de pensar en la persona en la que me propongo convertirme, creando así una imagen mental clara de esa persona.\nSé que a través del principio de la autosugestión, cualquier deseo que mantenga persistentemente en mi mente eventualmente buscará expresarse a través de medios prácticos para alcanzar el objetivo que persigue. Por lo tanto, dedicaré 10 minutos diarios a demandar de mí mismo el desarrollo de la confianza en mí mismo.\nHe escrito con claridad una descripción de mi principal objetivo en la vida, y nunca dejaré de intentar hasta haber desarrollado suficiente confianza en mí mismo para lograrlo.\nComprendo con claridad que no hay riqueza ni posición que pueda durar mucho tiempo, a menos que se haya formado sobre la lealtad y la justicia; por lo tanto, no me comprometeré en ninguna transacción que no beneficie a todos a los que afecte. Tendré éxito atrayendo hacia mí las fuerzas que deseo emplear, y la cooperación de otras personas. Induciré a otros a servirme, por obra de mi disposición de servir a otros. Eliminaré el desprecio, la envidia, los celos, el egoísmo y el cinismo, y cultivaré el amor por toda la humanidad, porque sé que una actitud negativa hacia los demás nunca me dará el éxito. Haré que los demás crean en mí, porque yo creeré en ellos y en mí mismo.\nFirmaré esta fórmula con mi nombre, la memorizaré y la repetiré en voz alta una vez cada día, con la fe absoluta de que influirá gradualmente en mis pensamientos y mis actos para que yo me convierta en una persona que confía en sí misma y que goza del privilegio del éxito.'
    },
    {
        id: 'bob_paso_6',
        title: 'Paso 6.- Escuchar o ver video de lo que quiero ser experto',
        description: 'Por ejemplo videos de ventas.'
    },
    {
        id: 'bob_paso_7',
        title: 'Paso 7.- Reflexionar al final del día',
        description: '• ¿Me comporté como la persona en la que me quiero convertir?\n• ¿Tuve la actitud (pensamientos/emociones/acciones) de la persona en la que me quiero convertir?\n• ¿Operé con el standard (desempeño) de la persona en la que me quiero convertir?\n• ¿Tuve la disciplina de la persona en la que me quiero convertir?'
    }
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
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checklistConciencia[pregunta.id]
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

                {/* Los 7 pasos diarios de Bob Proctor para lograr lo que sea */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border-2 border-gold-400/30">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold-500" />
                        Los 7 pasos diarios de Bob Proctor para lograr lo que sea
                    </h3>
                    <div className="space-y-4">
                        {PASOS_BOB_PROCTOR.map(paso => (
                            <div key={paso.id} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                <button
                                    onClick={() => toggleChecklistItem(paso.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${checklistConciencia[paso.id]
                                            ? 'bg-gold-500 border-gold-500 text-white'
                                            : 'border-gray-300 dark:border-gray-500'
                                        }`}
                                >
                                    {checklistConciencia[paso.id] && <Check className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <h4 className={`font-medium ${checklistConciencia[paso.id] ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {paso.title}
                                    </h4>
                                    {paso.description && (
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                            {paso.description.includes('http') ? (
                                                <a href="https://www.youtube.com/watch?v=lHKF_cwmoYU" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                                                    Escuchar grabación aquí
                                                </a>
                                            ) : (
                                                paso.description
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
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
