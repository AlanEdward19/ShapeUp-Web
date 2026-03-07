import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, Plus, Lightbulb } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ExerciseModal from '../../components/ExerciseModal';
import SuggestExerciseModal from '../../components/SuggestExerciseModal';
import { useLanguage } from '../../contexts/LanguageContext';
import './Exercises.css';

import { exercisesDB, availableMuscles } from '../../data/mockExercises';

const Exercises = () => {
    const { t } = useLanguage();
    const { setIsOpen, setSteps } = useTour();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showSuggest, setShowSuggest] = useState(false);

    // ─── Exercise Library Tour Trigger ───────────────────────────────
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_exercises_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="ex-header"]',
                    content: 'Esta é a Biblioteca de Exercícios com todos os movimentos disponíveis na plataforma. Você pode sugerir um novo exercício para inclusão clicando no botão ao lado!',
                },
                {
                    selector: '[data-tour="ex-toolbar"]',
                    content: 'Use a busca para encontrar exercícios pelo nome, ou clique em Filtrar para selecionar grupos musculares específicos e refinar os resultados.',
                },
                {
                    selector: '[data-tour="ex-card"]',
                    content: 'Clique em qualquer card para visualizar os detalhes completos do exercício: músculos trabalhados, equipamento necessário e instruções de execução.',
                }
            ];
            setSteps(tourSteps);
            setTimeout(() => {
                setIsOpen(true);
            }, 500);
            sessionStorage.setItem('shapeup_exercises_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps]);

    // Toggle muscle filter
    const toggleMuscle = (muscle) => {
        if (selectedMuscles.includes(muscle)) {
            setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
        } else {
            setSelectedMuscles([...selectedMuscles, muscle]);
        }
    };

    // Filter logic
    const filteredExercises = exercisesDB.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.some(m => ex.muscles.includes(m));
        return matchesSearch && matchesMuscle;
    });

    return (
        <div className="su-exercises-dashboard">
            <div className="su-dashboard-header-flex" data-tour="ex-header">
                <div>
                    <h1 className="su-page-title">{t('pro.exercises.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.exercises.subtitle')}</p>
                </div>
                <Button icon={<Lightbulb size={16} />} onClick={() => setShowSuggest(true)}>{t('pro.exercises.btn.suggest')}</Button>
            </div>

            <Card className="su-exercises-container su-mt-4">
                {/* Toolbar */}
                <div className="su-exercises-toolbar" data-tour="ex-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
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
                            icon={<Filter size={16} />}
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
                                        <button className="su-text-btn" onClick={() => setSelectedMuscles([])}>{t('pro.exercises.filter.clear')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Directory Grid */}
                <div className="su-exercises-grid">
                    {filteredExercises.map((ex, idx) => (
                        <div
                            key={ex.id}
                            className="su-exercise-thumb-card"
                            onClick={() => setSelectedExercise(ex)}
                            {...(idx === 0 ? { 'data-tour': 'ex-card' } : {})}
                        >
                            <div className="su-ex-thumb-visual">
                                <PlayCircle size={32} className="su-ex-play-icon" />
                            </div>
                            <div className="su-ex-thumb-content">
                                <h4 className="su-ex-thumb-title">{ex.name}</h4>
                                <div className="su-ex-thumb-tags">
                                    <span className="su-ex-tag-type">{ex.type}</span>
                                    {ex.muscles.slice(0, 2).map(m => (
                                        <span key={m} className="su-ex-tag-muscle">{m}</span>
                                    ))}
                                    {ex.muscles.length > 2 && <span className="su-ex-tag-muscle">+{ex.muscles.length - 2}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredExercises.length === 0 && (
                        <div className="su-empty-state">{t('pro.exercises.empty')}</div>
                    )}
                </div>
            </Card>

            {/* Detail Modal */}
            {selectedExercise && (
                <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
            )}

            {/* Suggest Exercise Modal */}
            {showSuggest && (
                <SuggestExerciseModal onClose={() => setShowSuggest(false)} />
            )}
        </div>
    );
};

export default Exercises;
