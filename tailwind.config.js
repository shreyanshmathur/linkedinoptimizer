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
                linkedin: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc5fb',
                    400: '#36a8f9',
                    500: '#0b8ce9',
                    600: '#0072c7',
                    700: '#005ba1',
                    800: '#004d87',
                    900: '#004070',
                },
                dark: {
                    900: '#0a0a0f',
                    800: '#13131f',
                    700: '#1c1c2e',
                },
                neon: {
                    blue: '#00f3ff',
                    purple: '#bc13fe',
                    pink: '#ff0055',
                },
                score: {
                    low: '#ef4444',
                    medium: '#f59e0b',
                    high: '#22c55e',
                    excellent: '#10b981',
                }
            },
            animation: {
                'blob': 'blob 7s infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'score-up': 'scoreUp 0.5s ease-out',
                'level-up': 'levelUp 0.8s ease-out',
                'bounce-in': 'bounceIn 0.5s ease-out',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)' },
                    '50%': { opacity: '.5', boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                scoreUp: {
                    '0%': { transform: 'scale(1)', color: '#22c55e' },
                    '50%': { transform: 'scale(1.2)', color: '#10b981' },
                    '100%': { transform: 'scale(1)', color: 'inherit' },
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
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                'glass-dark': 'linear-gradient(145deg, rgba(19, 19, 31, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)',
            }
        },
    },
    plugins: [],
}
