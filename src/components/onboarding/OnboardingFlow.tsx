import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProsperity } from '../../hooks/useProsperity'
import { useNonNegotiables } from '../../hooks/useNonNegotiables'
import { Plus, Trash2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

interface OnboardingFlowProps {
    onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const { profile, updateProfile } = useAuth()
    const { initializePillars, updatePillar } = useProsperity()
    const { updateItems } = useNonNegotiables()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Form states
    const [palabraDelAño, setPalabraDelAño] = useState(profile?.palabra_del_año || '')
    const [fraseDelAño, setFraseDelAño] = useState(profile?.frase_del_año || '')
    const [porQue, setPorQue] = useState(profile?.por_que || '')
    const [noNegociables, setNoNegociables] = useState<string[]>([])
    const [tempNoNegociable, setTempNoNegociable] = useState('')
    const [alterEgo, setAlterEgo] = useState(profile?.alter_ego || '')
    const [estadoEmocionalIdeal, setEstadoEmocionalIdeal] = useState(profile?.estado_emocional_ideal || '')

    // Prosperity test states
    const [prosperity, setProsperity] = useState({
        economica: { hoy: 5, deseado: 10 },
        emocional: { hoy: 5, deseado: 10 },
        fisica: { hoy: 5, deseado: 10 },
        relacional: { hoy: 5, deseado: 10 },
        entorno: { hoy: 5, deseado: 10 },
        salud: { hoy: 5, deseado: 10 },
        desarrollo_personal: { hoy: 5, deseado: 10 },
    })

    const totalSteps = 6

    const addNoNegociable = () => {
        if (tempNoNegociable.trim()) {
            setNoNegociables([...noNegociables, tempNoNegociable.trim()])
            setTempNoNegociable('')
        }
    }

    const removeNoNegociable = (index: number) => {
        setNoNegociables(noNegociables.filter((_, i) => i !== index))
    }

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1)
        } else {
            await finishOnboarding()
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const finishOnboarding = async () => {
        setLoading(true)

        // Save profile data
        await updateProfile({
            palabra_del_año: palabraDelAño,
            frase_del_año: fraseDelAño,
            por_que: porQue,
            alter_ego: alterEgo,
            estado_emocional_ideal: estadoEmocionalIdeal,
            onboarding_completed: true
        })

        // Save non-negotiables
        await updateItems(noNegociables)

        // Initialize and update prosperity pillars
        await initializePillars()
        for (const [pilar, values] of Object.entries(prosperity)) {
            await updatePillar(
                pilar as 'economica' | 'emocional' | 'fisica' | 'relacional' | 'entorno',
                values.hoy,
                values.deseado
            )
        }

        setLoading(false)
        onComplete()
    }

    const pilarLabels: Record<string, string> = {
        economica: '💰 Económica',
        emocional: '💖 Emocional',
        fisica: '💪 Salud Física',
        relacional: '👥 Relaciones',
        entorno: '🏠 Entorno',
        salud: '🩺 Disciplina/Caracter',
        desarrollo_personal: '📚 Desarrollo Personal'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex gap-2 mb-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full transition-all duration-500 ${i < step
                                    ? 'bg-gradient-to-r from-gold-400 to-gold-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                        Paso {step} de {totalSteps}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-fade-in">
                    {/* Step 1: Palabra del Año */}
                    {step === 1 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">✨</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Tu Palabra del Año
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ¿Qué palabra quieres que te acompañe cada día?
                                </p>
                            </div>
                            <input
                                type="text"
                                value={palabraDelAño}
                                onChange={(e) => setPalabraDelAño(e.target.value.toUpperCase())}
                                placeholder="Ej: ABUNDANCIA"
                                className="w-full px-6 py-4 text-2xl text-center font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all uppercase tracking-wider"
                            />
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {['LIBERTAD', 'ABUNDANCIA', 'CRECIMIENTO', 'PAZ', 'DISCIPLINA'].map(word => (
                                    <button
                                        key={word}
                                        onClick={() => setPalabraDelAño(word)}
                                        className="px-4 py-2 rounded-full text-sm border border-gray-200 dark:border-gray-600 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-all dark:text-gray-300"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Frase del Año */}
                    {step === 2 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">📝</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Tu Frase del Año
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Un mantra que te recuerde tu dirección cada mañana
                                </p>
                            </div>
                            <textarea
                                value={fraseDelAño}
                                onChange={(e) => setFraseDelAño(e.target.value)}
                                placeholder="Ej: Este año construyo mi libertad financiera con paz interior..."
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl h-40 bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all resize-none"
                            />
                        </div>
                    )}

                    {/* Step 3: Por Qué */}
                    {step === 3 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">❓</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Tu ¿Por Qué?
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ¿Por qué vale la pena vivir este año con intención y disciplina?
                                </p>
                            </div>
                            <textarea
                                value={porQue}
                                onChange={(e) => setPorQue(e.target.value)}
                                placeholder="Escribe tu razón profunda..."
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl h-48 bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all resize-none"
                            />
                        </div>
                    )}

                    {/* Step 4: No Negociables */}
                    {step === 4 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">🛡️</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Tus No Negociables
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aspectos de tu vida que no cederás por dinero, miedo o presión
                                </p>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={tempNoNegociable}
                                    onChange={(e) => setTempNoNegociable(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addNoNegociable()}
                                    placeholder="Ej: Tiempo con familia"
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all"
                                />
                                <button
                                    onClick={addNoNegociable}
                                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white hover:shadow-lg transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {noNegociables.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl animate-slide-up"
                                    >
                                        <span className="dark:text-white font-medium">{item}</span>
                                        <button
                                            onClick={() => removeNoNegociable(idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {noNegociables.length === 0 && (
                                    <p className="text-center text-gray-400 py-8">
                                        Agrega tus no negociables
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Alter-Ego */}
                    {step === 5 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">🦸</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Tu Alter-Ego
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ¿Qué versión de ti vas a invocar para jugar tu mejor juego?
                                </p>
                            </div>

                            <input
                                type="text"
                                value={alterEgo}
                                onChange={(e) => setAlterEgo(e.target.value)}
                                placeholder="Ej: El Arquitecto de Mi Destino"
                                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 rounded-xl mb-8 bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all"
                            />

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold gradient-text mb-2">
                                    Tu Estado Emocional Ideal
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    ¿Cuál es la emoción que quieres sentir la mayor parte del tiempo?
                                </p>
                            </div>

                            <input
                                type="text"
                                value={estadoEmocionalIdeal}
                                onChange={(e) => setEstadoEmocionalIdeal(e.target.value)}
                                placeholder="Ej: Paz, Abundancia, Confianza..."
                                className="w-full px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-all"
                            />
                        </div>
                    )}

                    {/* Step 6: Test de Prosperidad */}
                    {step === 6 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-4 block">📊</span>
                                <h2 className="text-3xl font-bold gradient-text mb-2">
                                    Test de Prosperidad Integral
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Evaluemos dónde estás hoy en los 5 pilares de tu vida
                                </p>
                            </div>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                                {Object.entries(prosperity).map(([pilar, values]) => {
                                    const gap = values.deseado - values.hoy
                                    return (
                                        <div key={pilar} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <h3 className="text-lg font-semibold mb-4 dark:text-white">
                                                {pilarLabels[pilar]}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm mb-2 text-gray-500 dark:text-gray-400">
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
                                                    <label className="block text-sm mb-2 text-gray-500 dark:text-gray-400">
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
                                                <span className={`text-sm font-medium ${gap > 5 ? 'text-red-500' : gap > 3 ? 'text-orange-500' : 'text-green-500'
                                                    }`}>
                                                    Gap: {gap} puntos
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-4 mt-8">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-blue to-indigo-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                                    <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                                    <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                                </div>
                            ) : step === totalSteps ? (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    ¡Comenzar!
                                </>
                            ) : (
                                <>
                                    Siguiente
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
