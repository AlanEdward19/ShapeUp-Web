import React, { useEffect } from 'react';
import { useTour } from '@reactour/tour';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/Card';
import { Users, DollarSign, UserCheck, TrendingUp, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react';
import './DashboardProfessional.css';
import './DashboardGym.css';

const mockRecent = [
    { id: 1,  name: 'Marcos Gomes',  type: 'client',  time: '07:02', status: 'allowed' },
    { id: 2,  name: 'Carlos Silva',  type: 'trainer', time: '07:05', status: 'allowed' },
    { id: 3,  name: 'Julia Reis',    type: 'client',  time: '07:11', status: 'blocked' },
    { id: 4,  name: 'Roberto Lima',  type: 'client',  time: '07:18', status: 'allowed' },
    { id: 5,  name: 'Beto Fitness',  type: 'trainer', time: '07:22', status: 'allowed' },
    { id: 6,  name: 'Ana Costa',     type: 'client',  time: '07:31', status: 'allowed' },
    { id: 7,  name: 'Pedro Alves',   type: 'client',  time: '07:38', status: 'blocked' },
    { id: 8,  name: 'Amanda Souza',  type: 'trainer', time: '07:45', status: 'allowed' },
    { id: 9,  name: 'Fábio Lopes',   type: 'client',  time: '07:52', status: 'allowed' },
    { id: 10, name: 'Renata Melo',   type: 'client',  time: '08:01', status: 'allowed' },
];

const DashboardGym = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { setIsOpen, setSteps } = useTour();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_gym_dashboard_tour_seen');
        if (!hasSeenTour) {
            setSteps([
                {
                    selector: '.gym-feature-metrics',
                    content: t('tour.gym_dashboard.1') || 'Welcome to your Gym Dashboard! Here you manage billing, active clients and access.',
                },
                {
                    selector: '.gym-quicklinks',
                    content: t('tour.gym_dashboard.2') || 'Manage your team via the Staff menu. Easily assign students to trainers.',
                },
                {
                    selector: '.gym-feature-turnstile',
                    content: t('tour.gym_dashboard.3') || 'Monitor real-time turnstile passages via the Turnstile menu.',
                }
            ]);
            setIsOpen(true);
            localStorage.setItem('shapeup_gym_dashboard_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps, t]);

    const metrics = [
        {
            icon: <Users size={22} color="var(--primary)" />,
            iconBg: 'rgba(59, 130, 246, 0.1)',
            label: t('gym.metric.active_clients') || 'Active Clients',
            value: '1,245',
            trend: '+56',
            trendLabel: t('gym.metric.this_month') || 'this month',
            trendClass: 'positive',
        },
        {
            icon: <DollarSign size={22} color="#10b981" />,
            iconBg: 'rgba(16, 185, 129, 0.1)',
            label: t('gym.metric.revenue') || 'Gross Monthly Revenue',
            value: 'R$ 145.890',
            trend: '+8.4%',
            trendLabel: t('gym.metric.this_month') || 'this month',
            trendClass: 'positive',
        },
        {
            icon: <UserCheck size={22} color="#8b5cf6" />,
            iconBg: 'rgba(139, 92, 246, 0.1)',
            label: t('gym.metric.active_staff') || 'Active Staff',
            value: '18',
            trend: '12 trainers · 6 admins',
            trendLabel: '',
            trendClass: 'neutral',
        },
        {
            icon: <TrendingUp size={22} color="#f59e0b" />,
            iconBg: 'rgba(245, 158, 11, 0.1)',
            label: t('gym.metric.peak_hour') || 'Peak Hour Today',
            value: '07:00',
            trend: '312 accesses',
            trendLabel: '',
            trendClass: 'neutral',
        },
    ];

    const quickLinks = [
        {
            icon: <Users size={20} color="#10b981" />,
            label: t('nav.clients') || 'Clients',
            desc: t('gym.clients.subtitle') || 'All enrolled students',
            path: '/dashboard/clients',
            className: '',
        },
        {
            icon: <Shield size={20} color="#8b5cf6" />,
            label: t('nav.staff') || 'Staff',
            desc: t('gym.staff.subtitle') || 'Trainers and administrators',
            path: '/dashboard/staff',
            className: 'gym-feature-staff',
        },
    ];

    return (
        <div className="su-clients-dashboard">
            {/* Header */}
            <div className="gym-dashboard-header gym-feature-metrics">
                <div>
                    <h1 className="su-page-title">{t('gym.dashboard.title') || 'Gym Overview'}</h1>
                    <p className="su-page-subtitle">{t('gym.dashboard.subtitle') || 'Manage revenue, access, and active clients.'}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="gym-metrics-grid">
                {metrics.map((m, i) => (
                    <Card key={i} className="gym-metric-card">
                        <div className="gym-metric-icon-wrap" style={{ background: m.iconBg }}>
                            {m.icon}
                        </div>
                        <div className="gym-metric-body">
                            <span className="gym-metric-label">{m.label}</span>
                            <span className="gym-metric-value">{m.value}</span>
                            <span className={`gym-metric-trend ${m.trendClass}`}>
                                {m.trend} {m.trendLabel}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Bottom two-col layout */}
            <div className="gym-bottom-grid gym-bottom-stretch">
                {/* Quick Access */}
                <div className="gym-quicklinks">
                    <h2 className="gym-section-title">{t('gym.dashboard.quick_access') || 'Quick Access'}</h2>
                    <div className="gym-quicklinks-col">
                        {quickLinks.map((link, i) => (
                            <Card
                                key={i}
                                className={`gym-quicklink-card ${link.className}`}
                                onClick={() => navigate(link.path)}
                            >
                                <div className="gym-quicklink-icon">{link.icon}</div>
                                <div className="gym-quicklink-info">
                                    <span className="gym-quicklink-label">{link.label}</span>
                                    <span className="gym-quicklink-desc">{link.desc}</span>
                                </div>
                                <ArrowRight size={18} className="gym-quicklink-arrow" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Turnstile Activity */}
                <div>
                    <h2 className="gym-section-title">{t('gym.dashboard.recent_activity') || 'Recent Activity (Turnstile)'}</h2>
                    <Card className="gym-recent-card">
                        <div className="gym-recent-table-wrap">
                        <table className="gym-recent-table">
                            <thead>
                                <tr>
                                    <th>{t('gym.turnstile.table.user') || 'User'}</th>
                                    <th>{t('gym.turnstile.table.type') || 'Type'}</th>
                                    <th>{t('gym.turnstile.table.time') || 'Time'}</th>
                                    <th>{t('gym.turnstile.table.status') || 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockRecent.map(row => (
                                    <tr key={row.id}>
                                        <td>
                                            <div className="gym-recent-user">
                                                <div className="gym-recent-avatar">{row.name.charAt(0)}</div>
                                                {row.name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge neutral">
                                                {row.type === 'trainer'
                                                    ? (t('gym.turnstile.table.type.trainer') || 'Trainer')
                                                    : (t('gym.turnstile.table.type.client') || 'Client')}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.time}</td>
                                        <td>
                                            {row.status === 'allowed'
                                                ? <span className="gym-recent-status allowed"><CheckCircle size={14} />{t('gym.turnstile.status.allowed') || 'Allowed'}</span>
                                                : <span className="gym-recent-status blocked"><XCircle size={14} />{t('gym.turnstile.status.blocked') || 'Blocked'}</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <button className="gym-recent-viewall" onClick={() => navigate('/dashboard/turnstile')}>
                            {t('nav.turnstile') || 'View all in Turnstile'} <ArrowRight size={14} />
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardGym;
