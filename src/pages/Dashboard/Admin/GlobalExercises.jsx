import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    PlayCircle, 
    Activity,
    RefreshCw,
    Filter,
    MoreVertical
} from 'lucide-react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { getGlobalExercises, deleteExercise } from '../../../services/adminService';
import '../Clients.css';

const GlobalExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('all');

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const data = await getGlobalExercises();
            if (data && data.items) {
                setExercises(data.items);
            } else {
                // Fallback mock data
                setExercises([
                    { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', type: 'Strength', difficulty: 'Intermediate' },
                    { id: '2', name: 'Bulgarian Split Squat', muscle: 'Quads', type: 'Strength', difficulty: 'Advanced' },
                    { id: '3', name: 'Deadlift', muscle: 'Back', type: 'Powerlifting', difficulty: 'Intermediate' },
                    { id: '4', name: 'Lat Pulldown', muscle: 'Back', type: 'Strength', difficulty: 'Beginner' },
                    { id: '5', name: 'Dumbbell Bicep Curl', muscle: 'Biceps', type: 'Strength', difficulty: 'Beginner' },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch exercises:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this exercise from the global library?')) {
            try {
                await deleteExercise(id);
                setExercises(exercises.filter(ex => ex.id !== id));
            } catch (err) {
                alert('Failed to delete exercise.');
            }
        }
    };

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = filterMuscle === 'all' || ex.muscle === filterMuscle;
        return matchesSearch && matchesMuscle;
    });

    return (
        <div className="su-admin-exercises">
            <div className="su-dashboard-header-flex" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="su-page-title">Global Exercise Library</h1>
                    <p className="su-page-subtitle">Manage the master list of exercises available to all system users</p>
                </div>
                <Button onClick={() => alert('Add Exercise flow')}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Exercise
                </Button>
            </div>

            <Card className="su-clients-container">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search exercises..." 
                            className="su-bare-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="su-filter-select-wrapper">
                        <Filter size={16} />
                        <select value={filterMuscle} onChange={(e) => setFilterMuscle(e.target.value)}>
                            <option value="all">All Muscle Groups</option>
                            <option value="Chest">Chest</option>
                            <option value="Back">Back</option>
                            <option value="Quads">Quads</option>
                            <option value="Biceps">Biceps</option>
                            <option value="Triceps">Triceps</option>
                            <option value="Shoulders">Shoulders</option>
                        </select>
                    </div>

                    <Button variant="ghost" onClick={fetchExercises} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'su-spin' : ''} />
                    </Button>
                </div>

                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>Exercise Name</th>
                                <th>Muscle Group</th>
                                <th>Type</th>
                                <th>Difficulty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Activity className="su-spin" size={24} color="var(--primary)" />
                                        <p style={{ marginTop: '0.5rem' }} className="su-text-muted">Loading library...</p>
                                    </td>
                                </tr>
                            ) : filteredExercises.length > 0 ? (
                                filteredExercises.map(ex => (
                                    <tr key={ex.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="su-client-avatar" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                                                    <PlayCircle size={16} />
                                                </div>
                                                <span className="su-client-name">{ex.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{ex.muscle}</span>
                                        </td>
                                        <td>
                                            <div className="su-text-muted">{ex.type}</div>
                                        </td>
                                        <td>
                                            <span className={`su-status-badge ${ex.difficulty.toLowerCase().replace(' ', '-')}`}>
                                                {ex.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="su-table-actions">
                                                <Button variant="ghost" size="sm" title="Edit Exercise" onClick={() => alert('Edit Exercise')}>
                                                    <Edit2 size={16} color="var(--primary)" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Delete Exercise" onClick={() => handleDelete(ex.id)}>
                                                    <Trash2 size={16} color="var(--error)" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p className="su-text-muted">No exercises found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default GlobalExercises;
