import { readAllPages } from '../../utils/readAllPages';
import { workoutHistory } from '../../utils/workoutHistory';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import Button from '../../components/Button';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    PlanEditor,
    PlanCard,
    SessionDetailModal,
    SetTypeBadge,
    ProSelect,
    SET_TYPES,
    TECHNIQUES
} from './ClientDetail';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { enqueueMutation } from '../../services/mutationQueue';
import { generateObjectId } from '../../utils/objectId';
import { mapSetType, mapLoadUnit, mapTechnique, mapDifficulty, mapBlockType, mapIntensityType } from '../../utils/trainingEnums';
import { normalizePlan, flattenBlockExercises } from '../../utils/trainingNormalization';
import { mapAssignedWeekdaysToApi } from '../../utils/workoutSchedule';
import { buildWorkoutStatePayload, enrichExercisesFromCatalog } from '../../utils/workoutStatePayload';
import { useExercises } from '../../hooks/useExercises';
import WorkoutBodyMap from '../../components/anatomy/WorkoutBodyMap';
import {
    applyToggleLoggedSetComplete,
    applyUpdateSetLog,
    execInputClassName,
    INVALID_LOG_FLASH_MS,
    mergeSessionRequireRpe,
} from './TrainingPlansClient';
import './TrainingPlansClient.css';
import './TrainingPlansProfessional.css';

/* eslint-disable react-refresh/only-export-components -- execution helpers tested without mounting the page */
export { applyToggleLoggedSetComplete, applyUpdateSetLog };

export const independentRestKicker = (t) => t('client.session.timer.rest_label');

export const toRuntimeSets = (ex, exIdx) => ({
    id: ex.exerciseId ?? ex.id ?? `ex_${exIdx}`,
    exerciseId: ex.exerciseId ?? (typeof ex.id === 'number' ? ex.id : null),
    name: ex.name || ex.exerciseNamePt || ex.exerciseName || 'Exercise',
    muscles: ex.muscles || [],
    target: (ex.muscles && ex.muscles.length > 0) ? ex.muscles.join(', ') : (ex.tags || 'General'),
    requireRpe: Boolean(ex.requireRpe),
    sets: (ex.sets || []).map((s, sIdx) => ({
        id: s.id || `s_${exIdx}_${sIdx}`,
        type: s.type,
        technique: s.technique || 'Straight',
        target: `${s.reps} reps @ ${s.load}% | ${s.intensityType ? s.intensityType.toUpperCase() + ' ' + s.intensityValue : '—'}`,
        completed: false,
        failure: false,
        prescribedRest: s.rest || 90,
        prescribedReps: s.reps,
        prescribedLoad: s.load,
        prescribedRpe: s.intensityValue,
        prescribedIntensityType: s.intensityType || 'rpe',
        log: { weight: '', reps: '', rpe: '' },
    })),
});


// Shared by handleSavePlan and the offline-safe path of handleCopyPlan below -- both start
// from a plan object shaped like normalizePlan()'s output (PlanEditor's internal shape) and
// need the same API request body built from it.
export const buildWorkoutPlanBody = (plan, targetUserId) => ({
    targetUserId,
    name: plan.name || 'Novo Treino',
    notes: plan.notes || null,
    durationInWeeks: parseInt(plan.weeks) || 4,
    phase: plan.phase || 'Hypertrophy',
    difficulty: mapDifficulty(plan.difficulty),
    assignedWeekdays: mapAssignedWeekdaysToApi(plan.assignedWeekdays ?? []),
    blocks: (plan.blocks || []).map(block => ({
        type: mapBlockType(block.type),
        timeCapSeconds: block.timeCapSeconds === '' || block.timeCapSeconds == null ? null : parseInt(block.timeCapSeconds),
        intervalSeconds: block.intervalSeconds === '' || block.intervalSeconds == null ? null : parseInt(block.intervalSeconds),
        totalRounds: block.totalRounds === '' || block.totalRounds == null ? null : parseInt(block.totalRounds),
        restAfterSeconds: block.restAfterSeconds === '' || block.restAfterSeconds == null ? null : parseInt(block.restAfterSeconds),
        exercises: (block.exercises || []).map(ex => ({
            exerciseId: parseInt(ex.exerciseId) || 1,
            requireRpe: Boolean(ex.requireRpe),
            sets: (ex.sets || []).map(s => ({
                repetitions: s.reps === '' || s.reps == null ? null : parseInt(s.reps),
                load: parseFloat(s.load) || 0,
                loadUnit: mapLoadUnit(s.loadUnit),
                setType: mapSetType(s.type ?? s.setType),
                technique: mapTechnique(s.technique),
                intensity: s.intensityType && s.intensityValue !== ''
                    ? { type: mapIntensityType(s.intensityType), value: parseInt(s.intensityValue) }
                    : null,
                restSeconds: s.rest === '' || s.rest == null ? null : parseInt(s.rest),
                isExtra: false
            }))
        }))
    }))
});

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const IndependentPlanCard = ({ plan, onEdit, onCopy, onDelete, onStart, owned, catalog = [] }) => {
    const { t } = useLanguage();
    const mapExercises = enrichExercisesFromCatalog(flattenBlockExercises(plan.blocks), catalog);
    return (
        <div className="su-independent-plan-card">
            <div className="su-plan-card-body">
                <div className="su-plan-card-main">
                    <span className="su-phase-badge">
                        {plan.phase?.toUpperCase() || 'GENERAL'}
                    </span>
                    <h2 className="su-plan-display-name">{plan.name}</h2>
                    <p className="su-plan-display-meta">
                        {t('pro.builder.diff')}: <strong>{t(`pro.builder.diff.${plan.difficulty?.toLowerCase()}`) || plan.difficulty}</strong> · {plan.weeks} {t('pro.client.plan.weeks')}
                    </p>
                    <div className="su-ex-count-badge">
                        <span>{mapExercises.length} {t('pro.client.plan.exercises')}</span>
                    </div>
                    <WorkoutBodyMap exercises={mapExercises} compact />
                </div>
                <div className="su-plan-card-side">
                    <button className="su-execute-btn-large" onClick={() => onStart(plan)}>
                        {t('client.training.card.btn')}
                    </button>
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
    const { setSessionTitle } = useOutletContext();
    const { t, language, unitSystem, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const {
        getWorkoutPlansByUser,
        getWorkoutsByUser,
        getActiveWorkout,
        getWorkoutPlanById,
    } = useTrainingApi();
    const { getMe } = useAuthorizationApi();
    const { exercises: exercisesDB } = useExercises();

    // ─── STATE MANAGEMENT ──────────────────────────────────────────

    // 1. Storage & Navigation
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [userId, setUserId] = useState(null);
    const [planError, setPlanError] = useState(false);
    const ownPlan = plan => userId != null && String(plan.createdByUserId) === String(userId);
    const originText = language === 'en' ? ['Created by me','From my trainer','Other assigned workouts','You can create your own workouts. Workouts from your trainer stay separate.','Loading workouts…','Could not load your workouts.'] : language === 'es' ? ['Creados por mí','De mi entrenador','Otros entrenamientos asignados','Puedes crear tus propios entrenamientos. Los de tu entrenador se mantienen separados.','Cargando entrenamientos…','No se pudieron cargar tus entrenamientos.'] : ['Criados por mim','Do meu treinador','Outros treinos atribuídos','Você pode criar seus próprios treinos. Os treinos do seu treinador ficam separados.','Carregando treinos…','Não foi possível carregar seus treinos.'];
    const [editingPlan, setEditingPlan] = useState(null);
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

    // 2. Session Engine State
    const [sessionActive, setSessionActive] = useState(false);
    const [activePlan, setActivePlan] = useState(null);
    const [workoutTime, setWorkoutTime] = useState(0);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [sessionExercises, setSessionExercises] = useState([]);
    const [sessionFeedback, setSessionFeedback] = useState({ rpe: null, comments: '' });
    const [workoutSessionId, setWorkoutSessionId] = useState(null);
    const [isFinishingSession, setIsFinishingSession] = useState(false);
    const [pendingActiveWorkout, setPendingActiveWorkout] = useState(null);
    const [isResumingWorkout, setIsResumingWorkout] = useState(false);
    const [isCancellingActive, setIsCancellingActive] = useState(false);
    const [invalidLogs, setInvalidLogs] = useState({});

    const hasFirstDoneRef = useRef(false);
    const lastSyncedHashRef = useRef('');
    const committedSetsRef = useRef(new Set()); // Tracks sets that have been "sent" at least once as done
    const doneClickGuardRef = useRef({});
    const sessionExercisesRef = useRef(sessionExercises);
    const workoutTimeRef = useRef(workoutTime);

    // 3. Modals & Overlays
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSessionDetail, setShowSessionDetail] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    // 4. Pagination
    const [historyPage] = useState(1);
    const HISTORY_PER_PAGE = 5;

    useEffect(() => {
        sessionExercisesRef.current = sessionExercises;
    }, [sessionExercises]);

    useEffect(() => {
        workoutTimeRef.current = workoutTime;
    }, [workoutTime]);

    const buildWorkoutStatePayloadLocal = useCallback((sourceExercises, _elapsedSeconds) => {
        return buildWorkoutStatePayload({
            sessionId: workoutSessionId,
            exercises: sourceExercises,
            unitSystem,
        });
    }, [workoutSessionId, unitSystem]);
    
    /**
     * Sincroniza o estado atual do treino com o servidor.
     * Só envia se houver mudança no payload filtrado desde a última sincronização.
     * Enfileira via mutationQueue (offline foundation) em vez de chamar a API direto: a
     * escrita fica durável (sobrevive offline/reload) e ganha retry/backoff automáticos.
     * dedupeKey garante que só a versão mais recente do payload desta sessão fica pendente.
     */
    const syncWorkoutStateIfNeeded = useCallback(({ sourceExercises, elapsedSeconds }) => {
        if (!workoutSessionId) return;

        // 1. Build payload containing ONLY current completed sets
        const payload = buildWorkoutStatePayloadLocal(sourceExercises ?? sessionExercisesRef.current, elapsedSeconds ?? workoutTimeRef.current);

        // 2. Compara o hash do payload de séries FINALIZADAS
        const currentPayloadHash = JSON.stringify(payload.exercises); // Compare only exercises/sets content

        // 3. Se for igual ao que já está enfileirado/sincronizado, não faz nada
        if (currentPayloadHash === lastSyncedHashRef.current) {
            return;
        }

        // 4. Se o usuário apenas DESMARCOU uma série, não sincronizamos (deixamos o servidor com a última versão válida)
        // Só sincronizamos se houver conteúdo novo ou mudança em algo já marcado.
        // Contamos o total de sets no payload. Se diminuiu, é um "undone" puro, pulamos sem atualizar o hash.
        const currentDoneCount = payload.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        const lastDoneCount = parseInt(sessionStorage.getItem(`lastDoneCount_${workoutSessionId}`) || '0');

        if (currentDoneCount < lastDoneCount) {
             // Just bail, don't update hash. If they re-check, currentPayloadHash will match lastSyncedHashRef and still bail.
             return;
        }

        // 5. Enfileira a sincronização
        lastSyncedHashRef.current = currentPayloadHash;
        sessionStorage.setItem(`lastDoneCount_${workoutSessionId}`, currentDoneCount.toString());

        enqueueMutation({
            endpoint: `/api/training/workouts/${workoutSessionId}/state`,
            method: 'PUT',
            body: payload,
            dedupeKey: `workout-state-${workoutSessionId}`,
        });
    }, [workoutSessionId, buildWorkoutStatePayloadLocal]);

    const mutateSessionExercises = useCallback((mutator) => {
        const next = [...sessionExercisesRef.current];
        mutator(next);
        setSessionExercises(next);
        return next;
    }, []);

    const flashInvalidLog = (exerciseIndex, setIndex, missing) => {
        const key = `${exerciseIndex}-${setIndex}`;
        setInvalidLogs((prev) => ({ ...prev, [key]: missing }));
        window.setTimeout(() => {
            setInvalidLogs((prev) => {
                if (!prev[key]) return prev;
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }, INVALID_LOG_FLASH_MS);
    };

    // ─── EFFECTS ───────────────────────────────────────────────────

    // Initial Load handled in useState to prevent race conditions with Sync

    // -- Check for active workout on mount --
    useEffect(() => {
        const checkActiveWorkout = async () => {
            try {
                const response = await getActiveWorkout();
                if (response && response.hasActiveWorkout && response.session) {
                    console.log('Active workout found (Independent):', response.session);
                    setPendingActiveWorkout(response.session);
                }
            } catch (_error) {
                console.log('No active workout found (expected).');
            }
        };

        if (!sessionActive) {
            checkActiveWorkout();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleResumeActiveWorkout = async () => {
        if (!pendingActiveWorkout) return;
        setIsResumingWorkout(true);
        try {
            const activeSessionId = pendingActiveWorkout.sessionId || pendingActiveWorkout.id;
            const planId = pendingActiveWorkout.workoutPlanId || pendingActiveWorkout.planId;

            setWorkoutSessionId(activeSessionId);

            // Try to find the plan from local plans first
            let plan = plans.find(p => (p._planId || p.id) === planId);

            // If not found locally, try fetching from API
            if (!plan && planId) {
                try {
                    const fetchedPlan = await getWorkoutPlanById(planId);
                    if (fetchedPlan) plan = normalizePlan(fetchedPlan);
                } catch (err) {
                    console.error('Failed to fetch plan for resume:', err);
                }
            }

            if (plan) {
                const flattened = enrichExercisesFromCatalog(
                    flattenBlockExercises(plan.blocks),
                    exercisesDB
                );
                const sessionSnap = pendingActiveWorkout.exercises
                    || pendingActiveWorkout.Exercises;
                const runtimeExercises = mergeSessionRequireRpe(flattened, sessionSnap)
                    .map(toRuntimeSets);

                setSessionExercises(runtimeExercises);
                hasFirstDoneRef.current = false;
                committedSetsRef.current = new Set();
                lastSyncedHashRef.current = '';
                doneClickGuardRef.current = {};
                setIsFinishingSession(false);
                setActivePlan(plan);
                setSessionActive(true);
                setWorkoutTime(0);
                setSessionTitle(`${plan.name} \u00b7 ${plan.phase}`);
            }

            setPendingActiveWorkout(null);
        } catch (error) {
            console.error('Failed to resume workout:', error);
        } finally {
            setIsResumingWorkout(false);
        }
    };

    const handleCancelActiveWorkout = () => {
        if (!pendingActiveWorkout) return;
        setIsCancellingActive(true);
        const activeSessionId = pendingActiveWorkout.sessionId || pendingActiveWorkout.id;
        // Enqueued (offline foundation): local session state is reset unconditionally right
        // after regardless of the response, so there's nothing to await here.
        enqueueMutation({
            endpoint: `/api/training/workouts/${activeSessionId}/cancel`,
            method: 'POST',
            dedupeKey: `workout-cancel-${activeSessionId}`,
        });
        setPendingActiveWorkout(null);
        setIsCancellingActive(false);
    };

    // -- Independent Training Plans Tour Trigger --
    useEffect(() => {
        if (sessionActive || editingPlan) return;

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
    }, [sessionActive, editingPlan, setIsOpen, setSteps, setCurrentStep, t]);

    // Sync Plans to Storage
    useEffect(() => {
        if (userId && !loadingPlans && !planError) localStorage.setItem(`shapeup_independent_plans_${userId}`, JSON.stringify(plans));
    }, [plans, userId, loadingPlans, planError]);

    // Global Workout Timers
    useEffect(() => {
        let globalInterval = null;
        let restInterval = null;
        const isPausedByModal = showFeedbackModal || showOverviewModal || showCancelModal;

        if (sessionActive && !isPausedByModal) {
            globalInterval = setInterval(() => setWorkoutTime(sec => sec + 1), 1000);
        }

        if (isResting && restTimer > 0 && !isPausedByModal) {
            restInterval = setInterval(() => setRestTimer(sec => sec - 1), 1000);
        } else if (restTimer === 0 && isResting) {
            setIsResting(false);
        }

        return () => {
            clearInterval(globalInterval);
            clearInterval(restInterval);
        };
    }, [sessionActive, isResting, restTimer, showFeedbackModal, showOverviewModal, showCancelModal]);

    // Debounced synchronization: Only sync state when changes occur and have settled (2s)
    useEffect(() => {
        if (!sessionActive || !workoutSessionId || !hasFirstDoneRef.current) return;

        const timerId = setTimeout(() => {
            syncWorkoutStateIfNeeded({
                sourceExercises: sessionExercises,
                elapsedSeconds: workoutTimeRef.current
            });
        }, 2000);

        return () => clearTimeout(timerId);
    }, [sessionExercises, sessionActive, workoutSessionId, syncWorkoutStateIfNeeded]);

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

    // ─── SESSION ENGINE HANDLERS ──────────────────────────────────

    // Enqueued (offline foundation): a client-generated session id (see objectId.js) is used
    // as the real session id from the start -- state sync/finish/cancel run against this same
    // id whether online or offline, no reconciliation needed (backend accepts a pre-set id,
    // see StartWorkoutExecutionCommand.Id).
    const startSession = (plan) => {
        const pid = plan._planId || plan.id;

        // Só dá pra iniciar no servidor se o plano em si já tiver um ID real (não temporário
        // p.../plan_...) -- um plano ainda não sincronizado não existe lá pra referenciar.
        if (pid && !String(pid).startsWith('p') && !String(pid).startsWith('plan_')) {
            const sessionId = generateObjectId();
            setWorkoutSessionId(sessionId);
            enqueueMutation({
                endpoint: '/api/training/workouts/start',
                method: 'POST',
                body: { id: sessionId, planId: pid, startedAtUtc: new Date().toISOString() },
            });
        } else {
            setWorkoutSessionId(null);
        }

        const runtimeExercises = enrichExercisesFromCatalog(
            flattenBlockExercises(plan.blocks),
            exercisesDB
        ).map(toRuntimeSets);

        setSessionExercises(runtimeExercises);
        hasFirstDoneRef.current = false;
        committedSetsRef.current = new Set();
        lastSyncedHashRef.current = ''; // Reset hash for new session
        doneClickGuardRef.current = {};
        setIsFinishingSession(false);
        setActivePlan(plan);
        setSessionActive(true);
        setWorkoutTime(0);
        setSessionTitle(`${plan.name} · ${plan.phase}`);
    };

    const finishSession = async () => {
        if (isFinishingSession) return;

        setIsFinishingSession(true);
        await syncWorkoutStateIfNeeded({ force: true });

        setShowFeedbackModal(true);
        setSessionTitle(null);
        setIsFinishingSession(false);
    };

    const submitFeedback = () => {
        if (workoutSessionId) {
            // Enqueued (offline foundation): the session summary shown next (handleSessionCompleted)
            // is built entirely from local sessionExercises/workoutTime, not from this response.
            const payload = buildWorkoutStatePayloadLocal(sessionExercises, workoutTime);
            enqueueMutation({
                endpoint: `/api/training/workouts/${workoutSessionId}/finish`,
                method: 'POST',
                body: {
                    sessionId: String(workoutSessionId),
                    endedAtUtc: new Date().toISOString(),
                    perceivedExertion: parseFloat(sessionFeedback.rpe) || 5,
                    exercises: payload.exercises || []
                },
                dedupeKey: `workout-finish-${workoutSessionId}`,
            });
        }
        setShowFeedbackModal(false);
        setShowOverviewModal(true);
    };

    const handleSessionCompleted = () => {
        const totalVol = sessionExercises.reduce((acc, ex) => {
            return acc + ex.sets.filter(s => s.completed).reduce((setAcc, set) => {
                const w = parseFloat(set.log.weight) || 0;
                const r = parseFloat(set.log.reps) || 0;
                return setAcc + (w * r);
            }, 0);
        }, 0);

        let totalSets = 0;
        let completedSets = 0;
        sessionExercises.forEach(ex => ex.sets.forEach(s => {
            totalSets++;
            if (s.completed) completedSets++;
        }));

        let sessionStatus = 'completed';
        if (completedSets === 0) sessionStatus = 'skipped';
        else if (completedSets < totalSets) sessionStatus = 'partial';

        const newHistoryEntry = {
            id: `h${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            duration: formatTime(workoutTime),
            totalVol: formatWeight(totalVol).replace('0 ', ''),
            rpe: sessionFeedback.rpe || 5,
            comments: sessionFeedback.comments || '',
            status: sessionStatus,
            exercises: sessionExercises.map(ex => ({
                name: ex.name,
                muscles: ex.muscles || [],
                skipped: ex.sets.every(s => !s.completed),
                sets: ex.sets.filter(s => s.completed).map((s, idx) => ({
                    set: idx + 1,
                    type: s.type,
                    reps: s.log.reps || 0,
                    load: s.log.weight || 0,
                    rpe: s.log.rpe || 0
                }))
            }))
        };

        setPlans(prev => prev.map(p => {
            if (p.id === activePlan.id) {
                return { ...p, history: [newHistoryEntry, ...(p.history || [])] };
            }
            return p;
        }));

        resetSession({ skipCancel: true });
    };

    const resetSession = ({ skipCancel = false } = {}) => {
        if (!skipCancel && workoutSessionId) {
            // Enqueued (offline foundation): local session state is reset unconditionally
            // right below regardless of the response.
            enqueueMutation({
                endpoint: `/api/training/workouts/${workoutSessionId}/cancel`,
                method: 'POST',
                dedupeKey: `workout-cancel-${workoutSessionId}`,
            });
        }
        setSessionActive(false);
        setActivePlan(null);
        setWorkoutSessionId(null);
        setIsFinishingSession(false);
        setWorkoutTime(0);
        setIsResting(false);
        setRestTimer(0);
        setSessionExercises([]);
        setSessionFeedback({ rpe: null, comments: '' });
        setShowOverviewModal(false);
        setShowFeedbackModal(false);
        setShowCancelModal(false);
        hasFirstDoneRef.current = false;
        lastSyncedHashRef.current = '';
        doneClickGuardRef.current = {};
        setSessionTitle(null);
    };

    // ─── COMPUTED ──────────────────────────────────────────────────

    const allHistory = plans.flatMap(plan =>
        (plan.history || []).map(h => ({
            ...h,
            planName: plan.name,
            convertedVol: h.totalVol
        }))
    ).sort((a, b) => b.id.localeCompare(a.id));

    const paginatedHistory = allHistory.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

    // ─── RENDER ────────────────────────────────────────────────────

    if (sessionActive) {
        return (
            <div className="su-session-engine">
                <div className="su-session-header-sticky">
                    <div className="su-session-header-left">
                        <Button variant="outline" onClick={() => setShowCancelModal(true)} size="sm">{t('client.session.btn.cancel')}</Button>
                    </div>
                    <div className={`su-rest-timer-group ${isResting ? 'active' : ''}`}>
                        <div className="su-rest-controls">
                            <button className="su-adjust-rest-btn minus" onClick={() => setRestTimer(p => Math.max(0, p - 15))}>-15s</button>
                            <div className="su-rest-clock-display"><span className="su-timer-kicker">{independentRestKicker(t)}</span> <span className="su-timer-digits">{formatTime(restTimer)}</span></div>
                            <button className="su-adjust-rest-btn plus" onClick={() => setRestTimer(p => p + 15)}>+15s</button>
                        </div>
                    </div>
                    <div className="su-session-header-right">
                        {isResting && <button className="su-skip-rest-btn" onClick={() => setIsResting(false)}>{t('client.session.btn.skip')}</button>}
                    </div>
                </div>

                <div className="su-execution-scroll">
                    <WorkoutBodyMap exercises={sessionExercises} compact />
                    {sessionExercises.map((ex, exIdx) => {
                        const liveSetIndex = ex.sets.findIndex(s => !s.completed);
                        return (
                        <article key={ex.id} className="su-ledger-exercise">
                            <div className="su-ex-execution-header">
                                <div className="su-ex-index-group">
                                    <span className="su-ledger-num">{String(exIdx + 1).padStart(2, '0')}</span>
                                    <div>
                                        <h3 className="su-se-ex-title">{ex.name}</h3>
                                        <span className="su-ex-target">{ex.target}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="su-sets-execution">
                                <div className="su-exec-row su-exec-header">
                                    <div className="col-set">{t('client.session.table.set')}</div>
                                    <div className="col-target">{t('client.session.table.target')}</div>
                                    <div className="col-rest">{t('client.session.table.rest')}</div>
                                    <div className="col-log">{unitSystem === 'imperial' ? 'lbs' : 'kg'}</div>
                                    <div className="col-log">{t('client.session.table.reps')}</div>
                                    <div className="col-log">{t('client.session.table.rpe')}</div>
                                    <div className="col-failure">{t('client.session.table.failure')}</div>
                                    <div className="col-done">{t('client.session.table.done')}</div>
                                </div>
                                {ex.sets.map((s, sIdx) => (
                                    <div key={s.id} className={`su-exec-row ${s.completed ? 'completed' : ''} ${sIdx === liveSetIndex ? 'live' : ''}`}>
                                        <div className="col-set">
                                            <span className={`su-set-badge ${s.type}`} onClick={() => {
                                                const types = ['warmup', 'working', 'topset', 'backoff'];
                                                const cur = types.indexOf(s.type);
                                                const next = types[(cur + 1) % types.length];
                                                mutateSessionExercises(updated => {
                                                    updated[exIdx].sets[sIdx].type = next;
                                                });
                                            }} style={{ cursor: 'pointer' }}>
                                                {t(`client.session.set_type.${s.type}`) !== `client.session.set_type.${s.type}` ? t(`client.session.set_type.${s.type}`) : (s.type.charAt(0).toUpperCase() + s.type.slice(1))}
                                            </span>
                                        </div>
                                        <div className="col-target">
                                            <div className="su-target-primary">{s.target}</div>
                                        </div>
                                        <div className="col-rest">
                                            <div className="su-rest-display">
                                                <span>{s.prescribedRest}s</span>
                                            </div>
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className={execInputClassName(invalidLogs[`${exIdx}-${sIdx}`], 'weight')} value={s.log.weight} onChange={e => setSessionExercises(applyUpdateSetLog(sessionExercisesRef.current, exIdx, sIdx, 'weight', e.target.value))} placeholder="--" disabled={s.completed} />
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className={execInputClassName(invalidLogs[`${exIdx}-${sIdx}`], 'reps')} value={s.log.reps} onChange={e => setSessionExercises(applyUpdateSetLog(sessionExercisesRef.current, exIdx, sIdx, 'reps', e.target.value))} placeholder="--" disabled={s.completed} />
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className={execInputClassName(invalidLogs[`${exIdx}-${sIdx}`], 'rpe')} value={s.log.rpe} onChange={e => setSessionExercises(applyUpdateSetLog(sessionExercisesRef.current, exIdx, sIdx, 'rpe', e.target.value))} placeholder="--" disabled={s.completed} />
                                        </div>
                                        <div className="col-failure">
                                            <label className={`su-failure-checkbox ${s.failure ? 'checked' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    className="su-visually-hidden"
                                                    checked={s.failure}
                                                    onChange={e => {
                                                        mutateSessionExercises(updated => {
                                                            updated[exIdx].sets[sIdx].failure = e.target.checked;
                                                            if (e.target.checked) updated[exIdx].sets[sIdx].log.rpe = '10';
                                                        });
                                                    }}
                                                />
                                                <span className="su-failure-icon" />
                                            </label>
                                        </div>
                                        <div className="col-done">
                                            <button className={`su-check-circle ${s.completed ? 'checked' : ''}`} onClick={() => {
                                                const clickKey = `${exIdx}-${sIdx}`;
                                                const now = Date.now();
                                                const lastClick = doneClickGuardRef.current[clickKey] || 0;
                                                if (now - lastClick < 350) return;
                                                doneClickGuardRef.current[clickKey] = now;

                                                const result = applyToggleLoggedSetComplete(sessionExercisesRef.current, exIdx, sIdx);
                                                if (result.missing.length) {
                                                    flashInvalidLog(exIdx, sIdx, result.missing);
                                                    return;
                                                }

                                                setSessionExercises(result.exercises);
                                                const completedState = result.exercises[exIdx].sets[sIdx].completed;

                                                if (completedState) {
                                                    committedSetsRef.current.add(s.id);
                                                    hasFirstDoneRef.current = true;
                                                }

                                                if (result.startRest && s.prescribedRest > 0) { setRestTimer(s.prescribedRest); setIsResting(true); }
                                            }} aria-label={t('client.session.table.done')} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                        );
                    })}
                    <div className="su-session-footer su-mt-8 su-mb-12">
                        <Button size="lg" fullWidth className="su-complete-session-btn" onClick={finishSession} disabled={isFinishingSession}>{t('client.session.btn.finish')}</Button>
                    </div>
                </div>

                {showCancelModal && (
                    <div className="su-modal-overlay">
                        <div className="su-modal-box">
                            <h2>{t('client.session.modal.cancel.title')}</h2>
                            <p>{t('client.session.modal.cancel.desc')}</p>
                            <div className="su-modal-actions">
                                <Button variant="outline" onClick={() => setShowCancelModal(false)}>{t('client.session.modal.cancel.keep')}</Button>
                                <Button onClick={resetSession} style={{ backgroundColor: 'var(--error)', color: 'white' }}>{t('client.session.modal.cancel.confirm')}</Button>
                            </div>
                        </div>
                    </div>
                )}

                {showFeedbackModal && (
                    <div className="su-rest-modal-overlay">
                        <div className="su-feedback-modal-content">
                            <h3>{t('client.session.modal.feedback.title')}</h3>
                            <p className="su-text-muted su-mb-4" style={{ textAlign: 'center' }}>{t('client.session.modal.feedback.desc')}</p>

                            <div className="su-feedback-rpe-scale">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <button
                                        key={n}
                                        className={`su-rpe-btn ${sessionFeedback.rpe === n ? 'active' : ''}`}
                                        onClick={() => setSessionFeedback(prev => ({ ...prev, rpe: n }))}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                            <div className="su-feedback-comments">
                                <label className="su-input-label">{t('client.session.modal.feedback.comments')}</label>
                                <textarea
                                    className="su-textarea-input"
                                    placeholder={t('client.session.modal.feedback.placeholder')}
                                    value={sessionFeedback.comments}
                                    onChange={e => setSessionFeedback(prev => ({ ...prev, comments: e.target.value }))}
                                />
                            </div>

                            <div className="su-feedback-actions">
                                <Button fullWidth onClick={submitFeedback} disabled={!sessionFeedback.rpe}>
                                    {t('client.session.modal.feedback.submit')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showOverviewModal && (
                    <div className="su-gamified-overlay">
                        <div className="su-gamified-content">
                            <button className="su-close-gamified" onClick={handleSessionCompleted} aria-label="Close">×</button>

                            <div className="su-gamified-header">
                                <h2>{t('client.session.modal.gamified.title')}</h2>
                            </div>

                            <div className="su-gamified-stats">
                                <div className="su-stat-box highlight">
                                    <span className="su-stat-value">{formatWeight(sessionExercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).reduce((sa, s) => sa + (parseFloat(s.log.weight) * parseFloat(s.log.reps) || 0), 0), 0)).replace('0 ', '')}</span>
                                    <span className="su-stat-label">{t('client.session.modal.gamified.vol').replace('(kg)', `(${unitSystem === 'imperial' ? 'lbs' : 'kg'})`)}</span>
                                </div>
                                <div className="su-stat-box">
                                    <span className="su-stat-value">{formatTime(workoutTime)}</span>
                                    <span className="su-stat-label">{t('client.session.modal.gamified.duration')}</span>
                                </div>
                            </div>

                            <div className="su-gamified-actions">
                                <Button fullWidth size="lg" onClick={handleSessionCompleted}>
                                    {t('client.session.modal.gamified.return')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
            {/* Active Workout Recovery Modal (Blocking) */}
            {pendingActiveWorkout && (
                <div className="su-rest-modal-overlay" style={{ zIndex: 12000 }}>
                    <div className="su-feedback-modal-content" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>{t('client.session.modal.active.title')}</h3>
                        <p className="su-text-muted su-mb-6">
                            {t('client.session.modal.active.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button
                                fullWidth
                                onClick={handleResumeActiveWorkout}
                                disabled={isResumingWorkout || isCancellingActive}
                            >
                                {isResumingWorkout ? '...' : t('client.session.modal.active.resume')}
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={handleCancelActiveWorkout}
                                disabled={isResumingWorkout || isCancellingActive}
                                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            >
                                {isCancellingActive ? '...' : t('client.session.modal.active.cancel')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="su-dashboard-header" data-tour="idep-tp-header">
                <div>
                    <h1 className="su-page-title">{t('client.training.title')}</h1>
                    <p className="su-text-muted">{originText[3]}</p>
                </div>
                <Button className="su-mt-4" disabled={!userId || loadingPlans} onClick={handleAddPlan}>{t('independent.training.btn.create')}</Button>
            </div>

            <div className="su-independent-plans-list su-mt-8" data-tour="idep-tp-card">
                {loadingPlans ? <p role="status">{originText[4]}</p> : planError ? <p role="alert">{originText[5]}</p> : [
                    plans.filter(ownPlan),
                    plans.filter(plan => !ownPlan(plan) && (plan.trainerUserId || plan.createdByUserId)),
                    plans.filter(plan => !ownPlan(plan) && !plan.trainerUserId && !plan.createdByUserId)
                ].map((group, index) => (index < 2 || group.length > 0) && <section key={index} data-plan-origin={index === 0 ? 'self' : index === 1 ? 'trainer' : 'unknown'} style={{marginBottom:24}}><h2 className="su-section-title" style={{marginBottom:16}}>{originText[index]} <span className="su-text-muted">({group.length})</span></h2>{group.length ? group.map(plan => <IndependentPlanCard key={plan.id} plan={plan} catalog={exercisesDB} owned={ownPlan(plan)} onEdit={setEditingPlan} onCopy={handleCopyPlan} onDelete={handleDeletePlan} onStart={startSession} />) : <p className="su-text-muted">{t('client.training.empty.desc')}</p>}</section>)}
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
