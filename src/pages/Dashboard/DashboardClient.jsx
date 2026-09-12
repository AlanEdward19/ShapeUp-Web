import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RankingList from '../../components/gamification/RankingList';
import GamificationProgressCard from '../../components/gamification/GamificationProgressCard';
import { useGamificationApi } from '../../hooks/api/useGamificationApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import { calculateMuscleSetsTotal } from '../../utils/muscleAnalytics';
import { exercisesDB } from '../../data/mockExercises';
import './DashboardClient.css';
import AthleteDailyPanel from '../../components/AthleteDailyPanel';

// ─── Helper: normalize any date string to YYYY-MM-DD in LOCAL time ───
const toLocalDateKey = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ─── Helper: ISO week key ─────────────────────────────────────────────
const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

const DashboardClient = ({ renderView } = {}) => {
    const { t, convertWeight, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const { getGamificationProfile, getRanking } = useGamificationApi();

    const storedName = localStorage.getItem('shapeup_user_name') || 'Athlete';
    const firstName = storedName.split(' ')[0];
    const nextPlanName = (() => { try { return JSON.parse(localStorage.getItem(`shapeup_client_plans_${localStorage.getItem('shapeup_client_id') || 1}`) || '[]')[0]?.name; } catch { return null; } })();
    const clientId = localStorage.getItem('shapeup_client_id') || 1;
    const currentUserId = parseInt(localStorage.getItem('shapeup_client_id'), 10) || 1;

    const [gamificationProfile, setGamificationProfile] = useState(null);
    const [rankingEntries, setRankingEntries] = useState([]);
    const [rankingCursor, setRankingCursor] = useState(null);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [rankingLoadingMore, setRankingLoadingMore] = useState(false);

    const fetchRanking = useCallback(async (cursor = null, append = false) => {
        if (append) {
            setRankingLoadingMore(true);
        } else {
            setRankingLoading(true);
        }

        try {
            const response = await getRanking(cursor, 10);
            const items = response?.items ?? [];
            const nextCursor = response?.nextCursor ?? null;

            setRankingEntries((prev) => (append ? [...prev, ...items] : items));
            setRankingCursor(nextCursor);
        } catch (error) {
            console.error('Failed to fetch ranking:', error);
            if (!append) {
                setRankingEntries([]);
                setRankingCursor(null);
            }
        } finally {
            setRankingLoading(false);
            setRankingLoadingMore(false);
        }
    }, [getRanking]);

    const fetchGamificationProfile = useCallback(async () => {
        try {
            const profile = await getGamificationProfile();
            setGamificationProfile(profile);
        } catch (error) {
            console.error('Failed to fetch gamification profile:', error);
            setGamificationProfile({
                totalXp: 0,
                currentStreak: 0,
                shapeCoins: 0,
                shapeScore: 0,
                level: 1,
            });
        }
    }, [getGamificationProfile]);

    useEffect(() => {
        fetchGamificationProfile();
        fetchRanking();
    }, [fetchGamificationProfile, fetchRanking]);

    // ─── Read localStorage once, on mount (clientId is fixed for this component's lifetime) ───
    const [initialClientState] = useState(() => {
        const storedPlans = localStorage.getItem(`shapeup_client_plans_${clientId}`);
        let allHistory = [];
        let plansData = { plansWithSessions: 0, totalPlans: 0 };
        if (storedPlans) {
            const plans = JSON.parse(storedPlans);
            const getTimestamp = (id) => {
                if (typeof id === 'number') return id;
                if (typeof id === 'string') return parseInt(id.replace(/[^0-9]/g, '')) || 0;
                return 0;
            };
            allHistory = plans
                .flatMap(p => (p.history || []).map(h => ({ ...h, planName: p.name })))
                .sort((a, b) => getTimestamp(a.id) - getTimestamp(b.id));
            plansData = {
                plansWithSessions: plans.filter(p => (p.history || []).length > 0).length,
                totalPlans: plans.length
            };
        }

        const storedObjs = localStorage.getItem(`shapeup_client_objectives_${clientId}`);
        const objectives = storedObjs ? JSON.parse(storedObjs) : { goalWeight: '', history: [] };

        return { allHistory, plansData, objectives };
    });

    const [allHistory] = useState(initialClientState.allHistory);
    const [plansData] = useState(initialClientState.plansData);

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
    }, [setIsOpen, setSteps, setCurrentStep, t]);

    const currentWeekKey = getWeekKey(new Date());

    // ─── Weekly Volume ────────────────────────────────────────────────
    const { weeklyVolumeFormatted, weeklyDiff } = useMemo(() => {
        const lastWeekKey = getWeekKey(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
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
    }, [allHistory, currentWeekKey, convertWeight]);

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
    }, [allHistory, convertWeight]);

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
    }, [allHistory, convertWeight]);

    const hasData = allHistory.length > 0;
    const { plansWithSessions, totalPlans } = plansData;

    if (renderView) return renderView({ weeklyVolumeFormatted, weeklyDiff, streakDays, chartData, allHistory, plansData, nextPlanName });
    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex" data-tour="client-header">
                <div>
                    <span className="su-nutrition-kicker">{firstName} · Sua sessão de hoje</span><h1 className="su-page-title">{nextPlanName || 'Sua rotina de treinamento'}</h1>
                    <p className="su-page-subtitle">
                        {hasData
                            ? `${plansWithSessions} / ${totalPlans} ${t('client.dashboard.trend.sessions.plans')}`
                            : t('client.dashboard.subtitle.nodata')}
                    </p>
                </div>
            </div>

            <AthleteDailyPanel volume={weeklyVolumeFormatted} streak={streakDays} sessions={plansWithSessions} totalPlans={totalPlans} chartData={chartData} />
            <details className="su-athlete-additional"><summary>Estatísticas completas, conquistas e ranking</summary>
            <div className="su-metrics-grid" data-tour="client-metrics">
                <div className="su-dash-feature">
                    <div>
                        <p className="su-dash-label">{t('client.dashboard.metric.weekly')}</p>
                        <p className="su-dash-feature-num">
                            {hasData ? weeklyVolumeFormatted : '—'}
                            {hasData && <span className="su-dash-feature-unit">{formatWeight(0).replace('0 ', '')}</span>}
                        </p>
                        <p className={`su-dash-feature-note su-metric-trend ${!weeklyDiff ? '' : weeklyDiff >= 0 ? 'positive' : 'negative'}`}>
                            {!hasData ? t('client.dashboard.trend.weekly.nosessions') : weeklyDiff === null ? t('client.dashboard.trend.weekly.first') : weeklyDiff >= 0 ? `↑ ${weeklyDiff}%` : `↓ ${Math.abs(weeklyDiff)}%`}
                        </p>
                    </div>
                    <dl className="su-dash-ledger">
                        <div className="su-dash-ledger-row">
                            <dt>{t('client.dashboard.metric.streak')}</dt>
                            <dd>{streakDays}</dd>
                            <dd className="su-dash-ledger-note su-metric-trend positive">
                                {streakDays === 0 ? t('client.dashboard.trend.streak.start') : streakDays >= 7 ? t('client.dashboard.trend.streak.great') : t('client.dashboard.trend.streak.keep')}
                            </dd>
                        </div>
                        <div className="su-dash-ledger-row">
                            <dt>{t('client.dashboard.metric.sessions')}</dt>
                            <dd>{plansWithSessions}<span className="su-dash-feature-unit">/{totalPlans}</span></dd>
                            <dd className="su-dash-ledger-note su-metric-trend">{totalPlans === 0 ? t('client.dashboard.trend.sessions.noplans') : t('client.dashboard.trend.sessions.plans')}</dd>
                        </div>
                    </dl>
                </div>
                <GamificationProgressCard profile={gamificationProfile} />
            </div>

            <div className="su-overview-layout">
                <div className="su-main-chart-area su-dash-sheet">
                    <h3 className="su-section-title">{t('client.dashboard.chart.title')}</h3>
                    <div className="su-area-chart-container">
                        {chartData.length >= 2 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="session" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '2px' }} labelFormatter={(l, p) => p[0]?.payload?.date} />
                                    <Area type="monotone" dataKey="volume" name={`Volume (${formatWeight(0).replace('0 ', '')})`} stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.12} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>
                                {t('client.dashboard.chart.nodata')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="su-overview-sidebar" data-tour="client-achievements">
                    <h3 className="su-section-title">{t('client.dashboard.achievements.title')}</h3>
                    <div className="su-pr-list">
                        {recentImprovements.length > 0 ? (
                            recentImprovements.map((imp) => (
                                <div key={imp.name} className="su-pr-item">
                                    <div className="su-pr-name">{imp.name}</div>
                                    <div className="su-pr-stats">{imp.from} <span className="su-text-muted">→ {imp.to}</span></div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {t('client.dashboard.achievements.nodata')}
                            </div>
                        )}
                    </div>

                    <div className="su-muscle-toolbar">
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
                        <div style={{ display: 'flex', gap: '8px', padding: '0.5rem 0', alignItems: 'center', width: '100%', fontSize: '0.8rem' }}>
                            <input type="date" value={muscleCustomRange.start} onChange={e => setMuscleCustomRange(p => ({ ...p, start: e.target.value }))} className="su-input" style={{ width: 'auto', padding: '4px 8px', minHeight: 'unset', height: '28px' }} />
                            <span className="su-text-muted">→</span>
                            <input type="date" value={muscleCustomRange.end} onChange={e => setMuscleCustomRange(p => ({ ...p, end: e.target.value }))} className="su-input" style={{ width: 'auto', padding: '4px 8px', minHeight: 'unset', height: '28px' }} />
                        </div>
                    )}
                    <div className="su-area-chart-container" style={{ minHeight: '280px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                        {muscleVolumeData.length > 0 ? (
                            <>
                                <div style={{ flex: '1 1 250px', height: '280px', minWidth: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleVolumeData}>
                                            <PolarGrid stroke="var(--border-color)" />
                                            <PolarAngleAxis dataKey="muscle" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                            <Radar name="Sets" dataKey="sets" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
                                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '2px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="su-muscle-breakdown" style={{ flex: '1 1 180px' }}>
                                    <h4 className="su-dash-label">Detalhamento</h4>
                                    {muscleVolumeData.map((m) => (
                                        <div key={m.muscle} className="su-muscle-row">
                                            <span>{m.muscle}</span>
                                            <span>{m.sets} <span className="su-text-muted">{t('common.sets')}</span></span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
                                {t('client.dashboard.chart.nodata')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RankingList
                entries={rankingEntries}
                currentUserId={currentUserId}
                nextCursor={rankingCursor}
                onLoadMore={() => rankingCursor && fetchRanking(rankingCursor, true)}
                isLoading={rankingLoading}
                isLoadingMore={rankingLoadingMore}
            />
            </details>
        </div>
    );
};

export default DashboardClient;
