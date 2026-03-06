import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Target, Scale, Trash2, TrendingUp, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import './DashboardClient.css';

const ObjectivesClient = () => {
    const { t, unitSystem, convertWeight } = useLanguage();
    const clientId = localStorage.getItem('shapeup_client_id') || 1;

    // --- Objectives State ---
    const [objectives, setObjectives] = useState(() => {
        const stored = localStorage.getItem(`shapeup_client_objectives_${clientId}`);
        if (stored) return JSON.parse(stored);
        return {
            goalWeight: '',
            goalUnit: 'metric', // Stored origin unit for the goal
            history: [] // { id, date, weight, unit }
        };
    });

    // Form States
    const [tempGoalWeight, setTempGoalWeight] = useState(objectives.goalWeight ? convertWeight(objectives.goalWeight, objectives.goalUnit || 'metric') : '');
    const [newWeightEntry, setNewWeightEntry] = useState('');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem(`shapeup_client_objectives_${clientId}`, JSON.stringify(objectives));
    }, [objectives, clientId]);

    // Handlers
    const handleSaveGoal = () => {
        setObjectives(prev => ({
            ...prev,
            goalWeight: tempGoalWeight,
            goalUnit: unitSystem
        }));
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const handleLogWeight = () => {
        if (!newWeightEntry) return;
        // Don't log if the input is obviously invalid
        const parsedWeight = parseFloat(newWeightEntry);
        if (isNaN(parsedWeight) || parsedWeight <= 0) return;

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            weight: parsedWeight,
            unit: unitSystem
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
        weight: parseFloat(convertWeight(h.weight, h.unit || 'metric').toFixed(1)), // Fix precision
        date: h.date
    }));

    return (
        <div className="su-objectives-tab">
            <h1 className="su-page-title su-mb-6">{t('client.objectives.title')}</h1>

            <div className="su-overview-layout">
                {/* Left Column: Data Entry & History */}
                <div className="su-overview-main">

                    {/* Goals Card */}
                    <Card className="su-mb-4">
                        <div className="su-card-header-icon su-mb-4">
                            <Target size={20} className="su-text-muted" />
                            <h3 className="su-section-title" style={{ margin: 0 }}>{t('client.objectives.target.title')}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label={t('client.objectives.target.label').replace('(kg)', `(${unitSystem === 'imperial' ? 'lbs' : 'kg'})`)}
                                    type="number"
                                    placeholder="e.g. 75"
                                    value={tempGoalWeight}
                                    onChange={(e) => setTempGoalWeight(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                {showSaveSuccess && (
                                    <div className="su-success-text" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>
                                        <Check size={14} />
                                        {t('client.objectives.target.saved')}
                                    </div>
                                )}
                                <Button onClick={handleSaveGoal}>{t('client.objectives.target.btn')}</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Log Weight Card */}
                    <Card>
                        <div className="su-card-header-icon su-mb-4">
                            <Scale size={20} className="su-text-muted" />
                            <h3 className="su-section-title" style={{ margin: 0 }}>{t('client.objectives.log.title')}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label={t('client.objectives.log.label').replace('(kg)', `(${unitSystem === 'imperial' ? 'lbs' : 'kg'})`)}
                                    type="number"
                                    placeholder="e.g. 82.5"
                                    value={newWeightEntry}
                                    onChange={(e) => setNewWeightEntry(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleLogWeight}>{t('client.objectives.log.btn')}</Button>
                        </div>

                        <h4 className="su-text-muted su-mb-4" style={{ fontSize: '0.875rem' }}>{t('client.objectives.history.title')}</h4>
                        {objectives.history.length === 0 ? (
                            <p className="su-text-muted">{t('client.objectives.history.empty')}</p>
                        ) : (
                            <div className="su-history-list">
                                {objectives.history.map(entry => (
                                    <div key={entry.id} className="su-history-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{convertWeight(entry.weight, entry.unit || 'metric') % 1 === 0 ? convertWeight(entry.weight, entry.unit || 'metric').toString() : convertWeight(entry.weight, entry.unit || 'metric').toFixed(1)} {unitSystem === 'imperial' ? 'lbs' : 'kg'}</div>
                                            <div className="su-text-muted" style={{ fontSize: '0.85rem' }}>{entry.date}</div>
                                        </div>
                                        <button
                                            className="su-delete-history-btn"
                                            onClick={() => handleDeleteWeight(entry.id)}
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
                            <h3 className="su-section-title">{t('client.objectives.chart.title')}</h3>
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
                                        <Area type="monotone" dataKey="weight" name={t('client.objectives.chart.series.weight').replace('(kg)', `(${unitSystem === 'imperial' ? 'lbs' : 'kg'})`)} stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeightClient)" />

                                        {/* Optional Reference Line for Goal Weight */}
                                        {objectives.goalWeight && (
                                            <Area type="monotone" dataKey={() => parseFloat(convertWeight(objectives.goalWeight, objectives.goalUnit || 'metric').toFixed(1))} name={t('client.objectives.chart.series.goal')} stroke="var(--text-muted)" strokeDasharray="5 5" fill="none" />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    {t('client.objectives.chart.empty')}
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
