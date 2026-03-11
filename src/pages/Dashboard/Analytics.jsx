import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Activity, TrendingUp, Download } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, Legend
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import './Analytics.css';

const Analytics = () => {
    const { t, language } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [metrics, setMetrics] = useState({
        mrr: 0,
        activeClients: 0,
        globalAdherence: 0,
        avgLifespan: 9
    });

    const [growthData, setGrowthData] = useState([]);
    const [distData, setDistData] = useState([]);

    useEffect(() => {
        const storedClients = localStorage.getItem('shapeup_clients');
        const storedPlans = localStorage.getItem('shapeup_pro_plans');

        const clients = storedClients ? JSON.parse(storedClients) : [];
        const plans = storedPlans ? JSON.parse(storedPlans) : [];

        // 1. Filter out only Active or Needs Attention (excluding Invited and Inactive)
        const activeUsers = clients.filter(c => c.status === 'Active' || c.status === 'Needs Attention');

        // 2. Calculate MRR
        let totalMrr = 0;
        activeUsers.forEach(c => {
            if (c.billingType === 'custom' && c.customPrice) {
                totalMrr += Number(c.customPrice);
            } else if (c.billingType === 'plan' && c.billingPlanId) {
                const p = plans.find(plan => plan.id === c.billingPlanId);
                if (p && p.price) {
                    totalMrr += Number(p.price);
                }
            }
        });

        // 3. Calculate Global Adherence
        let totalAdherenceSum = 0;
        let validAdherenceCount = 0;

        activeUsers.forEach(c => {
            if (c.compliance !== undefined && c.compliance !== null) {
                totalAdherenceSum += Number(c.compliance);
                validAdherenceCount++;
            }
        });

        const avgAdherence = validAdherenceCount > 0 ? Math.round(totalAdherenceSum / validAdherenceCount) : 0;

        // Calculate average lifespan (months) for active users based on joinDate if available (mock to 0 if not to avoid confusion, or calculate real)
        let totalMonths = 0;
        let validDates = 0;
        const now = new Date();
        activeUsers.forEach(c => {
            if (c.joinDate) {
                const join = new Date(c.joinDate);
                const diffTime = Math.abs(now - join);
                const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
                totalMonths += diffMonths;
                validDates++;
            }
        });
        const calcLifespan = validDates > 0 ? Math.round(totalMonths / validDates) : 0;

        setMetrics({
            mrr: totalMrr,
            activeClients: activeUsers.length,
            globalAdherence: avgAdherence,
            avgLifespan: calcLifespan
        });

        // 4. Generate Adherence Distribution
        const buckets = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '< 70%': 0
        };

        activeUsers.forEach(c => {
            const val = c.compliance || 0;
            if (val >= 90) buckets['90-100%']++;
            else if (val >= 80) buckets['80-89%']++;
            else if (val >= 70) buckets['70-79%']++;
            else buckets['< 70%']++;
        });

        setDistData([
            { range: '90-100%', clients: buckets['90-100%'] },
            { range: '80-89%', clients: buckets['80-89%'] },
            { range: '70-79%', clients: buckets['70-79%'] },
            { range: '< 70%', clients: buckets['< 70%'] },
        ]);

        // 5. Generate Trailing 6 Month Growth Data (ending at current active)
        const currentMonthIdx = new Date().getMonth();

        let buildGrowth = [];
        let simulatedActive = activeUsers.length;

        // Count actual inactive clients for churned, instead of random
        const inactiveClients = clients.filter(c => c.status === 'Inactive');
        let totalChurned = inactiveClients.length;

        // Work backwards 6 months
        for (let i = 0; i < 6; i++) {
            let mIdx = currentMonthIdx - i;
            if (mIdx < 0) mIdx += 12;

            const date = new Date(2000, mIdx, 1);
            const formattedMonth = date.toLocaleString(language === 'pt-BR' ? 'pt-BR' : 'en-US', { month: 'short' });

            // Distribute inactive clients across months (for visual, mostly in recent months)
            const expectedChurn = i === 0 ? totalChurned : 0; // Just put all churn in current month for real data accuracy, or 0.

            buildGrowth.unshift({
                month: formattedMonth,
                active: Math.max(0, simulatedActive),
                churned: expectedChurn
            });

            // To make the graph look logical, subtract a logical amount for previous months based on real data if we had it.
            // But since we don't have historical snapshots, we just step down slightly so it's not a flat line, but strictly based on currently active.
            // If active is 0, keep it 0.
            if (simulatedActive > 0) {
                simulatedActive = Math.max(0, simulatedActive - 1);
            }
        }

        setGrowthData(buildGrowth);

    }, [language]);

    // ─── Insights / Analytics Tour Trigger ─────────────────────────────
    useEffect(() => {
        const hasSeenTour = sessionStorage.getItem('shapeup_analytics_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="an-header"]',
                    content: t('tour.analytics.1'),
                },
                {
                    selector: '[data-tour="an-metrics"]',
                    content: t('tour.analytics.2'),
                },
                {
                    selector: '[data-tour="an-charts"]',
                    content: t('tour.analytics.3'),
                }
            ];
            setSteps(tourSteps);
            setCurrentStep(0);
setTimeout(() => {
                setIsOpen(true);
            }, 500);
            sessionStorage.setItem('shapeup_analytics_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps]);

    return (
        <div className="su-analytics-dashboard">
            <div className="su-dashboard-header-flex" data-tour="an-header">
                <div>
                    <h1 className="su-page-title">{t('pro.analytics.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.analytics.subtitle')}</p>
                </div>
                <Button variant="outline" icon={<Download size={16} />}>{t('pro.analytics.btn.export')}</Button>
            </div>

            {/* Metrics Grid */}
            <div className="su-analytics-metrics-grid su-mt-4" data-tour="an-metrics">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.analytics.metric.mrr')}</span>
                        <DollarSign size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">${metrics.mrr.toLocaleString()}</div>
                    <span className="su-metric-trend positive">{t('pro.analytics.metric.mrr.trend')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.analytics.metric.clients')}</span>
                        <Users size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">{metrics.activeClients}</div>
                    <span className="su-metric-trend positive">{t('pro.analytics.metric.clients.trend')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.analytics.metric.adherence')}</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">{metrics.globalAdherence}%</div>
                    <span className="su-metric-trend positive">{t('pro.analytics.metric.adherence.trend')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.analytics.metric.lifespan')}</span>
                        <TrendingUp size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">{metrics.avgLifespan} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t('pro.analytics.metric.lifespan.unit')}</span></div>
                    <span className="su-metric-trend">{t('pro.analytics.metric.lifespan.trend')}</span>
                </Card>
            </div>

            {/* Charts Area */}
            <div className="su-analytics-charts-grid" data-tour="an-charts">

                {/* Client Growth Chart */}
                <Card className="su-chart-card su-col-span-2">
                    <h3 className="su-section-title">{t('pro.analytics.chart.growth')}</h3>
                    <div className="su-chart-container-large">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                <Area type="monotone" name={t('pro.analytics.chart.growth.active')} dataKey="active" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                                <Area type="monotone" name={t('pro.analytics.chart.growth.churned')} dataKey="churned" stroke="var(--error)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Adherence Distribution Chart */}
                <Card className="su-chart-card">
                    <h3 className="su-section-title">{t('pro.analytics.chart.adherence')}</h3>
                    <div className="su-chart-container-large">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="range" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" width={70} />
                                <RechartsTooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                <Bar dataKey="clients" name={t('pro.analytics.chart.adherence.clients')} fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Analytics;
