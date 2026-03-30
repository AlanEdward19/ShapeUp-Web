import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    Database, 
    Activity, 
    Lock, 
    UserPlus, 
    AlertCircle, 
    CheckCircle, 
    ArrowRight,
    TrendingUp,
    Server,
    Globe
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);

    // Mock data for the dashboard (In a real scenario, this comes from adminService)
    const [stats, setStats] = useState({
        totalUsers: 1248,
        activeGroups: 42,
        assignedScopes: 312,
        systemHealth: 98.4
    });

    const userGrowthData = [
        { month: 'Jan', users: 850 },
        { month: 'Feb', users: 940 },
        { month: 'Mar', users: 1080 },
        { month: 'Apr', users: 1150 },
        { month: 'May', users: 1248 },
    ];

    const groupDistribution = [
        { name: 'Professionals', value: 340, color: '#2563EB' },
        { name: 'Gym Admins', value: 120, color: '#06B6D4' },
        { name: 'Independent', value: 450, color: '#8B5CF6' },
        { name: 'Clients', value: 1338, color: '#10B981' },
    ];

    const recentActivities = [
        { id: 1, type: 'user_created', title: 'New Professional Registered', detail: 'marcos.silva@email.com', time: '10 minutes ago', icon: <UserPlus size={18} className="su-accent-text" /> },
        { id: 2, type: 'scope_assigned', title: 'Scope Assigned', detail: 'trainer_pro assigned to 12 users', time: '1 hour ago', icon: <Lock size={18} className="su-primary-text" /> },
        { id: 3, type: 'system_alert', title: 'Database Optimization', detail: 'Regular maintenance completed successfully', time: '3 hours ago', icon: <CheckCircle size={18} className="su-success-text" /> },
        { id: 4, type: 'group_deleted', title: 'Group Archive', detail: 'Group "Old CrossFit Alpha" was archived', time: 'Yesterday', icon: <AlertCircle size={18} className="su-warning-text" /> },
    ];

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="su-admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Activity className="su-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="su-admin-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('admin.dashboard.title')}</h1>
                    <p className="su-page-subtitle">{t('admin.dashboard.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                   <Button variant="secondary" onClick={() => navigate('/dashboard/admin/users')}>{t('nav.users')}</Button>
                   <Button onClick={() => navigate('/dashboard/admin/scopes')}>{t('nav.scopes')}</Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="su-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Total Users</span>
                        <Users size={20} className="su-text-muted" />
                    </div>
                    <div className="su-metric-value">{stats.totalUsers}</div>
                    <span className="su-metric-trend positive">+12% from last month</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Active Groups</span>
                        <Database size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">{stats.activeGroups}</div>
                    <span className="su-metric-trend positive">5 new groups this week</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Security Scopes</span>
                        <ShieldCheck size={20} className="su-primary-text" />
                    </div>
                    <div className="su-metric-value">{stats.assignedScopes}</div>
                    <span className="su-metric-trend">24 active rule sets</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">System Health</span>
                        <Server size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">{stats.systemHealth}%</div>
                    <span className="su-metric-trend positive">Operational</span>
                </Card>
            </div>

            {/* Charts & Activity Layout */}
            <div className="su-admin-overview-layout su-mt-4">
                
                {/* User Growth Chart */}
                <Card className="su-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="su-section-title" style={{ marginBottom: 0 }}>User Growth</h3>
                        <div className="su-text-muted" style={{ fontSize: '0.875rem' }}>Last 5 months</div>
                    </div>
                    <div className="su-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)'}}
                                />
                                <Area type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Activities Feed */}
                <Card className="su-recent-activity">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="su-section-title" style={{ marginBottom: 0 }}>System Logs</h3>
                        <Button variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigate('/dashboard/admin/logs')}>
                            View All <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </Button>
                    </div>
                    <ul className="su-activity-list">
                        {recentActivities.map(activity => (
                            <li key={activity.id} className="su-activity-item">
                                <div className="su-activity-icon">
                                    {activity.icon}
                                </div>
                                <div className="su-activity-content">
                                    <div className="su-activity-title">{activity.title}</div>
                                    <div className="su-text-muted">{activity.detail}</div>
                                    <div className="su-activity-time">{activity.time}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Role Distribution Section */}
            <div className="su-metrics-grid su-mt-4">
                <Card style={{ gridColumn: 'span 2' }}>
                     <h3 className="su-section-title">User Role Distribution</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '200px', height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={groupDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {groupDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            {groupDistribution.map((group, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: group.color }}></div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{group.name}:</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{group.value}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardAdmin;
