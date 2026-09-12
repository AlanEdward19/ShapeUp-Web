import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/Card';
import { Download } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer
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
    const [view, setView] = useState('transactions');
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const filteredTransactions = recentTransactions.filter(tx => (filter === 'all' || tx.status === filter) && (tx.client + ' ' + tx.plan).toLowerCase().includes(query.toLowerCase()));
    const exportReport = () => {
        const csv = '\uFEFFAluno;Plano;Data;Valor;Status\n' + filteredTransactions.map(tx => [tx.client, tx.plan, tx.date, tx.amount.toFixed(2), tx.status].join(';')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = 'shapeup-financeiro.csv'; link.click(); URL.revokeObjectURL(url);
    };

    const totalRevenue  = 145890;
    const totalExpenses = 39200;
    const netProfit     = totalRevenue - totalExpenses;
    const totalClients  = subscriptionPlans.reduce((s, p) => s + p.activeClients, 0);

    const overdueCount = recentTransactions.filter(tx => tx.status === 'overdue').length;
    const metrics = [
        { label: 'Receita recorrente (MRR)', value: fmt(totalRevenue), trend: totalClients + ' membros', trendClass: 'positive' },
        { label: 'Inadimplência nas cobranças', value: Math.round(overdueCount / recentTransactions.length * 100) + '%', trend: overdueCount + ' em aberto', trendClass: 'negative' },
        { label: 'Ticket médio / aluno', value: fmt(totalRevenue / totalClients), trend: 'Receita por assinatura', trendClass: 'positive' },
        { label: 'Despesas operacionais', value: fmt(totalExpenses), trend: 'Folha & manutenção', trendClass: '' },
        { label: 'Resultado líquido do mês', value: fmt(netProfit), trend: Math.round(netProfit / totalRevenue * 100) + '% de margem', trendClass: 'positive' },
    ];

    const statusMeta = {
        paid:    { label: t('gym.financial.status.paid')    || 'Paid',    cls: 'paid' },
        pending: { label: t('gym.financial.status.pending') || 'Pending', cls: 'pending' },
        overdue: { label: t('gym.financial.status.overdue') || 'Overdue', cls: 'overdue' },
    };

    return (
        <div className="su-clients-dashboard su-finance-workspace">
            {/* Header */}
            <div className="su-dashboard-header-flex" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="su-page-title">Gestão financeira</h1>
                    <p className="su-page-subtitle">{t('gym.financial.subtitle') || 'Monthly revenue, expenses and subscriber analytics.'}</p>
                </div>
                <button className="fin-export-btn" onClick={exportReport}>
                    <Download size={16} /> {t('gym.financial.btn.export') || 'Export Report'}
                </button>
            </div>

            {/* KPI Cards */}
            <div className="fin-metrics-grid">
                {metrics.map((m, i) => (
                    <Card key={i} className="gym-metric-card fin-kpi-card">
                        <div className="gym-metric-body">
                            <span className="gym-metric-label">{m.label}</span>
                            <span className="gym-metric-value fin-value">{m.value}</span>
                            <span className={`gym-metric-trend ${m.trendClass}`}>
                                {m.trend}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Chart + Plans side-by-side */}
            <nav className="su-finance-tabs" aria-label="Visões financeiras"><button type="button" aria-pressed={view === 'transactions'} onClick={() => {setView('transactions'); setFilter('all');}}>Visão geral & fluxo</button><button type="button" aria-pressed={view === 'transactions' && filter === 'pending'} onClick={() => {setView('transactions'); setFilter('pending');}}>Cobranças pendentes</button><button type="button" aria-pressed={view === 'analytics'} onClick={() => setView('analytics')}>Receitas & planos</button></nav>
            <div className="fin-mid-grid" hidden={view !== 'analytics'}>
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
                            <AreaChart data={period === 'month' ? monthlyRevenue.slice(-1) : period === 'quarter' ? monthlyRevenue.slice(-3) : monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.22} />
                                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--error)" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="var(--error)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                                <RechartsTooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: 12 }}
                                    formatter={(v) => fmt(v)}
                                />
                                <Area type="monotone" dataKey="revenue"  stroke="var(--success)" fill="url(#gradRev)" strokeWidth={2} name={t('gym.financial.chart.revenue') || 'Revenue'} />
                                <Area type="monotone" dataKey="expenses" stroke="var(--error)" fill="url(#gradExp)" strokeWidth={2} name={t('gym.financial.chart.expenses') || 'Expenses'} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Subscription Plans */}
                <Card className="fin-plans-card">
                    <div className="fin-card-header">
                        <h2 className="fin-card-title">{t('gym.financial.plans.title') || 'Subscription Plans'}</h2>
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
            <Card className={`fin-tx-card ${view !== 'transactions' ? 'su-finance-hidden' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="fin-card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div><h2 className="fin-card-title">Fluxo de cobranças e transações recentes</h2><p className="su-text-muted">Histórico consolidado de cobranças da unidade.</p></div><div className="su-finance-filters"><select aria-label="Status das cobranças" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todas</option><option value="pending">Pendentes</option><option value="overdue">Atrasadas</option><option value="paid">Confirmadas</option></select><input aria-label="Buscar cobrança" placeholder="Buscar aluno ou plano..." value={query} onChange={event => setQuery(event.target.value)} /></div>
                </div>
                <div className="su-finance-table-scroll"><table className="fin-tx-table">
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
                        {filteredTransactions.map(tx => {
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
                                        <span className={`fin-tx-status ${s.cls}`}>{s.label}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table></div><footer className="su-finance-table-footer">{filteredTransactions.length} cobranças exibidas</footer>
            </Card>
        </div>
    );
};

export default FinancialGym;
