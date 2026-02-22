import React from 'react';
import { DollarSign, Users, Activity, TrendingUp, Download } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, Legend
} from 'recharts';
import './Analytics.css';

// Mock Data
const clientGrowthData = [
    { month: 'Jan', active: 18, churned: 1 },
    { month: 'Feb', active: 20, churned: 0 },
    { month: 'Mar', active: 22, churned: 2 },
    { month: 'Apr', active: 25, churned: 1 },
    { month: 'May', active: 28, churned: 1 },
    { month: 'Jun', active: 32, churned: 0 },
    { month: 'Jul', active: 36, churned: 2 },
];

const adherenceData = [
    { range: '90-100%', clients: 15 },
    { range: '80-89%', clients: 12 },
    { range: '70-79%', clients: 5 },
    { range: '< 70%', clients: 4 },
];

const Analytics = () => {
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
                    <div className="su-metric-value">$4,250</div>
                    <span className="su-metric-trend positive">↑ 12% vs last month</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Active Clients</span>
                        <Users size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">36</div>
                    <span className="su-metric-trend positive">↑ 4 net new clients</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Global Adherence</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">84%</div>
                    <span className="su-metric-trend positive">↑ 2% vs last month</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Avg. Client Lifespan</span>
                        <TrendingUp size={20} className="su-warning-text" />
                    </div>
                    <div className="su-metric-value">9 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>mo</span></div>
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
                            <AreaChart data={clientGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <BarChart data={adherenceData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
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
