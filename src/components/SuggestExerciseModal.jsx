import React, { useState } from 'react';
import { X, Lightbulb, CheckCircle } from 'lucide-react';
import './InviteClientModal.css';
import './SuggestExerciseModal.css';

const MUSCLES = [
    'Chest', 'Upper Chest', 'Latissimus Dorsi', 'Rhomboids', 'Traps',
    'Front Delt', 'Side Delt', 'Rear Delt', 'Biceps', 'Triceps',
    'Forearms', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Lower Back'
];

const EQUIPMENT = [
    'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
    'Kettlebell', 'Resistance Band', 'EZ Bar', 'Smith Machine', 'Other'
];

const SuggestExerciseModal = ({ onClose }) => {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        name: '',
        isCompound: null,          // true | false | null (unset)
        muscles: [],
        equipment: [],
    });
    const [error, setError] = useState('');

    const toggleItem = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleSubmit = () => {
        if (!form.name.trim()) { setError('Please enter the exercise name.'); return; }
        if (form.isCompound === null) { setError('Please select whether it is compound or isolation.'); return; }
        if (form.muscles.length === 0) { setError('Please select at least one muscle group.'); return; }
        if (form.equipment.length === 0) { setError('Please select at least one equipment type.'); return; }
        setError('');
        setSent(true);
    };

    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-box su-suggest-modal" onClick={e => e.stopPropagation()}>
                <button className="su-modal-close" onClick={onClose}><X size={20} /></button>

                {!sent ? (
                    <>
                        <div className="su-modal-icon-header">
                            <div className="su-modal-icon-circle" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                                <Lightbulb size={24} />
                            </div>
                        </div>
                        <h2 className="su-modal-title">Suggest New Exercise</h2>
                        <p className="su-modal-subtitle">
                            Can't find an exercise you need? Suggest it to our admins and we'll review it for the library.
                        </p>

                        {/* Name */}
                        <div className="su-suggest-field">
                            <label className="su-suggest-label">Exercise Name <span className="su-required">*</span></label>
                            <input
                                autoFocus
                                type="text"
                                className="su-modal-input"
                                placeholder="e.g. Paused Hack Squat"
                                value={form.name}
                                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                                style={{ paddingLeft: '0.875rem' }}
                            />
                        </div>

                        {/* Compound / Isolation */}
                        <div className="su-suggest-field">
                            <label className="su-suggest-label">Movement Type <span className="su-required">*</span></label>
                            <div className="su-suggest-toggle-row">
                                <button
                                    type="button"
                                    className={`su-suggest-toggle ${form.isCompound === true ? 'active' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, isCompound: true }))}
                                >
                                    Compound
                                </button>
                                <button
                                    type="button"
                                    className={`su-suggest-toggle ${form.isCompound === false ? 'active' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, isCompound: false }))}
                                >
                                    Isolation
                                </button>
                            </div>
                        </div>

                        {/* Muscle Groups */}
                        <div className="su-suggest-field">
                            <label className="su-suggest-label">
                                Primary Muscles <span className="su-required">*</span>
                                {form.muscles.length > 0 && <span className="su-suggest-count">({form.muscles.length} selected)</span>}
                            </label>
                            <div className="su-suggest-chips">
                                {MUSCLES.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`su-suggest-chip ${form.muscles.includes(m) ? 'active' : ''}`}
                                        onClick={() => { toggleItem('muscles', m); setError(''); }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Equipment */}
                        <div className="su-suggest-field">
                            <label className="su-suggest-label">
                                Equipment <span className="su-required">*</span>
                                {form.equipment.length > 0 && <span className="su-suggest-count">({form.equipment.length} selected)</span>}
                            </label>
                            <div className="su-suggest-chips">
                                {EQUIPMENT.map(eq => (
                                    <button
                                        key={eq}
                                        type="button"
                                        className={`su-suggest-chip ${form.equipment.includes(eq) ? 'active' : ''}`}
                                        onClick={() => { toggleItem('equipment', eq); setError(''); }}
                                    >
                                        {eq}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p className="su-modal-error-msg">{error}</p>}

                        <div className="su-modal-actions">
                            <button className="su-modal-btn-cancel" onClick={onClose}>Cancel</button>
                            <button className="su-modal-btn-primary" onClick={handleSubmit}
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
                            >
                                <Lightbulb size={16} /> Send Suggestion
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="su-modal-success">
                        <div className="su-modal-success-icon">
                            <CheckCircle size={52} />
                        </div>
                        <h2 className="su-modal-title">Suggestion Sent!</h2>
                        <p className="su-modal-subtitle">
                            Your suggestion for <strong>"{form.name}"</strong> has been submitted to our administrators for review.<br />
                            We'll notify you once it's approved and added to the library. Thank you! 🙏
                        </p>
                        <button className="su-modal-btn-primary" style={{ alignSelf: 'center', marginTop: '1rem' }} onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestExerciseModal;
