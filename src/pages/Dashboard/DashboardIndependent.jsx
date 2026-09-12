import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RankingList from '../../components/gamification/RankingList';
import GamificationProgressCard from '../../components/gamification/GamificationProgressCard';
import { useGamificationApi } from '../../hooks/api/useGamificationApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import './DashboardClient.css';
import UpcomingWorkout from '../../components/UpcomingWorkout';

// --- Helper: normalize any date string to YYYY-MM-DD in LOCAL time ---
const toLocalDateKey = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

const DashboardIndependent = () => {
    const { t, convertWeight, formatWeight } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const { getGamificationProfile, getRanking } = useGamificationApi();
    const storedName = localStorage.getItem('shapeup_user_name') || 'Athlete';
    const firstName = storedName.split(' ')[0];
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

    const [initialIndependentState] = useState(() => {
        const storedPlans = localStorage.getItem('shapeup_independent_plans');
        if (!storedPlans) {
            return { allHistory: [], plansData: { plansWithSessions: 0, totalPlans: 0 } };
        }

        const plans = JSON.parse(storedPlans);
        const allHistory = plans
            .flatMap(p => (p.history || []).map(h => ({ ...h, planName: p.name })))
            .sort((a, b) => {
                const idA = a.id?.replace('h', '') || 0;
                const idB = b.id?.replace('h', '') || 0;
                return parseInt(idA) - parseInt(idB);
            });
        const plansData = {
            plansWithSessions: plans.filter(p => (p.history || []).length > 0).length,
            totalPlans: plans.length
        };

        return { allHistory, plansData };
    });

    const [allHistory] = useState(initialIndependentState.allHistory);
    const [plansData] = useState(initialIndependentState.plansData);

    // ─── Tour Trigger ─────────────────────────────────────────────────
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_independent_dashboard_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="idep-header"]',
                    content: t('tour.dashboard_independent.1'),
                },
                {
                    selector: '[data-tour="idep-metrics"]',
                    content: t('tour.dashboard_independent.2'),
                },
                {
                    selector: '[data-tour="idep-achievements"]',
                    content: t('tour.dashboard_independent.3'),
                }
            ];

            setSteps(tourSteps);
            setCurrentStep(0);

            setTimeout(() => {
                setIsOpen(true);
            }, 600);

            localStorage.setItem('shapeup_independent_dashboard_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps, setCurrentStep, t]);

    const currentWeekKey = getWeekKey(new Date());

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
        return { weeklyVolumeFormatted: formatted, weeklyDiff: pct };
    }, [allHistory, currentWeekKey, convertWeight]);

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

    const chartData = useMemo(() => {
        return allHistory.slice(-8).map((h, i) => {
            const rawStr = h.totalVol || '0';
            const v = parseFloat(rawStr.toString().replace(/[^0-9.]/g, ''));
            const originUnit = rawStr.includes('lbs') ? 'imperial' : 'metric';
            const converted = isNaN(v) ? 0 : convertWeight(v, originUnit);
            return { session: `S${i + 1}`, volume: converted, date: h.date };
        });
    }, [allHistory, convertWeight]);

    const recentImprovements = useMemo(() => {
        const bestMap = {};
        const improvementsList = [];

        allHistory.forEach(h => {
            (h.exercises || []).forEach(ex => {
                if (ex.skipped) return;
                const exerciseName = (ex.name || '').trim();
                let sessionMaxLoad = 0;
                let sessionMaxReps = 0;

                (ex.sets || []).forEach(s => {
                    const l = parseFloat(s.load) || 0;
                    const r = parseInt(s.reps) || 0;
                    if (l > sessionMaxLoad || (l === sessionMaxLoad && r > sessionMaxReps)) {
                        sessionMaxLoad = l;
                        sessionMaxReps = r;
                    }
                });

                if (sessionMaxLoad === 0 && sessionMaxReps === 0) return;

                if (!bestMap[exerciseName]) {
                    bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps };
                } else {
                    const best = bestMap[exerciseName];
                    if (sessionMaxLoad > best.load || (sessionMaxLoad === best.load && sessionMaxReps > best.reps)) {
                        improvementsList.push({
                            name: exerciseName,
                            from: { load: best.load, reps: best.reps },
                            to: { load: sessionMaxLoad, reps: sessionMaxReps },
                            date: h.date
                        });
                        bestMap[exerciseName] = { load: sessionMaxLoad, reps: sessionMaxReps };
                    }
                }
            });
        });

        return improvementsList
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(imp => ({
                name: imp.name,
                from: `${imp.from.load} × ${imp.from.reps}`,
                to: `${imp.to.load} × ${imp.to.reps}`
            }));
    }, [allHistory]);

    const hasData = allHistory.length > 0;

    return (
        <div className="su-dashboard-client">
            <div className="su-dashboard-header-flex" data-tour="idep-header">
                <div>
                    <h1 className="su-page-title">{t('client.dashboard.welcome')} {firstName}</h1>
                    <p className="su-page-subtitle">
                        {hasData
                            ? `${plansData.plansWithSessions} / ${plansData.totalPlans} ${t('client.dashboard.trend.sessions.plans')}`
                            : t('client.dashboard.subtitle.nodata')}
                    </p>
                </div>
            </div>

            <div className="su-metrics-grid" data-tour="idep-metrics">
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
                            <dd>{plansData.plansWithSessions}<span className="su-dash-feature-unit">/{plansData.totalPlans}</span></dd>
                            <dd className="su-dash-ledger-note su-metric-trend">{plansData.totalPlans === 0 ? t('client.dashboard.trend.sessions.noplans') : t('client.dashboard.trend.sessions.plans')}</dd>
                        </div>
                    </dl>
                </div>
                <GamificationProgressCard profile={gamificationProfile} />
            </div>

            <UpcomingWorkout />
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

                <div className="su-overview-sidebar" data-tour="idep-achievements">
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
        </div>
    );
};

export default DashboardIndependent;
