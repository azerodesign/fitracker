/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)', // Vibrant Blue
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
                secondary: {
                    50: 'var(--color-secondary-50)',
                    100: 'var(--color-secondary-100)',
                    200: 'var(--color-secondary-200)',
                    300: 'var(--color-secondary-300)',
                    400: 'var(--color-secondary-400)',
                    500: 'var(--color-secondary-500)',
                    600: 'var(--color-secondary-600)',
                    700: 'var(--color-secondary-700)',
                    800: 'var(--color-secondary-800)',
                    900: 'var(--color-secondary-900)',
                },
                // Semantic Colors (New System)
                'bg-main': 'var(--color-bg-main)',
                'bg-card': 'var(--color-bg-card)',
                'text-base': 'var(--color-text-base)',
                'text-muted': 'var(--color-text-muted)',
                'border-dim': 'var(--color-border-dim)',

                // Compatibility / Derived
                'bg-surface': 'var(--color-bg-card)',
                'text-dim': 'var(--color-text-muted)',
                'border-subtle': 'var(--color-border-dim)',

                // Legacy Aliases (mapped to new vars via CSS)
                'app-bg': 'var(--color-app-bg)',
                surface: 'var(--color-surface)',
                'surface-hover': 'var(--color-surface-hover)',
                'text-main': 'var(--color-text-main)',
                'text-muted': 'var(--color-text-muted)',
                border: 'var(--color-border)',

                success: 'var(--color-success)',
                danger: 'var(--color-danger)',
                warning: 'var(--color-warning)',
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                'pill': '9999px', // Fully rounded
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // Simpler soft shadow
                'soft-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08)', // Simpler hover shadow
                'inner-light': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.5)', // Simpler highlight
            }
        },
    },
    plugins: [],
}
