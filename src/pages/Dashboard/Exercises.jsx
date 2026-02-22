import React, { useState } from 'react';
import { Search, Filter, PlayCircle, Plus, Lightbulb } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ExerciseModal from '../../components/ExerciseModal';
import SuggestExerciseModal from '../../components/SuggestExerciseModal';
import './Exercises.css';

// Mock Exercise Data
const exercisesDB = [
    { id: 1, name: 'Barbell Bench Press', muscles: ['Chest', 'Triceps', 'Front Delt'], type: 'Compound', equipment: 'Barbell' },
    { id: 2, name: 'Incline Dumbbell Press', muscles: ['Upper Chest', 'Triceps', 'Front Delt'], type: 'Compound', equipment: 'Dumbbell' },
    { id: 3, name: 'Cable Crossover', muscles: ['Chest'], type: 'Isolation', equipment: 'Cable' },
    { id: 4, name: 'Barbell Squat', muscles: ['Quads', 'Glutes', 'Hamstrings'], type: 'Compound', equipment: 'Barbell' },
    { id: 5, name: 'Romanian Deadlift', muscles: ['Hamstrings', 'Glutes', 'Lower Back'], type: 'Compound', equipment: 'Barbell' },
    { id: 6, name: 'Leg Extension', muscles: ['Quads'], type: 'Isolation', equipment: 'Machine' },
    { id: 7, name: 'Pull Up', muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'], type: 'Compound', equipment: 'Bodyweight' },
    { id: 8, name: 'Seated Cable Row', muscles: ['Rhomboids', 'Latissimus Dorsi', 'Biceps'], type: 'Compound', equipment: 'Cable' },
    { id: 9, name: 'Overhead Press', muscles: ['Shoulders', 'Triceps'], type: 'Compound', equipment: 'Barbell' },
    { id: 10, name: 'Lateral Raise', muscles: ['Side Delt'], type: 'Isolation', equipment: 'Dumbbell' },
];

const availableMuscles = ['Chest', 'Upper Chest', 'Back', 'Latissimus Dorsi', 'Rhomboids', 'Shoulders', 'Front Delt', 'Side Delt', 'Rear Delt', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Lower Back'];

const Exercises = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showSuggest, setShowSuggest] = useState(false);

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
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Exercise Library</h1>
                    <p className="su-page-subtitle">Browse and manage the global exercise database.</p>
                </div>
                <Button icon={<Lightbulb size={16} />} onClick={() => setShowSuggest(true)}>Suggest New Exercise</Button>
            </div>

            <Card className="su-exercises-container su-mt-4">
                {/* Toolbar */}
                <div className="su-exercises-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input
                            type="text"
                            placeholder="Search exercises by name..."
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
                            Muscles {selectedMuscles.length > 0 && `(${selectedMuscles.length})`}
                        </Button>

                        {isFilterOpen && (
                            <div className="su-filter-dropdown">
                                <div className="su-filter-dropdown-header">Filter by Target Muscle</div>
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
                                        <button className="su-text-btn" onClick={() => setSelectedMuscles([])}>Clear Filters</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Directory Grid */}
                <div className="su-exercises-grid">
                    {filteredExercises.map(ex => (
                        <div key={ex.id} className="su-exercise-thumb-card" onClick={() => setSelectedExercise(ex)}>
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
                        <div className="su-empty-state">No exercises found matching your criteria.</div>
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
