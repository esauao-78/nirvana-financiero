import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface DateInputProps {
    value: string // Format: YYYY-MM-DD (internal)
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function DateInput({ value, onChange, placeholder = 'dd/mm/aaaa', className = '' }: DateInputProps) {
    const [displayValue, setDisplayValue] = useState('')
    const hiddenInputRef = useRef<HTMLInputElement>(null)

    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    useEffect(() => {
        if (value) {
            const [year, month, day] = value.split('-')
            setDisplayValue(`${day}/${month}/${year}`)
        } else {
            setDisplayValue('')
        }
    }, [value])

    // Handle manual input in DD/MM/YYYY format
    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^\d/]/g, '')

        // Auto-add slashes
        if (input.length === 2 && !input.includes('/')) {
            input += '/'
        } else if (input.length === 5 && input.split('/').length === 2) {
            input += '/'
        }

        // Limit to DD/MM/YYYY format
        if (input.length <= 10) {
            setDisplayValue(input)
        }

        // If complete date, convert to YYYY-MM-DD
        if (input.length === 10) {
            const parts = input.split('/')
            if (parts.length === 3) {
                const [day, month, year] = parts
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                // Validate date
                const date = new Date(isoDate)
                if (!isNaN(date.getTime())) {
                    onChange(isoDate)
                }
            }
        }
    }

    // Open native date picker
    const openDatePicker = () => {
        hiddenInputRef.current?.showPicker?.()
        hiddenInputRef.current?.focus()
        hiddenInputRef.current?.click()
    }

    // Handle native date picker selection
    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    return (
        <div className="relative">
            <input
                type="text"
                value={displayValue}
                onChange={handleDisplayChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white ${className}`}
            />
            <button
                type="button"
                onClick={openDatePicker}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-brand-blue rounded-lg transition-colors"
            >
                <Calendar className="w-4 h-4" />
            </button>
            <input
                ref={hiddenInputRef}
                type="date"
                value={value}
                onChange={handleNativeChange}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
            />
        </div>
    )
}
