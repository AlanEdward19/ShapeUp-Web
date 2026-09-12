import { ShieldCheck, Cloud, Dumbbell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function WorkspaceIntro() {
    const { language } = useLanguage();
    const pt = language === 'pt-BR';
    return <aside className="su-workspace-intro">
        <span className="su-intro-status"><span /> ShapeUp Workspace</span>
        <h2>{pt ? 'Workspace de Performance Atlética' : 'Your athletic performance workspace'}</h2>
        <p>{pt ? 'Prescrição, periodização e acompanhamento em um só lugar. Mais clareza para cada etapa da sua evolução.' : 'Training plans, periodization and progress in one place. More clarity at every stage of your journey.'}</p>
        <div className="su-intro-feature"><ShieldCheck size={21} /><div><strong>{pt ? 'Criptografia e proteção de dados' : 'Your personal account'}</strong><p>{pt ? 'Entre com seu e-mail ou sua conta Google para acessar seu perfil.' : 'Sign in with your email or Google account to access your profile.'}</p></div></div>
        <div className="su-intro-feature"><Cloud size={21} /><div><strong>{pt ? 'Sincronização contínua em nuvem' : 'Your connected routine'}</strong><p>{pt ? 'Treinos, registros e acompanhamento organizados no mesmo workspace.' : 'Keep workouts, logs and coaching together in one workspace.'}</p></div></div>
        <footer><Dumbbell size={16} /> {pt ? 'Consistência em cada sessão.' : 'Consistency in every session.'}</footer>
    </aside>;
}
