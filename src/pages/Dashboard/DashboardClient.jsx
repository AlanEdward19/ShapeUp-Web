import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Activity, Flame, Map, CheckCircle, TrendingUp, ChevronRight, Target, Scale, Trash2, Award, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './DashboardClient.css';

const volumeData = [
    { day: 'Mon', volume: 8500 },
    { day: 'Tue', volume: 11000 },
    { day: 'Wed', volume: 0 },
    { day: 'Thu', volume: 14200 },
    { day: 'Fri', volume: 0 },
    { day: 'Sat', volume: 16500 },
    { day: 'Sun', volume: 0 },
];

const DashboardClient = () => {
    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Welcome back, Mike</h1>
                    <p className="su-page-subtitle">You have 1 workout scheduled for today.</p>
                </div>
            </div>

            {/* Aggregate Metrics */}
            <div className="su-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Weekly Volume</span>
                        <TrendingUp size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">50.2k <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
                    <span className="su-metric-trend positive">↑ 12% vs last week</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Current Streak</span>
                        <Flame size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">4 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>weeks</span></div>
                    <span className="su-metric-trend positive">Keep it up!</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Sessions Completed</span>
                        <CalendarDays size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">3/4</div>
                    <span className="su-metric-trend">This week</span>
                </Card>
            </div>

            <div className="su-overview-layout">

                {/* Main Chart Area */}
                <div className="su-main-chart-area">
                    <Card className="su-chart-card">
                        <h3 className="su-section-title">Volume Progression</h3>
                        <div className="su-area-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="volume" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="su-overview-sidebar">
                    <Card className="su-achievements-card">
                        <h3 className="su-section-title"><Award size={20} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--warning)' }} /> Recent Improvements</h3>

                        <div className="su-pr-list">
                            <div className="su-pr-item">
                                <div className="su-pr-icon-wrap">
                                    <TrendingUp size={16} className="su-success-text" />
                                </div>
                                <div className="su-pr-details">
                                    <div className="su-pr-name">Barbell Bench Press</div>
                                    <div className="su-pr-stats">80kg x 8 <span className="su-text-muted">→ 85kg x 6</span></div>
                                </div>
                            </div>

                            <div className="su-pr-item">
                                <div className="su-pr-icon-wrap">
                                    <TrendingUp size={16} className="su-success-text" />
                                </div>
                                <div className="su-pr-details">
                                    <div className="su-pr-name">Incline DB Press</div>
                                    <div className="su-pr-stats">Total Volume PR: 3,200kg</div>
                                </div>
                            </div>

                            <div className="su-pr-item">
                                <div className="su-pr-icon-wrap">
                                    <Target size={16} className="su-accent-text" />
                                </div>
                                <div className="su-pr-details">
                                    <div className="su-pr-name">RPE Consistency</div>
                                    <div className="su-pr-stats">Hit target RPE on 90% of sets</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default DashboardClient;
