import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProsperity } from '../../hooks/useProsperity'
import { useNonNegotiables } from '../../hooks/useNonNegotiables'
import {
    User, Sparkles, FileText, HelpCircle, Shield, Zap, BarChart3,
    Plus, Trash2, Save, ChevronDown, ChevronUp
} from 'lucide-react'

// Section component moved OUTSIDE of IdentityEditor to prevent re-creation on each render
interface SectionProps {
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode
    onSave: () => void
    saving: boolean
    isExpanded: boolean
    onToggle: () => void
}

function Section({ id, title, icon: Icon, children, onSave, saving, isExpanded, onToggle }: SectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gold-500" />
                    <span className="font-semibold dark:text-white">{title}</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                    <div className="pt-4 space-y-4">
                        {children}
                    </div>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            )}
        </div>
    )
}

export function IdentityEditor() {
    const { profile, updateProfile, retryLoadProfile } = useAuth()
    const { pillars, updatePillar, refresh: refreshPillars } = useProsperity()
    const { items: nonNegotiables, updateItems, refresh: refreshNonNegotiables } = useNonNegotiables()

    const [saving, setSaving] = useState(false)
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    // Profile fields
    const [nombre, setNombre] = useState('')
    const [palabraDelAño, setPalabraDelAño] = useState('')
    const [fraseDelAño, setFraseDelAño] = useState('')
    const [porQue, setPorQue] = useState('')
    const [alterEgo, setAlterEgo] = useState('')
    const [estadoEmocionalIdeal, setEstadoEmocionalIdeal] = useState('')

    // Non-negotiables
    const [tempNoNegociables, setTempNoNegociables] = useState<string[]>([])
    const [newNoNegociable, setNewNoNegociable] = useState('')

    // Prosperity test
    const [prosperity, setProsperity] = useState({
        economica: { hoy: 5, deseado: 10 },
        emocional: { hoy: 5, deseado: 10 },
        fisica: { hoy: 5, deseado: 10 },
        relacional: { hoy: 5, deseado: 10 },
        entorno: { hoy: 5, deseado: 10 },
        salud: { hoy: 5, deseado: 10 },
        desarrollo_personal: { hoy: 5, deseado: 10 },
    })

    useEffect(() => {
        if (profile) {
            setNombre(profile.nombre || '')
            setPalabraDelAño(profile.palabra_del_año || '')
            setFraseDelAño(profile.frase_del_año || '')
            setPorQue(profile.por_que || '')
            setAlterEgo(profile.alter_ego || '')
            setEstadoEmocionalIdeal(profile.estado_emocional_ideal || '')
        }
    }, [profile])

    useEffect(() => {
        if (nonNegotiables) {
            setTempNoNegociables(nonNegotiables.map(n => n.descripcion))
        }
    }, [nonNegotiables])

    useEffect(() => {
        if (pillars && pillars.length > 0) {
            const newProsperity: any = { ...prosperity }
            pillars.forEach(p => {
                if (newProsperity[p.pilar]) {
                    newProsperity[p.pilar] = {
                        hoy: p.valor_actual,
                        deseado: p.valor_deseado
                    }
                }
            })
            setProsperity(newProsperity)
        }
    }, [pillars])

    const pilarLabels: Record<string, string> = {
        economica: '💰 Económica',
        emocional: '💖 Emocional',
        fisica: '💪 Salud Física',
        relacional: '👥 Relaciones',
        entorno: '🏠 Entorno',
        salud: '🩺 Disciplina/Caracter',
        desarrollo_personal: '📚 Desarrollo Personal'
    }

    const addNoNegociable = () => {
        if (newNoNegociable.trim()) {
            setTempNoNegociables([...tempNoNegociables, newNoNegociable.trim()])
            setNewNoNegociable('')
        }
    }

    const removeNoNegociable = (index: number) => {
        setTempNoNegociables(tempNoNegociables.filter((_, i) => i !== index))
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        await updateProfile({
            nombre,
            palabra_del_año: palabraDelAño,
            frase_del_año: fraseDelAño,
            por_que: porQue,
            alter_ego: alterEgo,
            estado_emocional_ideal: estadoEmocionalIdeal,
        })
        await retryLoadProfile()
        setSaving(false)
    }

    const handleSaveNonNegotiables = async () => {
        setSaving(true)
        await updateItems(tempNoNegociables)
        await refreshNonNegotiables()
        setSaving(false)
    }

    const handleSaveProsperity = async () => {
        setSaving(true)
        for (const [pilar, values] of Object.entries(prosperity)) {
            await updatePillar(
                pilar as 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno',
                values.hoy,
                values.deseado
            )
        }
        await refreshPillars()
        setSaving(false)
    }

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <User className="w-7 h-7 text-gold-500" />
                    Mi Identidad
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Modifica tu palabra del año, frase, por qué, no negociables y más
                </p>
            </div>

            <div className="space-y-4">
                {/* Nombre y Palabra del Año */}
                <Section
                    id="basico"
                    title="Nombre y Palabra del Año"
                    icon={Sparkles}
                    onSave={handleSaveProfile}
                    saving={saving}
                    isExpanded={expandedSection === 'basico'}
                    onToggle={() => toggleSection('basico')}
                >
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tu Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="¿Cómo te llamas?"
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Palabra del Año</label>
                        <input
                            type="text"
                            value={palabraDelAño}
                            onChange={(e) => setPalabraDelAño(e.target.value.toUpperCase())}
                            placeholder="Ej: ABUNDANCIA"
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-center text-xl font-bold uppercase tracking-wider"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {['LIBERTAD', 'ABUNDANCIA', 'CRECIMIENTO', 'PAZ', 'DISCIPLINA'].map(word => (
                                <button
                                    key={word}
                                    type="button"
                                    onClick={() => setPalabraDelAño(word)}
                                    className="px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-all dark:text-gray-300"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Frase del Año */}
                <Section
                    id="frase"
                    title="Tu Frase del Año"
                    icon={FileText}
                    onSave={handleSaveProfile}
                    saving={saving}
                    isExpanded={expandedSection === 'frase'}
                    onToggle={() => toggleSection('frase')}
                >
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Un mantra que te recuerde tu dirección</label>
                        <textarea
                            value={fraseDelAño}
                            onChange={(e) => setFraseDelAño(e.target.value)}
                            placeholder="Ej: Este año construyo mi libertad financiera con paz interior..."
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-32 resize-none"
                        />
                    </div>
                </Section>

                {/* Por Qué */}
                <Section
                    id="porque"
                    title="Tu ¿Por Qué?"
                    icon={HelpCircle}
                    onSave={handleSaveProfile}
                    saving={saving}
                    isExpanded={expandedSection === 'porque'}
                    onToggle={() => toggleSection('porque')}
                >
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">¿Por qué vale la pena vivir este año con intención?</label>
                        <textarea
                            value={porQue}
                            onChange={(e) => setPorQue(e.target.value)}
                            placeholder="Escribe tu razón profunda..."
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-40 resize-none"
                        />
                    </div>
                </Section>

                {/* No Negociables */}
                <Section
                    id="nonegociables"
                    title="Tus No Negociables"
                    icon={Shield}
                    onSave={handleSaveNonNegotiables}
                    saving={saving}
                    isExpanded={expandedSection === 'nonegociables'}
                    onToggle={() => toggleSection('nonegociables')}
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aspectos de tu vida que no cederás por dinero, miedo o presión
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newNoNegociable}
                            onChange={(e) => setNewNoNegociable(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addNoNegociable()}
                            placeholder="Ej: Tiempo con familia"
                            className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={addNoNegociable}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {tempNoNegociables.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                            >
                                <span className="dark:text-white">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => removeNoNegociable(idx)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {tempNoNegociables.length === 0 && (
                            <p className="text-center text-gray-400 py-4">Agrega tus no negociables</p>
                        )}
                    </div>
                </Section>

                {/* Alter-Ego */}
                <Section
                    id="alterego"
                    title="Tu Alter-Ego"
                    icon={Zap}
                    onSave={handleSaveProfile}
                    saving={saving}
                    isExpanded={expandedSection === 'alterego'}
                    onToggle={() => toggleSection('alterego')}
                >
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">¿Qué versión de ti vas a invocar?</label>
                        <input
                            type="text"
                            value={alterEgo}
                            onChange={(e) => setAlterEgo(e.target.value)}
                            placeholder="Ej: El Arquitecto de Mi Destino"
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-lg font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado Emocional Ideal</label>
                        <input
                            type="text"
                            value={estadoEmocionalIdeal}
                            onChange={(e) => setEstadoEmocionalIdeal(e.target.value)}
                            placeholder="Ej: Paz, Abundancia, Confianza..."
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </Section>

                {/* Test de Prosperidad */}
                <Section
                    id="prosperidad"
                    title="Test de Prosperidad Integral"
                    icon={BarChart3}
                    onSave={handleSaveProsperity}
                    saving={saving}
                    isExpanded={expandedSection === 'prosperidad'}
                    onToggle={() => toggleSection('prosperidad')}
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Evalúa dónde estás hoy en los 5 pilares de tu vida
                    </p>
                    <div className="space-y-4">
                        {Object.entries(prosperity).map(([pilar, values]) => {
                            const gap = values.deseado - values.hoy
                            return (
                                <div key={pilar} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <h4 className="font-medium mb-3 dark:text-white">{pilarLabels[pilar]}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">
                                                Hoy: <span className="font-bold text-brand-blue">{values.hoy}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={values.hoy}
                                                onChange={(e) => setProsperity({
                                                    ...prosperity,
                                                    [pilar]: { ...values, hoy: parseInt(e.target.value) }
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">
                                                Deseado: <span className="font-bold text-gold-500">{values.deseado}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={values.deseado}
                                                onChange={(e) => setProsperity({
                                                    ...prosperity,
                                                    [pilar]: { ...values, deseado: parseInt(e.target.value) }
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className={`text-xs font-medium ${gap > 5 ? 'text-red-500' : gap > 3 ? 'text-orange-500' : 'text-green-500'
                                            }`}>
                                            Gap: {gap} puntos
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Section>
            </div>
        </div>
    )
}
