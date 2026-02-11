import { useEffect } from 'react'
import { Sparkles, X, Target } from 'lucide-react'

interface MotivationPopupProps {
    isOpen: boolean
    onClose: () => void
    palabraDelAño: string
    porQue: string
}

export function MotivationPopup({ isOpen, onClose, palabraDelAño, porQue }: MotivationPopupProps) {
    useEffect(() => {
        if (isOpen) {
            // Play a subtle sound? Maybe later.
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-lg relative overflow-hidden shadow-2xl border border-gold-500/30 animate-scale-up">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-orange-500 to-red-500" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-8 py-4">
                    {/* Header Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-50 dark:bg-gold-900/20 mb-2 ring-4 ring-gold-100 dark:ring-gold-900/10">
                        <Sparkles className="w-10 h-10 text-gold-500 animate-pulse" />
                    </div>

                    {/* Word of the Year */}
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                            TU PALABRA DEL AÑO
                        </p>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-orange-600 drop-shadow-sm uppercase tracking-tight">
                            {palabraDelAño || "ENFOQUE"}
                        </h2>
                    </div>

                    {/* The Why */}
                    {porQue && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Tu Por Qué
                            </div>
                            <p className="text-lg text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                                "{porQue}"
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-gold-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-gold-500/30 hover:shadow-xl hover:scale-[1.02] transition-all transform active:scale-95"
                    >
                        Continuar con Propósito
                    </button>
                </div>
            </div>
        </div>
    )
}
