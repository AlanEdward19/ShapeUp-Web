import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Activity, TrendingUp, Download } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, Legend
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
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

        setMetrics({
            mrr: totalMrr,
            activeClients: activeUsers.length,
            globalAdherence: avgAdherence,
            avgLifespan: 9 // Static mock for now
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

        // 5. Generate Trailing 6 Month Growth Mock Data (ending at current active)
        const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();

        let buildGrowth = [];
        let simulatedActive = activeUsers.length;

        // Work backwards 6 months
        for (let i = 0; i < 6; i++) {
            let mIdx = currentMonthIdx - i;
            if (mIdx < 0) mIdx += 12;

            buildGrowth.unshift({
                month: monthsStr[mIdx],
                active: Math.max(0, simulatedActive),
                churned: Math.floor(Math.random() * 3) // random 0-2 churn
            });
            // Simulate that in previous months we had fewer clients
            simulatedActive = simulatedActive - Math.floor(Math.random() * 4) - 1;
        }

        setGrowthData(buildGrowth);

    }, []);

    return (
        <div className="su-analytics-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Business Analytics</h1>
                    <p className="su-page-subtitle">Track your coaching business growth and overall client performance.</p>
                </div>
                <Button variant="outline" icon={<Download size={16} />}>Export Report</Button>
            </div>

            {/* Metrics Grid */}
            <div className="su-analytics-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Monthly Recurring Revenue</span>
                        <DollarSign size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">${metrics.mrr.toLocaleString()}</div>
                    <span className="su-metric-trend positive">Based on Current Subscriptions</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Active Clients</span>
                        <Users size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">{metrics.activeClients}</div>
                    <span className="su-metric-trend positive">Real-time Rosters</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Global Adherence</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">{metrics.globalAdherence}%</div>
                    <span className="su-metric-trend positive">Computed from Active P.</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Avg. Client Lifespan</span>
                        <TrendingUp size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">{metrics.avgLifespan} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>mo</span></div>
                    <span className="su-metric-trend">Stable</span>
                </Card>
            </div>

            {/* Charts Area */}
            <div className="su-analytics-charts-grid">

                {/* Client Growth Chart */}
                <Card className="su-chart-card su-col-span-2">
                    <h3 className="su-section-title">Client Growth & Retention</h3>
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
                                <Area type="monotone" name="Active Clients" dataKey="active" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                                <Area type="monotone" name="Churned" dataKey="churned" stroke="var(--error)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Adherence Distribution Chart */}
                <Card className="su-chart-card">
                    <h3 className="su-section-title">Adherence Distribution</h3>
                    <div className="su-chart-container-large">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="range" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="var(--text-muted)" width={70} />
                                <RechartsTooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                                <Bar dataKey="clients" name="Clients" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Analytics;
