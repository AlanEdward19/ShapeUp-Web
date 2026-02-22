import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Activity, Scale, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import './ClientDetail.css';

// Mock DB Fetch
const getClientData = (id) => {
    // In a real app we'd fetch based on ID. 
    return {
        id,
        name: 'Mike K.',
        plan: 'Hypertrophy Block A',
        startDate: 'Oct 12, 2025',
        goal: 'Muscle Gain',
        weightProgress: [
            { week: 'W1', weight: 82.5 },
            { week: 'W2', weight: 82.8 },
            { week: 'W3', weight: 83.1 },
            { week: 'W4', weight: 83.5 },
            { week: 'W5', weight: 84.0 },
        ],
        strengthProgress: [ // Squat 1RM Estimate
            { week: 'W1', load: 110 },
            { week: 'W2', load: 112.5 },
            { week: 'W3', load: 115 },
            { week: 'W4', load: 120 },
            { week: 'W5', load: 122.5 },
        ],
        readinessRadar: [
            { subject: 'Sleep Quality', A: 80, fullMark: 100 },
            { subject: 'Energy Levels', A: 85, fullMark: 100 },
            { subject: 'Soreness (Low=Good)', A: 60, fullMark: 100 },
            { subject: 'Stress', A: 40, fullMark: 100 },
            { subject: 'Nutrition', A: 90, fullMark: 100 },
        ],
        adherence: { completed: 18, skipped: 2, partial: 1 }
    };
};

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const client = getClientData(id);

    return (
        <div className="su-client-detail-dashboard">
            <div className="su-dashboard-header-flex">
                <div className="su-header-with-back">
                    <button className="su-back-btn" onClick={() => navigate('/dashboard/clients')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="su-page-title">{client.name} <span className="su-status-badge active su-ml-2">Active</span></h1>
                        <p className="su-page-subtitle">Current Plan: <strong>{client.plan}</strong> • Goal: {client.goal}</p>
                    </div>
                </div>
                <div className="su-header-actions">
                    <Button variant="outline">Message Client</Button>
                    <Button>Edit Program</Button>
                </div>
            </div>

            <div className="su-client-metrics-grid su-mt-4">

                {/* 1. Strength Progression */}
                <Card className="su-metric-card-large">
                    <div className="su-card-header-icon">
                        <TrendingUp size={20} className="su-text-muted" />
                        <h3 className="su-section-title">Strength Progression (Squat)</h3>
                    </div>
                    <div className="su-chart-wrapper-med">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={client.strengthProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="load" name="Est. 1RM (kg)" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Readiness & RPE Radar */}
                <Card className="su-metric-card-large">
                    <div className="su-card-header-icon">
                        <Activity size={20} className="su-text-muted" />
                        <h3 className="su-section-title">Latest Check-in Readiness</h3>
                    </div>
                    <div className="su-chart-wrapper-med">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={client.readinessRadar}>
                                <PolarGrid stroke="var(--border-color)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Client" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 3. Weight Tracking */}
                <Card className="su-metric-card-large">
                    <div className="su-card-header-icon">
                        <Scale size={20} className="su-text-muted" />
                        <h3 className="su-section-title">Bodyweight vs. Goal Trend</h3>
                    </div>
                    <div className="su-chart-wrapper-med">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={client.weightProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="weight" name="Bodyweight (kg)" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 4. Adherence Breakdown */}
                <Card className="su-metric-card-large">
                    <div className="su-card-header-icon">
                        <CheckCircle2 size={20} className="su-text-muted" />
                        <h3 className="su-section-title">Adherence (Last 30 Days)</h3>
                    </div>
                    <div className="su-adherence-stats">
                        <div className="su-adherence-circle-wrap">
                            <svg viewBox="0 0 36 36" className="su-circular-chart">
                                <path className="su-circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="su-circle-main"
                                    strokeDasharray="85, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="su-percentage">85%</text>
                            </svg>
                        </div>
                        <div className="su-adherence-legend">
                            <div className="su-legend-item">
                                <span className="su-legend-dot primary"></span>
                                <span className="su-legend-label">Completed</span>
                                <span className="su-legend-val">{client.adherence.completed} sessions</span>
                            </div>
                            <div className="su-legend-item">
                                <span className="su-legend-dot error"></span>
                                <span className="su-legend-label">Skipped</span>
                                <span className="su-legend-val">{client.adherence.skipped} sessions</span>
                            </div>
                            <div className="su-legend-item">
                                <span className="su-legend-dot warning"></span>
                                <span className="su-legend-label">Partial (Logged)</span>
                                <span className="su-legend-val">{client.adherence.partial} sessions</span>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default ClientDetail;
