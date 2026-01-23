import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProsperity } from '../../hooks/useProsperity'
import { Settings, Download, Key, User, RefreshCw } from 'lucide-react'

export function SettingsView() {
    const { profile, updateProfile } = useAuth()
    const { pillars } = useProsperity()

    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_key') || '')
    const [nombre, setNombre] = useState(profile?.nombre || '')
    const [palabraDelAño, setPalabraDelAño] = useState(profile?.palabra_del_año || '')
    const [alterEgo, setAlterEgo] = useState(profile?.alter_ego || '')
    const [estadoEmocionalIdeal, setEstadoEmocionalIdeal] = useState(profile?.estado_emocional_ideal || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const saveApiKey = () => {
        localStorage.setItem('openai_key', apiKey)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const saveProfile = async () => {
        setSaving(true)
        await updateProfile({
            nombre,
            palabra_del_año: palabraDelAño,
            alter_ego: alterEgo,
            estado_emocional_ideal: estadoEmocionalIdeal
        })
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const exportData = () => {
        const data = {
            profile,
            pillars,
            exported_at: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `juega-tu-juego-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2 mb-6">
                <Settings className="w-7 h-7 text-gray-500" />
                Configuración
            </h2>

            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tu Perfil
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Palabra del Año</label>
                        <input
                            type="text"
                            value={palabraDelAño}
                            onChange={(e) => setPalabraDelAño(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white uppercase font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tu Alter-Ego</label>
                        <input
                            type="text"
                            value={alterEgo}
                            onChange={(e) => setAlterEgo(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado Emocional Ideal</label>
                        <input
                            type="text"
                            value={estadoEmocionalIdeal}
                            onChange={(e) => setEstadoEmocionalIdeal(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${saved ? 'bg-green-500' : 'bg-brand-blue hover:bg-brand-blue/90'
                            } disabled:opacity-50`}
                    >
                        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Perfil'}
                    </button>
                </div>
            </div>

            {/* OpenAI API Key */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Key de OpenAI
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Necesitas una API Key de OpenAI para usar el Coach IA (Rodrigo). Esta key se guarda solo en tu navegador.
                </p>
                <div className="flex gap-2">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        onClick={saveApiKey}
                        className="px-6 py-2 bg-gold-500 text-white rounded-xl font-medium"
                    >
                        Guardar
                    </button>
                </div>
            </div>

            {/* Export Data */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Datos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Descarga una copia de todos tus datos en formato JSON
                </p>
                <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Download className="w-5 h-5" />
                    Exportar Datos
                </button>
            </div>
        </div>
    )
}
