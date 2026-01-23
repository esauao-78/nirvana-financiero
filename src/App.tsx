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
    const { user, profile, loading } = useAuth()
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

    // Onboarding not completed
    if (!profile?.onboarding_completed) {
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
