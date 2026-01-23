import { useState } from 'react'
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

function AppContent() {
    const { user, profile, loading, profileLoading, profileError, retryLoadProfile } = useAuth()
    const [currentView, setCurrentView] = useState<ViewType>('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [coachOpen, setCoachOpen] = useState(false)

    // Loading state
    if (loading) {
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
    if (!user) {
        return <LoginForm />
    }

    // Profile is still loading
    if (profileLoading) {
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

    // Profile failed to load - show error with retry option
    if (profileError || (!profile && user)) {
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
                        {profileError || 'No se pudo cargar tu información. Por favor, intenta de nuevo.'}
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
                    </div>
                </div>
            </div>
        )
    }

    // Onboarding not completed - only show if we have a profile AND onboarding is explicitly false
    if (profile && profile.onboarding_completed === false) {
        return (
            <OnboardingFlow
                onComplete={() => {
                    // Profile will be updated, causing re-render
                    window.location.reload()
                }}
            />
        )
    }

    // Main app
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
                </main>
            </div>

            <CoachModal
                isOpen={coachOpen}
                onClose={() => setCoachOpen(false)}
            />
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
