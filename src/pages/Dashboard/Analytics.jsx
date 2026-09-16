import { useTrainerPortfolio } from '../../hooks/useTrainerPortfolio';
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import './Analytics.css';

const Analytics = () => {
    const portfolio = useTrainerPortfolio();
    const { t, language } = useLanguage();
    const tr=(pt,en,es)=>({'pt-BR':pt,en,es}[language]);
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [metrics, setMetrics] = useState({
        mrr: 0,
        activeClients: 0,
        globalAdherence: 0,
        avgLifespan: 0
    });

    const [growthData, setGrowthData] = useState([]);
    const [distData, setDistData] = useState([]);

    useEffect(() => {
        const { clients, plans } = portfolio;
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

        const nowDate = new Date();
        const monthly = Array.from({length:6},(_,index)=>{
            const start = new Date(nowDate.getFullYear(),nowDate.getMonth()-5+index,1);
            const end = new Date(start.getFullYear(),start.getMonth()+1,1);
            return {month:start.toLocaleDateString(language,{month:'short'}),active:clients.filter(client=>client.joinDate && new Date(client.joinDate)>=start && new Date(client.joinDate)<end).length};
        });
        setGrowthData(monthly);

    }, [language, portfolio]);

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
    }, [setIsOpen, setSteps, setCurrentStep, t]);

    return (
        <div className="su-analytics-dashboard">{portfolio.error && <p role="alert">{t('common.error')}</p>}
            <div className="su-dashboard-header-flex" data-tour="an-header">
                <div>
                    <h1 className="su-page-title">{t('pro.analytics.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.analytics.subtitle')}</p>
                </div>
                <Button variant="outline" onClick={()=>{ const csv=["month,enrollments",...growthData.map(row=>`${row.month},${row.active}`)].join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="shapeup-enrollments.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }} icon={<Download size={16} />}>{t('pro.analytics.btn.export')}</Button>
            </div>

            <div className="su-analytics-metrics-grid" data-tour="an-metrics">
                <Card className="su-metric-card su-analytics-feature">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{tr('Valor dos planos ativos','Active plan value','Valor de los planes activos')}</span>
                    </div>
                    <div className="su-metric-value">${metrics.mrr.toLocaleString()}</div>
                </Card>

                <div className="su-analytics-stack">
                    <Card className="su-metric-card">
                        <div className="su-metric-header">
                            <span className="su-metric-label">{t('pro.analytics.metric.clients')}</span>
                        </div>
                        <div className="su-metric-value">{metrics.activeClients}</div>
                    </Card>

                    <Card className="su-metric-card">
                        <div className="su-metric-header">
                            <span className="su-metric-label">{t('pro.analytics.metric.adherence')}</span>
                        </div>
                        <div className="su-metric-value">{metrics.globalAdherence}%</div>
                    </Card>

                    <Card className="su-metric-card">
                        <div className="su-metric-header">
                            <span className="su-metric-label">{t('pro.analytics.metric.lifespan')}</span>
                        </div>
                        <div className="su-metric-value">{metrics.avgLifespan} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t('pro.analytics.metric.lifespan.unit')}</span></div>
                    </Card>
                </div>
            </div>

            {/* Charts Area */}
            <div className="su-analytics-charts-grid" data-tour="an-charts">

                {/* Client Growth Chart */}
                <Card className="su-chart-card su-col-span-2">
                    <h3 className="su-section-title">{tr('Matrículas por mês','Enrollments by month','Matrículas por mes')}</h3>
                    <div className="su-chart-container-large">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '2px' }} />
                                <Area type="monotone" name={tr('Matrículas','Enrollments','Matrículas')} dataKey="active" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.12} />
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
