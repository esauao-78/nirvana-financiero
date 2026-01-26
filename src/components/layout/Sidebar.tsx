import {
    BarChart3,
    Target,
    CheckSquare,
    DollarSign,
    BookOpen,
    TrendingUp,
    Settings,
    Heart,
    ListTodo,
    Timer,
    User,
    ShoppingBag,
    Trophy
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useGamification } from '../../contexts/GamificationContext'

export type ViewType = 'dashboard' | 'metas' | 'tareas' | 'rutina' | 'pomodoro' | 'finanzas' | 'diario' | 'biblioteca' | 'estadisticas' | 'identidad' | 'settings' | 'tienda'

interface SidebarProps {
    currentView: ViewType
    onNavigate: (view: ViewType) => void
    isOpen: boolean
    onClose: () => void
}

const menuItems: Array<{ id: ViewType; icon: React.ElementType; label: string; color: string }> = [
    { id: 'dashboard', icon: BarChart3, label: 'Inicio', color: 'text-blue-500' },
    { id: 'metas', icon: Target, label: 'Mis Metas', color: 'text-gold-500' },
    { id: 'tareas', icon: ListTodo, label: 'Tareas', color: 'text-indigo-500' },
    { id: 'rutina', icon: CheckSquare, label: 'Rutina Diaria', color: 'text-green-500' },
    { id: 'pomodoro', icon: Timer, label: 'Pomodoro', color: 'text-red-500' },
    { id: 'diario', icon: Heart, label: 'Diario de Conciencia', color: 'text-pink-500' },
    { id: 'finanzas', icon: DollarSign, label: 'Finanzas', color: 'text-emerald-500' },
    { id: 'biblioteca', icon: BookOpen, label: 'Biblioteca', color: 'text-purple-500' },
    { id: 'estadisticas', icon: TrendingUp, label: 'Estadísticas', color: 'text-orange-500' },
    { id: 'tienda', icon: ShoppingBag, label: 'Tienda de Recompensas', color: 'text-teal-500' },
    { id: 'identidad', icon: User, label: 'Mi Identidad', color: 'text-gold-500' },
    { id: 'settings', icon: Settings, label: 'Configuración', color: 'text-gray-500' },
]

export function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
    const { profile } = useAuth()
    const { levelProgress } = useGamification()

    const handleNavigate = (view: ViewType) => {
        onNavigate(view)
        onClose()
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-[73px] h-[calc(100vh-73px)] w-64 
          bg-white dark:bg-gray-800 border-r dark:border-gray-700 
          transition-transform duration-300 z-40 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Character Stats Card */}
                {profile && (
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-sm">
                                {profile.level || 1}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    Nivel {profile.level || 1}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                    <Trophy className="w-3 h-3" />
                                    {profile.coins || 0} monedas
                                </div>
                            </div>
                        </div>
                        {/* XP Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
                            />
                        </div>
                        <p className="text-right text-[10px] text-gray-400 mt-1">
                            {profile.xp || 0} XP
                        </p>
                    </div>
                )}

                <nav className="p-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${currentView === item.id
                                    ? 'bg-gradient-to-r from-brand-blue/10 to-indigo-500/10 dark:from-brand-blue/20 dark:to-indigo-500/20 font-semibold'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
              `}
                        >
                            <item.icon
                                className={`w-5 h-5 ${currentView === item.id ? item.color : 'text-gray-500 dark:text-gray-400'}`}
                            />
                            <span className={`${currentView === item.id ? 'text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {item.label}
                            </span>
                            {currentView === item.id && (
                                <div className="ml-auto w-1.5 h-6 bg-brand-blue rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

            </aside>
        </>
    )
}
