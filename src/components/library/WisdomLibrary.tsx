import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Plus, Star, Trash2, Quote, Lightbulb, Link, Book, Calendar } from 'lucide-react'

interface WisdomEntry {
    id: string
    tipo: 'frase' | 'aprendizaje' | 'recurso' | 'libro'
    contenido: string
    fuente: string | null
    favorito: boolean
    fecha: string | null
    created_at: string
}

export function WisdomLibrary() {
    const { user } = useAuth()
    const [entries, setEntries] = useState<WisdomEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState<'all' | 'frase' | 'aprendizaje' | 'recurso' | 'libro'>('all')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [tipo, setTipo] = useState<'frase' | 'aprendizaje' | 'recurso' | 'libro'>('frase')
    const [contenido, setContenido] = useState('')
    const [fuente, setFuente] = useState('')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

    const fetchEntries = async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('wisdom_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setEntries(data as WisdomEntry[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchEntries()
    }, [user])

    const handleSubmit = async () => {
        if (!contenido.trim() || !user) return

        setSaving(true)
        setError('')

        const { error } = await supabase
            .from('wisdom_entries')
            .insert({
                user_id: user.id,
                tipo,
                contenido,
                fuente: fuente || null,
                fecha: fecha || null
            })

        if (error) {
            setError(error.message)
        } else {
            setContenido('')
            setFuente('')
            setFecha(new Date().toISOString().split('T')[0])
            setShowForm(false)
            fetchEntries()
        }
        setSaving(false)
    }

    const toggleFavorite = async (id: string, current: boolean) => {
        await supabase
            .from('wisdom_entries')
            .update({ favorito: !current })
            .eq('id', id)

        fetchEntries()
    }

    const deleteEntry = async (id: string) => {
        await supabase
            .from('wisdom_entries')
            .delete()
            .eq('id', id)

        fetchEntries()
    }

    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(e => e.tipo === filter)

    const tipoIcons = {
        frase: <Quote className="w-4 h-4" />,
        aprendizaje: <Lightbulb className="w-4 h-4" />,
        recurso: <Link className="w-4 h-4" />,
        libro: <Book className="w-4 h-4" />
    }

    const tipoColors = {
        frase: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        aprendizaje: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        recurso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        libro: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-purple-500" />
                        Biblioteca de Sabiduría
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Tus frases, aprendizajes, libros y recursos
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Agregar
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'Todos' },
                    { key: 'frase', label: '💬 Frases' },
                    { key: 'aprendizaje', label: '💡 Aprendizajes' },
                    { key: 'libro', label: '📚 Libros' },
                    { key: 'recurso', label: '🔗 Recursos' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${filter === f.key
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-slide-up">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Nueva Entrada</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Tipo</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['frase', 'aprendizaje', 'libro', 'recurso'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTipo(t)}
                                            className={`py-2 rounded-xl font-medium capitalize transition-all text-sm ${tipo === t
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contenido *</label>
                                <textarea
                                    value={contenido}
                                    onChange={(e) => setContenido(e.target.value)}
                                    placeholder={
                                        tipo === 'frase' ? '"La frase inspiradora..."' :
                                            tipo === 'recurso' ? 'https://...' :
                                                tipo === 'libro' ? 'Título del libro y reflexión...' :
                                                    'Lo que aprendí...'
                                    }
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white h-32 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    {tipo === 'libro' ? 'Autor' : 'Fuente'} (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={fuente}
                                    onChange={(e) => setFuente(e.target.value)}
                                    placeholder={tipo === 'libro' ? 'Autor del libro' : 'Autor, libro, podcast...'}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowForm(false); setError('') }}
                                className="flex-1 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 py-2 bg-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entries List */}
            <div className="space-y-4">
                {filteredEntries.map(entry => (
                    <div
                        key={entry.id}
                        className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${tipoColors[entry.tipo]}`}>
                                        {tipoIcons[entry.tipo]}
                                        {entry.tipo}
                                    </span>
                                    {entry.fecha && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(entry.fecha)}
                                        </span>
                                    )}
                                    {entry.favorito && <Star className="w-4 h-4 text-gold-500 fill-gold-500" />}
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                    {entry.tipo === 'frase' && '"'}{entry.contenido}{entry.tipo === 'frase' && '"'}
                                </p>
                                {entry.fuente && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        — {entry.fuente}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => toggleFavorite(entry.id, entry.favorito)}
                                    className={`p-2 rounded-lg transition-colors ${entry.favorito
                                            ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-500'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gold-500'
                                        }`}
                                >
                                    <Star className={`w-4 h-4 ${entry.favorito ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredEntries.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay entradas en tu biblioteca</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-purple-500 font-medium hover:underline"
                        >
                            Agregar tu primera entrada
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
