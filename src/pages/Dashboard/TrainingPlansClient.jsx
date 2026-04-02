import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, CheckCircle, Clock, ChevronRight, ChevronLeft, CalendarDays, Plus, FastForward, Award, TrendingUp, X, Trash2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ExerciseModal from '../../components/ExerciseModal';
import { exercisesDB } from '../../data/mockExercises';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { useAuth } from '../../contexts/AuthContext';
import { normalizePlan } from '../../utils/trainingNormalization';
import { mapSetType, mapTechnique } from '../../utils/trainingEnums';
import './TrainingPlansClient.css';

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ClientView = () => {
    const { setSessionTitle } = useOutletContext();
    const { t, unitSystem, convertWeight, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const { startWorkout, updateWorkoutState, getWorkoutPlansByUser, cancelWorkout } = useTrainingApi();
    const { getMe } = useAuthorizationApi();
    const { currentUser } = useAuth();

    // Session State
    const [sessionActive, setSessionActive] = useState(false);
    const [activePlan, setActivePlan] = useState(null); // The actual plan data structure being run
    const [assignedPlans, setAssignedPlans] = useState([]);
    const [viewingExerciseDef, setViewingExerciseDef] = useState(null); // Controls the ExerciseModal

    // Global Workout Timer
    const [workoutTime, setWorkoutTime] = useState(0);

    // Rest Timer State
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);


    // Post-Session Flow States
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [sessionFeedback, setSessionFeedback] = useState({ rpe: null, comments: '' });

    // Dynamic Sets Data Structure (Simplified for demo)
    // We store arrays of sets for each exercise block
    // Dynamic Sets Data Structure
    const [exercises, setExercises] = useState([]);
    const [workoutSessionId, setWorkoutSessionId] = useState(null);
    const [isFinishingSession, setIsFinishingSession] = useState(false);

    const syncInFlightRef = useRef(false);
    const hasFirstDoneRef = useRef(false);
    const lastSyncedHashRef = useRef('');
    const committedSetsRef = useRef(new Set()); // Tracks sets that have been "sent" at least once as done
    const doneClickGuardRef = useRef({});
    const exercisesRef = useRef(exercises);
    const workoutTimeRef = useRef(workoutTime);

    // Session History Pagination state
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 5;

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        exercisesRef.current = exercises;
    }, [exercises]);

    useEffect(() => {
        workoutTimeRef.current = workoutTime;
    }, [workoutTime]);

    const buildWorkoutStatePayload = useCallback((sourceExercises, elapsedSeconds) => {
        // Only sync exercises that have at least one set with progress
        const exercisesWithProgress = sourceExercises.map(ex => {
            const setsWithProgress = ex.sets.filter(s => !!s.completed).map(s => ({
                id: s.id,
                repetitions: parseInt(s.log?.reps) || 0,
                load: parseFloat(s.log?.weight) || 0,
                loadUnit: String(unitSystem === 'imperial' ? 2 : 1),
                setType: mapSetType(s.type),
                technique: mapTechnique(s.technique || 'Straight'),
                rpe: parseFloat(s.log?.rpe) || 0,
                restSeconds: parseInt(s.prescribedRest) || 90,
                isExtra: !!s.isExtra,
                completed: true, // If it's in this list, it's completed
                failure: !!s.failure
            }));

            if (setsWithProgress.length === 0) return null;

            return {
                exerciseId: parseInt(ex.id) || ex.exerciseId || 0,
                sets: setsWithProgress
            };
        }).filter(Boolean);

        return {
            sessionId: String(workoutSessionId),
            savedAtUtc: new Date().toISOString(),
            exercises: exercisesWithProgress
        };
    }, [workoutSessionId, unitSystem]);
    
    /**
     * Sincroniza o estado atual do treino com o servidor.
     * Só envia se houver mudança no payload filtrado desde a última sincronização.
     */
    const syncWorkoutStateIfNeeded = useCallback(async ({ sourceExercises, elapsedSeconds }) => {
        if (!workoutSessionId || syncInFlightRef.current) return;

        // 1. Build payload containing ONLY current completed sets
        const payload = buildWorkoutStatePayload(sourceExercises ?? exercisesRef.current, elapsedSeconds ?? workoutTimeRef.current);
        
        // 2. Compara o hash do payload de séries FINALIZADAS
        const currentPayloadHash = JSON.stringify(payload.exercises); // Compare only exercises/sets content
        
        // 3. Se for igual ao que o servidor já tem como "Estado Finalizado", não faz nada
        if (currentPayloadHash === lastSyncedHashRef.current) {
            return;
        }

        // 4. Se o usuário apenas DESMARCOU uma série, não sincronizamos
        const currentDoneCount = payload.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        const lastDoneCount = parseInt(sessionStorage.getItem(`lastDoneCount_client_${workoutSessionId}`) || '0');
        
        if (currentDoneCount < lastDoneCount) {
             return;
        }

        // 5. Inicia a sincronização
        syncInFlightRef.current = true;
        const previousHash = lastSyncedHashRef.current;
        lastSyncedHashRef.current = currentPayloadHash;
        sessionStorage.setItem(`lastDoneCount_client_${workoutSessionId}`, currentDoneCount.toString());

        try {
            console.log('Sincronizando Estado Consolidado (Client)...', payload);
            await updateWorkoutState(workoutSessionId, payload);
        } catch (error) {
            console.error('Falha na sincronização (Client):', error);
            lastSyncedHashRef.current = previousHash;
        } finally {
            syncInFlightRef.current = false;
        }
    }, [workoutSessionId, updateWorkoutState, buildWorkoutStatePayload]);

    // -- Fetch Plans from API & LocalStorage --
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                console.log('TrainingPlansClient: Calling getMe()...');
                const me = await getMe();
                const userId = me.id || me.userId;
                
                if (!userId) {
                    console.warn('TrainingPlansClient: No valid user ID returned from getMe.');
                    return;
                }
                
                console.log('TrainingPlansClient: Fetching training plans for user:', userId);
                const response = await getWorkoutPlansByUser(userId);
                const raw = Array.isArray(response) 
                    ? response 
                    : (response?.data || response?.items || []);
                
                const data = raw.map(p => normalizePlan(p));
                setAssignedPlans(data);
                
                // Update local storage cache
                localStorage.setItem(`shapeup_client_plans_${userId}`, JSON.stringify(data));
            } catch (err) {
                console.error('Error fetching plans from API:', err);
                const storedPlans = localStorage.getItem(`shapeup_client_plans_${localStorage.getItem('shapeup_client_id')}`);
                if (storedPlans) {
                    setAssignedPlans(JSON.parse(storedPlans));
                }
            }
        };

        fetchPlans();
    }, [getMe, getWorkoutPlansByUser]);

    // -- Training Plans Tour Trigger --
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_training_plans_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="tp-plan-card"]',
                    content: t('tour.training_client.1'),
                },
                {
                    selector: '[data-tour="tp-start-btn"]',
                    content: t('tour.training_client.2'),
                },
                {
                    selector: '[data-tour="tp-history"]',
                    content: t('tour.training_client.3'),
                }
            ];
            setSteps(tourSteps);
            setCurrentStep(0);
            setTimeout(() => {
                setIsOpen(true);
            }, 700);
            localStorage.setItem('shapeup_training_plans_tour_seen', 'true');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setIsOpen, setSteps]);

    // -- Session Engine Tour Trigger --
    useEffect(() => {
        if (sessionActive) {
            const hasSeenSessionTour = localStorage.getItem('shapeup_session_engine_tour_seen');
            if (!hasSeenSessionTour) {
                const tourSteps = [
                    {
                        selector: '[data-tour="se-global-timer"]',
                        content: t('tour.session_engine.1'),
                    },
                    {
                        selector: '[data-tour="se-rest-timer"]',
                        content: t('tour.session_engine.2'),
                    },
                    {
                        selector: '[data-tour="se-exercises"]',
                        content: t('tour.session_engine.3'),
                    },
                    {
                        selector: '[data-tour="se-add-set"]',
                        content: t('tour.session_engine.4'),
                    }
                ];
                setSteps(tourSteps);
                setCurrentStep(0);
                setTimeout(() => {
                    setIsOpen(true);
                }, 800);
                localStorage.setItem('shapeup_session_engine_tour_seen', 'true');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionActive, setIsOpen, setSteps, setCurrentStep, t]);

    // Debounced synchronization: Only sync state when changes occur and have settled (2s)
    useEffect(() => {
        if (!sessionActive || !workoutSessionId || !hasFirstDoneRef.current) return;
        
        const timerId = setTimeout(() => {
            syncWorkoutStateIfNeeded({
                sourceExercises: exercises,
                elapsedSeconds: workoutTimeRef.current
            });
        }, 2000);

        return () => clearTimeout(timerId);
    }, [exercises, sessionActive, workoutSessionId, syncWorkoutStateIfNeeded]);

    // -- Start A Specific Session --
    const startSessionForPlan = async (plan) => {
        // Call API to start workout
        try {
            console.log('Starting workout via API for plan:', plan.id);
            const me = await getMe();
            const command = {
                workoutPlanId: plan._planId || plan.id,
                targetUserId: me.id || me.userId
            };
            const startedWorkout = await startWorkout(command);
            setWorkoutSessionId(startedWorkout?.sessionId || startedWorkout?.id || startedWorkout?.workoutSessionId || null);
        } catch (error) {
            console.error('Failed to start workout via API:', error);
            setWorkoutSessionId(null);
        }

        // Map the plan's exercises into the runtime session engine format
        const runtimeExercises = plan.exercises.map((ex, exIdx) => {
            return {
                id: ex.exerciseId ?? ex.id ?? `ex_${exIdx}`,
                name: ex.name || ex.exerciseNamePt || ex.exerciseName || 'Exercise',
                target: (ex.muscles && ex.muscles.length > 0) ? ex.muscles.join(', ') : (ex.tags || 'General'),
                sets: ex.sets.map((s, sIdx) => ({
                    id: `s_${exIdx}_${sIdx}`,
                    type: s.type,
                    target: `${s.reps} reps @ ${s.load}% | RPE ${s.rpe}`,
                    completed: false,
                    failure: false,
                    prescribedRest: s.rest || 90,
                    log: { weight: '', reps: '', rpe: '' }
                }))
            };
        });

        setExercises(runtimeExercises);
        hasFirstDoneRef.current = false;
        committedSetsRef.current = new Set();
        lastSyncedHashRef.current = buildWorkoutStateComparisonHash(runtimeExercises);
        doneClickGuardRef.current = {};
        setIsFinishingSession(false);
        setActivePlan(plan);
        setSessionActive(true);
        setWorkoutTime(0);
        setSessionTitle(`${plan.name} · ${plan.phase}`);
    };

    // -- Timers Effect --
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


    // -- Handlers --
    const startRest = (seconds) => {
        setRestTimer(seconds);
        setIsResting(true);
    };

    const adjustRest = (amount) => {
        setRestTimer(prev => Math.max(0, prev + amount));
        if (!isResting && amount > 0) {
            setIsResting(true);
        }
    };

    const skipRest = () => {
        setIsResting(false);
        setRestTimer(0);
    };

    const toggleSetComplete = (exerciseIndex, setIndex, defaultRest) => {
        const clickKey = `${exerciseIndex}-${setIndex}`;
        const now = Date.now();
        const lastClick = doneClickGuardRef.current[clickKey] || 0;
        if (now - lastClick < 350) return;
        doneClickGuardRef.current[clickKey] = now;

        const newExercises = [...exercises];
        const isNowComplete = !newExercises[exerciseIndex].sets[setIndex].completed;

        newExercises[exerciseIndex].sets[setIndex].completed = isNowComplete;
        setExercises(newExercises);

        if (isNowComplete) {
            const targetSet = newExercises[exerciseIndex].sets[setIndex];
            committedSetsRef.current.add(targetSet.id);
            hasFirstDoneRef.current = true;
        }

        if (isNowComplete && defaultRest > 0) {
            startRest(defaultRest);
        }
    };

    const toggleFailure = (exerciseIndex, setIndex) => {
        const newExercises = [...exercises];
        const isFailing = !newExercises[exerciseIndex].sets[setIndex].failure;
        newExercises[exerciseIndex].sets[setIndex].failure = isFailing;

        // Auto-set RPE to 10 when reaching failure
        if (isFailing) {
            newExercises[exerciseIndex].sets[setIndex].log.rpe = '10';
        }

        setExercises(newExercises);
    };

    const updateSetLog = (exerciseIndex, setIndex, field, value) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].log[field] = value;
        setExercises(newExercises);
    };

    const addExtraSet = (exerciseIndex) => {
        const newExercises = [...exercises];
        const newSetId = `extra_${Date.now()}`;
        newExercises[exerciseIndex].sets.push({
            id: newSetId,
            type: 'working',
            isExtra: true,
            target: 'Extra Volume',
            completed: false,
            failure: false,
            log: { weight: '', reps: '', rpe: '' },
            prescribedRest: 60 // Default for extra sets
        });
        setExercises(newExercises);
    };

    const removeExtraSet = (exerciseIndex, setIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        setExercises(newExercises);
    };

    const updateSetType = (exerciseIndex, setIndex, newType) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].type = newType;
        setExercises(newExercises);
    };

    const finishSession = async () => {
        setIsFinishingSession(true);

        // Force a final sync before proceeding to feedback/overview to ensure no pending changes are lost
        await syncWorkoutStateIfNeeded({
            sourceExercises: exercises,
            elapsedSeconds: workoutTime
        });

        // Instead of directly ending, trigger feedback flow
        setShowFeedbackModal(true);
        setSessionTitle(null);
        setIsFinishingSession(false);
    };

    const submitFeedback = () => {
        setShowFeedbackModal(false);
        setShowOverviewModal(true);
    };

    const skipOverviewAndFinish = () => {
        // Compute basic stats to save to history
        const totalVol = exercises.reduce((acc, ex) => {
            return acc + ex.sets.filter(s => s.completed).reduce((setAcc, set) => {
                const w = parseFloat(set.log.weight) || 0;
                const r = parseFloat(set.log.reps) || 0;
                return setAcc + (w * r);
            }, 0);
        }, 0);

        // Determine total session status
        let totalSetsCount = 0;
        let completedSetsCount = 0;
        exercises.forEach(ex => {
            ex.sets.forEach(s => {
                totalSetsCount++;
                if (s.completed) completedSetsCount++;
            });
        });

        let sessionStatus = 'completed';
        if (completedSetsCount === 0) sessionStatus = 'skipped';
        else if (completedSetsCount < totalSetsCount) sessionStatus = 'partial';

        // Save session history back to identical plan in localStorage
        if (activePlan) {
            const clientId = localStorage.getItem('shapeup_client_id') || 1;
            const storedPlansRaw = localStorage.getItem(`shapeup_client_plans_${clientId}`);
            if (storedPlansRaw) {
                let dbPlans = JSON.parse(storedPlansRaw);
                const targetPlanIdx = dbPlans.findIndex(p => p.id === activePlan.id);
                if (targetPlanIdx !== -1) {
                    const newHistoryEntry = {
                        id: `h${Date.now()}`,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        duration: formatTime(workoutTime),
                        totalVol: formatWeight(totalVol).replace('0 ', ''),
                        rpe: sessionFeedback.rpe || 5,
                        comments: sessionFeedback.comments || '',
                        status: sessionStatus,
                        exercises: exercises.map(ex => ({
                            name: ex.name,
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

                    dbPlans[targetPlanIdx].history = [newHistoryEntry, ...(dbPlans[targetPlanIdx].history || [])];
                    localStorage.setItem(`shapeup_client_plans_${clientId}`, JSON.stringify(dbPlans));

                    // Evaluate Notifications / Alerts
                    const skipCounts = JSON.parse(localStorage.getItem('shapeup_skipped_counts') || '{}');
                    const activeClientId = localStorage.getItem('shapeup_client_id') || '1';
                    const activeClientName = localStorage.getItem('shapeup_user_name') || 'Client';

                    exercises.forEach(ex => {
                        const isSkipped = ex.sets.every(s => !s.completed);
                        if (isSkipped) {
                            skipCounts[ex.name] = (skipCounts[ex.name] || 0) + 1;
                            if (skipCounts[ex.name] >= 2) {
                                addNotification('pro', 'alert', 'Skipped Exercise Alert', `${activeClientName} skipped ${ex.name} multiple times.`, 'warning', { link: `/dashboard/clients/${activeClientId}`, subType: 'alerts_skipped', sessionId: newHistoryEntry.id, clientId: activeClientId, clientName: activeClientName });
                            }
                        } else {
                            if (skipCounts[ex.name]) delete skipCounts[ex.name]; // Reset if they finally did it
                        }
                    });
                    localStorage.setItem('shapeup_skipped_counts', JSON.stringify(skipCounts));

                    if (sessionFeedback.rpe >= 8) {
                        addNotification('pro', 'alert', 'Fatigue Alert', `${activeClientName} reported high RPE (${sessionFeedback.rpe}) during session.`, 'error', { link: `/dashboard/clients/${activeClientId}`, subType: 'alerts_fatigue', sessionId: newHistoryEntry.id, clientId: activeClientId, clientName: activeClientName });
                    }

                    if (sessionStatus === 'skipped') {
                        const skippedSessions = parseInt(localStorage.getItem('shapeup_skipped_sessions') || '0', 10) + 1;
                        if (skippedSessions >= 2) {
                            addNotification('pro', 'alert', 'Missed Session Alert', `${activeClientName} skipped multiple training days recently.`, 'error', { link: `/dashboard/clients/${activeClientId}`, subType: 'alerts_missed', sessionId: newHistoryEntry.id, clientId: activeClientId, clientName: activeClientName });
                        }
                        localStorage.setItem('shapeup_skipped_sessions', skippedSessions.toString());
                    } else if (sessionStatus === 'completed') {
                        localStorage.setItem('shapeup_skipped_sessions', '0');
                    }

                    // Reflect instantly on dashboard plans
                    setAssignedPlans(dbPlans);
                }
            }
        }

        setShowOverviewModal(false);
        // Actual reset
        setSessionFeedback({ rpe: null, comments: '' });
        setSessionActive(false);
        setActivePlan(null);
        setWorkoutSessionId(null);
        setIsFinishingSession(false);
        setWorkoutTime(0);
        setIsResting(false);
        setRestTimer(0);
        setExercises([]);
        hasFirstDoneRef.current = false;
        lastSyncedHashRef.current = '';
        doneClickGuardRef.current = {};
        setViewingExerciseDef(null);
    };

    const handleCancelSessionConfirm = async () => {
        if (workoutSessionId) {
            try {
                await cancelWorkout(workoutSessionId);
            } catch (error) {
                console.error('Failed to cancel workout via API:', error);
            }
        }
        setShowCancelModal(false);
        setSessionFeedback({ rpe: null, comments: '' });
        setSessionActive(false);
        setActivePlan(null);
        setWorkoutSessionId(null);
        setIsFinishingSession(false);
        setWorkoutTime(0);
        setIsResting(false);
        setRestTimer(0);
        setExercises([]);
        hasFirstDoneRef.current = false;
        lastSyncedHashRef.current = '';
        doneClickGuardRef.current = {};
        setViewingExerciseDef(null);
    };

    // -- History Calculation --
    const allHistory = assignedPlans.flatMap(plan =>
        (plan.history || []).map(h => {
            const rawVol = h.totalVol || '0';
            // Strip out formatting characters (dots, commas) safely, then convert to float
            // e.g. "1.680" -> "1680", "1,680" -> "1680"
            const cleanVolStr = rawVol.toString().replace(/[^\d]/g, '');
            const v = parseFloat(cleanVolStr);
            const originUnit = rawVol.includes('lbs') ? 'imperial' : 'metric';
            const converted = isNaN(v) ? 0 : convertWeight(v, originUnit);

            return {
                ...h,
                planName: plan.name,
                convertedVol: formatWeight(converted, unitSystem).replace('0 ', '') // formatWeight attaches the correct string
            };
        })
    ).sort((a, b) => {
        const timeA = parseInt(a.id.replace('h', '')) || 0;
        const timeB = parseInt(b.id.replace('h', '')) || 0;
        return timeB - timeA;
    });

    const totalPages = Math.ceil(allHistory.length / HISTORY_PER_PAGE);
    const paginatedHistory = allHistory.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

    // 1. Inactive View (Plan Overview)
    if (!sessionActive) {
        return (
            <div className="su-client-dashboard">
                <h1 className="su-page-title su-mb-6">{t('client.training.title')}</h1>

                {assignedPlans.length === 0 ? (
                    <Card className="su-active-plan-card" data-tour="tp-plan-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{t('client.training.empty.title')}</h3>
                        <p data-tour="tp-start-btn" className="su-text-muted">{t('client.training.empty.desc')}</p>
                    </Card>
                ) : (
                    <div data-tour="tp-plan-card">
                        {assignedPlans.map(plan => (
                            <Card key={plan.id} className="su-active-plan-card su-mb-4">
                                <div className="su-plan-hero">
                                    <div className="su-plan-hero-content">
                                        <span className="su-tag">{plan.phase}</span>
                                        <h2 className="su-plan-title">{plan.name}</h2>
                                        <p className="su-coach-credit">{t('client.training.card.difficulty')}: <strong>{plan.difficulty}</strong> · {plan.weeks} {t('client.training.card.weeks')}</p>

                                        <div className="su-plan-meta-row">
                                            <div className="su-meta-pill">
                                                <DumbbellIcon size={16} /> {plan.exercises.length} {t('client.training.card.exercises')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="su-plan-hero-action" data-tour="tp-start-btn">
                                        <Button size="lg" icon={<Play size={20} fill="currentColor" />} onClick={() => startSessionForPlan(plan)}>
                                            {t('client.training.card.btn')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <h3 className="su-section-title su-mt-8" data-tour="tp-history">{t('client.training.history.title')}</h3>
                <div className="su-history-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {allHistory.length === 0 ? (
                        <p className="su-text-muted">{t('client.training.history.empty')}</p>
                    ) : (
                        paginatedHistory.map((hist) => (
                            <Card
                                key={hist.id}
                                className="su-history-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setSelectedSession(hist);
                                    setShowSessionModal(true);
                                }}
                            >
                                <div className="su-hist-left">
                                    <div className="su-hist-date">
                                        <CalendarDays size={18} className="su-text-muted" /> {hist.date}
                                    </div>
                                    <div className="su-hist-title">{hist.planName}</div>
                                </div>
                                <div className="su-hist-right">
                                    {/* <span className="su-pr-badge">New PR!</span> */}
                                    <span className="su-text-muted">⏱ {hist.duration}</span>
                                    <span className="su-hist-vol">{hist.convertedVol} {t('client.training.history.vol')}</span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="su-pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <Button
                            variant="outline"
                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                            disabled={historyPage === 1}
                            icon={<ChevronLeft size={16} />}
                        >
                            {t('client.training.pagination.prev')}
                        </Button>
                        <span className="su-text-muted" style={{ fontSize: '0.9rem' }}>
                            {t('client.training.pagination.page')} {historyPage} {t('client.training.pagination.of')} {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                            disabled={historyPage === totalPages}
                        >
                            {t('client.training.pagination.next')} <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                        </Button>
                    </div>
                )}

                {showSessionModal && selectedSession && (
                    <SessionDetailModal
                        session={selectedSession}
                        planName={selectedSession.planName}
                        onClose={() => {
                            setShowSessionModal(false);
                            setSelectedSession(null);
                        }}
                    />
                )}
            </div>
        );
    }

    // 2. Active Session Engine
    return (
        <div className="su-session-engine">

            {/* Sticky Header with Timers */}
            <div className="su-session-header-sticky" data-tour="se-global-timer">
                <div className="su-session-header-left">
                    <Button variant="outline" onClick={() => setShowCancelModal(true)} size="sm">{t('client.session.btn.cancel')}</Button>
                </div>

                {/* Rest Timer Group */}
                <div className={`su-rest-timer-group ${isResting ? 'active' : ''}`} data-tour="se-rest-timer">
                    <div className="su-rest-controls">
                        <button
                            className="su-adjust-rest-btn minus"
                            onClick={() => adjustRest(-15)}
                            title="Remove 15 seconds"
                        >
                            -15s
                        </button>

                        <div className="su-rest-clock-display">
                            <Clock size={20} />
                            <span className="su-timer-digits">
                                {formatTime(restTimer)}
                            </span>
                        </div>

                        <button
                            className="su-adjust-rest-btn plus"
                            onClick={() => adjustRest(15)}
                            title="Add 15 seconds"
                        >
                            +15s
                        </button>
                    </div>
                </div>

                <div className="su-session-header-right">
                    {isResting && <span className="su-timer-label">{t('client.session.resting')}</span>}
                    {isResting && (
                        <button className="su-skip-rest-btn" onClick={skipRest} title={t('client.session.btn.skip')}>
                            <FastForward size={16} />
                            {t('client.session.btn.skip')}
                        </button>
                    )}
                </div>
            </div>



            {/* Application Flow Overlays */}

            {/* Cancel Session Confirmation Modal */}
            {showCancelModal && (
                <div className="su-rest-modal-overlay" style={{ zIndex: 11000 }}>
                    <div className="su-feedback-modal-content" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>{t('client.session.modal.cancel.title')}</h3>
                        <p className="su-text-muted su-mb-6">
                            {t('client.session.modal.cancel.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="outline" fullWidth onClick={() => setShowCancelModal(false)}>
                                {t('client.session.modal.cancel.keep')}
                            </Button>
                            <Button
                                fullWidth
                                onClick={handleCancelSessionConfirm}
                                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }}
                            >
                                {t('client.session.modal.cancel.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Session Feedback Modal */}
            {showFeedbackModal && (
                <div className="su-rest-modal-overlay">
                    <div className="su-feedback-modal-content">
                        <h3>{t('client.session.modal.feedback.title')}</h3>
                        <p className="su-text-muted su-mb-4" style={{ textAlign: 'center' }}>{t('client.session.modal.feedback.desc')}</p>

                        <div className="su-feedback-rpe-scale">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                <button
                                    key={rating}
                                    className={`su-rpe-btn ${sessionFeedback.rpe === rating ? 'active' : ''}`}
                                    onClick={() => setSessionFeedback({ ...sessionFeedback, rpe: rating })}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>

                        <div className="su-feedback-comments">
                            <label className="su-input-label">{t('client.session.modal.feedback.comments')}</label>
                            <textarea
                                className="su-textarea-input"
                                placeholder={t('client.session.modal.feedback.placeholder')}
                                value={sessionFeedback.comments}
                                onChange={(e) => setSessionFeedback({ ...sessionFeedback, comments: e.target.value })}
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

            {/* Post-Session Gamified Overview Modal */}
            {showOverviewModal && (() => {
                const totalVol = exercises.reduce((acc, ex) => {
                    return acc + ex.sets.filter(s => s.completed).reduce((setAcc, set) => {
                        const w = parseFloat(set.log.weight) || 0;
                        const r = parseFloat(set.log.reps) || 0;
                        return setAcc + (w * r);
                    }, 0);
                }, 0);

                // Calculate New PRs dynamically based on previous history
                const clientId = localStorage.getItem('shapeup_client_id') || 1;
                const storedPlansRaw = localStorage.getItem(`shapeup_client_plans_${clientId}`);
                let previousBestMap = {};

                if (storedPlansRaw) {
                    const dbPlans = JSON.parse(storedPlansRaw);
                    dbPlans.forEach(plan => {
                        (plan.history || []).forEach(h => {
                            h.exercises.forEach(ex => {
                                let maxL = 0;
                                let maxR = 0;
                                ex.sets.forEach(s => {
                                    const l = parseFloat(s.load) || 0;
                                    const r = parseFloat(s.reps) || 0;
                                    if (l > maxL || (l === maxL && r > maxR)) { maxL = l; maxR = r; }
                                });
                                if (maxL > 0 || maxR > 0) {
                                    const prev = previousBestMap[ex.name] || { load: 0, reps: 0 };
                                    if (maxL > prev.load || (maxL === prev.load && maxR > prev.reps)) {
                                        previousBestMap[ex.name] = { load: maxL, reps: maxR };
                                    }
                                }
                            });
                        });
                    });
                }

                // Check current session
                let newPrsCount = 0;
                exercises.forEach(ex => {
                    let maxL = 0;
                    let maxR = 0;
                    ex.sets.filter(s => s.completed).forEach(s => {
                        const l = parseFloat(s.log.weight) || 0;
                        const r = parseFloat(s.log.reps) || 0;
                        if (l > maxL || (l === maxL && r > maxR)) { maxL = l; maxR = r; }
                    });

                    if (maxL > 0 || maxR > 0) {
                        const prevBest = previousBestMap[ex.name];
                        if (prevBest && (maxL > prevBest.load || (maxL === prevBest.load && maxR > prevBest.reps))) {
                            newPrsCount++;
                        }
                    }
                });

                return (
                    <div className="su-gamified-overlay">
                        <div className="su-gamified-content">
                            <button className="su-close-gamified" onClick={skipOverviewAndFinish}>
                                <X size={24} />
                            </button>

                            <div className="su-gamified-header">
                                <div className="su-trophy-icon">🏆</div>
                                <h2>{t('client.session.modal.gamified.title')}</h2>
                                <p>{t('client.session.modal.gamified.desc')} {activePlan?.name || t('client.session.modal.gamified.fallback')}.</p>
                            </div>

                            <div className="su-gamified-stats">
                                <div className="su-stat-box">
                                    <span className="su-stat-value">{totalVol.toLocaleString()}</span>
                                    <span className="su-stat-label">{t('client.session.modal.gamified.vol').replace('(kg)', `(${unitSystem === 'imperial' ? 'lbs' : 'kg'})`)}</span>
                                    {totalVol > 0 && (
                                        <div className="su-stat-trend up">
                                            <TrendingUp size={14} /> +XP
                                        </div>
                                    )}
                                </div>
                                <div className="su-stat-box">
                                    <span className="su-stat-value">{Math.ceil(workoutTime / 60)}m</span>
                                    <span className="su-stat-label">{t('client.session.modal.gamified.duration')}</span>
                                </div>
                                <div className="su-stat-box highlight" style={newPrsCount === 0 ? { opacity: 0.6 } : {}}>
                                    <span className="su-stat-value">{newPrsCount}</span>
                                    <span className="su-stat-label">{t('client.session.modal.gamified.prs')}</span>
                                    <Award size={18} className="su-stat-icon-abs" />
                                </div>
                            </div>

                            <div className="su-gamified-actions">
                                <Button size="lg" fullWidth onClick={skipOverviewAndFinish}>
                                    {t('client.session.modal.gamified.return')}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="su-execution-scroll" data-tour="se-exercises">
                {exercises.map((exercise, exIndex) => (
                    <Card key={exercise.id} className="su-execution-card">
                        <div className="su-ex-execution-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>{exIndex + 1}. {exercise.name}</h3>
                                <span className="su-ex-target">{exercise.target}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                icon={<Play size={14} />}
                                onClick={() => {
                                    // Try to find the detailed exercise definition from the global database
                                    const exDef = exercisesDB.find(e => e.name.toLowerCase() === exercise.name.toLowerCase());
                                    // If found, open modal. Otherwise, create a mock fallback to prevent crash
                                    if (exDef) {
                                        setViewingExerciseDef(exDef);
                                    } else {
                                        setViewingExerciseDef({
                                            name: exercise.name,
                                            type: 'Unknown',
                                            equipment: 'Unknown',
                                            muscles: ['Unknown']
                                        });
                                    }
                                }}
                            >
                                {t('client.session.card.details')}
                            </Button>
                        </div>

                        <div className="su-sets-execution">
                            {/* Table Header Row */}
                            <div className="su-exec-row su-exec-header">
                                <div className="col-set" title="The current set sequence or type">{t('client.session.table.set')}</div>
                                <div className="col-target" title="Prescribed target range and load">{t('client.session.table.target')}</div>
                                <div className="col-rest" title="Prescribed rest time">{t('client.session.table.rest')}</div>
                                <div className="col-log" title="Actual weight logged for this set">{t('client.session.table.weight')}</div>
                                <div className="col-log" title="Actual reps logged for this set">{t('client.session.table.reps')}</div>
                                <div className="col-log" title="Rate of Perceived Exertion (1-10)">{t('client.session.table.rpe')}</div>
                                <div className="col-failure" title="Check if muscular failure was reached">{t('client.session.table.failure')}</div>
                                <div className="col-done" title="Mark this set as complete">{t('client.session.table.done')}</div>
                            </div>

                            {/* Sets Iteration */}
                            {exercise.sets.map((set, setIndex) => (
                                <div key={set.id} className={`su-exec-row ${set.completed ? 'completed' : ''}`}>
                                    <div className="col-set">
                                        {set.isExtra ? (
                                            <select
                                                className={`su-set-badge ${set.type} su-set-type-select`}
                                                value={set.type}
                                                onChange={(e) => updateSetType(exIndex, setIndex, e.target.value)}
                                            >
                                                <option value="warmup">{t('client.session.set_type.warmup')}</option>
                                                <option value="feeder">{t('client.session.set_type.feeder')}</option>
                                                <option value="working">{t('client.session.set_type.working')}</option>
                                                <option value="topset">{t('client.session.set_type.topset')}</option>
                                                <option value="dropset">{t('client.session.set_type.dropset')}</option>
                                            </select>
                                        ) : (
                                            <span className={`su-set-badge ${set.type}`}>
                                                {t(`client.session.set_type.${set.type}`) !== `client.session.set_type.${set.type}` ? t(`client.session.set_type.${set.type}`) : (set.type.charAt(0).toUpperCase() + set.type.slice(1))}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-target">
                                        <div className="su-target-primary">{set.target}</div>
                                        {set.instruction && (
                                            <div className="su-target-instruction">
                                                {set.instruction}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-rest">
                                        <div className="su-rest-display">
                                            <Clock size={16} />
                                            <span>{set.prescribedRest}s</span>
                                        </div>
                                    </div>
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.weight}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'weight', e.target.value)}
                                            placeholder="--"
                                            disabled={set.completed}
                                        />
                                    </div>
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.reps}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'reps', e.target.value)}
                                            placeholder="--"
                                            disabled={set.completed}
                                        />
                                    </div>
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.rpe}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'rpe', e.target.value)}
                                            placeholder="--"
                                            disabled={set.completed || set.failure}
                                            title={set.failure ? "RPE is locked to 10 when reaching failure" : ""}
                                        />
                                    </div>
                                    <div className="col-failure">
                                        <label className={`su-failure-checkbox ${set.failure ? 'checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={!!set.failure}
                                                onChange={() => toggleFailure(exIndex, setIndex)}
                                                className="su-visually-hidden"
                                            />
                                            <span className="su-failure-icon">🔥</span>
                                        </label>
                                    </div>
                                    <div className="col-done">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {set.isExtra && !set.completed && (
                                                <button
                                                    className="su-btn-icon-danger"
                                                    onClick={() => removeExtraSet(exIndex, setIndex)}
                                                    style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                                    title="Remove extra set"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <button
                                                className={`su-check-circle ${set.completed ? 'checked' : ''}`}
                                                onClick={() => toggleSetComplete(exIndex, setIndex, set.prescribedRest)}
                                            >
                                                <CheckCircle size={28} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Dynamic + Add Set Action */}
                            <div className="su-add-set-row" data-tour="se-add-set">
                                <button className="su-add-set-btn" onClick={() => addExtraSet(exIndex)}>
                                    <Plus size={16} /> {t('client.session.btn.add_set')}
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                <div className="su-finish-run-container">
                    <Button size="lg" fullWidth className="su-complete-session-btn" onClick={finishSession} disabled={isFinishingSession}>
                        {t('client.session.btn.finish')}
                    </Button>
                </div>
            </div>

            {/* Exercise Detail Modal Overlay */}
            {
                viewingExerciseDef && (
                    <ExerciseModal
                        exercise={viewingExerciseDef}
                        onClose={() => setViewingExerciseDef(null)}
                    />
                )
            }
        </div >
    );
};

const DumbbellIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.4 14.4l-4.8-4.8" />
        <path d="M6 18l-1.2-1.2a2.82 2.82 0 0 1 0-4l1.4-1.4a2.82 2.82 0 0 1 4 0l1.2 1.2" />
        <path d="M18 6l1.2 1.2a2.82 2.82 0 0 1 0 4l-1.4 1.4a2.82 2.82 0 0 1-4 0L12.6 11.4" />
        <path d="M4 14l-2 2" />
        <path d="M20 10l2-2" />
    </svg>
)

// ─── SESSION DETAIL MODAL (matches coach view) ────────────────────
const SET_TYPE_COLORS = { warmup: '#94a3b8', feeder: '#a78bfa', working: '#60a5fa', topset: '#f59e0b', backoff: '#34d399' };
const SetTypeBadge = ({ type }) => {
    const { t } = useLanguage();
    return (
        <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
            borderRadius: 999, color: '#fff', background: SET_TYPE_COLORS[type] || '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap'
        }}>{t(`client.session.set_type.${type}`) || type}</span>
    );
};

const SessionDetailModal = ({ session, planName, onClose }) => {
    const { t, unitSystem, convertWeight, formatWeight } = useLanguage();

    // We infer the original scale from the session's totalVol
    const originUnit = (session.totalVol || '').includes('lbs') ? 'imperial' : 'metric';

    return (
        <div className="su-modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="su-modal-box su-session-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="su-modal-close" onClick={onClose}><X size={20} /></button>
                <h2 className="su-modal-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>{planName}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
                    {session.date} · {session.duration} · {session.convertedVol || session.totalVol} {t('client.training.history.vol')} · RPE {session.rpe}
                </p>
                <div className="su-sd-exercises" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {session.exercises.map((ex, i) => (
                        <div key={i} className="su-sd-ex-block" style={{ marginBottom: '1.5rem' }}>
                            <div className="su-sd-ex-name" style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                {ex.name}
                                {ex.skipped && <span className="su-skipped-tag" style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--danger)', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)' }}>{t('pro.client.plan.history.tag.skipped.ex')}</span>}
                            </div>
                            {ex.skipped ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0' }}>
                                    Skipped
                                </p>
                            ) : (
                                <div className="su-sd-sets-table" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="su-sd-sets-head" style={{ display: 'grid', gridTemplateColumns: '40px 80px 1fr 1fr 1fr', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                                        <span>{t('client.session.table.set')}</span><span>Type</span><span>{t('client.session.table.reps')}</span><span>{t('client.session.table.weight')}</span><span>RPE</span>
                                    </div>
                                    {ex.sets.map((s, si) => (
                                        <div key={si} className="su-sd-set-row" style={{ display: 'grid', gridTemplateColumns: '40px 80px 1fr 1fr 1fr', alignItems: 'center', fontSize: '0.95rem' }}>
                                            <span className="su-sd-set-num" style={{ color: 'var(--text-muted)' }}>{s.set}</span>
                                            <SetTypeBadge type={s.type} />
                                            <span>{s.reps} reps</span>
                                            <span>{convertWeight(parseFloat(s.load) || 0, originUnit) % 1 === 0 ? convertWeight(parseFloat(s.load) || 0, originUnit).toString() : convertWeight(parseFloat(s.load) || 0, originUnit).toFixed(1)} {unitSystem === 'imperial' ? 'lbs' : 'kg'}</span>
                                            <span>RPE {s.rpe}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ClientView;
