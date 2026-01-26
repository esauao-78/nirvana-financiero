import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import confetti from 'canvas-confetti'

interface GamificationContextType {
    addXp: (amount: number, source?: string) => Promise<void>
    addCoins: (amount: number) => Promise<void>
    spendCoins: (amount: number) => Promise<boolean>
    levelProgress: number
    xpForNextLevel: number
    showLevelUpAnimation: boolean
    closeLevelUp: () => void
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: ReactNode }) {
    const { profile, updateProfile } = useAuth()
    const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)
    const [xpForNextLevel, setXpForNextLevel] = useState(1000)
    const [levelProgress, setLevelProgress] = useState(0)

    // Calculate level progress
    useEffect(() => {
        if (!profile) return

        const currentLevel = profile.level || 1
        const currentXp = profile.xp || 0

        // Formula: Level 1 requires 1000 XP. Level 2 requires 2000 XP...
        // Total XP validation is simplified here. We assume 'xp' is current progress towards next level? 
        // Or 'xp' is total accumulated. Let's assume 'xp' is TOTAL accumulated for simplicity in this iteration, 
        // BUT usually games have "XP for this level".
        // Let's stick to the database Schema: "xp" is a column.

        // Let's define: XP resets on Level Up? Or Cumulative?
        // Cumulative is easier to track "Total Life Score".
        // Let's say: Level N requires (N * 1000) XP to reach Level N+1 (Relative? No, let's do Cumulative thresholds).
        // Formula: XP = 500 * (Level^2 - Level) ... standard RPG curve.

        // Simpler approach for this app:
        // Each level needs (Level * 1000) XP. 
        // Example: 
        // Level 1 -> 2 needs 1000 XP.
        // Level 2 -> 3 needs 2000 XP (Total 3000).

        const nextLevelXpRequired = currentLevel * 1000
        setXpForNextLevel(nextLevelXpRequired)

        // Calculate progress percentage based on "XP into this level"
        // THIS IS TRICKY if we only store TOTAL XP.
        // Let's assume `xp` in DB is "Current XP in this level" to make it simple?
        // OR better: XP in DB is TOTAL.
        // If XP is TOTAL:
        // Level 1: 0 - 1000
        // Level 2: 1000 - 3000 (Range 2000)

        // Let's just USE 'xp' as "Current XP towards next level" and reset it on level up.
        // This is easier for the user to understand: "I have 500/1000 XP".

        setLevelProgress((currentXp / nextLevelXpRequired) * 100)

    }, [profile])

    const addXp = useCallback(async (amount: number, source?: string) => {
        if (!profile) return

        const currentXp = profile.xp || 0
        const currentLevel = profile.level || 1
        const nextLevelXp = currentLevel * 1000

        let newXp = currentXp + amount
        let newLevel = currentLevel
        let levelUp = false

        // Check for Level Up
        if (newXp >= nextLevelXp) {
            newXp = newXp - nextLevelXp // Carry over excess XP
            newLevel = currentLevel + 1
            levelUp = true
        }

        // Optimistic Update
        const updates = {
            xp: newXp,
            level: newLevel
        }

        // If level up, maybe give bonus coins?
        if (levelUp) {
            updates['coins'] = (profile.coins || 0) + 100 // Bonus coins
            setShowLevelUpAnimation(true)
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
        }

        await updateProfile(updates)

    }, [profile, updateProfile])

    const addCoins = useCallback(async (amount: number) => {
        if (!profile) return
        const currentCoins = profile.coins || 0
        await updateProfile({ coins: currentCoins + amount })
    }, [profile, updateProfile])

    const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
        if (!profile) return false
        const currentCoins = profile.coins || 0

        if (currentCoins < amount) {
            return false
        }

        await updateProfile({ coins: currentCoins - amount })
        return true
    }, [profile, updateProfile])

    return (
        <GamificationContext.Provider value={{
            addXp,
            addCoins,
            spendCoins,
            levelProgress,
            xpForNextLevel,
            showLevelUpAnimation,
            closeLevelUp: () => setShowLevelUpAnimation(false)
        }}>
            {children}
        </GamificationContext.Provider>
    )
}

export function useGamification() {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
