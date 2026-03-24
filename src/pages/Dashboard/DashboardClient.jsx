import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { TrendingUp, Flame, CalendarDays, Award, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import { calculateMuscleSetsTotal } from '../../utils/muscleAnalytics';
import { exercisesDB } from '../../data/mockExercises';
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
    const { t, convertWeight, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();

    const storedName = localStorage.getItem('shapeup_user_name') || 'Athlete';
    const firstName = storedName.split(' ')[0];
    const clientId = localStorage.getItem('shapeup_client_id') || 1;

    // ─── Re-read localStorage on every mount ─────────────────────────
    const [allHistory, setAllHistory] = useState([]);
    const [plansData, setPlansData] = useState({ plansWithSessions: 0, totalPlans: 0 });
    const [objectives, setObjectives] = useState({ goalWeight: '', history: [] });

    useEffect(() => {
        const storedPlans = localStorage.getItem(`shapeup_client_plans_${clientId}`);
        if (storedPlans) {
            const plans = JSON.parse(storedPlans);
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
        }

        const storedObjs = localStorage.getItem(`shapeup_client_objectives_${clientId}`);
        if (storedObjs) {
            setObjectives(JSON.parse(storedObjs));
        }
    }, [clientId]);

    // ─── Tour Trigger ─────────────────────────────────────────────────
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_client_dashboard_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="client-header"]',
                    content: t('tour.dashboard_client.1'),
                },
                {
                    selector: '[data-tour="client-metrics"]',
                    content: t('tour.dashboard_client.3'),
                },
                {
                    selector: '[data-tour="client-achievements"]',
                    content: t('tour.dashboard_client.4'),
                }
            ];

            setSteps(tourSteps);
            setCurrentStep(0);

            setTimeout(() => {
                setIsOpen(true);
            }, 600);

            localStorage.setItem('shapeup_client_dashboard_tour_seen', 'true');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setIsOpen, setSteps, setCurrentStep, t]);

    const currentWeekKey = getWeekKey(new Date());

    // ─── Weekly Volume ────────────────────────────────────────────────
    const { weeklyVolumeFormatted, weeklyDiff } = useMemo(() => {
        const lastWeekKey = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const sumVol = sessions => sessions.reduce((acc, h) => {
            const rawStr = h.totalVol || '0';
            const v = parseFloat(rawStr.toString().replace(/[^0-9.]/g, ''));
            const originUnit = rawStr.includes('lbs') ? 'imperial' : 'metric';
            const converted = isNaN(v) ? 0 : convertWeight(v, originUnit);
            return acc + converted;
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
            const rawStr = h.totalVol || '0';
            const v = parseFloat(rawStr.toString().replace(/[^0-9.]/g, ''));
            const originUnit = rawStr.includes('lbs') ? 'imperial' : 'metric';
            const converted = isNaN(v) ? 0 : convertWeight(v, originUnit);
            return { session: `S${i + 1}`, volume: converted, date: h.date };
        });
    }, [allHistory]);

    // ─── Muscle Activation ───────────────────────────────────────────
    const [muscleTimeFilter, setMuscleTimeFilter] = useState('30');
    const [muscleCustomRange, setMuscleCustomRange] = useState({ start: '', end: '' });
    
    const muscleVolumeData = useMemo(() => {
        let historyToUse = allHistory;
        if (muscleTimeFilter !== 'all') {
            if (muscleTimeFilter === 'custom') {
                if (muscleCustomRange.start && muscleCustomRange.end) {
                    const start = new Date(muscleCustomRange.start + 'T00:00:00');
                    const end = new Date(muscleCustomRange.end + 'T23:59:59');
                    historyToUse = allHistory.filter(h => {
                        const d = new Date(h.date + 'T12:00:00');
                        return d >= start && d <= end;
                    });
                }
            } else {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - parseInt(muscleTimeFilter));
                historyToUse = allHistory.filter(h => new Date(h.date + 'T12:00:00') >= cutoff);
            }
        }
        const volumes = calculateMuscleSetsTotal(historyToUse, exercisesDB);
        return Object.entries(volumes)
            .map(([muscle, sets]) => ({ muscle, sets }))
            .sort((a, b) => b.sets - a.sets)
            .slice(0, 8); // Show top 8 for RadarChart layout
    }, [allHistory, muscleTimeFilter, muscleCustomRange]);


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
            .map(imp => {
                // Since load doesn't store a string, we have to look up the session's totalVol to find the unit
                const fromOriginUnit = imp.fromSession?.totalVol?.includes('lbs') ? 'imperial' : 'metric';
                const toOriginUnit = imp.toSession?.totalVol?.includes('lbs') ? 'imperial' : 'metric';

                const fromLoadConverted = convertWeight(imp.from.load, fromOriginUnit);
                const toLoadConverted = convertWeight(imp.to.load, toOriginUnit);

                const fromFormatted = fromLoadConverted % 1 === 0 ? fromLoadConverted.toString() : fromLoadConverted.toFixed(1);
                const toFormatted = toLoadConverted % 1 === 0 ? toLoadConverted.toString() : toLoadConverted.toFixed(1);

                return {
                    name: imp.name,
                    from: `${fromFormatted} × ${imp.from.reps}`,
                    to: `${toFormatted} × ${imp.to.reps}`
                };
            });
    }, [allHistory]);

    const hasData = allHistory.length > 0;
    const { plansWithSessions, totalPlans } = plansData;

    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex" data-tour="client-header">
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
            <div className="su-metrics-grid su-mt-4" data-tour="client-metrics">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('client.dashboard.metric.weekly')}</span>
                        <TrendingUp size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">
                        {hasData ? weeklyVolumeFormatted : '—'}
                        {hasData && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> {formatWeight(0).replace('0 ', '')}</span>}
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
                                        <Area type="monotone" dataKey="volume" name={`Volume (${formatWeight(0).replace('0 ', '')})`} stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
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
                <div className="su-overview-sidebar" data-tour="client-achievements">
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

                    {/* Muscle Distribution Chart */}
                    <Card className="su-chart-card su-mt-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                            <h3 className="su-section-title" style={{ margin: 0 }}>{t('client.dashboard.chart.muscles') || 'Muscle Volume (Sets)'}</h3>
                            <select 
                                className="su-select" 
                                style={{ width: 'auto', padding: '4px 24px 4px 8px', fontSize: '0.8rem', minHeight: 'unset', height: '28px' }}
                                value={muscleTimeFilter}
                                onChange={(e) => setMuscleTimeFilter(e.target.value)}
                            >
                                <option value="7">{t('reports.range.7days') || '7 Days'}</option>
                                <option value="14">{t('reports.range.14days') || '14 Days'}</option>
                                <option value="30">{t('reports.range.30days') || '30 Days'}</option>
                                <option value="90">{t('reports.range.90days') || '90 Days'}</option>
                                <option value="custom">{t('reports.range.custom') || 'Custom Range'}</option>
                                <option value="all">{t('reports.range.all') || 'All Time'}</option>
                            </select>
                        </div>
                        {muscleTimeFilter === 'custom' && (
                            <div style={{ display: 'flex', gap: '8px', padding: '0.5rem 0', alignItems: 'center', justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem' }}>
                                <input type="date" value={muscleCustomRange.start} onChange={e => setMuscleCustomRange(p => ({ ...p, start: e.target.value }))} className="su-input" style={{ width: 'auto', padding: '4px 8px', minHeight: 'unset', height: '28px' }} />
                                <span className="su-text-muted">→</span>
                                <input type="date" value={muscleCustomRange.end} onChange={e => setMuscleCustomRange(p => ({ ...p, end: e.target.value }))} className="su-input" style={{ width: 'auto', padding: '4px 8px', minHeight: 'unset', height: '28px' }} />
                            </div>
                        )}
                        <div className="su-area-chart-container" style={{ minHeight: '300px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%' }}>
                            {muscleVolumeData.length > 0 ? (
                                <>
                                    <div style={{ flex: '1 1 250px', height: '300px', minWidth: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleVolumeData}>
                                                <PolarGrid stroke="var(--border-color)" />
                                                <PolarAngleAxis dataKey="muscle" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                                <Radar name="Sets" dataKey="sets" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} />
                                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Detalhamento</h4>
                                        {muscleVolumeData.map((m) => (
                                            <div key={m.muscle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{m.muscle}</span>
                                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.sets} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>séries</span></span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    {t('client.dashboard.chart.nodata')}
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

