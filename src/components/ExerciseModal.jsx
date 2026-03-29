import React from 'react';
import { X, PlayCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './ExerciseModal.css';

const ExerciseModal = ({ exercise, onClose }) => {
    const { t } = useLanguage();
    if (!exercise) return null;

    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="su-modal-header">
                    <div className="su-modal-title-group">
                        <h2 className="su-modal-title">{exercise.name}</h2>
                        <div className="su-modal-tags">
                            {exercise.type && <span className="su-ex-tag-type">{exercise.type}</span>}
                            {(exercise.equipment || (exercise.equipments && exercise.equipments.length > 0)) && (
                                <span className="su-ex-tag-equipment">
                                    {exercise.equipment || exercise.equipments[0].equipmentNamePt || exercise.equipments[0].equipmentName}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="su-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="su-modal-body">

                    {/* Left Col: Video Placeholder */}
                    <div className="su-modal-video-section">
                        <div className="su-video-placeholder">
                            <PlayCircle size={48} className="su-video-play-btn" />
                            <span className="su-video-hint">{t('client.exercise_modal.video')}</span>
                        </div>
                    </div>

                    {/* Right Col: Info & Anatomy */}
                    <div className="su-modal-info-section">

                        <div className="su-info-block">
                            <h3>{t('client.exercise_modal.muscles')}</h3>
                            <div className="su-anatomy-heatmap">
                                {/* Simulated Anatomy via Badges */}
                                {exercise.muscles.map((muscle, idx) => (
                                    <span key={muscle} className={`su-anatomy-badge ${idx === 0 ? 'primary' : 'secondary'}`}>
                                        {muscle}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="su-info-block">
                            <h3>{t('client.exercise_modal.notes.title')}</h3>
                            <p className="su-text-muted">
                                {exercise.description || `${t('client.exercise_modal.notes.desc.1')}${exercise.name}${t('client.exercise_modal.notes.desc.2')} (${exercise.equipment || '-'}) ${t('client.exercise_modal.notes.desc.3')}`}
                            </p>
                            
                            {/* Renderizar os passos (steps) reais da API ou o fallback genérico se a lista estiver vazia */}
                            {exercise.steps && exercise.steps.length > 0 ? (
                                <ul className="su-execution-list">
                                    {exercise.steps.map((step, idx) => {
                                        // O step pode ser uma string direta, ou um objeto { stepDescriptionPt, stepDescription... }
                                        const stepText = typeof step === 'object' 
                                            ? (step.stepDescriptionPt || step.stepDescription || step.description || step.name) 
                                            : step;
                                        return <li key={idx}>{stepText}</li>;
                                    })}
                                </ul>
                            ) : (
                                <ul className="su-execution-list">
                                    <li>{t('client.exercise_modal.notes.bullet1')}</li>
                                    <li>{t('client.exercise_modal.notes.bullet2')}</li>
                                    <li>{t('client.exercise_modal.notes.bullet3')}</li>
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;
