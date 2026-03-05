import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Activity, Scale, CheckCircle2,
    Plus, Copy, Trash2, ChevronRight, ChevronDown, ChevronUp, AlertTriangle,
    GripVertical, X, Save, Settings2, BarChart2, Dumbbell, ClipboardList, History
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, ResponsiveContainer, Tooltip,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import ExerciseLibraryModal from '../../components/ExerciseLibraryModal';
import { addNotification } from '../../utils/notifications';
import '../../components/InviteClientModal.css';
import '../Dashboard/TrainingPlansProfessional.css';
import './ClientDetail.css';

// ─── Mock Data ─────────────────────────────────────────────

const clientsDB = {};

const getClientData = (id) => {
    let baseClient = clientsDB[id];

    // Attempt to override/find from localStorage
    const stored = localStorage.getItem('shapeup_clients');
    if (stored) {
        const clients = JSON.parse(stored);
        const local = clients.find(c => c.id === id);
        if (local) {
            baseClient = { ...baseClient, ...local, goal: local.goal || 'General Fitness' };
        }
    }

    if (!baseClient) {
        baseClient = { name: `Client #${id}`, goal: 'General Fitness', status: 'Active' };
    }

    // Only apply mock charts if it's one of the original 5 hardcoded ones
    const hasData = id <= 5;

    return {
        ...baseClient,
        weightProgress: hasData ? [
            { week: 'W1', weight: 82.5 }, { week: 'W2', weight: 82.8 },
            { week: 'W3', weight: 83.1 }, { week: 'W4', weight: 83.5 }, { week: 'W5', weight: 84.0 },
        ] : [],
        strengthProgress: hasData ? [
            { week: 'W1', load: 110 }, { week: 'W2', load: 112.5 },
            { week: 'W3', load: 115 }, { week: 'W4', load: 120 }, { week: 'W5', load: 122.5 },
        ] : [],
        readinessRadar: hasData ? [
            { subject: 'Sleep', A: 80, fullMark: 100 }, { subject: 'Energy', A: 85, fullMark: 100 },
            { subject: 'Soreness', A: 60, fullMark: 100 }, { subject: 'Stress', A: 40, fullMark: 100 },
            { subject: 'Nutrition', A: 90, fullMark: 100 },
        ] : [],
        adherence: hasData ? { completed: 18, skipped: 2, partial: 1 } : { completed: 0, skipped: 0, partial: 0 },
        hasData
    };
};

// Plans + per-plan session history
const initPlans = [];

// ─── Helpers ────────────────────────────────────────────────

const SET_TYPE_COLORS = { warmup: '#94a3b8', feeder: '#a78bfa', working: '#60a5fa', topset: '#f59e0b', backoff: '#34d399' };
export const SetTypeBadge = ({ type }) => {
    const { t } = useLanguage();
    return (
        <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
            borderRadius: 999, color: '#fff', background: SET_TYPE_COLORS[type] || '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap'
        }}>{t(`client.session.set_type.${type}`) || type}</span>
    );
};

export const ProSelect = ({ label, value, onChange, options }) => (
    <div className="su-input-group">
        {label && <label className="su-input-label">{label}</label>}
        <select className="su-select" value={value} onChange={onChange}>
            {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
    </div>
);

// ─── Plan Editor (mirrors TrainingPlansProfessional, no analytics) ──

const TECHNIQUES = ['Straight', 'Cluster', 'Drop Set', 'Rest Pause', 'Muscle Round'];
const SET_TYPES = ['warmup', 'feeder', 'working', 'topset', 'backoff'];

export const PlanEditor = ({ plan, onSave, onCancel, onAssign }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(plan.name);
    const [phase, setPhase] = useState(plan.phase);
    const [difficulty, setDiff] = useState(plan.difficulty || 'Intermediate');
    const [weeks, setWeeks] = useState(plan.weeks);
    const [planNotes, setPlanNotes] = useState(plan.notes || '');
    const [exercises, setExercises] = useState(
        plan.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }))
    );
    const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    const addExercise = () => setShowExerciseLibrary(true);

    const handleSelectExercise = (ex) => {
        // Prevent duplicates
        const isDuplicate = exercises.some(e => e.name.toLowerCase() === ex.name.toLowerCase());
        if (isDuplicate) {
            setAlertModal({
                visible: true,
                title: t('pro.builder.error.title'),
                message: t('pro.builder.error.duplicate')
            });
            return;
        }

        setExercises(prev => [...prev, {
            id: `e${Date.now()}`, name: ex.name, tags: `${ex.type} • ${ex.muscles.join(' • ')}`, notes: '',
            sets: [{ type: 'working', technique: 'Straight', reps: '8-10', load: '75', rpe: '8', rest: '90' }]
        }]);
        setShowExerciseLibrary(false);
    };

    const removeExercise = idx =>
        setExercises(prev => prev.filter((_, i) => i !== idx));

    const addSet = exIdx => setExercises(prev => {
        const u = [...prev];
        u[exIdx] = { ...u[exIdx], sets: [...u[exIdx].sets, { type: 'working', technique: 'Straight', reps: '8-10', load: '75', rpe: '8', rest: '90' }] };
        return u;
    });

    const removeSet = (exIdx, sIdx) => setExercises(prev => {
        const u = [...prev];
        u[exIdx] = { ...u[exIdx], sets: u[exIdx].sets.filter((_, i) => i !== sIdx) };
        return u;
    });

    const updateSet = (exIdx, sIdx, field, value) => setExercises(prev => {
        const u = [...prev];
        u[exIdx].sets[sIdx] = { ...u[exIdx].sets[sIdx], [field]: value };
        return u;
    });

    const updateEx = (exIdx, field, value) => setExercises(prev => {
        const u = [...prev];
        u[exIdx] = { ...u[exIdx], [field]: value };
        return u;
    });

    // Derived summary values (live computed)
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const avgRpe = (() => {
        const all = exercises.flatMap(ex => ex.sets.map(s => parseFloat(s.rpe)).filter(r => !isNaN(r)));
        return all.length ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : '—';
    })();
    const estMins = exercises.length === 0 ? '—' : (() => {
        const totalRest = exercises.reduce((acc, ex) =>
            acc + ex.sets.reduce((a, s) => a + (parseInt(s.rest) || 90), 0), 0);
        return `${Math.round((totalRest + totalSets * 45) / 60)}–${Math.round((totalRest + totalSets * 75) / 60)} min`;
    })();

    // Intensity distribution (sets grouped by RPE rounded)
    const intensityDist = (() => {
        const map = {};
        exercises.forEach(ex => ex.sets.forEach(s => {
            const r = parseFloat(s.rpe);
            if (!isNaN(r)) {
                const key = `RPE ${Math.round(r)}`;
                map[key] = (map[key] || 0) + 1;
            }
        }));
        return Object.entries(map)
            .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
            .map(([RPE, sets]) => ({ RPE, sets }));
    })();

    // Technique usage (% of sets per technique)
    const techniqueUsage = (() => {
        const map = {};
        let total = 0;
        exercises.forEach(ex => ex.sets.forEach(s => {
            const t = s.technique || 'Straight';
            map[t] = (map[t] || 0) + 1;
            total++;
        }));
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, value: total ? Math.round(count / total * 100) : 0 }));
    })();

    return (
        <div className="su-builder-layout">
            {/* LEFT: Plan builder */}
            <div className="su-plan-builder">
                <Card className="su-plan-header-card">
                    <div className="su-plan-meta-grid">
                        <Input label={t('pro.builder.name')} value={name} onChange={e => setName(e.target.value)} />
                        <Input label={t('pro.builder.weeks')} type="number" min="1" max="52" value={weeks} onChange={e => setWeeks(e.target.value)} />
                        <ProSelect label={t('pro.builder.phase')} value={phase} onChange={e => setPhase(e.target.value)}
                            options={[
                                { value: 'Hypertrophy', label: 'Hypertrophy' },
                                { value: 'Strength', label: 'Strength / Power' },
                                { value: 'Endurance', label: 'Endurance' },
                                { value: 'Deload', label: 'Deload' },
                            ]} />
                        <ProSelect label={t('pro.builder.diff')} value={difficulty} onChange={e => setDiff(e.target.value)}
                            options={['Beginner', 'Intermediate', 'Advanced']} />
                    </div>
                    <div className="su-mt-4">
                        <Input label={t('pro.builder.notes')} value={planNotes}
                            onChange={e => setPlanNotes(e.target.value)}
                            placeholder={t('pro.builder.notes.ph')} />
                    </div>
                </Card>

                <div className="su-exercise-stack">
                    <div className="su-stack-header">
                        <h2>{t('pro.builder.stack')}</h2>
                        <Button icon={<Plus size={16} />} onClick={addExercise}>{t('pro.builder.add.ex')}</Button>
                    </div>

                    <div className="su-sortable-list">
                        {exercises.map((ex, exIdx) => (
                            <div key={ex.id} className="su-exercise-builder-card">
                                <div className="su-drag-handle-vertical"><GripVertical size={20} /></div>
                                <div className="su-exercise-content">
                                    <div className="su-ex-header">
                                        <div className="su-ex-title-row">
                                            <input
                                                className="su-pe-ex-name-input"
                                                value={ex.name}
                                                onChange={e => updateEx(exIdx, 'name', e.target.value)}
                                                placeholder={t('pro.builder.ex.name.ph')}
                                            />
                                            <input
                                                className="su-pe-ex-tags-input"
                                                value={ex.tags}
                                                onChange={e => updateEx(exIdx, 'tags', e.target.value)}
                                                placeholder={t('pro.builder.ex.tags.ph')}
                                            />
                                        </div>
                                        <div className="su-ex-toggles">
                                            <button className="su-icon-btn su-error-text" onClick={() => removeExercise(exIdx)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="su-ex-notes">
                                        <Input
                                            value={ex.notes}
                                            onChange={e => updateEx(exIdx, 'notes', e.target.value)}
                                            placeholder={t('pro.builder.ex.notes.ph')}
                                        />
                                    </div>

                                    <div className="su-sets-builder">
                                        <div className="su-sets-header-labels">
                                            <span></span>
                                            <span>{t('pro.builder.set.type')}</span>
                                            <span>{t('pro.builder.set.tech')}</span>
                                            <span>{t('pro.builder.set.reps')}</span>
                                            <span>{t('pro.builder.set.load')}</span>
                                            <span>{t('pro.builder.set.rpe')}</span>
                                            <span>{t('pro.builder.set.rest')}</span>
                                            <span></span>
                                        </div>

                                        {ex.sets.map((s, sIdx) => (
                                            <div key={sIdx} className="su-set-row">
                                                <div className="su-set-base-grid">
                                                    <div className="su-set-index">{sIdx + 1}</div>
                                                    <div className="su-input-group">
                                                        <select className="su-select" value={s.type}
                                                            onChange={e => updateSet(exIdx, sIdx, 'type', e.target.value)}>
                                                            {SET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="su-input-group">
                                                        <select className="su-select" value={s.technique}
                                                            onChange={e => updateSet(exIdx, sIdx, 'technique', e.target.value)}>
                                                            {TECHNIQUES.map(t => <option key={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <Input value={s.reps} onChange={e => updateSet(exIdx, sIdx, 'reps', e.target.value)} placeholder="8-10" />
                                                    <Input value={s.load} onChange={e => updateSet(exIdx, sIdx, 'load', e.target.value)} placeholder="75" />
                                                    <Input value={s.rpe} onChange={e => updateSet(exIdx, sIdx, 'rpe', e.target.value)} placeholder="8" />
                                                    <Input value={s.rest} onChange={e => updateSet(exIdx, sIdx, 'rest', e.target.value)} placeholder="90" />
                                                    <div className="su-set-actions">
                                                        <button className="su-icon-btn su-error-text" onClick={() => removeSet(exIdx, sIdx)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Button variant="outline" icon={<Plus size={16} />} className="su-mt-2"
                                            onClick={() => addSet(exIdx)}>{t('pro.builder.add.set')}</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="su-pe-add-ex-btn" onClick={addExercise}>
                        <Plus size={18} /> {t('pro.builder.add.ex')}
                    </button>
                </div>
            </div>

            {/* RIGHT: Sticky summary sidebar */}
            <div className="su-structural-analytics">
                <Card className="su-sticky-card">
                    <div className="su-card-header-flex">
                        <h3 className="su-card-title">
                            <Dumbbell size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                            {t('pro.builder.summary.title')}
                        </h3>
                    </div>

                    <div className="su-intelligence-metrics">
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.ex')}</span>
                            <span className="su-metric-val">{exercises.length}</span>
                        </div>
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.sets')}</span>
                            <span className="su-metric-val">{totalSets} {t('pro.builder.summary.sets.val')}</span>
                        </div>
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.time')}</span>
                            <span className="su-metric-val">{estMins}</span>
                        </div>
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.rpe')}</span>
                            <span className="su-metric-val">{avgRpe}</span>
                        </div>
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.phase')}</span>
                            <span className="su-metric-val">{phase}</span>
                        </div>
                        <div className="su-metric-item">
                            <span className="su-metric-label">{t('pro.builder.summary.diff')}</span>
                            <span className="su-metric-val">{difficulty}</span>
                        </div>
                    </div>

                    {/* Intensity Distribution */}
                    {intensityDist.length > 0 && (
                        <div className="su-chart-section">
                            <h4 className="su-chart-subhead">{t('pro.builder.chart.intensity')}</h4>
                            <div className="su-mini-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={intensityDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="RPE" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                        <Tooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                        <Bar dataKey="sets" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Technique Usage */}
                    {techniqueUsage.length > 0 && (
                        <div className="su-chart-section">
                            <h4 className="su-chart-subhead">{t('pro.builder.chart.tech')}</h4>
                            <div className="su-tech-bars">
                                {techniqueUsage.map(tech => (
                                    <div key={tech.name} className="su-tech-bar-row">
                                        <span className="su-tech-label">{tech.name}</span>
                                        <div className="su-heatmap-bar">
                                            <div className="su-heatmap-fill" style={{
                                                width: `${tech.value}%`,
                                                backgroundColor: tech.name === 'Straight' ? 'var(--text-muted)' : 'var(--accent)'
                                            }} />
                                        </div>
                                        <span className="su-tech-pct">{tech.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button fullWidth icon={<Save size={16} />}
                        onClick={() => onSave({ ...plan, name, phase, difficulty, weeks, notes: planNotes, exercises })}>
                        {t('pro.builder.btn.save')}
                    </Button>
                    {onAssign && (
                        <Button fullWidth variant="outline" className="su-mt-2" style={{ color: 'var(--text-main)' }}
                            onClick={() => onAssign({ ...plan, name, phase, difficulty, weeks, notes: planNotes, exercises })}>
                            {t('pro.builder.btn.assign')}
                        </Button>
                    )}
                    <Button fullWidth variant="outline" icon={<X size={16} />}
                        onClick={onCancel} style={{ marginTop: '0.5rem' }}>
                        {t('pro.builder.btn.cancel')}
                    </Button>
                </Card>
            </div>
            {showExerciseLibrary && (
                <ExerciseLibraryModal
                    onClose={() => setShowExerciseLibrary(false)}
                    onSelect={handleSelectExercise}
                />
            )}

            {alertModal.visible && (
                <div className="su-modal-overlay su-alert-modal-overlay" onClick={() => setAlertModal({ ...alertModal, visible: false })}>
                    <div className="su-modal-box su-alert-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="su-alert-icon-wrap">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="su-modal-title">{alertModal.title}</h2>
                        <p className="su-modal-subtitle">
                            {alertModal.message}
                        </p>
                        <div className="su-modal-actions">
                            <Button fullWidth onClick={() => setAlertModal({ ...alertModal, visible: false })}>
                                {t('pro.builder.error.btn')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── SESSION DETAIL MODAL ───────────────────────────────────
const SessionDetailModal = ({ session, planName, onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-box su-session-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="su-modal-close" onClick={onClose}><X size={20} /></button>
                <h2 className="su-modal-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>{planName}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem', lineHeight: '1.4' }}>
                    {session.date} &middot; {session.duration} &middot; {session.totalVol} {t('pro.plan.history.vol')} &middot; Avg RPE {session.rpe}
                </p>
                <div className="su-sd-exercises">
                    {session.exercises.map((ex, i) => (
                        <div key={i} className="su-sd-ex-block">
                            <div className="su-sd-ex-name">
                                {ex.name}
                                {ex.skipped && <span className="su-danger-tag" style={{ marginLeft: '0.5rem', backgroundColor: 'var(--error-light, rgba(239, 68, 68, 0.2))', color: 'var(--error, #ef4444)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{t('pro.client.plan.history.tag.skipped.ex')}</span>}
                            </div>
                            {ex.skipped ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.25rem 0 0' }}>
                                    {t('pro.client.plan.history.tag.skipped.desc')}
                                </p>
                            ) : (
                                <div className="su-sd-sets-table">
                                    <div className="su-sd-sets-head" style={{ display: 'grid', gridTemplateColumns: '40px 80px 1fr 1fr 1fr', gap: '8px' }}>
                                        <span>Set</span><span>{t('pro.builder.set.type')}</span><span style={{ textAlign: 'center' }}>{t('pro.builder.set.reps')}</span><span style={{ textAlign: 'center' }}>{t('pro.builder.set.load')}</span><span style={{ textAlign: 'center' }}>{t('pro.builder.set.rpe')}</span>
                                    </div>
                                    {ex.sets.map((s, si) => (
                                        <div key={si} className="su-sd-set-row" style={{ display: 'grid', gridTemplateColumns: '40px 80px 1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                                            <span className="su-sd-set-num">{s.set}</span>
                                            <div><SetTypeBadge type={s.type} /></div>
                                            <span style={{ textAlign: 'center', fontSize: '0.85rem' }}>{s.reps} reps</span>
                                            <span style={{ wordBreak: 'break-word', textAlign: 'center', fontSize: '0.85rem' }}>{s.load} kg</span>
                                            <span style={{ textAlign: 'center', fontSize: '0.85rem' }}>RPE {s.rpe}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── PLAN CARD (with expandable history) ────────────────────
const PlanCard = ({ plan, onEdit, onCopy, onDelete, initialHighlightedSessionId }) => {
    const { t } = useLanguage();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    React.useEffect(() => {
        if (initialHighlightedSessionId && plan.history) {
            const sessionMatch = plan.history.find(s => String(s.id) === String(initialHighlightedSessionId));
            if (sessionMatch) {
                setHistoryOpen(true);
                setSelectedSession(sessionMatch);
            }
        }
    }, [initialHighlightedSessionId, plan.history]);

    return (
        <>
            <Card className={`su-cp-plan-card ${plan.active ? 'active-plan' : ''}`}>
                <div className="su-cp-plan-header">
                    <div className="su-cp-plan-info">
                        {plan.active && <span className="su-active-plan-badge">{t('pro.client.plan.active')}</span>}
                        <h3 className="su-cp-plan-name">{plan.name}</h3>
                        <p className="su-cp-plan-meta">{plan.phase} · {plan.difficulty} · {plan.weeks} {t('pro.client.plan.weeks')} · {plan.exercises.length} {t('pro.client.plan.exercises')}</p>
                    </div>
                    <div className="su-cp-plan-actions">
                        <button className="su-cp-action-btn edit" onClick={() => onEdit(plan)} title="Edit Plan">
                            <Settings2 size={16} /> {t('pro.client.plan.btn.edit')}
                        </button>
                        <button className="su-cp-action-btn copy" onClick={() => onCopy(plan)} title="Copy Plan">
                            <Copy size={16} /> {t('pro.client.plan.btn.copy')}
                        </button>
                        <button className="su-cp-action-btn delete" onClick={() => setConfirmDelete(true)} title="Delete Plan">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Exercise chips */}
                <div className="su-cp-plan-exercises">
                    {plan.exercises.map(ex => (
                        <span key={ex.id} className="su-cp-ex-chip">{ex.name}</span>
                    ))}
                    {plan.exercises.length === 0 && (
                        <span className="su-cp-ex-empty">{t('pro.client.plan.empty.ex')}</span>
                    )}
                </div>

                {/* History toggle */}
                {plan.history && plan.history.length > 0 && (
                    <button
                        className="su-cp-history-toggle"
                        onClick={() => setHistoryOpen(v => !v)}
                    >
                        <History size={14} />
                        {historyOpen ? t('pro.client.plan.history.hide') : t('pro.client.plan.history.show')} ({plan.history.length})
                        {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                )}

                {/* Inline history list */}
                {historyOpen && plan.history && (
                    <div className="su-cp-inline-history">
                        {plan.history.map(session => (
                            <button
                                key={session.id}
                                className="su-cp-hist-row"
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="su-cp-hist-row-left">
                                    <span className="su-cp-hist-date">{session.date}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span className="su-cp-hist-meta">
                                            ⏱ {session.duration} · {session.totalVol} {t('pro.plan.history.vol')} · Avg RPE {session.rpe}
                                        </span>
                                        {session.status === 'partial' && (
                                            <span className="su-warning-tag" style={{ backgroundColor: 'var(--warning-light, rgba(245, 158, 11, 0.2))', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'help' }} title="Client did not complete all prescribed sets">{t('pro.client.plan.history.tag.partial')}</span>
                                        )}
                                        {session.status === 'skipped' && (
                                            <span className="su-danger-tag" style={{ backgroundColor: 'var(--error-light, rgba(239, 68, 68, 0.2))', color: 'var(--error, #ef4444)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{t('pro.client.plan.history.tag.skipped.sess')}</span>
                                        )}
                                        {(!session.status && session.exercises.some(ex => ex.skipped)) && (
                                            <span className="su-danger-tag" style={{ backgroundColor: 'var(--error-light, rgba(239, 68, 68, 0.2))', color: 'var(--error, #ef4444)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Client skipped at least one exercise">{t('pro.client.plan.history.tag.skipped.ex')}</span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={16} className="su-text-muted" />
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="su-modal-overlay" onClick={() => setConfirmDelete(false)}>
                    <div className="su-modal-box su-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="su-confirm-icon">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="su-confirm-title">{t('pro.client.plan.delete.title')}</h3>
                        <p className="su-confirm-body">
                            <strong>"{plan.name}"</strong> {t('pro.client.plan.delete.desc')}
                        </p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                                {t('pro.client.plan.delete.cancel')}
                            </Button>
                            <Button
                                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                                onClick={() => { onDelete(plan.id); setConfirmDelete(false); }}
                            >
                                {t('pro.client.plan.delete.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session detail modal */}
            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    planName={plan.name}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </>
    );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────
const ClientDetail = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const client = getClientData(parseInt(id));

    const [activeTab, setActiveTab] = useState(location.state?.tab || 'analytics');
    const [plans, setPlans] = useState(() => {
        const stored = localStorage.getItem('shapeup_client_plans_' + id);
        if (stored) return JSON.parse(stored);
        return client.hasData ? initPlans : [];
    });
    const [editingPlan, setEditingPlan] = useState(null);
    const [selectedPRComparison, setSelectedPRComparison] = useState(null);

    // --- Objectives State ---
    const [objectives, setObjectives] = useState(() => {
        const stored = localStorage.getItem(`shapeup_client_objectives_${id}`);
        if (stored) return JSON.parse(stored);
        return { goalWeight: '', history: [] };
    });

    // -- Derived Analytics State --
    const getTimestamp = (id) => {
        if (typeof id === 'number') return id;
        if (typeof id === 'string') return parseInt(id.replace(/[^0-9]/g, '')) || 0;
        return 0;
    };

    const allHistory = plans
        .flatMap(p => (p.history || []).map(h => ({ ...h, planName: p.name })))
        .sort((a, b) => getTimestamp(a.id) - getTimestamp(b.id));

    const hasRealData = allHistory.length > 0;

    const dynamicVolumeProgress = allHistory.map((h, i) => ({
        session: `S${i + 1}`,
        vol: parseInt(h.totalVol.replace(/,/g, '').replace(' kg', '')) || 0,
        date: h.date
    }));

    const dynamicRpeTrend = allHistory.map((h, i) => ({
        session: `S${i + 1}`,
        rpe: h.rpe || 0,
        date: h.date
    }));

    // --- Recent Improvements (PR Logic) ---
    const recentImprovements = React.useMemo(() => {
        const bestMap = {};
        const improvementsList = [];

        // allHistory is reliably sorted by timestamp ascending
        allHistory.forEach(h => {
            (h.exercises || []).forEach(ex => {
                if (ex.skipped) return;

                const exerciseName = (ex.name || '').trim();
                if (!exerciseName) return;

                let sessionMaxLoad = 0;
                let sessionMaxReps = 0;

                (ex.sets || []).forEach(s => {
                    const l = parseFloat(s.load) || 0;
                    const r = parseInt(s.reps) || 0;
                    if (l > sessionMaxLoad) {
                        sessionMaxLoad = l;
                        sessionMaxReps = r;
                    } else if (l === sessionMaxLoad && r > sessionMaxReps) {
                        sessionMaxReps = r;
                    }
                });

                if (sessionMaxLoad === 0 && sessionMaxReps === 0) return;

                if (!bestMap[exerciseName]) {
                    bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps, date: h.date, session: h };
                } else {
                    const best = bestMap[exerciseName];
                    const isImprovement = sessionMaxLoad > best.load || (sessionMaxLoad === best.load && sessionMaxReps > best.reps);

                    if (isImprovement) {
                        improvementsList.push({
                            name: exerciseName,
                            from: { load: best.load, reps: best.reps },
                            to: { load: sessionMaxLoad, reps: sessionMaxReps },
                            date: h.date,
                            fromSession: best.session,
                            toSession: h
                        });
                        bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps, date: h.date, session: h };
                    }
                }
            });
        });

        return improvementsList
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5) // Show 5 for coach
            .map(imp => ({
                name: imp.name,
                from: `${imp.from.load}kg × ${imp.from.reps}`,
                to: `${imp.to.load}kg × ${imp.to.reps}`,
                date: imp.date,
                fromSession: imp.fromSession,
                toSession: imp.toSession
            }));
    }, [allHistory]);

    const adherenceStats = { completed: 0, skipped: 0, partial: 0 };
    if (hasRealData) {
        allHistory.forEach(h => {
            if (h.status === 'completed') adherenceStats.completed++;
            else if (h.status === 'skipped') adherenceStats.skipped++;
            else if (h.status === 'partial') adherenceStats.partial++;
            else {
                const skippedCount = h.exercises.filter(ex => ex.skipped).length;
                if (skippedCount === 0) {
                    adherenceStats.completed++;
                } else if (skippedCount === h.exercises.length) {
                    adherenceStats.skipped++;
                } else {
                    adherenceStats.partial++;
                }
            }
        });
    }

    // If we have history, calculate a generic % based on how many exercises were skipped inside the sessions
    const compliancePct = hasRealData ? (() => {
        let totalEx = 0;
        let skippedEx = 0;
        allHistory.forEach(h => {
            h.exercises.forEach(ex => {
                totalEx++;
                if (ex.skipped) skippedEx++;
            });
        });
        return totalEx === 0 ? 100 : Math.round(((totalEx - skippedEx) / totalEx) * 100);
    })() : 0;

    // --- Bodyweight Chart Data ---
    const dynamicWeightProgress = [...objectives.history].sort((a, b) => a.id - b.id).map((h, i) => ({
        session: `Entry ${i + 1}`,
        weight: h.weight,
        date: h.date
    }));
    const hasWeightData = dynamicWeightProgress.length >= 2;

    // Sync plans to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem('shapeup_client_plans_' + id, JSON.stringify(plans));
    }, [plans, id]);

    const handleSavePlan = (updated) => {
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingPlan(null);
        addNotification(id.toString(), 'alert', 'Plan Updated', `Your coach has updated "${updated.name}"`, 'primary', {
            link: '/dashboard/training'
        });
    };

    const handleDeletePlan = (planId) =>
        setPlans(prev => prev.filter(p => p.id !== planId));

    const handleAddPlan = () => {
        const newPlan = {
            id: `p${Date.now()}`, name: 'New Training Plan',
            phase: 'Hypertrophy', difficulty: 'Intermediate',
            weeks: 6, active: false, notes: '', exercises: [], history: []
        };
        setPlans(prev => [...prev, newPlan]);
        setEditingPlan(newPlan);
    };

    const handleCopyPlan = (plan) => {
        const copy = {
            ...plan,
            id: `p${Date.now()}`,
            name: `${plan.name} (Copy)`,
            active: false,
            history: [],
            exercises: plan.exercises.map(ex => ({
                ...ex, id: `e${Date.now() + Math.random()}`,
                sets: ex.sets.map(s => ({ ...s }))
            }))
        };
        setPlans(prev => [...prev, copy]);
        setEditingPlan(copy);
    };

    const tabs = [
        { id: 'analytics', label: t('pro.client.tabs.analytics'), icon: <BarChart2 size={16} /> },
        { id: 'plans', label: t('pro.client.tabs.plans'), icon: <Dumbbell size={16} /> },
    ];

    return (
        <div className="su-client-detail-dashboard">
            {/* Page Header */}
            <div className="su-dashboard-header-flex">
                <button className="su-back-btn" onClick={() => navigate('/dashboard/clients')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="su-page-title">
                        {client.name}
                        <span className={`su-status-badge ${client.status === 'Active' ? 'active' : client.status === 'Inactive' ? 'inactive' : 'warning'} su-ml-2`}>
                            {client.status === 'Active' ? t('clients.status.active') :
                                client.status === 'Needs Attention' ? t('clients.status.attention') :
                                    client.status === 'Invited' ? t('clients.status.invited') :
                                        client.status === 'Inactive' ? t('clients.status.inactive') : client.status}
                        </span>
                    </h1>
                    <p className="su-page-subtitle">Goal: <strong>{client.goal}</strong></p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/feedback', { state: { clientName: client.name } })}
                >
                    {t('pro.client.btn.message')}
                </Button>
            </div>

            {/* Tabs */}
            <div className="su-cp-tabs su-mt-4">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`su-cp-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => { setActiveTab(t.id); setEditingPlan(null); }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Analytics ──────────────────────────────────── */}
            {activeTab === 'analytics' && !hasRealData && (
                <div className="su-client-empty-state su-mt-4" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <BarChart2 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('pro.client.empty.analytics.title')}</h3>
                    <p>{t('pro.client.empty.analytics.desc')}</p>
                </div>
            )}

            {activeTab === 'analytics' && hasRealData && (
                <div className="su-client-metrics-grid su-mt-4">
                    <Card className="su-metric-card-large">
                        <div className="su-card-header-icon">
                            <TrendingUp size={20} className="su-text-muted" />
                            <h3 className="su-section-title">{t('pro.client.chart.volume')}</h3>
                        </div>
                        <div className="su-chart-wrapper-med">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dynamicVolumeProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} labelFormatter={(l, p) => p[0]?.payload.date} />
                                    <Area type="monotone" dataKey="vol" name={t('client.analysis.chart.vol')} stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="su-metric-card-large">
                        <div className="su-card-header-icon">
                            <Activity size={20} className="su-text-muted" />
                            <h3 className="su-section-title">{t('pro.client.chart.rpe')}</h3>
                        </div>
                        <div className="su-chart-wrapper-med">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dynamicRpeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 10]} ticks={[2, 4, 6, 8, 10]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} labelFormatter={(l, p) => p[0]?.payload.date} />
                                    <Line type="monotone" dataKey="rpe" name={t('client.analysis.chart.rpe')} stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="su-metric-card-large" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="su-card-header-icon">
                            <TrendingUp size={20} className="su-text-muted" />
                            <h3 className="su-section-title">{t('pro.client.chart.weight')}</h3>
                        </div>
                        <div style={{ flex: 1, minHeight: 0, marginTop: '1rem' }}>
                            {hasWeightData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dynamicWeightProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} labelFormatter={(l, p) => p[0]?.payload.date} />
                                        <Area type="monotone" dataKey="weight" name={t('client.objectives.chart.series.weight')} stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />

                                        {objectives.goalWeight && (
                                            <Area type="monotone" dataKey={() => parseFloat(objectives.goalWeight)} name={t('client.objectives.chart.series.goal')} stroke="var(--text-muted)" strokeDasharray="5 5" fill="none" />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    <p>{t('pro.client.chart.weight.empty')}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="su-metric-card-large">
                        <div className="su-card-header-icon">
                            <CheckCircle2 size={20} className="su-text-muted" />
                            <h3 className="su-section-title">{t('pro.client.chart.adherence')}</h3>
                        </div>
                        <div className="su-adherence-stats">
                            <div className="su-adherence-circle-wrap">
                                <svg viewBox="0 0 36 36" className="su-circular-chart">
                                    <path className="su-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="su-circle-main" strokeDasharray={`${compliancePct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <text x="18" y="20.35" className="su-percentage">{compliancePct}%</text>
                                </svg>
                            </div>
                            <div className="su-adherence-legend">
                                <div className="su-legend-item"><span className="su-legend-dot primary" /><span className="su-legend-label">{t('pro.client.adherence.completed')}</span><span className="su-legend-val">{adherenceStats.completed} {t('pro.builder.summary.sets.val')}</span></div>
                                <div className="su-legend-item"><span className="su-legend-dot error" /><span className="su-legend-label">{t('pro.client.adherence.skipped')}</span><span className="su-legend-val">{adherenceStats.skipped} {t('pro.builder.summary.sets.val')}</span></div>
                                <div className="su-legend-item"><span className="su-legend-dot warning" /><span className="su-legend-label">{t('pro.client.adherence.partial')}</span><span className="su-legend-val">{adherenceStats.partial} {t('pro.builder.summary.sets.val')}</span></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="su-metric-card-large">
                        <div className="su-card-header-icon">
                            <TrendingUp size={20} className="su-text-muted" />
                            <h3 className="su-section-title">{t('pro.client.chart.prs')}</h3>
                        </div>
                        <div className="su-improvements-list su-mt-2">
                            {recentImprovements.length > 0 ? (
                                recentImprovements.map((imp, idx) => (
                                    <div
                                        key={idx}
                                        className="su-improvement-item"
                                        onClick={() => setSelectedPRComparison(imp)}
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s', padding: '0.75rem', borderRadius: '8px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div className="su-imp-info">
                                            <span className="su-imp-name">{imp.name}</span>
                                            <span className="su-imp-date">{imp.date}</span>
                                        </div>
                                        <div className="su-imp-values">
                                            <span className="su-imp-from">{imp.from}</span>
                                            <ChevronRight size={14} className="su-imp-arrow" />
                                            <span className="su-imp-to">{imp.to}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="su-text-muted su-p-4" style={{ textAlign: 'center' }}>
                                    {t('pro.client.prs.empty')}
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* PR Comparison Modal */}
            {selectedPRComparison && (
                <div className="su-modal-overlay" onClick={() => setSelectedPRComparison(null)} style={{ zIndex: 12000 }}>
                    <div className="su-modal-box su-session-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <button className="su-modal-close" onClick={() => setSelectedPRComparison(null)}><X size={20} /></button>
                        <h2 className="su-modal-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>{t('pro.client.prs.modal.title')} {selectedPRComparison.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
                            {t('pro.client.prs.modal.desc')}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {/* Previous Session Panel */}
                            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                    <History size={16} /> {t('pro.client.prs.modal.prev')}
                                </h4>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedPRComparison.fromSession.planName}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedPRComparison.fromSession.date}</p>
                                </div>

                                {selectedPRComparison.fromSession.exercises
                                    .filter(ex => ex.name === selectedPRComparison.name)
                                    .map((ex, idx) => (
                                        <div key={idx} className="su-sd-sets-table">
                                            <div className="su-sd-sets-head" style={{ gridTemplateColumns: '40px 1fr 1fr 1fr' }}>
                                                <span>Set</span><span>{t('pro.builder.set.reps')}</span><span>{t('pro.builder.set.load')}</span><span>{t('pro.builder.set.rpe')}</span>
                                            </div>
                                            {ex.sets.map((s, si) => (
                                                <div key={si} className="su-sd-set-row" style={{ gridTemplateColumns: '40px 1fr 1fr 1fr' }}>
                                                    <span className="su-sd-set-num">{s.set}</span>
                                                    <span>{s.reps}</span>
                                                    <span>{s.load} kg</span>
                                                    <span>{s.rpe}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>

                            {/* New PR Session Panel */}
                            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '1rem', backgroundColor: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {t('pro.client.prs.modal.tag')}
                                </div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                                    <TrendingUp size={16} /> {t('pro.client.prs.modal.new')}
                                </h4>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedPRComparison.toSession.planName}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedPRComparison.toSession.date}</p>
                                </div>

                                {selectedPRComparison.toSession.exercises
                                    .filter(ex => ex.name === selectedPRComparison.name)
                                    .map((ex, idx) => (
                                        <div key={idx} className="su-sd-sets-table">
                                            <div className="su-sd-sets-head" style={{ gridTemplateColumns: '40px 1fr 1fr 1fr' }}>
                                                <span>Set</span><span>{t('pro.builder.set.reps')}</span><span>{t('pro.builder.set.load')}</span><span>{t('pro.builder.set.rpe')}</span>
                                            </div>
                                            {ex.sets.map((s, si) => (
                                                <div key={si} className="su-sd-set-row" style={{ gridTemplateColumns: '40px 1fr 1fr 1fr' }}>
                                                    <span className="su-sd-set-num">{s.set}</span>
                                                    <span>{s.reps}</span>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{s.load} kg</span>
                                                    <span>{s.rpe}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Training Plans ──────────────────────────────── */}
            {activeTab === 'plans' && (
                <div className="su-cp-plans-view su-mt-4">
                    {editingPlan ? (
                        <PlanEditor
                            plan={editingPlan}
                            onSave={handleSavePlan}
                            onCancel={() => setEditingPlan(null)}
                        />
                    ) : (
                        <>
                            <div className="su-cp-plans-toolbar">
                                <h2 className="su-cp-section-title">{t('pro.client.plans.title')} ({plans.length})</h2>
                                <Button icon={<Plus size={16} />} onClick={handleAddPlan}>{t('pro.client.plans.btn.add')}</Button>
                            </div>
                            <div className="su-plans-list">
                                {plans.map(p => (
                                    <PlanCard
                                        key={p.id}
                                        plan={p}
                                        onEdit={setEditingPlan}
                                        onCopy={handleCopyPlan}
                                        onDelete={handleDeletePlan}
                                        initialHighlightedSessionId={location.state?.highlightSessionId}
                                    />
                                ))}
                            </div>
                            {plans.length === 0 && (
                                <div className="su-cp-empty">
                                    <Dumbbell size={40} />
                                    <p>{t('pro.client.plans.empty')}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientDetail;
