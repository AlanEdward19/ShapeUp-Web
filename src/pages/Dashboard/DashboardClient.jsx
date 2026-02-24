import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { TrendingUp, Flame, CalendarDays, Award, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './DashboardClient.css';

// ─── Helper: normalize any date string to YYYY-MM-DD in LOCAL time ───
const toLocalDateKey = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ─── Helper: YYYY-MM-DD for today in local time ───────────────────────
const getTodayKey = () => toLocalDateKey(new Date());

// ─── Helper: ISO week key ─────────────────────────────────────────────
const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

const DashboardClient = () => {
    const storedName = localStorage.getItem('shapeup_user_name') || 'Athlete';
    const firstName = storedName.split(' ')[0];
    const clientId = localStorage.getItem('shapeup_client_id') || 1;

    // ─── Re-read localStorage on every mount ─────────────────────────
    const [allHistory, setAllHistory] = useState([]);
    const [plansData, setPlansData] = useState({ plansWithSessions: 0, totalPlans: 0 });

    useEffect(() => {
        const storedPlans = localStorage.getItem(`shapeup_client_plans_${clientId}`);
        if (!storedPlans) return;
        const plans = JSON.parse(storedPlans);
        const history = plans
            .flatMap(p => p.history || [])
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        setAllHistory(history);
        setPlansData({
            plansWithSessions: plans.filter(p => (p.history || []).length > 0).length,
            totalPlans: plans.length
        });
    }, []); // empty deps = runs every time component mounts

    const currentWeekKey = getWeekKey(new Date());

    // ─── Weekly Volume ────────────────────────────────────────────────
    const { weeklyVolumeFormatted, weeklyDiff } = useMemo(() => {
        const lastWeekKey = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const sumVol = sessions => sessions.reduce((acc, h) => {
            const v = parseFloat((h.totalVol || '0').toString().replace(/[^0-9.]/g, ''));
            return acc + (isNaN(v) ? 0 : v);
        }, 0);
        const thisVol = sumVol(allHistory.filter(h => getWeekKey(h.date) === currentWeekKey));
        const lastVol = sumVol(allHistory.filter(h => getWeekKey(h.date) === lastWeekKey));
        const pct = lastVol === 0 ? null : Math.round(((thisVol - lastVol) / lastVol) * 100);
        const formatted = thisVol >= 1000 ? `${(thisVol / 1000).toFixed(1)}k` : thisVol.toFixed(0);
        return { weeklyVolumeFormatted: formatted, weeklyDiff: pct, hasVolume: thisVol > 0 };
    }, [allHistory, currentWeekKey]);

    // ─── Current Streak (consecutive days, LOCAL timezone) ───────────
    const streakDays = useMemo(() => {
        if (allHistory.length === 0) return 0;
        const daySet = new Set(allHistory.map(h => toLocalDateKey(h.date)));
        let streak = 0;
        const checkDate = new Date();
        while (true) {
            const key = toLocalDateKey(checkDate);
            if (daySet.has(key)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [allHistory]);

    // ─── Volume Progression chart (last 8 sessions) ───────────────────
    const chartData = useMemo(() => {
        return allHistory.slice(-8).map((h, i) => {
            const v = parseFloat((h.totalVol || '0').toString().replace(/[^0-9.]/g, ''));
            return { session: `S${i + 1}`, volume: isNaN(v) ? 0 : v, date: h.date };
        });
    }, [allHistory]);

    // ─── Recent Improvements ─────────────────────────────────────────
    const recentImprovements = useMemo(() => {
        const exerciseMap = {};
        allHistory.forEach(h => {
            (h.exercises || []).forEach(ex => {
                if (ex.skipped) return;
                const maxLoad = Math.max(...(ex.sets || [{ load: 0 }]).map(s => parseFloat(s.load) || 0));
                const maxReps = Math.max(...(ex.sets || [{ reps: 0 }]).map(s => parseFloat(s.reps) || 0));
                if (!exerciseMap[ex.name]) {
                    exerciseMap[ex.name] = { first: { load: maxLoad, reps: maxReps }, last: { load: maxLoad, reps: maxReps } };
                } else {
                    exerciseMap[ex.name].last = { load: maxLoad, reps: maxReps };
                }
            });
        });
        return Object.entries(exerciseMap)
            .filter(([, v]) => v.last.load > v.first.load)
            .slice(0, 3)
            .map(([name, v]) => ({
                name,
                from: `${v.first.load}kg × ${v.first.reps}`,
                to: `${v.last.load}kg × ${v.last.reps}`
            }));
    }, [allHistory]);

    const hasData = allHistory.length > 0;
    const { plansWithSessions, totalPlans } = plansData;

    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Welcome back, {firstName}</h1>
                    <p className="su-page-subtitle">
                        {hasData
                            ? `${plansWithSessions} of ${totalPlans} training plan${totalPlans !== 1 ? 's' : ''} completed.`
                            : 'Go to My Training to start your first session!'}
                    </p>
                </div>
            </div>

            {/* Aggregate Metrics */}
            <div className="su-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Weekly Volume</span>
                        <TrendingUp size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">
                        {hasData ? weeklyVolumeFormatted : '—'}
                        {hasData && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> kg</span>}
                    </div>
                    <span className={`su-metric-trend ${!weeklyDiff ? '' : weeklyDiff >= 0 ? 'positive' : 'negative'}`}>
                        {!hasData ? 'No sessions yet' : weeklyDiff === null ? 'First week!' : weeklyDiff >= 0 ? `↑ ${weeklyDiff}% vs last week` : `↓ ${Math.abs(weeklyDiff)}% vs last week`}
                    </span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Current Streak</span>
                        <Flame size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">
                        {streakDays}
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> {streakDays === 1 ? 'day' : 'days'}</span>
                    </div>
                    <span className="su-metric-trend positive">
                        {streakDays === 0 ? 'Start your streak!' : streakDays >= 7 ? '🔥 Great consistency!' : 'Keep it up!'}
                    </span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Sessions Completed</span>
                        <CalendarDays size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">
                        {plansWithSessions}
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/{totalPlans}</span>
                    </div>
                    <span className="su-metric-trend">{totalPlans === 0 ? 'No plans assigned yet' : 'Training plans'}</span>
                </Card>
            </div>

            <div className="su-overview-layout">

                {/* Main Chart Area */}
                <div className="su-main-chart-area">
                    <Card className="su-chart-card">
                        <h3 className="su-section-title">Volume Progression</h3>
                        <div className="su-area-chart-container">
                            {chartData.length >= 2 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} labelFormatter={(l, p) => p[0]?.payload?.date} />
                                        <Area type="monotone" dataKey="volume" name="Volume (kg)" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    Complete at least 2 sessions to see your volume trend.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="su-overview-sidebar">
                    <Card className="su-achievements-card">
                        <h3 className="su-section-title">
                            <Award size={20} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--warning)' }} />
                            Recent Improvements
                        </h3>

                        <div className="su-pr-list">
                            {recentImprovements.length > 0 ? (
                                recentImprovements.map((imp) => (
                                    <div key={imp.name} className="su-pr-item">
                                        <div className="su-pr-icon-wrap">
                                            <TrendingUp size={16} className="su-success-text" />
                                        </div>
                                        <div className="su-pr-details">
                                            <div className="su-pr-name">{imp.name}</div>
                                            <div className="su-pr-stats">{imp.from} <span className="su-text-muted">→ {imp.to}</span></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Keep training and your improvements will appear here!
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default DashboardClient;

