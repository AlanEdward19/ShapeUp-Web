import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { TrendingUp, Flame, CalendarDays, Award, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
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
    const { t } = useLanguage();
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

        // Sort by session ID (which is a timestamp) for reliable order
        const getTimestamp = (id) => {
            if (typeof id === 'number') return id;
            if (typeof id === 'string') return parseInt(id.replace(/[^0-9]/g, '')) || 0;
            return 0;
        };

        const history = plans
            .flatMap(p => (p.history || []).map(h => ({ ...h, planName: p.name })))
            .sort((a, b) => getTimestamp(a.id) - getTimestamp(b.id));

        setAllHistory(history);
        setPlansData({
            plansWithSessions: plans.filter(p => (p.history || []).length > 0).length,
            totalPlans: plans.length
        });
    }, [clientId]);

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
        const bestMap = {};
        const improvementsList = [];

        // allHistory is now reliably sorted by timestamp ascending
        allHistory.forEach(h => {
            (h.exercises || []).forEach(ex => {
                if (ex.skipped) return;

                const exerciseName = (ex.name || '').trim();
                if (!exerciseName) return;

                // Find best set in this session
                let sessionMaxLoad = 0;
                let sessionMaxReps = 0;

                (ex.sets || []).forEach(s => {
                    const l = parseFloat(s.load) || 0;
                    const r = parseInt(s.reps) || 0;
                    if (l > sessionMaxLoad) {
                        sessionMaxLoad = l;
                        sessionMaxReps = r;
                    } else if (l === sessionMaxLoad && r > sessionMaxReps) {
                        sessionMaxReps = r;
                    }
                });

                if (sessionMaxLoad === 0 && sessionMaxReps === 0) return;

                if (!bestMap[exerciseName]) {
                    bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps, date: h.date };
                } else {
                    const best = bestMap[exerciseName];
                    // PR check: More weight OR same weight with more reps
                    const isImprovement = sessionMaxLoad > best.load || (sessionMaxLoad === best.load && sessionMaxReps > best.reps);

                    if (isImprovement) {
                        improvementsList.push({
                            name: exerciseName,
                            from: { load: best.load, reps: best.reps },
                            to: { load: sessionMaxLoad, reps: sessionMaxReps },
                            date: h.date
                        });
                        bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps, date: h.date };
                    }
                }
            });
        });

        // Return the 3 most recent improvements
        // Sort improvements by date descending
        return improvementsList
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(imp => ({
                name: imp.name,
                from: `${imp.from.load}kg × ${imp.from.reps}`,
                to: `${imp.to.load}kg × ${imp.to.reps}`
            }));
    }, [allHistory]);

    const hasData = allHistory.length > 0;
    const { plansWithSessions, totalPlans } = plansData;

    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('client.dashboard.welcome')} {firstName}</h1>
                    <p className="su-page-subtitle">
                        {hasData
                            ? `${plansWithSessions} / ${totalPlans} ${t('client.dashboard.trend.sessions.plans')}`
                            : t('client.dashboard.subtitle.nodata')}
                    </p>
                </div>
            </div>

            {/* Aggregate Metrics */}
            <div className="su-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('client.dashboard.metric.weekly')}</span>
                        <TrendingUp size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">
                        {hasData ? weeklyVolumeFormatted : '—'}
                        {hasData && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> kg</span>}
                    </div>
                    <span className={`su-metric-trend ${!weeklyDiff ? '' : weeklyDiff >= 0 ? 'positive' : 'negative'}`}>
                        {!hasData ? t('client.dashboard.trend.weekly.nosessions') : weeklyDiff === null ? t('client.dashboard.trend.weekly.first') : weeklyDiff >= 0 ? `↑ ${weeklyDiff}%` : `↓ ${Math.abs(weeklyDiff)}%`}
                    </span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('client.dashboard.metric.streak')}</span>
                        <Flame size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">
                        {streakDays}
                    </div>
                    <span className="su-metric-trend positive">
                        {streakDays === 0 ? t('client.dashboard.trend.streak.start') : streakDays >= 7 ? t('client.dashboard.trend.streak.great') : t('client.dashboard.trend.streak.keep')}
                    </span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('client.dashboard.metric.sessions')}</span>
                        <CalendarDays size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">
                        {plansWithSessions}
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/{totalPlans}</span>
                    </div>
                    <span className="su-metric-trend">{totalPlans === 0 ? t('client.dashboard.trend.sessions.noplans') : t('client.dashboard.trend.sessions.plans')}</span>
                </Card>
            </div>

            <div className="su-overview-layout">

                {/* Main Chart Area */}
                <div className="su-main-chart-area">
                    <Card className="su-chart-card">
                        <h3 className="su-section-title">{t('client.dashboard.chart.title')}</h3>
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
                                    {t('client.dashboard.chart.nodata')}
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
                            {t('client.dashboard.achievements.title')}
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
                                    {t('client.dashboard.achievements.nodata')}
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

