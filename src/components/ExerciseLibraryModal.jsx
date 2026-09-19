import React, { useState } from 'react';
import { useExercises } from '../hooks/useExercises';
import { useLanguage } from '../contexts/LanguageContext';
import './ExerciseLibraryModal.css';

const ExerciseLibraryModal = ({ onClose, onSelect }) => {
    const { t } = useLanguage();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        filteredExercises,
        loading,
        searchTerm,
        setSearchTerm,
        selectedMuscles,
        toggleMuscle,
        clearFilters,
        availableMuscles,
    } = useExercises();

    return (
        <div className="su-modal-overlay su-elm-overlay" onClick={onClose}>
            <div className="su-modal-box su-elm-box" onClick={(e) => e.stopPropagation()}>
                <div className="su-elm-header">
                    <div>
                        <h2 className="su-elm-title">{t('pro.library.title')}</h2>
                        <p className="su-elm-subtitle">{t('pro.library.subtitle')}</p>
                    </div>
                    <button className="su-modal-close" onClick={onClose} aria-label={t('common.cancel')} type="button">×</button>
                </div>

                <div className="su-elm-toolbar">
                    <div className="su-elm-search">
                        <input
                            type="text"
                            placeholder={t('pro.library.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button
                        type="button"
                        className={`su-elm-filter-btn ${selectedMuscles.length > 0 || isFilterOpen ? 'active' : ''}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        aria-expanded={isFilterOpen}
                    >
                        {t('pro.library.muscles')}
                        {selectedMuscles.length > 0 && (
                            <span className="su-elm-filter-badge">{selectedMuscles.length}</span>
                        )}
                    </button>
                </div>

                {isFilterOpen && (
                    <div className="su-elm-filter-panel">
                        <div className="su-elm-filter-header">
                            <span className="su-elm-filter-title">{t('pro.library.filter_title')}</span>
                            {selectedMuscles.length > 0 && (
                                <button type="button" className="su-elm-clear-btn" onClick={clearFilters}>
                                    {t('pro.library.clear')}
                                </button>
                            )}
                        </div>
                        <div className="su-elm-filter-grid">
                            {availableMuscles.map((m) => (
                                <button
                                    key={m}
                                    className={`su-elm-muscle-pill ${selectedMuscles.includes(m) ? 'selected' : ''}`}
                                    onClick={() => toggleMuscle(m)}
                                    type="button"
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="su-elm-list">
                    {loading ? (
                        <div className="su-elm-empty">
                            <p>{t('pro.library.loading')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="su-elm-count">{t('pro.library.count', { n: filteredExercises.length })}</div>
                            {filteredExercises.map((ex) => (
                                <button key={ex.id} type="button" className="su-elm-item" onClick={() => onSelect(ex)}>
                                    <div className="su-elm-item-info">
                                        <strong>{ex.name}</strong>
                                        <div className="su-elm-item-tags">
                                            {ex.muscles.slice(0, 3).map((m) => (
                                                <span key={m} className="su-elm-tag muscle">{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="su-elm-item-arrow" aria-hidden="true">→</span>
                                </button>
                            ))}
                            {filteredExercises.length === 0 && (
                                <div className="su-elm-empty">
                                    <p>{t('pro.library.empty')}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseLibraryModal;
