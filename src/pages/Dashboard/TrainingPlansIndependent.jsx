import WeekdayChips from '../../components/training/WeekdayChips';
import { readAllPages } from '../../utils/readAllPages';
import { workoutHistory } from '../../utils/workoutHistory';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTour } from '../../components/tour/useShadowAwareTour';
import Button from '../../components/Button';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlanEditor, SessionDetailModal } from './ClientDetail';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { enqueueMutation } from '../../services/mutationQueue';
import { generateObjectId } from '../../utils/objectId';
import { flattenBlockExercises, normalizePlan } from '../../utils/trainingNormalization';
import { buildWorkoutPlanBody, findTimeBasedDurationError } from '../../utils/workoutPlanPayload';
import { enrichExercisesFromCatalog } from '../../utils/workoutStatePayload';
import { useExercises } from '../../hooks/useExercises';
import WorkoutBodyMap from '../../components/anatomy/WorkoutBodyMap';
import './TrainingPlansClient.css';
import './TrainingPlansProfessional.css';

// eslint-disable-next-line react-refresh/only-export-components -- body builder is tested without mounting the page
export { buildWorkoutPlanBody };

/** Workouts are executed in the mobile app; the web creates, organises and reviews them. */
const appNotes = {
    'pt-BR': 'Os treinos são executados no app ShapeUp. Aqui você cria, organiza e revisa o histórico.',
    en: 'Workouts are run in the ShapeUp app. Here you create, organise and review your history.',
    es: 'Los entrenamientos se realizan en la app ShapeUp. Aquí creas, organizas y revisas tu historial.',
};

const IndependentPlanCard = ({ plan, onEdit, onCopy, onDelete, owned, catalog = [] }) => {
    const { t } = useLanguage();
    const mapExercises = enrichExercisesFromCatalog(flattenBlockExercises(plan.blocks), catalog);
    return (
        <div className="su-independent-plan-card">
            <div className="su-plan-card-body">
                <div className="su-plan-card-main">
                    {plan.phase ? <span className="su-phase-badge">{plan.phase}</span> : null}
                    <h2 className="su-plan-display-name">{plan.name}</h2>
                    <p className="su-plan-display-meta">
                        {t('pro.builder.diff')}: <strong>{t(`pro.builder.diff.${plan.difficulty?.toLowerCase()}`) || plan.difficulty}</strong> · {plan.weeks} {t('pro.client.plan.weeks')}
                    </p>
                    <div className="su-ex-count-badge">
                        <span>{mapExercises.length} {t('pro.client.plan.exercises')}</span>
                    </div>
                    <WeekdayChips days={plan.assignedWeekdays} />
                </div>
                <div className="su-plan-card-map">
                    <WorkoutBodyMap exercises={mapExercises} compact />
                </div>
                <div className="su-plan-card-side">
                    <div className="su-plan-tiny-actions">
                        {owned && <button onClick={() => onEdit(plan)} title={t('pro.client.plan.btn.edit')}>{t('pro.client.plan.btn.edit')}</button>}
                        <button onClick={() => onCopy(plan)} title={t('pro.client.plan.btn.copy')}>{t('pro.client.plan.btn.copy')}</button>
                        {owned && <button onClick={() => onDelete(plan)} title={t('independent.builder.btn.delete')} className="delete">{t('independent.builder.btn.delete')}</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrainingPlansIndependent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const appNote = appNotes[language] || appNotes['pt-BR'];
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const { getWorkoutPlansByUser, getWorkoutsByUser } = useTrainingApi();
    const { getMe } = useAuthorizationApi();
    const { exercises: exercisesDB } = useExercises();

    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [userId, setUserId] = useState(null);
    const [planError, setPlanError] = useState(false);
    const ownPlan = plan => userId != null && String(plan.createdByUserId) === String(userId);
    const [editingPlan, setEditingPlan] = useState(null);
    const originText = language === 'en' ? ['Created by me','From my trainer','Other assigned workouts','You can create your own workouts. Workouts from your trainer stay separate.','Loading workouts…','Could not load your workouts.'] : language === 'es' ? ['Creados por mí','De mi entrenador','Otros entrenamientos asignados','Puedes crear tus propios entrenamientos. Los de tu entrenador se mantienen separados.','Cargando entrenamientos…','No se pudieron cargar tus entrenamientos.'] : ['Criados por mim','Do meu treinador','Outros treinos atribuídos','Você pode criar seus próprios treinos. Os treinos do seu treinador ficam separados.','Carregando treinos…','Não foi possível carregar seus treinos.'];
    const [showSessionDetail, setShowSessionDetail] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const [historyPage] = useState(1);
    const HISTORY_PER_PAGE = 5;
    useEffect(() => {
        if (!location.state?.create) return;
        const exercise = location.state.exercise;
        setEditingPlan({ id: `p${Date.now()}`, name: 'Novo plano de treino', phase: 'Hypertrophy', difficulty: 'Intermediate', weeks: 6, active: false, notes: '', history: [], blocks: exercise ? [{ id: `b${Date.now()}`, type: 'straight', exercises: [{ ...exercise, exerciseId: exercise.id, id: `e${Date.now()}`, notes: '', sets: [{ type: 'working', technique: 'Straight', reps: '8-10', load: '', intensityType: 'rpe', intensityValue: '8', rest: '90' }] }] }] : [] });
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state, location.pathname, navigate]);


    // Fetch plans from API on mount
    useEffect(() => {
        const fetchPlans = async () => {
            let fetchedUserId = null;
            try {
                setLoadingPlans(true);

                // 1. Get real User ID from getMe
                console.log('TrainingPlansIndependent: Calling getMe()...');
                const me = await getMe();
                const userId = me.id || me.userId;

                if (!userId) {
                    console.warn('TrainingPlansIndependent: No valid user ID returned from getMe.');
                    setLoadingPlans(false);
                    return;
                }

                console.log('TrainingPlansIndependent: Fetching plans for user:', userId);
                fetchedUserId = userId;
                setUserId(userId);
                const [raw, sessions] = await Promise.all([readAllPages(cursor => getWorkoutPlansByUser(userId, cursor)), readAllPages(cursor => getWorkoutsByUser(userId, cursor))]);
                const history = sessions.filter(session => session.isCompleted || session.isCancelled).map(workoutHistory);
                const data = raw.map(p => ({...normalizePlan(p), history:history.filter(session=>String(session.workoutPlanId)===String(p.planId || p.id))}));
                setPlanError(false);
                console.log('TrainingPlansIndependent: Final plans data:', data);
                setPlans(data);

                // Backup cache
                localStorage.setItem(`shapeup_independent_plans_${userId}`, JSON.stringify(data));
            } catch (err) {
                console.error('TrainingPlansIndependent: Error fetching plans from API:', err);
                const cached = fetchedUserId && localStorage.getItem(`shapeup_independent_plans_${fetchedUserId}`);
                let restored = null;
                try { restored = cached ? JSON.parse(cached) : null; } catch { /* Ignore invalid cache. */ }
                setPlanError(!Array.isArray(restored));
                setPlans(Array.isArray(restored) ? restored : []);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchPlans();
    }, [getMe, getWorkoutPlansByUser, getWorkoutsByUser]);

    // -- Independent Training Plans Tour Trigger --
    useEffect(() => {
        if (editingPlan) return;

        const hasSeenTour = localStorage.getItem('shapeup_independent_training_plans_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="idep-tp-header"]',
                    content: t('tour.training_independent.1'),
                },
                {
                    selector: '[data-tour="idep-tp-card"]',
                    content: t('tour.training_independent.2'),
                },
                {
                    selector: '[data-tour="idep-tp-history"]',
                    content: t('tour.training_independent.3'),
                }
            ];

            setSteps(tourSteps);
            setCurrentStep(0);

            setTimeout(() => {
                setIsOpen(true);
            }, 600);

            localStorage.setItem('shapeup_independent_training_plans_tour_seen', 'true');
        }
    }, [editingPlan, setIsOpen, setSteps, setCurrentStep, t]);


    // Sync plans to storage
    useEffect(() => {
        if (userId && !loadingPlans && !planError) localStorage.setItem(`shapeup_independent_plans_${userId}`, JSON.stringify(plans));
    }, [plans, userId, loadingPlans, planError]);

    // ─── PLAN MANAGEMENT HANDLERS ─────────────────────────────────

    const handleAddPlan = () => {
        const newPlan = {
            id: `p${Date.now()}`,
            name: t('independent.builder.default.name'),
            phase: 'Hypertrophy',
            difficulty: 'Intermediate',
            weeks: 6,
            active: false,
            notes: '',
            blocks: [],
            history: []
        };
        setEditingPlan(newPlan);
    };

    // Enqueued (offline foundation). Update already knows its target id (`_planId`) up front --
    // no different from the other Bucket A flows, safe to fire-and-forget. Create is the part
    // that used to need the server's response: a brand-new plan's real id, used right after
    // for any edit/delete/copy/start on it. Same fix as startWorkout -- generate the id
    // client-side (objectId.js) and send it along; the backend uses it as-is
    // (CreateWorkoutPlanCommand.Id) instead of always generating one.
    const handleSavePlan = (updated) => {
        const loggedInUserId = userId;
        if (!loggedInUserId) return;
        const durationErr = findTimeBasedDurationError(updated);
        if (durationErr) {
            addNotification('independent', 'alert', 'Treino não salvo', durationErr, 'danger');
            return;
        }
        const workoutBody = buildWorkoutPlanBody(updated, loggedInUserId);

        console.log('Enviando treino (Solo) para a API:', workoutBody);

        if (updated._planId && !ownPlan(updated)) return;
        let savedPlan = { ...updated, createdByUserId: userId, targetUserId: userId, trainerUserId: null };

        if (updated._planId) {
            enqueueMutation({
                endpoint: `/api/training/workout-plans/${updated._planId}`,
                method: 'PUT',
                body: workoutBody,
                dedupeKey: `workout-plan-${updated._planId}`,
            });
        } else {
            const planId = generateObjectId();
            savedPlan = { ...savedPlan, id: planId, _planId: planId };
            enqueueMutation({
                endpoint: '/api/training/workout-plans',
                method: 'POST',
                body: { ...workoutBody, id: planId },
                dedupeKey: `workout-plan-${planId}`,
            });
        }

        setPlans(prev => {
            // Se for edição, substitui pelo salvo. Se for novo, adiciona o salvo.
            const exists = prev.some(p => p.id === updated.id);
            if (exists) {
                return prev.map(p => p.id === updated.id ? savedPlan : p);
            }
            return [...prev, savedPlan];
        });
        setEditingPlan(null);

        addNotification('independent', 'alert', 'Treino Salvo', `Seu treino foi enviado com sucesso!`, 'primary');
    };

    // Offline-safe by construction: `original` already has the full local copy of the plan
    // (from the last successful fetch, or from a not-yet-synced local edit) -- no need to ask
    // the server to copy-by-reference and wait for a new id back. We build the duplicate
    // entirely client-side and enqueue it as a plain CREATE (same body-builder as
    // handleSavePlan), which is response-ignored/optimistic-local already.
    const handleCopyPlan = (original) => {
        const copy = {
            ...original,
            id: `p${Date.now()}`,
            _planId: undefined,
            createdByUserId: userId,
            targetUserId: userId,
            trainerUserId: null,
            name: `${original.name} (Copy)`,
            history: [],
            active: false
        };

        const loggedInUserId = userId;
        if (!loggedInUserId) return;
        copy.id = generateObjectId();
        copy._planId = copy.id;
        enqueueMutation({
            endpoint: '/api/training/workout-plans',
            method: 'POST',
            body: { ...buildWorkoutPlanBody(copy, loggedInUserId), id: copy.id },
            dedupeKey: `workout-plan-${copy.id}`,
        });

        setPlans(prev => [...prev, copy]);
        addNotification('independent', 'success', 'Treino Copiado', `Cópia criada com sucesso!`, 'primary');
    };

    const handleDeletePlan = (plan) => {
        if (!ownPlan(plan)) return;
        setPlanToDelete(plan);
        setShowDeleteConfirm(true);
    };

    const confirmDeletePlan = () => {
        if (!planToDelete || !ownPlan(planToDelete)) return;

        const pid = planToDelete._planId || planToDelete.id;

        // Só enfileira a chamada se for um ID real do backend (não temporário p... ou plan_...
        // -- um plano ainda não sincronizado com o servidor não tem o que deletar lá).
        if (pid && !String(pid).startsWith('p') && !String(pid).startsWith('plan_')) {
            enqueueMutation({
                endpoint: `/api/training/workout-plans/${pid}`,
                method: 'DELETE',
                dedupeKey: `workout-plan-${pid}`,
            });
        }

        setPlans(prev => prev.filter(p => p.id !== (planToDelete._planId || planToDelete.id)));
        addNotification('independent', 'alert', 'Treino Removido', 'Seu treino foi excluído com sucesso.', 'error');
        setShowDeleteConfirm(false);
        setPlanToDelete(null);
    };

    const allHistory = plans.flatMap(plan =>
        (plan.history || []).map(h => ({
            ...h,
            planName: plan.name,
            convertedVol: h.totalVol
        }))
    ).sort((a, b) => b.id.localeCompare(a.id));

    const paginatedHistory = allHistory.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

    // ─── RENDER ────────────────────────────────────────────────────

    if (editingPlan) {
        return (
            <div className="su-pro-dashboard su-independent-builder">
                <div className="su-dashboard-header-flex su-mb-6">
                    <div>
                        <h1 className="su-page-title">{t('independent.builder.title')}</h1>
                        <p className="su-page-subtitle">{t('independent.training.subtitle.builder')}</p>
                    </div>
                    <Button variant="outline" onClick={() => setEditingPlan(null)}>{t('independent.builder.btn.back')}</Button>
                </div>
                <PlanEditor plan={editingPlan} isIndependent={true} onSave={handleSavePlan} onCancel={() => setEditingPlan(null)} />
            </div>
        );
    }

    return (
        <div className="su-client-dashboard">
            <div className="su-dashboard-header" data-tour="idep-tp-header">
                <div>
                    <h1 className="su-page-title">{t('client.training.title')}</h1>
                    <p className="su-text-muted">{originText[3]}</p>
                </div>
                <Button className="su-mt-4" disabled={!userId || loadingPlans} onClick={handleAddPlan}>{t('independent.training.btn.create')}</Button>
            </div>

            <aside className="su-app-note" role="note">
                <span className="material-symbols-outlined" aria-hidden="true">smartphone</span>
                <p>{appNote}</p>
            </aside>

            <div className="su-independent-plans-list su-mt-8" data-tour="idep-tp-card">
                {loadingPlans ? <p role="status">{originText[4]}</p> : planError ? <p role="alert">{originText[5]}</p> : [
                    plans.filter(ownPlan),
                    plans.filter(plan => !ownPlan(plan) && (plan.trainerUserId || plan.createdByUserId)),
                    plans.filter(plan => !ownPlan(plan) && !plan.trainerUserId && !plan.createdByUserId)
                ].map((group, index) => (index < 2 || group.length > 0) && <section key={index} data-plan-origin={index === 0 ? 'self' : index === 1 ? 'trainer' : 'unknown'} style={{marginBottom:24}}><h2 className="su-section-title" style={{marginBottom:16}}>{originText[index]} <span className="su-text-muted">({group.length})</span></h2>{group.length ? group.map(plan => <IndependentPlanCard key={plan.id} plan={plan} catalog={exercisesDB} owned={ownPlan(plan)} onEdit={setEditingPlan} onCopy={handleCopyPlan} onDelete={handleDeletePlan} />) : <p className="su-text-muted">{t('client.training.empty.desc')}</p>}</section>)}
            </div>

            <div className="su-history-section su-mt-12" data-tour="idep-tp-history">
                <h3 className="su-section-title su-mb-4">{t('independent.training.history.title')}</h3>
                <div className="su-independent-history-scroll">
                    {allHistory.length === 0 ? (
                        <p className="su-text-muted">{t('independent.training.history.empty')}</p>
                    ) : (
                        paginatedHistory.map(hist => (
                            <button type="button" key={hist.id} className="su-independent-history-item" onClick={() => setShowSessionDetail(hist)}>
                                <div className="su-hist-item-left">
                                    <div className="su-hist-item-date">
                                        <span>{hist.date}</span>
                                    </div>
                                    <div className="su-hist-item-title">{hist.planName}</div>
                                </div>
                                <div className="su-hist-item-right">
                                    <div className="su-hist-item-stat">
                                        <span>{hist.duration}</span>
                                    </div>
                                    <div className="su-hist-item-stat volume">
                                        <span>{hist.convertedVol} {t('client.training.history.vol')}</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {showSessionDetail && (
                <SessionDetailModal
                    session={showSessionDetail}
                    planName={showSessionDetail.planName}
                    planExercises={flattenBlockExercises(plans.find(p => p.name === showSessionDetail.planName)?.blocks)}
                    catalog={exercisesDB}
                    onClose={() => setShowSessionDetail(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="su-modal-overlay su-delete-confirm-overlay" onClick={() => { setShowDeleteConfirm(false); setPlanToDelete(null); }}>
                    <div className="su-modal-box su-delete-confirm-content su-alert-modal-box" onClick={e => e.stopPropagation()}>
                        <h2>{t('independent.builder.delete.title') || 'Excluir Treino?'}</h2>
                        <p className="su-text-muted">
                            {t('independent.builder.delete.desc') || 'Tem certeza que deseja excluir o treino'}
                            <strong> {planToDelete?.name}</strong>?
                            <br/>{t('independent.builder.delete.warning') || 'Essa ação não pode ser desfeita.'}
                        </p>
                        <div className="su-modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Button
                                variant="outline"
                                className="su-cancel-btn"
                                onClick={() => { setShowDeleteConfirm(false); setPlanToDelete(null); }}
                                style={{ minWidth: '120px' }}
                            >
                                {t('common.cancel') || 'Cancelar'}
                            </Button>
                            <Button
                                className="su-confirm-delete-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    confirmDeletePlan();
                                }}
                                style={{ minWidth: '120px', backgroundColor: 'var(--error)', color: 'white' }}
                            >
                                {t('common.delete') || 'Excluir'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingPlansIndependent;

const ArrowLeft = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
