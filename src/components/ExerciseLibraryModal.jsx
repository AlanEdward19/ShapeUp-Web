import React, { useState } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { exercisesDB, availableMuscles } from '../data/mockExercises';
import './ExerciseLibraryModal.css';

const ExerciseLibraryModal = ({ onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleMuscle = (muscle) => {
        if (selectedMuscles.includes(muscle)) {
            setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
        } else {
            setSelectedMuscles([...selectedMuscles, muscle]);
        }
    };

    const filteredExercises = exercisesDB.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.some(m => ex.muscles.includes(m));
        return matchesSearch && matchesMuscle;
    });

    return (
        <div className="su-modal-overlay su-elm-overlay" onClick={onClose}>
            <div className="su-modal-box su-elm-box" onClick={e => e.stopPropagation()}>
                <div className="su-elm-header">
                    <div>
                        <h2 className="su-elm-title">Select Exercise</h2>
                        <p className="su-elm-subtitle">Choose an exercise to add to the training plan.</p>
                    </div>
                    <button className="su-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="su-elm-toolbar">
                    <div className="su-elm-search">
                        <Search size={18} className="su-text-muted" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="su-elm-filter-wrap">
                        <button
                            className={`su-elm-filter-btn ${selectedMuscles.length > 0 ? 'active' : ''}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={16} /> Filters {selectedMuscles.length > 0 && `(${selectedMuscles.length})`}
                        </button>

                        {isFilterOpen && (
                            <div className="su-elm-filter-dropdown">
                                <div className="su-elm-filter-grid">
                                    {availableMuscles.map(m => (
                                        <label key={m} className="su-elm-filter-opt">
                                            <input
                                                type="checkbox"
                                                checked={selectedMuscles.includes(m)}
                                                onChange={() => toggleMuscle(m)}
                                            />
                                            {m}
                                        </label>
                                    ))}
                                </div>
                                {selectedMuscles.length > 0 && (
                                    <button className="su-elm-clear-btn" onClick={() => setSelectedMuscles([])}>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="su-elm-list">
                    {filteredExercises.map(ex => (
                        <div key={ex.id} className="su-elm-item" onClick={() => onSelect(ex)}>
                            <div className="su-elm-item-info">
                                <strong>{ex.name}</strong>
                                <div className="su-elm-item-tags">
                                    <span className="su-elm-tag type">{ex.type}</span>
                                    {ex.muscles.slice(0, 2).map(m => <span key={m} className="su-elm-tag muscle">{m}</span>)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredExercises.length === 0 && (
                        <div className="su-elm-empty">No exercises found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseLibraryModal;
