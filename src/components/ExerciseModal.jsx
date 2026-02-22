import React from 'react';
import { X, PlayCircle } from 'lucide-react';
import './ExerciseModal.css';

const ExerciseModal = ({ exercise, onClose }) => {
    if (!exercise) return null;

    return (
        <div className="su-modal-overlay" onClick={onClose}>
            <div className="su-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="su-modal-header">
                    <div className="su-modal-title-group">
                        <h2 className="su-modal-title">{exercise.name}</h2>
                        <div className="su-modal-tags">
                            <span className="su-ex-tag-type">{exercise.type}</span>
                            <span className="su-ex-tag-equipment">{exercise.equipment}</span>
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
                            <span className="su-video-hint">Official Execution Video</span>
                        </div>
                    </div>

                    {/* Right Col: Info & Anatomy */}
                    <div className="su-modal-info-section">

                        <div className="su-info-block">
                            <h3>Targeted Muscles</h3>
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
                            <h3>Execution Notes</h3>
                            <p className="su-text-muted">
                                This is a standardized placeholder description. To perform the {exercise.name}, ensure your form is consistent and you control the eccentric portion of the movement. Keep the selected {exercise.equipment} stable throughout the range of motion.
                            </p>
                            <ul className="su-execution-list">
                                <li>Maintain core stability.</li>
                                <li>Follow a 2-1-1-0 tempo as a baseline.</li>
                                <li>Breathe out on the concentric phase.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;
