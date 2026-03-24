import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/Card';
import {
    DollarSign, TrendingUp, TrendingDown, Users, CreditCard,
    ChevronDown, Download, CheckCircle, XCircle, Clock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import './FinancialGym.css';

// ── Mock data ──────────────────────────────────────────────────────────────────
const monthlyRevenue = [
    { month: 'Aug', revenue: 118200, expenses: 34000 },
    { month: 'Sep', revenue: 123500, expenses: 35200 },
    { month: 'Oct', revenue: 129800, expenses: 36100 },
    { month: 'Nov', revenue: 131200, expenses: 35800 },
    { month: 'Dec', revenue: 138000, expenses: 37200 },
    { month: 'Jan', revenue: 142300, expenses: 38500 },
    { month: 'Feb', revenue: 139700, expenses: 37000 },
    { month: 'Mar', revenue: 145890, expenses: 39200 },
];

const subscriptionPlans = [
    { id: 1, name: 'Plano Básico',    price: 89.90,  activeClients: 420, status: 'active' },
    { id: 2, name: 'Plano Padrão',   price: 129.90, activeClients: 592, status: 'active' },
    { id: 3, name: 'Plano Premium',  price: 199.90, activeClients: 218, status: 'active' },
    { id: 4, name: 'Plano Trimestral', price: 299.90, activeClients: 15, status: 'active' },
];

const recentTransactions = [
    { id: 1, client: 'Marcos Gomes',  plan: 'Plano Padrão',   amount: 129.90, date: '23/03/2026', status: 'paid' },
    { id: 2, client: 'Julia Reis',    plan: 'Plano Básico',    amount: 89.90,  date: '23/03/2026', status: 'paid' },
    { id: 3, client: 'Pedro Alves',   plan: 'Plano Padrão',   amount: 129.90, date: '22/03/2026', status: 'overdue' },
    { id: 4, client: 'Ana Costa',     plan: 'Plano Premium',  amount: 199.90, date: '22/03/2026', status: 'paid' },
    { id: 5, client: 'Fábio Lopes',   plan: 'Plano Básico',    amount: 89.90,  date: '21/03/2026', status: 'pending' },
    { id: 6, client: 'Renata Melo',   plan: 'Plano Premium',  amount: 199.90, date: '21/03/2026', status: 'paid' },
    { id: 7, client: 'Carlos Neto',   plan: 'Plano Trimestral', amount: 299.90, date: '20/03/2026', status: 'paid' },
    { id: 8, client: 'Amanda Lima',   plan: 'Plano Padrão',   amount: 129.90, date: '20/03/2026', status: 'overdue' },
];

const fmt = (n) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

// ── Component ──────────────────────────────────────────────────────────────────
const FinancialGym = () => {
    const { t } = useLanguage();
    const [period, setPeriod] = useState('month');

    const totalRevenue  = 145890;
    const totalExpenses = 39200;
    const netProfit     = totalRevenue - totalExpenses;
    const totalClients  = subscriptionPlans.reduce((s, p) => s + p.activeClients, 0);

    const metrics = [
        {
            icon: <DollarSign size={22} color="#10b981" />,
            bg: 'rgba(16, 185, 129, 0.1)',
            label: t('gym.financial.metric.revenue') || 'Gross Revenue',
            value: fmt(totalRevenue),
            trend: '+8.4%',
            trendClass: 'positive',
        },
        {
            icon: <TrendingDown size={22} color="#ef4444" />,
            bg: 'rgba(239, 68, 68, 0.1)',
            label: t('gym.financial.metric.expenses') || 'Expenses',
            value: fmt(totalExpenses),
            trend: '+2.1%',
            trendClass: 'negative',
        },
        {
            icon: <TrendingUp size={22} color="var(--primary)" />,
            bg: 'rgba(59, 130, 246, 0.1)',
            label: t('gym.financial.metric.net') || 'Net Profit',
            value: fmt(netProfit),
            trend: '+11.2%',
            trendClass: 'positive',
        },
        {
            icon: <Users size={22} color="#8b5cf6" />,
            bg: 'rgba(139, 92, 246, 0.1)',
            label: t('gym.financial.metric.active') || 'Active Subscribers',
            value: totalClients.toLocaleString('pt-BR'),
            trend: '+56',
            trendClass: 'positive',
        },
    ];

    const statusMeta = {
        paid:    { label: t('gym.financial.status.paid')    || 'Paid',    icon: <CheckCircle size={13} />, cls: 'paid' },
        pending: { label: t('gym.financial.status.pending') || 'Pending', icon: <Clock size={13} />,       cls: 'pending' },
        overdue: { label: t('gym.financial.status.overdue') || 'Overdue', icon: <XCircle size={13} />,     cls: 'overdue' },
    };

    return (
        <div className="su-clients-dashboard">
            {/* Header */}
            <div className="su-dashboard-header-flex" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="su-page-title">{t('gym.financial.title') || 'Financial Overview'}</h1>
                    <p className="su-page-subtitle">{t('gym.financial.subtitle') || 'Monthly revenue, expenses and subscriber analytics.'}</p>
                </div>
                <button className="fin-export-btn">
                    <Download size={16} /> {t('gym.financial.btn.export') || 'Export Report'}
                </button>
            </div>

            {/* KPI Cards */}
            <div className="fin-metrics-grid">
                {metrics.map((m, i) => (
                    <Card key={i} className="gym-metric-card fin-kpi-card">
                        <div className="gym-metric-icon-wrap" style={{ background: m.bg }}>{m.icon}</div>
                        <div className="gym-metric-body">
                            <span className="gym-metric-label">{m.label}</span>
                            <span className="gym-metric-value fin-value">{m.value}</span>
                            <span className={`gym-metric-trend ${m.trendClass}`}>
                                {m.trend} {t('gym.metric.this_month') || 'this month'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Chart + Plans side-by-side */}
            <div className="fin-mid-grid">
                {/* Revenue Chart */}
                <Card className="fin-chart-card">
                    <div className="fin-card-header">
                        <h2 className="fin-card-title">{t('gym.financial.chart.title') || 'Revenue vs Expenses'}</h2>
                        <div className="fin-period-toggle">
                            {['month', 'quarter', 'year'].map(p => (
                                <button
                                    key={p}
                                    className={`fin-period-btn ${period === p ? 'active' : ''}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {t(`gym.financial.period.${p}`) || p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                                <RechartsTooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                                    formatter={(v) => fmt(v)}
                                />
                                <Area type="monotone" dataKey="revenue"  stroke="#10b981" fill="url(#gradRev)" strokeWidth={2} name={t('gym.financial.chart.revenue') || 'Revenue'} />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#gradExp)" strokeWidth={2} name={t('gym.financial.chart.expenses') || 'Expenses'} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Subscription Plans */}
                <Card className="fin-plans-card">
                    <div className="fin-card-header">
                        <h2 className="fin-card-title">{t('gym.financial.plans.title') || 'Subscription Plans'}</h2>
                        <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="fin-plans-list">
                        {subscriptionPlans.map(plan => {
                            const planRevenue = plan.price * plan.activeClients;
                            const pct = Math.round((plan.activeClients / totalClients) * 100);
                            return (
                                <div key={plan.id} className="fin-plan-row">
                                    <div className="fin-plan-info">
                                        <span className="fin-plan-name">{plan.name}</span>
                                        <span className="fin-plan-price">{fmt(plan.price)}/mês · {plan.activeClients} {t('gym.financial.plans.members') || 'members'}</span>
                                    </div>
                                    <div className="fin-plan-bar-wrap">
                                        <div className="fin-plan-bar">
                                            <div className="fin-plan-bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="fin-plan-pct">{pct}%</span>
                                    </div>
                                    <span className="fin-plan-revenue">{fmt(planRevenue)}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="fin-tx-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="fin-card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 className="fin-card-title">{t('gym.financial.tx.title') || 'Recent Transactions'}</h2>
                </div>
                <table className="fin-tx-table">
                    <thead>
                        <tr>
                            <th>{t('gym.financial.tx.col.client') || 'Client'}</th>
                            <th>{t('gym.financial.tx.col.plan')   || 'Plan'}</th>
                            <th>{t('gym.financial.tx.col.date')   || 'Date'}</th>
                            <th>{t('gym.financial.tx.col.amount') || 'Amount'}</th>
                            <th>{t('gym.financial.tx.col.status') || 'Status'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map(tx => {
                            const s = statusMeta[tx.status] || statusMeta.pending;
                            return (
                                <tr key={tx.id}>
                                    <td>
                                        <div className="gym-recent-user">
                                            <div className="gym-recent-avatar">{tx.client.charAt(0)}</div>
                                            {tx.client}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tx.plan}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tx.date}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fmt(tx.amount)}</td>
                                    <td>
                                        <span className={`fin-tx-status ${s.cls}`}>{s.icon} {s.label}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default FinancialGym;
