import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginForm } from './components/auth/LoginForm'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { Header } from './components/layout/Header'
import { Sidebar, ViewType } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { GoalsList } from './components/goals/GoalsList'
import { HabitTracker } from './components/habits/HabitTracker'
import { FinancesDashboard } from './components/finances/FinancesDashboard'
import { DailyCheckIn } from './components/diary/DailyCheckIn'
import { WisdomLibrary } from './components/library/WisdomLibrary'
import { StatsDashboard } from './components/statistics/StatsDashboard'
import { SettingsView } from './components/settings/SettingsView'
import { CoachModal } from './components/coach/CoachModal'
import { TasksList } from './components/tasks/TasksList'
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer'
import { IdentityEditor } from './components/identity/IdentityEditor'
import { RewardsShop } from './components/gamification/RewardsShop'
import { MotivationPopup } from './components/identity/MotivationPopup'

function AppContent() {
    const { profile, appState, errorMessage, retryLoadProfile, signOut } = useAuth()
    const [currentView, setCurrentView] = useState<ViewType>('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [coachOpen, setCoachOpen] = useState(false)
    const [motivationOpen, setMotivationOpen] = useState(false)

    // Loading state
    if (appState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 animate-pulse">
                        <span className="text-3xl">🎯</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        )
    }

    // Not logged in
    if (appState === 'unauthenticated') {
        return <LoginForm />
    }

    // Profile is loading
    if (appState === 'profile_loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 animate-pulse">
                        <span className="text-3xl">🎯</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Cargando tu perfil...</p>
                </div>
            </div>
        )
    }

    // Profile failed to load
    if (appState === 'profile_error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Error al cargar el perfil
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {errorMessage || 'No se pudo cargar tu información. Por favor, intenta de nuevo.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={retryLoadProfile}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-blue to-indigo-600 hover:shadow-lg transition-all"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Recargar página
                        </button>
                        <button
                            onClick={signOut}
                            className="w-full py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Onboarding not completed
    if (profile && profile.onboarding_completed === false) {
        return (
            <OnboardingFlow
                onComplete={() => {
                    window.location.reload()
                }}
            />
        )
    }

    // Main app (authenticated state)
    // Motivation Popup Logic
    /* useEffect(() => {
        // Show immediately on mount (if authenticated)
        setMotivationOpen(true)

        // Show every 30 minutes
        const interval = setInterval(() => {
            setMotivationOpen(true)
        }, 30 * 60 * 1000)

        return () => clearInterval(interval)
    }, []) */

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onOpenCoach={() => setCoachOpen(true)}
            />

            <div className="flex">
                <Sidebar
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="flex-1 min-h-[calc(100vh-73px)] overflow-y-auto">
                    {currentView === 'dashboard' && (
                        <Dashboard onEmergency={() => setCoachOpen(true)} />
                    )}
                    {currentView === 'metas' && <GoalsList />}
                    {currentView === 'tareas' && <TasksList />}
                    {currentView === 'rutina' && <HabitTracker />}
                    {currentView === 'pomodoro' && <PomodoroTimer />}
                    {currentView === 'diario' && <DailyCheckIn />}
                    {currentView === 'finanzas' && <FinancesDashboard />}
                    {currentView === 'biblioteca' && <WisdomLibrary />}
                    {currentView === 'estadisticas' && <StatsDashboard />}
                    {currentView === 'identidad' && <IdentityEditor />}
                    {currentView === 'settings' && <SettingsView />}
                    {currentView === 'tienda' && <RewardsShop />}
                </main>
            </div>

            {/* Floating Coach Button */}
            <button
                onClick={() => setCoachOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-brand-blue to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-40"
                title="Tu Coach IA"
            >
                <span className="text-2xl">🧠</span>
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Tu Coach IA
                </span>
            </button>

            <CoachModal
                isOpen={coachOpen}
                onClose={() => setCoachOpen(false)}
            />

            {/* <MotivationPopup
                isOpen={motivationOpen}
                onClose={() => setMotivationOpen(false)}
                palabraDelAño={profile?.palabra_del_año || ''}
                porQue={profile?.por_que || ''}
            /> */}
        </div>
    )
}

import { GamificationProvider } from './contexts/GamificationContext'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <GamificationProvider>
                    <AppContent />
                </GamificationProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
