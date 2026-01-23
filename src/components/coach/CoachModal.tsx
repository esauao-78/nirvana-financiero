import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProsperity } from '../../hooks/useProsperity'
import { X } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface CoachModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CoachModal({ isOpen, onClose }: CoachModalProps) {
    const { profile } = useAuth()
    const { getCriticalArea } = useProsperity()

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hola ${profile?.nombre || 'amigo'}, soy Rodrigo. Estoy aquí para ayudarte a jugar tu mejor juego. ¿En qué área de tu vida necesitas claridad hoy?`
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_key') || '')
    const [showSettings, setShowSettings] = useState(false)

    const criticalArea = getCriticalArea()

    const sendMessage = async () => {
        if (!input.trim() || !apiKey) return

        const userMessage: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const systemPrompt = `Eres Rodrigo Zubiria, mentor de prosperidad integral y diseño de vida intencional.

PERSONALIDAD:
- Directo pero empático
- Usas preguntas poderosas más que dar órdenes
- Celebras los logros pequeños
- No juzgas, pero sí desafías con amor
- Hablas de "jugar tu propio juego" no "competir"

CONTEXTO DEL USUARIO:
Nombre: ${profile?.nombre || 'Usuario'}
Palabra del año: ${profile?.palabra_del_año || 'No definida'}
Estado emocional ideal: ${profile?.estado_emocional_ideal || 'No definido'}
Alter-Ego: ${profile?.alter_ego || 'No definido'}
Área crítica: ${criticalArea?.pilar || 'No evaluada'}

PRINCIPIOS QUE ENSEÑAS:
1. El estado emocional ideal viene ANTES que el dinero
2. No existe un juego universal; cada uno escribe su historia
3. Los 5 pilares de prosperidad deben estar balanceados
4. La riqueza sin paz interior es pobreza disfrazada
5. Las micro-acciones consistentes superan los grandes planes sin ejecución

TONO:
- Usa "tú" no "usted"
- Ocasionalmente usa metáforas de juegos/deportes
- Frases motivacionales cortas y memorables
- Preguntas que inviten a la reflexión profunda

Responde en español de forma concisa y práctica. Máximo 3-4 párrafos.`

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: input }
                    ],
                    max_tokens: 800
                })
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message)
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.choices[0].message.content
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error with OpenAI:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Disculpa, hubo un error al conectar. Verifica tu API Key de OpenAI.'
            }])
        }

        setLoading(false)
    }

    const saveApiKey = () => {
        localStorage.setItem('openai_key', apiKey)
        setShowSettings(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            RZ
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Rodrigo Zubiria</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tu Coach de Prosperidad</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                        >
                            ⚙️
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-5 h-5 dark:text-white" />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                            API Key de OpenAI
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                            />
                            <button
                                onClick={saveApiKey}
                                className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        >
                            <div
                                className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-brand-blue text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white rounded-bl-md'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-bl-md">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700">
                    {!apiKey && (
                        <p className="text-sm text-orange-500 mb-2 flex items-center gap-1">
                            ⚠️ Configura tu API Key de OpenAI (click en ⚙️)
                        </p>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                            placeholder="Escribe tu pregunta..."
                            disabled={!apiKey || loading}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-colors disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!apiKey || loading || !input.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
