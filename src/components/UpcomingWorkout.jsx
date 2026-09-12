import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Dumbbell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { flattenBlockExercises } from '../utils/trainingNormalization';

export default function UpcomingWorkout() {
    const { language } = useLanguage();
    const pt = language === 'pt-BR';
    const [plans] = useState(() => {
        try { const value = JSON.parse(localStorage.getItem(`shapeup_client_plans_${localStorage.getItem('shapeup_client_id') || 1}`) || '[]'); return Array.isArray(value) ? value : []; }
        catch { return []; }
    });
    const [index, setIndex] = useState(0);
    const plan = plans[index];
    const exercises = plan ? flattenBlockExercises(plan.blocks) : [];
    return <section className="su-upcoming-workout">
        <header><div><span className="su-nutrition-kicker">{pt ? 'Sua rotina de treino' : 'Your training routine'}</span><h2>{plan?.name || (pt ? 'Prepare sua próxima sessão' : 'Prepare your next session')}</h2></div><Link className="su-btn su-btn-primary" to="/dashboard/training"><Play size={15} />{pt ? 'Abrir meus treinos' : 'Open my workouts'}</Link></header>
        {plans.length > 1 && <nav aria-label={pt ? 'Planos de treino' : 'Training plans'}>{plans.map((item, i) => <button type="button" key={item.id || i} onClick={() => setIndex(i)} aria-pressed={i === index}>{item.name}</button>)}</nav>}
        {exercises.length ? <ol>{exercises.map((exercise, i) => <li key={exercise.id || i}><span className="su-workout-index">{String(i + 1).padStart(2, '0')}</span><div><strong>{exercise.name || exercise.exerciseName}</strong><p>{(exercise.muscles || []).map(muscle => typeof muscle === 'string' ? muscle : muscle.namePt || muscle.name).filter(Boolean).join(' · ')}</p></div><span className="su-workout-sets"><strong>{exercise.sets?.length || 0} {pt ? 'séries' : 'sets'} {exercise.sets?.[0]?.reps && `× ${exercise.sets[0].reps} reps`}</strong>{exercise.sets?.[0]?.load && <small>{pt ? 'Carga' : 'Load'}: {exercise.sets[0].load}</small>}</span></li>)}</ol> : <p className="su-upcoming-empty"><Dumbbell size={20} />{pt ? 'Acesse seus planos para selecionar uma sessão e registrar suas séries.' : 'Open your plans to select a session and log your sets.'}</p>}
    </section>;
}
