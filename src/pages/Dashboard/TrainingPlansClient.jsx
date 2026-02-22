import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, ChevronRight, CalendarDays, Plus, FastForward, Award, TrendingUp, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
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

    // Session State
    const [sessionActive, setSessionActive] = useState(false);

    // Global Workout Timer
    const [workoutTime, setWorkoutTime] = useState(0);

    // Rest Timer State
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [showRestModal, setShowRestModal] = useState(false);
    const [customRestInput, setCustomRestInput] = useState(60);

    // Post-Session Flow States
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [sessionFeedback, setSessionFeedback] = useState({ rpe: null, comments: '' });

    // Dynamic Sets Data Structure (Simplified for demo)
    // We store arrays of sets for each exercise block
    const [exercises, setExercises] = useState([
        {
            id: 'ex1',
            name: 'Incline Dumbbell Press',
            target: 'Chest • Shoulders',
            sets: [
                { id: 's1', type: 'warmup', target: '12-15 reps @ RPE 6', completed: false, failure: false, log: { weight: '', reps: '', rpe: '' } },
                { id: 's2', type: 'working', target: '8-10 reps @ 75%', instruction: 'Cluster Set: Perform 2 reps, rest 15s. Repeat 3 blocks.', completed: false, failure: false, log: { weight: '', reps: '', rpe: '' } },
                { id: 's3', type: 'topset', target: '5-8 reps @ 85% | RPE 9+', completed: false, failure: false, log: { weight: '40', reps: '6', rpe: '9' } }
            ]
        },
        {
            id: 'ex2',
            name: 'Lat Pulldown',
            target: 'Back',
            sets: [
                { id: 's1', type: 'working', target: '10-12 reps @ 70%', instruction: 'Drop Set: Reduce load by 20% for 2 drops.', completed: false, failure: false, log: { weight: '', reps: '', rpe: '' } }
            ]
        }
    ]);

    // -- Timers Effect --
    useEffect(() => {
        let globalInterval = null;
        let restInterval = null;

        if (sessionActive) {
            globalInterval = setInterval(() => setWorkoutTime(sec => sec + 1), 1000);
        }

        if (isResting && restTimer > 0) {
            restInterval = setInterval(() => setRestTimer(sec => sec - 1), 1000);
        } else if (restTimer === 0 && isResting) {
            setIsResting(false);
        }

        return () => {
            clearInterval(globalInterval);
            clearInterval(restInterval);
        };
    }, [sessionActive, isResting, restTimer]);


    // -- Handlers --
    const startRest = (seconds) => {
        setRestTimer(seconds);
        setIsResting(true);
        setShowRestModal(false);
    };

    const skipRest = () => {
        setIsResting(false);
        setRestTimer(0);
    };

    const toggleSetComplete = (exerciseIndex, setIndex, defaultRest) => {
        const newExercises = [...exercises];
        const isNowComplete = !newExercises[exerciseIndex].sets[setIndex].completed;

        newExercises[exerciseIndex].sets[setIndex].completed = isNowComplete;
        setExercises(newExercises);

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
            type: 'working', // Default to working, but allow change
            isExtra: true,
            target: 'Extra Volume',
            completed: false,
            failure: false,
            log: { weight: '', reps: '', rpe: '' }
        });
        setExercises(newExercises);
    };

    const updateSetType = (exerciseIndex, setIndex, newType) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex].type = newType;
        setExercises(newExercises);
    };

    const finishSession = () => {
        // Instead of directly ending, trigger feedback flow
        setShowFeedbackModal(true);
        setSessionTitle(null);
    };

    const submitFeedback = () => {
        setShowFeedbackModal(false);
        setShowOverviewModal(true);
    };

    const skipOverviewAndFinish = () => {
        setShowOverviewModal(false);
        // Actual reset
        setSessionFeedback({ rpe: null, comments: '' });
        setSessionActive(false);
        setWorkoutTime(0);
        setIsResting(false);
        setRestTimer(0);
        const resetExercises = exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({ ...s, completed: false }))
        }));
        setExercises(resetExercises);
    };

    // 1. Inactive View (Plan Overview)
    if (!sessionActive) {
        return (
            <div className="su-client-dashboard">
                <h1 className="su-page-title su-mb-6">Active Training Plan</h1>

                <Card className="su-active-plan-card">
                    <div className="su-plan-hero">
                        <div className="su-plan-hero-content">
                            <span className="su-tag">Hypertrophy</span>
                            <h2 className="su-plan-title">Hypertrophy Phase 1 - Upper Power</h2>
                            <p className="su-coach-credit">Designed by <strong>Coach Alex</strong></p>

                            <div className="su-plan-meta-row">
                                <div className="su-meta-pill">
                                    <DumbbellIcon size={16} /> 6 Structural Exercises
                                </div>
                                <div className="su-meta-pill">
                                    <Clock size={16} /> ~55 mins Est.
                                </div>
                            </div>
                        </div>

                        <div className="su-plan-hero-action">
                            <Button size="lg" icon={<Play size={20} fill="currentColor" />} onClick={() => {
                                setSessionActive(true);
                                setSessionTitle('Upper Power · Hypertrophy Phase 1');
                            }}>
                                Start Session
                            </Button>
                        </div>
                    </div>
                </Card>

                <h3 className="su-section-title su-mt-8">Session History</h3>
                <div className="su-history-list">
                    {[
                        { date: 'Yesterday', title: 'Lower Body Strength', vol: '12,500 kg', pr: true, duration: '1:05:00' },
                        { date: 'Oct 24', title: 'Upper Body Power', vol: '10,200 kg', pr: false, duration: '0:52:10' },
                        { date: 'Oct 22', title: 'Leg Day Volume', vol: '14,000 kg', pr: false, duration: '1:12:30' }
                    ].map((hist, i) => (
                        <Card key={i} className="su-history-card">
                            <div className="su-hist-left">
                                <div className="su-hist-date">
                                    <CalendarDays size={18} className="su-text-muted" /> {hist.date}
                                </div>
                                <div className="su-hist-title">{hist.title}</div>
                            </div>
                            <div className="su-hist-right">
                                {hist.pr && <span className="su-pr-badge">New PR!</span>}
                                <span className="su-text-muted">⏱ {hist.duration}</span>
                                <span className="su-hist-vol">{hist.vol} vol</span>
                                <button className="su-icon-btn"><ChevronRight size={20} /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // 2. Active Session Engine
    return (
        <div className="su-session-engine">

            {/* Sticky Header with Timers */}
            <div className="su-session-header-sticky">
                <div className="su-session-title-area">
                    <Button variant="outline" onClick={finishSession} size="sm">End Session</Button>
                </div>

                {/* Rest Timer Group */}
                <div className={`su-rest-timer-group ${isResting ? 'active' : ''}`}>
                    <button
                        className="su-rest-clock-btn"
                        onClick={() => setShowRestModal(true)}
                        title="Set Custom Rest Time"
                    >
                        <Clock size={20} />
                        <span className="su-timer-digits">
                            {formatTime(restTimer)}
                        </span>
                        {isResting && <span className="su-timer-label">Resting</span>}
                    </button>
                    {isResting && (
                        <button className="su-skip-rest-btn" onClick={skipRest} title="Skip Rest">
                            <FastForward size={16} />
                            Skip
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Rest Modal Overlay */}
            {showRestModal && (
                <div className="su-rest-modal-overlay" onClick={() => setShowRestModal(false)}>
                    <div className="su-rest-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Set Custom Rest</h3>
                        <div className="su-rest-quick-options">
                            <button onClick={() => startRest(30)}>30s</button>
                            <button onClick={() => startRest(60)}>60s</button>
                            <button onClick={() => startRest(90)}>90s</button>
                            <button onClick={() => startRest(120)}>120s</button>
                        </div>
                        <div className="su-rest-custom-input">
                            <Input
                                type="number"
                                value={customRestInput}
                                onChange={e => setCustomRestInput(e.target.value)}
                                placeholder="Seconds..."
                            />
                            <Button onClick={() => startRest(Number(customRestInput))}>Start Timer</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Flow Overlays */}

            {/* Post-Session Feedback Modal */}
            {showFeedbackModal && (
                <div className="su-rest-modal-overlay">
                    <div className="su-feedback-modal-content">
                        <h3>How did you feel today?</h3>
                        <p className="su-text-muted su-mb-4" style={{ textAlign: 'center' }}>Rate your overall session difficulty (RPE).</p>

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
                            <label className="su-input-label">Comments for Coach</label>
                            <textarea
                                className="su-textarea-input"
                                placeholder="Any pain? Did you feel great? Leave a note..."
                                value={sessionFeedback.comments}
                                onChange={(e) => setSessionFeedback({ ...sessionFeedback, comments: e.target.value })}
                            />
                        </div>

                        <div className="su-feedback-actions">
                            <Button fullWidth onClick={submitFeedback} disabled={!sessionFeedback.rpe}>
                                Submit Feedback
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Session Gamified Overview Modal */}
            {showOverviewModal && (
                <div className="su-gamified-overlay">
                    <div className="su-gamified-content">
                        <button className="su-close-gamified" onClick={skipOverviewAndFinish}>
                            <X size={24} />
                        </button>

                        <div className="su-gamified-header">
                            <div className="su-trophy-icon">🏆</div>
                            <h2>Workout Complete!</h2>
                            <p>Great job crushing Upper Power.</p>
                        </div>

                        <div className="su-gamified-stats">
                            <div className="su-stat-box">
                                <span className="su-stat-value">12,500</span>
                                <span className="su-stat-label">Total Vol (kg)</span>
                                <div className="su-stat-trend up">
                                    <TrendingUp size={14} /> +5%
                                </div>
                            </div>
                            <div className="su-stat-box">
                                <span className="su-stat-value">55m</span>
                                <span className="su-stat-label">Duration</span>
                            </div>
                            <div className="su-stat-box highlight">
                                <span className="su-stat-value">2</span>
                                <span className="su-stat-label">New PRs</span>
                                <Award size={18} className="su-stat-icon-abs" />
                            </div>
                        </div>

                        <div className="su-gamified-actions">
                            <Button size="lg" fullWidth onClick={skipOverviewAndFinish}>
                                Return to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="su-execution-scroll">
                {exercises.map((exercise, exIndex) => (
                    <Card key={exercise.id} className="su-execution-card">
                        <div className="su-ex-execution-header">
                            <h3>{exIndex + 1}. {exercise.name}</h3>
                            <span className="su-ex-target">{exercise.target}</span>
                        </div>

                        <div className="su-sets-execution">
                            {/* Table Header Row */}
                            <div className="su-exec-row su-exec-header">
                                <div className="col-set" title="The current set sequence or type">Set</div>
                                <div className="col-target" title="Prescribed target range and load">Target</div>
                                <div className="col-log" title="Actual weight logged for this set">Weight</div>
                                <div className="col-log" title="Actual reps logged for this set">Reps</div>
                                <div className="col-log" title="Rate of Perceived Exertion (1-10)">RPE</div>
                                <div className="col-failure" title="Check if muscular failure was reached">Failure</div>
                                <div className="col-done" title="Mark this set as complete">Done</div>
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
                                                <option value="warmup">Warm-up</option>
                                                <option value="feeder">Feeder</option>
                                                <option value="working">Working</option>
                                                <option value="topset">Top Set</option>
                                                <option value="dropset">Drop Set</option>
                                            </select>
                                        ) : (
                                            <span className={`su-set-badge ${set.type}`}>
                                                {set.type.charAt(0).toUpperCase() + set.type.slice(1)}
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
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.weight}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'weight', e.target.value)}
                                            placeholder="--"
                                        />
                                    </div>
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.reps}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'reps', e.target.value)}
                                            placeholder="--"
                                        />
                                    </div>
                                    <div className="col-log">
                                        <input
                                            type="number"
                                            className="su-exec-input"
                                            value={set.log.rpe}
                                            onChange={(e) => updateSetLog(exIndex, setIndex, 'rpe', e.target.value)}
                                            placeholder="--"
                                            disabled={set.failure}
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
                                        {/* Defaulting to 90s rest for demo when checking a set */}
                                        <button
                                            className={`su-check-circle ${set.completed ? 'checked' : ''}`}
                                            onClick={() => toggleSetComplete(exIndex, setIndex, 90)}
                                        >
                                            <CheckCircle size={28} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Dynamic + Add Set Action */}
                            <div className="su-add-set-row">
                                <button className="su-add-set-btn" onClick={() => addExtraSet(exIndex)}>
                                    <Plus size={16} /> Add Extra Set
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                <div className="su-finish-run-container">
                    <Button size="lg" fullWidth className="su-complete-session-btn" onClick={finishSession}>
                        Finish & Save Session
                    </Button>
                </div>
            </div>
        </div>
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

export default ClientView;
