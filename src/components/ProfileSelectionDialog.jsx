import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Dumbbell, Building2, User, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useDialogFocus from '../hooks/useDialogFocus';
import ProfileAvatar from './ProfileAvatar';
import './ProfileSelectionDialog.css';

const copy = {
    'pt-BR': {
        title: 'Como você quer entrar?',
        subtitle: 'Sua conta tem mais de um perfil. Escolha um para continuar.',
        other: 'Usar outra conta',
        roles: {
            Trainer: ['Personal trainer', 'Alunos, treinos e planos de atendimento'],
            GymOwner: ['Academia', 'Equipe, alunos e financeiro'],
            IndependentClient: ['Treino próprio', 'Seus treinos e sua nutrição, sem profissional'],
            Client: ['Aluno', 'Treinos prescritos pelo seu profissional'],
            GymClient: ['Aluno da academia', 'Treinos e acesso da sua academia'],
        },
    },
    en: {
        title: 'How do you want to continue?',
        subtitle: 'Your account has more than one profile. Pick one to continue.',
        other: 'Use another account',
        roles: {
            Trainer: ['Personal trainer', 'Clients, workouts and service plans'],
            GymOwner: ['Gym', 'Staff, members and finances'],
            IndependentClient: ['Self-coached', 'Your own training and nutrition'],
            Client: ['Client', 'Workouts prescribed by your coach'],
            GymClient: ['Gym member', 'Workouts and access from your gym'],
        },
    },
    es: {
        title: '¿Cómo quieres continuar?',
        subtitle: 'Tu cuenta tiene más de un perfil. Elige uno para continuar.',
        other: 'Usar otra cuenta',
        roles: {
            Trainer: ['Entrenador personal', 'Alumnos, entrenamientos y planes'],
            GymOwner: ['Gimnasio', 'Equipo, alumnos y finanzas'],
            IndependentClient: ['Entrenamiento propio', 'Tu entrenamiento y nutrición'],
            Client: ['Alumno', 'Entrenamientos de tu profesional'],
            GymClient: ['Socio del gimnasio', 'Entrenamientos y acceso de tu gimnasio'],
        },
    },
};

const icons = {
    Trainer: Dumbbell,
    GymOwner: Building2,
    IndependentClient: User,
    Client: Users,
    GymClient: Users,
};

/**
 * Sheet shown after a successful sign-in when the account has several profiles.
 * Lives outside the login shell so it follows the app theme and stays reusable.
 */
export default function ProfileSelectionDialog({ roles, user, busyIndex, onSelect, onCancel }) {
    const { language } = useLanguage();
    const text = copy[language] || copy['pt-BR'];
    const ref = useDialogFocus(roles.length > 0, onCancel);
    if (!roles.length) return null;
    const name = user?.displayName || user?.email || '';

    return createPortal(
        <div className="su-profile-backdrop" role="presentation">
            <div
                ref={ref}
                className="su-profile-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="su-profile-title"
            >
                <ProfileAvatar name={name} photo={user?.photoURL} size={56} className="su-profile-avatar" />
                <h2 id="su-profile-title">{text.title}</h2>
                <p className="su-profile-subtitle">{text.subtitle}</p>
                <ul className="su-profile-list">
                    {roles.map((roleObj, index) => {
                        const [label, hint] = text.roles[roleObj.role] || [roleObj.role, ''];
                        const Icon = icons[roleObj.role] || User;
                        return (
                            <li key={`${roleObj.role}-${index}`}>
                                <button
                                    type="button"
                                    className="su-profile-option"
                                    data-busy={busyIndex === index || undefined}
                                    disabled={busyIndex !== null && busyIndex !== index}
                                    onClick={() => onSelect(roleObj, index)}
                                >
                                    <span className="su-profile-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.9} /></span>
                                    <span className="su-profile-copy">
                                        <strong>{label}</strong>
                                        <small>{hint}</small>
                                    </span>
                                    <ChevronRight size={20} aria-hidden="true" className="su-profile-chevron" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <button type="button" className="su-profile-cancel" onClick={onCancel} disabled={busyIndex !== null}>
                    {text.other}
                </button>
            </div>
        </div>,
        document.body,
    );
}
