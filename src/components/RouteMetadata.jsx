import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SeoHead from './SeoHead';

const titles = {
  login: ['Entrar', 'Sign in', 'Iniciar sesión'],
  register: ['Criar conta', 'Create account', 'Crear cuenta'],
  'forgot-password': ['Recuperar senha', 'Recover password', 'Recuperar contraseña'],
  'reset-password': ['Redefinir senha', 'Reset password', 'Restablecer contraseña'],
  dashboard: ['Visão geral', 'Overview', 'Resumen'],
  onboarding: ['Configurar perfil', 'Set up profile', 'Configurar perfil'],
  training: ['Planos de treino', 'Training plans', 'Planes de entrenamiento'],
  clients: ['Alunos', 'Clients', 'Alumnos'],
  exercises: ['Exercícios', 'Exercises', 'Ejercicios'],
  feedback: ['Feedback', 'Feedback', 'Comentarios'],
  analytics: ['Análises', 'Analytics', 'Análisis'],
  reports: ['Relatórios', 'Reports', 'Informes'],
  settings: ['Configurações', 'Settings', 'Configuración'],
  objectives: ['Objetivos', 'Goals', 'Objetivos'],
  nutrition: ['Nutrição', 'Nutrition', 'Nutrición'],
  admin: ['Administração', 'Administration', 'Administración'],
  staff: ['Equipe', 'Staff', 'Equipo'],
  turnstile: ['Controle de acesso', 'Access control', 'Control de acceso'],
  financial: ['Financeiro', 'Finance', 'Finanzas'],
  messages: ['Mensagens', 'Messages', 'Mensajes'],
  gyms: ['Academias', 'Gyms', 'Gimnasios'],
};

export default function RouteMetadata() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  // These pages supply their own localized SEO metadata.
  if (['/', '/privacy', '/terms'].includes(pathname)) return null;
  const parts = pathname.split('/').filter(Boolean);
  const key = pathname === '/__/auth/action' ? 'reset-password' : parts[0] === 'dashboard' ? parts[1] || 'dashboard' : parts[0];
  const title = (titles[key] || ['Página não encontrada', 'Page not found', 'Página no encontrada'])[['pt-BR', 'en', 'es'].indexOf(language)];
  return <SeoHead title={title} path={pathname} noIndex />;
}
