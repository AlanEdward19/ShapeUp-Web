import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, ChevronRight, ChevronLeft, CalendarDays, Plus, FastForward, Award, TrendingUp, X, Trash2, Dumbbell as DumbbellIcon, Save, Settings2, Copy, History, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ExerciseModal from '../../components/ExerciseModal';
import { exercisesDB } from '../../data/mockExercises';
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
import './TrainingPlansClient.css';
import './TrainingPlansProfessional.css';

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const IndependentPlanCard = ({ plan, onEdit, onCopy, onDelete, onStart }) => {
    const { t } = useLanguage();
    return (
        <Card className="su-independent-plan-card">
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
                        <Activity size={14} />
                        <span>{plan.exercises?.length || 0} {t('pro.client.plan.exercises')}</span>
                    </div>
                </div>
                <div className="su-plan-card-side">
                    <button className="su-execute-btn-large" onClick={() => onStart(plan)}>
                        <Play size={20} fill="currentColor" />
                        {t('client.training.card.btn')}
                    </button>
                    <div className="su-plan-tiny-actions">
                        <button onClick={() => onEdit(plan)} title={t('pro.client.plan.btn.edit')}><Settings2 size={16} /></button>
                        <button onClick={() => onCopy(plan)} title={t('pro.client.plan.btn.copy')}><Copy size={16} /></button>
                        <button onClick={onDelete} title={t('independent.builder.btn.delete')} className="delete"><Trash2 size={16} /></button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const TrainingPlansIndependent = () => {
    const { setSessionTitle } = useOutletContext();
    const { t, unitSystem, convertWeight, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();

    // ─── STATE MANAGEMENT ──────────────────────────────────────────

    // 1. Storage & Navigation
    const [plans, setPlans] = useState([]);
    const [editingPlan, setEditingPlan] = useState(null);

    // 2. Session Engine State
    const [sessionActive, setSessionActive] = useState(false);
    const [activePlan, setActivePlan] = useState(null);
    const [workoutTime, setWorkoutTime] = useState(0);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [sessionExercises, setSessionExercises] = useState([]);
    const [sessionFeedback, setSessionFeedback] = useState({ rpe: null, comments: '' });

    // 3. Modals & Overlays
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSessionDetail, setShowSessionDetail] = useState(null);

    // 4. Pagination
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 5;

    // ─── EFFECTS ───────────────────────────────────────────────────

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem('shapeup_independent_plans');
        if (stored) {
            setPlans(JSON.parse(stored));
        }
    }, []);

    // Sync Plans to Storage
    useEffect(() => {
        localStorage.setItem('shapeup_independent_plans', JSON.stringify(plans));
    }, [plans]);

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
            exercises: [],
            history: []
        };
        setEditingPlan(newPlan);
    };

    const handleSavePlan = (updated) => {
        setPlans(prev => {
            const exists = prev.some(p => p.id === updated.id);
            if (exists) {
                return prev.map(p => p.id === updated.id ? updated : p);
            }
            return [...prev, updated];
        });
        setEditingPlan(null);
    };

    const handleCopyPlan = (original) => {
        const copy = {
            ...original,
            id: `p${Date.now()}`,
            name: `${original.name} (Copy)`,
            history: [],
            active: false
        };
        setPlans(prev => [...prev, copy]);
    };

    const handleDeletePlan = (id) => {
        setPlans(prev => prev.filter(p => p.id !== id));
    };

    // ─── SESSION ENGINE HANDLERS ──────────────────────────────────

    const startSession = (plan) => {
        const runtimeExercises = plan.exercises.map((ex, exIdx) => ({
            id: ex.id || `ex_${exIdx}`,
            name: ex.name,
            target: ex.tags || 'General',
            sets: ex.sets.map((s, sIdx) => ({
                id: `s_${exIdx}_${sIdx}`,
                type: s.type,
                target: `${s.reps} reps @ ${s.load}% | RPE ${s.rpe}`,
                completed: false,
                failure: false,
                prescribedRest: s.rest || 90,
                log: { weight: '', reps: '', rpe: '' }
            }))
        }));

        setSessionExercises(runtimeExercises);
        setActivePlan(plan);
        setSessionActive(true);
        setSessionTitle(`${plan.name} · ${plan.phase}`);
    };

    const finishSession = () => {
        setShowFeedbackModal(true);
        setSessionTitle(null);
    };

    const submitFeedback = () => {
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

        resetSession();
    };

    const resetSession = () => {
        setSessionActive(false);
        setActivePlan(null);
        setWorkoutTime(0);
        setIsResting(false);
        setRestTimer(0);
        setSessionExercises([]);
        setSessionFeedback({ rpe: null, comments: '' });
        setShowOverviewModal(false);
        setShowFeedbackModal(false);
        setShowCancelModal(false);
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
    const totalPages = Math.ceil(allHistory.length / HISTORY_PER_PAGE);

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
                            <div className="su-rest-clock-display"><Clock size={20} /> <span className="su-timer-digits">{formatTime(restTimer)}</span></div>
                            <button className="su-adjust-rest-btn plus" onClick={() => setRestTimer(p => p + 15)}>+15s</button>
                        </div>
                    </div>
                    <div className="su-session-header-right">
                        {isResting && <button className="su-skip-rest-btn" onClick={() => setIsResting(false)}><FastForward size={16} /> {t('client.session.btn.skip')}</button>}
                    </div>
                </div>

                <div className="su-execution-scroll">
                    {sessionExercises.map((ex, exIdx) => (
                        <Card key={ex.id} className="su-execution-card su-mb-6">
                            <div className="su-ex-execution-header">
                                <div>
                                    <h3 className="su-se-ex-title">{exIdx + 1}. {ex.name}</h3>
                                    <span className="su-ex-target">{ex.target}</span>
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
                                    <div key={s.id} className={`su-exec-row ${s.completed ? 'completed' : ''}`}>
                                        <div className="col-set">
                                            <span className={`su-set-badge ${s.type}`} onClick={() => {
                                                const types = ['warmup', 'working', 'topset', 'backoff'];
                                                const cur = types.indexOf(s.type);
                                                const next = types[(cur + 1) % types.length];
                                                const updated = [...sessionExercises];
                                                updated[exIdx].sets[sIdx].type = next;
                                                setSessionExercises(updated);
                                            }} style={{ cursor: 'pointer' }}>
                                                {t(`client.session.set_type.${s.type}`) !== `client.session.set_type.${s.type}` ? t(`client.session.set_type.${s.type}`) : (s.type.charAt(0).toUpperCase() + s.type.slice(1))}
                                            </span>
                                        </div>
                                        <div className="col-target">
                                            <div className="su-target-primary">{s.target}</div>
                                        </div>
                                        <div className="col-rest">
                                            <div className="su-rest-display">
                                                <Clock size={16} />
                                                <span>{s.prescribedRest}s</span>
                                            </div>
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className="su-exec-input" value={s.log.weight} onChange={e => { const updated = [...sessionExercises]; updated[exIdx].sets[sIdx].log.weight = e.target.value; setSessionExercises(updated); }} placeholder="--" />
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className="su-exec-input" value={s.log.reps} onChange={e => { const updated = [...sessionExercises]; updated[exIdx].sets[sIdx].log.reps = e.target.value; setSessionExercises(updated); }} placeholder="--" />
                                        </div>
                                        <div className="col-log">
                                            <input type="number" className="su-exec-input" value={s.log.rpe} onChange={e => { const updated = [...sessionExercises]; updated[exIdx].sets[sIdx].log.rpe = e.target.value; setSessionExercises(updated); }} placeholder="--" />
                                        </div>
                                        <div className="col-failure">
                                            <label className={`su-failure-checkbox ${s.failure ? 'checked' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    className="su-visually-hidden"
                                                    checked={s.failure}
                                                    onChange={e => {
                                                        const updated = [...sessionExercises];
                                                        updated[exIdx].sets[sIdx].failure = e.target.checked;
                                                        if (e.target.checked) updated[exIdx].sets[sIdx].log.rpe = '10';
                                                        setSessionExercises(updated);
                                                    }}
                                                />
                                                <span className="su-failure-icon">🔥</span>
                                            </label>
                                        </div>
                                        <div className="col-done">
                                            <button className={`su-check-circle ${s.completed ? 'checked' : ''}`} onClick={() => {
                                                const updated = [...sessionExercises];
                                                updated[exIdx].sets[sIdx].completed = !updated[exIdx].sets[sIdx].completed;
                                                setSessionExercises(updated);
                                                if (updated[exIdx].sets[sIdx].completed && s.prescribedRest > 0) { setRestTimer(s.prescribedRest); setIsResting(true); }
                                            }}><CheckCircle size={22} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                    <div className="su-session-footer su-mt-8 su-mb-12">
                        <Button size="lg" fullWidth className="su-complete-session-btn" onClick={finishSession}>{t('client.session.btn.finish')}</Button>
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
                            <button className="su-close-gamified" onClick={handleSessionCompleted}>
                                <X size={24} />
                            </button>

                            <div className="su-gamified-header">
                                <div className="su-trophy-icon">🏆</div>
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
                <PlanEditor plan={editingPlan} onSave={handleSavePlan} onCancel={() => setEditingPlan(null)} />
            </div>
        );
    }

    return (
        <div className="su-client-dashboard">
            <div className="su-dashboard-header">
                <div>
                    <h1 className="su-page-title">{t('client.training.title')}</h1>
                    <p className="su-text-muted">{t('independent.training.subtitle')}</p>
                </div>
                <Button className="su-mt-4" icon={<Plus size={18} />} onClick={handleAddPlan}>{t('independent.training.btn.create')}</Button>
            </div>

            <div className="su-independent-plans-list su-mt-8">
                {plans.length === 0 ? (
                    <Card className="su-empty-state-card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <DumbbellIcon size={40} className="su-text-muted su-mb-4" />
                        <h3>{t('independent.training.empty.title')}</h3>
                        <Button className="su-mt-4" onClick={handleAddPlan}>{t('independent.training.btn.create')}</Button>
                    </Card>
                ) : (
                    plans.map(plan => (
                        <IndependentPlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={setEditingPlan}
                            onCopy={handleCopyPlan}
                            onDelete={() => handleDeletePlan(plan.id)}
                            onStart={startSession}
                        />
                    ))
                )}
            </div>

            <div className="su-history-section su-mt-12">
                <h3 className="su-section-title su-mb-4">{t('independent.training.history.title')}</h3>
                <div className="su-independent-history-scroll">
                    {allHistory.length === 0 ? (
                        <p className="su-text-muted">{t('independent.training.history.empty')}</p>
                    ) : (
                        paginatedHistory.map(hist => (
                            <Card key={hist.id} className="su-independent-history-item" onClick={() => setShowSessionDetail(hist)}>
                                <div className="su-hist-item-left">
                                    <div className="su-hist-item-date">
                                        <CalendarDays size={14} />
                                        <span>{hist.date}</span>
                                    </div>
                                    <div className="su-hist-item-title">{hist.planName}</div>
                                </div>
                                <div className="su-hist-item-right">
                                    <div className="su-hist-item-stat">
                                        <Clock size={14} />
                                        <span>{hist.duration}</span>
                                    </div>
                                    <div className="su-hist-item-stat volume">
                                        <span>{hist.convertedVol} {t('client.training.history.vol')}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {showSessionDetail && (
                <SessionDetailModal
                    session={showSessionDetail}
                    planName={showSessionDetail.planName}
                    onClose={() => setShowSessionDetail(null)}
                />
            )}
        </div>
    );
};

export default TrainingPlansIndependent;

const ArrowLeft = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
