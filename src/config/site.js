export const SITE_NAME = 'ShapeUp'
export const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || 'https://shapeup.app').replace(/\/$/, '')
export const SITE_DESCRIPTION = {
  en: 'Log workouts, track adherence, and see real progress. Built for athletes, coaches, and gyms.',
  'pt-BR': 'Registre treinos, acompanhe aderência e veja progresso real. Para atletas, treinadores e academias.',
  es: 'Registra entrenamientos, sigue la adherencia y ve el progreso real. Para atletas, entrenadores y gimnasios.',
}

export const publicPaths = ['/', '/login', '/register', '/privacy', '/terms', '/forgot-password']
