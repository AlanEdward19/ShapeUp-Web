import React, { useEffect } from 'react';
import { useTour } from '@reactour/tour';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/Card';
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

    const featureMetric = {
        label: t('gym.metric.active_clients') || 'Active Clients',
        value: '1,245',
        trend: '+56',
        trendLabel: t('gym.metric.this_month') || 'this month',
        trendClass: 'positive',
    };

    const stackMetrics = [
        {
            label: t('gym.metric.revenue') || 'Gross Monthly Revenue',
            value: 'R$ 145.890',
            trend: '+8.4%',
            trendLabel: t('gym.metric.this_month') || 'this month',
            trendClass: 'positive',
        },
        {
            label: t('gym.metric.active_staff') || 'Active Staff',
            value: '18',
            trend: '12 trainers · 6 admins',
            trendLabel: '',
            trendClass: 'neutral',
        },
        {
            label: t('gym.metric.peak_hour') || 'Peak Hour Today',
            value: '07:00',
            trend: '312 accesses',
            trendLabel: '',
            trendClass: 'neutral',
        },
    ];

    const quickLinks = [
        {
            label: t('nav.clients') || 'Clients',
            desc: t('gym.clients.subtitle') || 'All enrolled students',
            path: '/dashboard/clients',
            className: '',
        },
        {
            label: t('nav.staff') || 'Staff',
            desc: t('gym.staff.subtitle') || 'Trainers and administrators',
            path: '/dashboard/staff',
            className: 'gym-feature-staff',
        },
        {
            label: t('nav.financial') || 'Financial',
            desc: t('gym.financial.subtitle') || 'Revenue, expenses and plans',
            path: '/dashboard/financial',
            className: '',
        },
    ];

    return (
        <div className="su-clients-dashboard">
            <div className="gym-dashboard-header gym-feature-metrics">
                <div>
                    <h1 className="su-page-title">{t('gym.dashboard.title') || 'Gym Overview'}</h1>
                    <p className="su-page-subtitle">{t('gym.dashboard.subtitle') || 'Manage revenue, access, and active clients.'}</p>
                </div>
            </div>

            <div className="gym-metrics-grid">
                <Card className="gym-metric-card is-feature">
                    <div className="gym-metric-body">
                        <span className="gym-metric-label">{featureMetric.label}</span>
                        <span className="gym-metric-value">{featureMetric.value}</span>
                        <span className={`gym-metric-trend ${featureMetric.trendClass}`}>
                            {featureMetric.trend} {featureMetric.trendLabel}
                        </span>
                    </div>
                </Card>
                <div className="gym-metric-stack">
                    {stackMetrics.map((m) => (
                        <Card key={m.label} className="gym-metric-card">
                            <span className="gym-metric-label">{m.label}</span>
                            <span className="gym-metric-value">{m.value}</span>
                            <span className={`gym-metric-trend ${m.trendClass}`}>
                                {m.trend} {m.trendLabel}
                            </span>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="gym-bottom-grid gym-bottom-stretch">
                <div className="gym-quicklinks">
                    <h2 className="gym-section-title">{t('gym.dashboard.quick_access') || 'Quick Access'}</h2>
                    <div className="gym-quicklinks-col">
                        {quickLinks.map((link) => (
                            <Card
                                key={link.path}
                                className={`gym-quicklink-card ${link.className}`}
                                onClick={() => navigate(link.path)}
                            >
                                <span className="gym-quicklink-label">{link.label}</span>
                                <span className="gym-quicklink-arrow">→</span>
                                <span className="gym-quicklink-desc">{link.desc}</span>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="gym-feature-turnstile">
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
                                            <div className="gym-recent-user">{row.name}</div>
                                        </td>
                                        <td>
                                            {row.type === 'trainer'
                                                ? (t('gym.turnstile.table.type.trainer') || 'Trainer')
                                                : (t('gym.turnstile.table.type.client') || 'Client')}
                                        </td>
                                        <td>{row.time}</td>
                                        <td>
                                            {row.status === 'allowed'
                                                ? <span className="gym-recent-status allowed">{t('gym.turnstile.status.allowed') || 'Allowed'}</span>
                                                : <span className="gym-recent-status blocked">{t('gym.turnstile.status.blocked') || 'Blocked'}</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <button className="gym-recent-viewall" onClick={() => navigate('/dashboard/turnstile')}>
                            {t('nav.turnstile') || 'View all in Turnstile'} →
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardGym;
