/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                linkedin: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc8fb',
                    400: '#36aaf5',
                    500: '#0a66c2',
                    600: '#0959a5',
                    700: '#0c4a86',
                    800: '#103f6f',
                    900: '#13365c',
                },
                score: {
                    low: '#ef4444',
                    medium: '#f59e0b',
                    high: '#22c55e',
                    excellent: '#10b981',
                }
            },
            animation: {
                'score-up': 'scoreUp 0.5s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'level-up': 'levelUp 0.8s ease-out',
                'bounce-in': 'bounceIn 0.5s ease-out',
            },
            keyframes: {
                scoreUp: {
                    '0%': { transform: 'scale(1)', color: '#22c55e' },
                    '50%': { transform: 'scale(1.2)', color: '#10b981' },
                    '100%': { transform: 'scale(1)', color: 'inherit' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(10, 102, 194, 0.4)' },
                    '50%': { boxShadow: '0 0 0 10px rgba(10, 102, 194, 0)' },
                },
                levelUp: {
                    '0%': { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
                    '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: 1 },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: 0 },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
            },
        },
    },
    plugins: [],
}
