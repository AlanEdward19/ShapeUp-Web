import React, { useState, useEffect } from 'react';
import { useTour } from '@reactour/tour';
import Button from '../../components/Button';
import ExerciseModal from '../../components/ExerciseModal';
import SuggestExerciseModal from '../../components/SuggestExerciseModal';
import { useLanguage } from '../../contexts/LanguageContext';
import './Exercises.css';

import { useExercises } from '../../hooks/useExercises';

const Exercises = () => {
    const { t } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    
    // UI Local States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(undefined);
    const [showSuggest, setShowSuggest] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    
    // Business Logic moved to Custom Hook
    const {
        filteredExercises,
        loading,
        searchTerm,
        setSearchTerm,
        selectedMuscles,
        toggleMuscle,
        clearFilters,
        availableMuscles
    } = useExercises();

    const activeExercise = selectedExercise === undefined ? filteredExercises[0] : selectedExercise;

    // ─── Exercise Library Tour Trigger ───────────────────────────────
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_exercises_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="ex-header"]',
                    content: t('tour.exercises.1'),
                },
                {
                    selector: '[data-tour="ex-toolbar"]',
                    content: t('tour.exercises.2'),
                },
                {
                    selector: '[data-tour="ex-card"]',
                    content: t('tour.exercises.3'),
                }
            ];
            setSteps(tourSteps);
            setCurrentStep(0);
setTimeout(() => {
                setIsOpen(true);
            }, 500);
            sessionStorage.setItem('shapeup_exercises_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps]);

    return (
        <div className="su-exercises-dashboard">
            <div className="su-dashboard-header-flex" data-tour="ex-header">
                <div>
                    <h1 className="su-page-title">{t('pro.exercises.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.exercises.subtitle')}</p>
                </div>
                <Button onClick={() => setShowSuggest(true)}>{t('pro.exercises.btn.suggest')}</Button>
            </div>

            <div className="su-exercises-ledger">
                <div className="su-exercises-toolbar" data-tour="ex-toolbar">
                    <div className="su-search-box">
                        <input
                            type="text"
                            placeholder={t('pro.exercises.search')}
                            className="su-bare-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="su-filter-dropdown-container">
                        <Button
                            variant={selectedMuscles.length > 0 ? 'primary' : 'outline'}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            {t('pro.exercises.filter')} {selectedMuscles.length > 0 && `(${selectedMuscles.length})`}
                        </Button>

                        {isFilterOpen && (
                            <div className="su-filter-dropdown">
                                <div className="su-filter-dropdown-header">{t('pro.exercises.filter.header')}</div>
                                <div className="su-filter-options-grid">
                                    {availableMuscles.map(muscle => (
                                        <label key={muscle} className="su-filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedMuscles.includes(muscle)}
                                                onChange={() => toggleMuscle(muscle)}
                                            />
                                            <span>{muscle}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedMuscles.length > 0 && (
                                    <div className="su-filter-actions">
                                        <button className="su-text-btn" onClick={clearFilters}>{t('pro.exercises.filter.clear')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="su-library-filters">
                    <div className="su-library-muscles"><button type="button" className={!selectedMuscles.length ? 'active' : ''} onClick={clearFilters}>{t('pro.dashboard.filter.all')}</button>{availableMuscles.map(muscle => <button type="button" key={muscle} className={selectedMuscles.includes(muscle) ? 'active' : ''} onClick={() => toggleMuscle(muscle)} aria-pressed={selectedMuscles.includes(muscle)}>{muscle}</button>)}</div>
                    <div className="su-library-views"><button type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}>Lista</button><button type="button" onClick={() => setViewMode('cards')} aria-pressed={viewMode === 'cards'}>Cards</button></div>
                </div>
                <div className={`su-library-layout ${activeExercise ? 'has-inspector' : ''}`}>
                {/* Directory Grid */}
                <div className="su-library-directory">
                <div className="su-library-directory-heading"><span>Exibindo {filteredExercises.length} exercícios</span><small>Selecione uma linha para inspecionar o guia biomecânico</small></div>
                {viewMode === 'list' && <div className="su-library-column-labels"><span>Código</span><span>Exercício & músculo alvo</span><span>Equipamento</span><span>Padrão motor</span><span>Ações</span></div>}
                <div className={`su-exercises-grid su-library-${viewMode}`}>
                    {loading ? (
                        <div className="su-empty-state" style={{ gridColumn: '1 / -1' }}>{t('pro.exercises.loading')}</div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="su-empty-state">{t('pro.exercises.empty')}</div>
                    ) : (
                        filteredExercises.map((ex, idx) => (
                            <button type="button"
                                key={ex.id}
                                className={`su-exercise-thumb-card ${activeExercise?.id === ex.id ? 'is-selected' : ''}`}
                                aria-pressed={activeExercise?.id === ex.id}
                                onClick={() => setSelectedExercise(ex)}
                                {...(idx === 0 ? { 'data-tour': 'ex-card' } : {})}
                            >
                                <div className="su-ex-thumb-visual">EX-{String(ex.id).slice(-4).padStart(3, '0')}</div>
                                <div className="su-ex-thumb-content">
                                    <h4 className="su-ex-thumb-title">{ex.name}</h4>
                                    <div className="su-ex-thumb-tags">
                                        {ex.type && <span className="su-ex-tag-type">{ex.type}</span>}
                                        {ex.muscles.slice(0, 2).map(m => (
                                            <span key={m} className="su-ex-tag-muscle">{m}</span>
                                        ))}
                                        {ex.muscles.length > 2 && <span className="su-ex-tag-muscle">+{ex.muscles.length - 2}</span>}
                                    </div>
                                </div>
                                <span className="su-library-equipment">{ex.equipment || ex.equipments?.[0]?.equipmentNamePt || '—'}</span>
                                <span className="su-library-pattern">{ex.type || '—'}</span>
                                <span className="su-library-arrow" aria-hidden="true">›</span>
                            </button>
                        ))
                    )}
                </div>
                </div>
                {activeExercise && <ExerciseModal embedded exercise={activeExercise} onClose={() => setSelectedExercise(null)} />}
                </div>
            </div>

            {/* Suggest Exercise Modal */}
            {showSuggest && (
                <SuggestExerciseModal onClose={() => setShowSuggest(false)} />
            )}
        </div>
    );
};

export default Exercises;
