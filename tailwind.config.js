/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#FBF7E4',
                    100: '#F5ECC0',
                    200: '#EBD88A',
                    300: '#E0C454',
                    400: '#D4AF37',
                    500: '#C9A227',
                    600: '#A6841F',
                    700: '#836618',
                    800: '#614B12',
                    900: '#3E300C',
                },
                brand: {
                    blue: '#1E3A8A',
                    gold: '#D4AF37',
                    red: '#DC2626',
                    green: '#10B981',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-in': 'bounce-in 0.5s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            keyframes: {
                'pulse-gold': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
                    '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
