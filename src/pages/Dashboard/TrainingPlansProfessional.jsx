import React, { useState } from 'react';
import { Target, Activity, Tag, Plus, GripVertical, Settings2, Trash2, Copy, BarChart3, Dumbbell } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import './TrainingPlansProfessional.css';

// Mock structural tech data
const techUsageData = [
    { name: 'Straight', value: 60 },
    { name: 'Cluster', value: 15 },
    { name: 'Drop', value: 15 },
    { name: 'MyoReps', value: 10 },
];

const intensityDistData = [
    { RPE: 'RPE 6', sets: 2 },
    { RPE: 'RPE 7', sets: 5 },
    { RPE: 'RPE 8', sets: 8 },
    { RPE: 'RPE 9', sets: 4 },
    { RPE: 'RPE 10', sets: 1 },
];

// Helper UI Components
const Select = ({ label, options, defaultValue, ...props }) => (
    <div className="su-input-group">
        {label && <label className="su-input-label">{label}</label>}
        <select className="su-select" defaultValue={defaultValue} {...props}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const SetRow = ({ defaultType = 'working', defaultReps = '8-10', defaultRest = '90', index }) => {
    const [technique, setTechnique] = useState('Straight');

    return (
        <div className="su-set-row">
            <div className="su-set-base-grid">
                <div className="su-set-index">{index}</div>
                <Select
                    options={[
                        { value: 'warmup', label: 'Warm-up' },
                        { value: 'feeder', label: 'Feeder' },
                        { value: 'working', label: 'Working' },
                        { value: 'topset', label: 'Top Set' },
                        { value: 'backoff', label: 'Back-off' }
                    ]}
                    defaultValue={defaultType}
                />
                <Select
                    options={[
                        { value: 'Straight', label: 'Straight Set' },
                        { value: 'Cluster', label: 'Cluster' },
                        { value: 'Drop', label: 'Drop Set' },
                        { value: 'RestPause', label: 'Rest Pause' },
                        { value: 'MuscleRound', label: 'Muscle Round' }
                    ]}
                    defaultValue={technique}
                    onChange={(e) => setTechnique(e.target.value)}
                />
                <Input placeholder="Reps (e.g. 8-10)" defaultValue={defaultReps} />
                <Input placeholder="Load % (e.g. 75)" />
                <Input placeholder="RPE" defaultValue="8" />
                <Input placeholder="Rest (s)" defaultValue={defaultRest} />
                <div className="su-set-actions">
                    <button className="su-icon-btn su-text-muted"><Copy size={16} /></button>
                    <button className="su-icon-btn su-error-text"><Trash2 size={16} /></button>
                </div>
            </div>

            {/* Dynamic Technique Fields */}
            {technique === 'Cluster' && (
                <div className="su-tech-addon">
                    <div className="su-tech-badge">Cluster Addon</div>
                    <Input placeholder="Cluster Reps" defaultValue="2" />
                    <Input placeholder="Cluster Blocks" defaultValue="3" />
                    <Input placeholder="Intra-rest (s)" defaultValue="15" />
                </div>
            )}

            {technique === 'Drop' && (
                <div className="su-tech-addon">
                    <div className="su-tech-badge">Drop Addon</div>
                    <Input placeholder="Drop Count" defaultValue="2" />
                    <Input placeholder="Drop %" defaultValue="20" />
                </div>
            )}

            {technique === 'RestPause' && (
                <div className="su-tech-addon">
                    <div className="su-tech-badge">Rest-Pause Addon</div>
                    <Input placeholder="Mini-sets" defaultValue="2" />
                    <Input placeholder="Pause (s)" defaultValue="20" />
                </div>
            )}

            {technique === 'MuscleRound' && (
                <div className="su-tech-addon">
                    <div className="su-tech-badge">Muscle Round Addon</div>
                    <Input placeholder="Blocks" defaultValue="6" />
                    <Input placeholder="Rest b/w Blocks (s)" defaultValue="10" />
                </div>
            )}
        </div>
    );
};


const ExerciseCard = ({ title, tags = "Chest • Compound" }) => {
    return (
        <div className="su-exercise-builder-card">
            <div className="su-drag-handle-vertical">
                <GripVertical size={20} />
            </div>

            <div className="su-exercise-content">
                <div className="su-ex-header">
                    <div className="su-ex-title-row">
                        <h3 className="su-ex-title">{title}</h3>
                        <span className="su-ex-tags">{tags}</span>
                    </div>
                    <div className="su-ex-toggles">
                        <label className="su-checkbox"><input type="checkbox" defaultChecked /> Compound</label>
                        <label className="su-checkbox"><input type="checkbox" /> Unilateral</label>
                        <button className="su-icon-btn su-error-text"><Trash2 size={18} /></button>
                    </div>
                </div>

                <div className="su-ex-notes">
                    <Input placeholder="Execution notes (e.g. 3 sec eccentric, pause at bottom)..." />
                </div>

                <div className="su-sets-builder">
                    <div className="su-sets-header-labels">
                        <span></span>
                        <span>Type</span>
                        <span>Technique</span>
                        <span>Reps</span>
                        <span>Load %</span>
                        <span>RPE</span>
                        <span>Rest (s)</span>
                        <span></span>
                    </div>
                    {/* Mock 3 sets */}
                    <SetRow index={1} defaultType="warmup" defaultReps="15" defaultRest="60" />
                    <SetRow index={2} />
                    <SetRow index={3} />
                    <Button variant="outline" icon={<Plus size={16} />} className="su-mt-2">Add Set</Button>
                </div>
            </div>
        </div>
    );
};


const TrainingPlansProfessional = () => {
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);

    return (
        <div className="su-pro-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{isCreatingPlan ? 'Plan Builder' : 'Training Library'}</h1>
                    <p className="su-page-subtitle">{isCreatingPlan ? 'Build reusable training templates and analyze structural volume.' : 'Manage your training templates and assign them to clients.'}</p>
                </div>
                {!isCreatingPlan && (
                    <Button icon={<Plus size={16} />} onClick={() => setIsCreatingPlan(true)}>Create New Plan</Button>
                )}
                {isCreatingPlan && (
                    <Button variant="outline" onClick={() => setIsCreatingPlan(false)}>Back to Library</Button>
                )}
            </div>

            {isCreatingPlan ? (
                <div className="su-builder-layout">

                    {/* Left Column: Plan Builder */}
                    <div className="su-plan-builder">
                        <Card className="su-plan-header-card">
                            <div className="su-plan-meta-grid">
                                <Input label="Plan Name" defaultValue="Hypertrophy Phase 1 - Upper Power" />
                                <Input label="Duration (Weeks)" type="number" min="1" max="52" defaultValue="6" />
                                <Select label="Objective" defaultValue="hypertrophy" options={[
                                    { value: 'hypertrophy', label: 'Hypertrophy' },
                                    { value: 'strength', label: 'Strength/Power' },
                                    { value: 'endurance', label: 'Endurance' },
                                    { value: 'rehab', label: 'Rehabilitation' }
                                ]} />
                                <Select label="Difficulty" defaultValue="intermediate" options={[
                                    { value: 'beginner', label: 'Beginner' },
                                    { value: 'intermediate', label: 'Intermediate' },
                                    { value: 'advanced', label: 'Advanced' }
                                ]} />
                            </div>
                            <div className="su-mt-4">
                                <Input label="General Plan Notes" placeholder="e.g. Focus on progressive overload over 6 weeks..." />
                            </div>
                        </Card>

                        <div className="su-exercise-stack">
                            <div className="su-stack-header">
                                <h2>Exercise Stack</h2>
                                <Button icon={<Plus size={16} />}>Add Exercise</Button>
                            </div>

                            {/* Draggable Mock List */}
                            <div className="su-sortable-list">
                                <ExerciseCard title="Barbell Bench Press" tags="Chest • Triceps • Compound" />
                                <ExerciseCard title="Incline Dumbbell Press" tags="Upper Chest • Compound" />
                                <ExerciseCard title="Cable Crossover" tags="Chest • Isolation" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Structural Intelligence */}
                    <div className="su-structural-analytics">
                        <Card className="su-sticky-card">
                            <div className="su-card-header-flex">
                                <h3 className="su-card-title"><BarChart3 size={20} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Plan Intelligence</h3>
                            </div>

                            <div className="su-intelligence-metrics">
                                <div className="su-metric-item">
                                    <span className="su-metric-label">Total Volume (Sets)</span>
                                    <span className="su-metric-val">16 Sets</span>
                                </div>
                                <div className="su-metric-item">
                                    <span className="su-metric-label">Estimated Duration</span>
                                    <span className="su-metric-val">55-65 mins</span>
                                </div>
                                <div className="su-metric-item">
                                    <span className="su-metric-label">Average RPE</span>
                                    <span className="su-metric-val">7.8</span>
                                </div>
                            </div>

                            <div className="su-chart-section">
                                <h4 className="su-chart-subhead">Intensity Distribution</h4>
                                <div className="su-mini-chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={intensityDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <XAxis dataKey="RPE" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                            <RechartsTooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                            <Bar dataKey="sets" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="su-chart-section">
                                <h4 className="su-chart-subhead">Technique Usage</h4>
                                <div className="su-tech-bars">
                                    {techUsageData.map(tech => (
                                        <div key={tech.name} className="su-tech-bar-row">
                                            <span className="su-tech-label">{tech.name}</span>
                                            <div className="su-heatmap-bar">
                                                <div className="su-heatmap-fill" style={{ width: `${tech.value}%`, backgroundColor: tech.name === 'Straight' ? 'var(--text-muted)' : 'var(--accent)' }}></div>
                                            </div>
                                            <span className="su-tech-pct">{tech.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button fullWidth className="su-mt-4">Save Template</Button>
                            <Button fullWidth variant="outline" className="su-mt-2" style={{ color: 'var(--text-main)' }}>Assign to Client</Button>
                        </Card>
                    </div>

                </div>
            ) : (
                <div className="su-training-library">
                    <div className="su-grid-cards">
                        {/* Mock Template 1 */}
                        <Card className="su-template-card">
                            <div className="su-template-header">
                                <h3 className="su-template-title">Hypertrophy Phase 1 - Upper Power</h3>
                                <span className="su-badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>Intermediate</span>
                            </div>
                            <p className="su-text-muted su-mt-2 su-text-sm">Objective: Hypertrophy</p>
                            <div className="su-template-stats su-mt-4">
                                <div><span className="su-stat-label">Exercises</span> 6</div>
                                <div><span className="su-stat-label">Total Volume</span> 16 Sets</div>
                                <div><span className="su-stat-label">Est. Time</span> 55m</div>
                            </div>
                            <div className="su-template-actions su-mt-4">
                                <Button variant="outline" size="small" onClick={() => setIsCreatingPlan(true)} style={{ flex: 1 }}>Edit</Button>
                                <Button variant="outline" size="small" icon={<Copy size={14} />} style={{ padding: '0 0.5rem' }} />
                                <Button variant="outline" size="small" icon={<Trash2 size={14} />} style={{ padding: '0 0.5rem', color: 'var(--error)' }} />
                            </div>
                        </Card>

                        {/* Mock Template 2 */}
                        <Card className="su-template-card">
                            <div className="su-template-header">
                                <h3 className="su-template-title">Full Body Metabolic Conditioning</h3>
                                <span className="su-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)' }}>Advanced</span>
                            </div>
                            <p className="su-text-muted su-mt-2 su-text-sm">Objective: Endurance</p>
                            <div className="su-template-stats su-mt-4">
                                <div><span className="su-stat-label">Exercises</span> 8</div>
                                <div><span className="su-stat-label">Total Volume</span> 24 Sets</div>
                                <div><span className="su-stat-label">Est. Time</span> 45m</div>
                            </div>
                            <div className="su-template-actions su-mt-4">
                                <Button variant="outline" size="small" onClick={() => setIsCreatingPlan(true)} style={{ flex: 1 }}>Edit</Button>
                                <Button variant="outline" size="small" icon={<Copy size={14} />} style={{ padding: '0 0.5rem' }} />
                                <Button variant="outline" size="small" icon={<Trash2 size={14} />} style={{ padding: '0 0.5rem', color: 'var(--error)' }} />
                            </div>
                        </Card>

                        {/* Mock Template 3 */}
                        <Card className="su-template-card">
                            <div className="su-template-header">
                                <h3 className="su-template-title">Lower Body Foundations</h3>
                                <span className="su-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>Beginner</span>
                            </div>
                            <p className="su-text-muted su-mt-2 su-text-sm">Objective: Strength/Power</p>
                            <div className="su-template-stats su-mt-4">
                                <div><span className="su-stat-label">Exercises</span> 5</div>
                                <div><span className="su-stat-label">Total Volume</span> 12 Sets</div>
                                <div><span className="su-stat-label">Est. Time</span> 40m</div>
                            </div>
                            <div className="su-template-actions su-mt-4">
                                <Button variant="outline" size="small" onClick={() => setIsCreatingPlan(true)} style={{ flex: 1 }}>Edit</Button>
                                <Button variant="outline" size="small" icon={<Copy size={14} />} style={{ padding: '0 0.5rem' }} />
                                <Button variant="outline" size="small" icon={<Trash2 size={14} />} style={{ padding: '0 0.5rem', color: 'var(--error)' }} />
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingPlansProfessional;
