import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, Sun, Moon, MessageCircle, LogOut, X } from 'lucide-react'

interface HeaderProps {
    sidebarOpen: boolean
    onToggleSidebar: () => void
    onOpenCoach: () => void
}

export function Header({ sidebarOpen, onToggleSidebar, onOpenCoach }: HeaderProps) {
    const { darkMode, toggleDarkMode } = useTheme()
    const { signOut, profile } = useAuth()

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
            <div className="px-4 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6 dark:text-white" />
                        ) : (
                            <Menu className="w-6 h-6 dark:text-white" />
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <h1 className="text-lg md:text-xl font-bold gradient-text hidden sm:block">
                            Juega Tu Propio Juego
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Coach Button */}
                    <button
                        onClick={onOpenCoach}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-gold-400 to-gold-500 hover:shadow-lg transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden md:inline">Rodrigo IA</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* Profile & Logout */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium dark:text-white truncate max-w-[120px]">
                                {profile?.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {profile?.alter_ego || 'Jugador'}
                            </p>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
