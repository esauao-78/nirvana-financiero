import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Moon, Sun, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
    const { signIn, signUp } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()

    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (isRegistering) {
            const { error } = await signUp(email, password, name)
            if (error) {
                setError(error.message)
            }
        } else {
            const { error } = await signIn(email, password)
            if (error) {
                setError(error.message)
            }
        }

        setLoading(false)
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                className="absolute top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
                {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-600 group-hover:-rotate-12 transition-transform" />
                )}
            </button>

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in border border-gray-100 dark:border-gray-700">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 shadow-lg">
                        <span className="text-3xl">🎯</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 gradient-text">
                        Juega Tu Propio Juego
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Alcanza el Nirvana Financiero
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-slide-up">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="relative animate-slide-up">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-colors"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-gold-400 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-brand-blue/90 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                                <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                                <div className="w-2 h-2 bg-white rounded-full loading-dot" />
                            </div>
                        ) : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </button>
                </form>



                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering)
                            setError('')
                        }}
                        className="ml-2 font-semibold text-gold-500 hover:text-gold-600 transition-colors"
                    >
                        {isRegistering ? 'Inicia sesión' : 'Regístrate'}
                    </button>
                </p>
            </div>
        </div>
    )
}
