import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Target, Scale, Trash2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './DashboardClient.css';

const ObjectivesClient = () => {
    const clientId = localStorage.getItem('shapeup_client_id') || 1;

    // --- Objectives State ---
    const [objectives, setObjectives] = useState(() => {
        const stored = localStorage.getItem(`shapeup_client_objectives_${clientId}`);
        if (stored) return JSON.parse(stored);
        return {
            goalWeight: '',
            history: [] // { date, weight }
        };
    });

    // Form States
    const [tempGoalWeight, setTempGoalWeight] = useState(objectives.goalWeight);
    const [newWeightEntry, setNewWeightEntry] = useState('');

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem(`shapeup_client_objectives_${clientId}`, JSON.stringify(objectives));
    }, [objectives, clientId]);

    // Handlers
    const handleSaveGoal = () => {
        setObjectives(prev => ({ ...prev, goalWeight: tempGoalWeight }));
    };

    const handleLogWeight = () => {
        if (!newWeightEntry) return;
        // Don't log if the input is obviously invalid
        const parsedWeight = parseFloat(newWeightEntry);
        if (isNaN(parsedWeight) || parsedWeight <= 0) return;

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            weight: parsedWeight
        };
        // Insert at beginning for chronological descending in list, but chart needs ascending
        setObjectives(prev => ({
            ...prev,
            history: [newEntry, ...prev.history]
        }));
        setNewWeightEntry('');
    };

    const handleDeleteWeight = (id) => {
        setObjectives(prev => ({
            ...prev,
            history: prev.history.filter(h => h.id !== id)
        }));
    }

    // Chart Data (Ascending dates)
    const chartData = [...objectives.history].sort((a, b) => a.id - b.id).map((h, i) => ({
        session: `Entry ${i + 1}`,
        weight: h.weight,
        date: h.date
    }));

    return (
        <div className="su-objectives-tab">
            <h1 className="su-page-title su-mb-6">Your Objectives</h1>

            <div className="su-overview-layout">
                {/* Left Column: Data Entry & History */}
                <div className="su-overview-main">

                    {/* Goals Card */}
                    <Card className="su-mb-4">
                        <div className="su-card-header-icon su-mb-4">
                            <Target size={20} className="su-text-muted" />
                            <h3 className="su-section-title" style={{ margin: 0 }}>Target Goal</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Goal Weight (kg)"
                                    type="number"
                                    placeholder="e.g. 75"
                                    value={tempGoalWeight}
                                    onChange={(e) => setTempGoalWeight(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSaveGoal}>Save Goal</Button>
                        </div>
                    </Card>

                    {/* Log Weight Card */}
                    <Card>
                        <div className="su-card-header-icon su-mb-4">
                            <Scale size={20} className="su-text-muted" />
                            <h3 className="su-section-title" style={{ margin: 0 }}>Log Current Weight</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Today's Weight (kg)"
                                    type="number"
                                    placeholder="e.g. 82.5"
                                    value={newWeightEntry}
                                    onChange={(e) => setNewWeightEntry(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleLogWeight}>Log Weight</Button>
                        </div>

                        <h4 className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>History</h4>
                        {objectives.history.length === 0 ? (
                            <p className="su-text-muted">No weight entries logged yet.</p>
                        ) : (
                            <div className="su-history-list">
                                {objectives.history.map(entry => (
                                    <div key={entry.id} className="su-history-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{entry.weight} kg</div>
                                            <div className="su-text-muted" style={{ fontSize: '0.85rem' }}>{entry.date}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteWeight(entry.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                            title="Delete Entry"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                </div>

                {/* Right Column: Chart */}
                <div className="su-overview-sidebar">
                    <Card className="su-metric-card-large" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <div className="su-card-header-icon">
                            <TrendingUp size={20} className="su-text-muted" />
                            <h3 className="su-section-title">Bodyweight Trend</h3>
                        </div>
                        <div style={{ flex: 1, minHeight: 0, marginTop: '1rem' }}>
                            {chartData.length >= 2 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorWeightClient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} labelFormatter={(l, p) => p[0]?.payload.date} />
                                        <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeightClient)" />

                                        {/* Optional Reference Line for Goal Weight */}
                                        {objectives.goalWeight && (
                                            <Area type="monotone" dataKey={() => parseFloat(objectives.goalWeight)} name="Goal" stroke="var(--text-muted)" strokeDasharray="5 5" fill="none" />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    Log at least 2 weight entries to see your trend chart.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ObjectivesClient;
