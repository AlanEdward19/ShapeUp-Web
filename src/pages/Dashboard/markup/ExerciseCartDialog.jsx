import { useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTrainingApi } from '../../../hooks/api/useTrainingApi';
import { useAuthorizationApi } from '../../../hooks/api/useAuthorizationApi';
import { readAllPages } from '../../../utils/readAllPages';

const copy = {
    'pt-BR': {
        title: (n) => `${n} ${n === 1 ? 'exercício selecionado' : 'exercícios selecionados'}`,
        subtitle: 'O que você quer fazer com eles?',
        create: 'Criar um treino novo',
        createHint: 'Abre o editor com os exercícios já adicionados.',
        edit: 'Editar um treino existente',
        editHint: 'Escolha o treino que vai receber os exercícios.',
        pickTitle: 'Escolha o treino',
        loading: 'Carregando seus treinos…',
        empty: 'Você ainda não tem treinos para editar.',
        error: 'Não foi possível carregar seus treinos.',
        back: 'Voltar',
        close: 'Fechar',
    },
    en: {
        title: (n) => `${n} ${n === 1 ? 'exercise selected' : 'exercises selected'}`,
        subtitle: 'What do you want to do with them?',
        create: 'Create a new workout',
        createHint: 'Opens the editor with the exercises already added.',
        edit: 'Edit an existing workout',
        editHint: 'Pick the workout that will receive the exercises.',
        pickTitle: 'Pick the workout',
        loading: 'Loading your workouts…',
        empty: 'You have no workouts to edit yet.',
        error: 'Could not load your workouts.',
        back: 'Back',
        close: 'Close',
    },
    es: {
        title: (n) => `${n} ${n === 1 ? 'ejercicio seleccionado' : 'ejercicios seleccionados'}`,
        subtitle: '¿Qué quieres hacer con ellos?',
        create: 'Crear un entrenamiento nuevo',
        createHint: 'Abre el editor con los ejercicios ya agregados.',
        edit: 'Editar un entrenamiento existente',
        editHint: 'Elige el entrenamiento que recibirá los ejercicios.',
        pickTitle: 'Elige el entrenamiento',
        loading: 'Cargando tus entrenamientos…',
        empty: 'Aún no tienes entrenamientos para editar.',
        error: 'No se pudieron cargar tus entrenamientos.',
        back: 'Volver',
        close: 'Cerrar',
    },
};

/** Step 2 of the library cart: which of my workouts (athlete) or templates (professional) gets the exercises. */
function useOwnWorkouts(enabled) {
    const { getWorkoutPlansByUser, getWorkoutTemplates } = useTrainingApi();
    const { getMe } = useAuthorizationApi();
    const professional = localStorage.getItem('shapeup_role') === 'professional';
    const [state, setState] = useState({ items: null, error: false });

    useEffect(() => {
        if (!enabled) return undefined;
        let active = true;
        const load = async () => {
            if (professional) {
                const response = await getWorkoutTemplates();
                const raw = Array.isArray(response) ? response : response?.data || response?.items || [];
                return raw.map((item) => ({ id: item.templateId ?? item.id, name: item.name }));
            }
            const me = await getMe();
            const userId = me.id || me.userId;
            const raw = await readAllPages((cursor) => getWorkoutPlansByUser(userId, cursor));
            return raw
                .filter((plan) => String(plan.createdByUserId) === String(userId))
                .map((plan) => ({ id: plan.planId ?? plan.id, name: plan.name }));
        };
        load()
            .then((items) => { if (active) setState({ items, error: false }); })
            .catch(() => { if (active) setState({ items: [], error: true }); });
        return () => { active = false; };
    }, [enabled, professional, getWorkoutPlansByUser, getWorkoutTemplates, getMe]);

    return state;
}

export default function ExerciseCartDialog({ count, onClose, onCreate, onEdit }) {
    const { language } = useLanguage();
    const c = copy[language] || copy['pt-BR'];
    const [step, setStep] = useState('choose');
    const { items, error } = useOwnWorkouts(step === 'pick');

    return (
        <div className="ex-dialog-overlay" onClick={onClose} data-testid="exercise-cart-dialog">
            <div className="ex-dialog" role="dialog" aria-modal="true" aria-label={c.title(count)} onClick={(event) => event.stopPropagation()}>
                <header>
                    <div>
                        <h2>{step === 'choose' ? c.title(count) : c.pickTitle}</h2>
                        {step === 'choose' && <p>{c.subtitle}</p>}
                    </div>
                    <button type="button" className="ex-dialog-close" onClick={onClose} aria-label={c.close}>×</button>
                </header>

                {step === 'choose' && (
                    <div className="ex-dialog-options">
                        <button type="button" onClick={onCreate} data-testid="cart-create">
                            <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
                            <span><strong>{c.create}</strong><small>{c.createHint}</small></span>
                        </button>
                        <button type="button" onClick={() => setStep('pick')} data-testid="cart-edit">
                            <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                            <span><strong>{c.edit}</strong><small>{c.editHint}</small></span>
                        </button>
                    </div>
                )}

                {step === 'pick' && (
                    <div className="ex-dialog-pick" data-testid="cart-pick">
                        {items === null && <p className="ex-dialog-muted">{c.loading}</p>}
                        {error && <p className="ex-dialog-muted" role="alert">{c.error}</p>}
                        {items && !error && items.length === 0 && <p className="ex-dialog-muted">{c.empty}</p>}
                        <ul>
                            {(items || []).map((item) => (
                                <li key={item.id}>
                                    <button type="button" onClick={() => onEdit(item.id)} data-testid={`cart-plan-${item.id}`}>
                                        <strong>{item.name}</strong>
                                        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="button" className="ex-dialog-back" onClick={() => setStep('choose')}>{c.back}</button>
                    </div>
                )}
            </div>
        </div>
    );
}
