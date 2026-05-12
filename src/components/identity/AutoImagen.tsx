import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Sparkles, Target, Save, Check } from 'lucide-react'

export function AutoImagen() {
    const { profile, updateProfile, retryLoadProfile } = useAuth()
    
    const [actualYFuturo, setActualYFuturo] = useState('')
    const [queHacerYEvitar, setQueHacerYEvitar] = useState('')
    const [autoimagenIdeal, setAutoimagenIdeal] = useState('')
    
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (profile?.auto_imagen) {
            setActualYFuturo(profile.auto_imagen.actual_y_futuro || '')
            setQueHacerYEvitar(profile.auto_imagen.que_hacer_y_evitar || '')
            setAutoimagenIdeal(profile.auto_imagen.autoimagen_ideal || '')
        }
    }, [profile])

    const handleSave = async () => {
        setSaving(true)
        setError('')
        setSaved(false)

        const auto_imagen = {
            actual_y_futuro: actualYFuturo,
            que_hacer_y_evitar: queHacerYEvitar,
            autoimagen_ideal: autoimagenIdeal
        }

        const { error: updateError } = await updateProfile({ auto_imagen })

        if (updateError) {
            setError(updateError.message)
        } else {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
            await retryLoadProfile()
        }

        setSaving(false)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-gold-500" />
                        Auto Imagen
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Diseña la versión de ti que logrará todos tus objetivos
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        1. ¿Qué es lo que estás haciendo en estos momentos que no te llevan a la vida que deseas y cómo te ves en 5 años?
                    </h3>
                    <textarea
                        value={actualYFuturo}
                        onChange={(e) => setActualYFuturo(e.target.value)}
                        placeholder="Reflexiona sobre tus acciones actuales..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white min-h-[150px] resize-y"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        2. ¿Qué es lo que debes de hacer y evitar para tener la vida que deseas y cómo te ves en 5 años?
                    </h3>
                    <textarea
                        value={queHacerYEvitar}
                        onChange={(e) => setQueHacerYEvitar(e.target.value)}
                        placeholder="Define tus nuevas acciones y límites..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white min-h-[150px] resize-y"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-gold-400/30">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold-500" />
                        3. Describe tu autoimagen ideal para lograr todos tus objetivos
                    </h3>
                    <textarea
                        value={autoimagenIdeal}
                        onChange={(e) => setAutoimagenIdeal(e.target.value)}
                        placeholder="Yo soy..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white min-h-[200px] resize-y text-lg"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 transition-all shadow-lg ${saved
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-gold-400 to-gold-600 hover:opacity-90'
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
                                Guardado
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Guardar Auto Imagen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
