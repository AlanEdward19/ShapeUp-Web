import React, { useState, useEffect, useMemo } from 'react';
import { Users, Activity, MessageSquare, CheckCircle, XCircle, TrendingUp, Award, Bell } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InviteClientModal from '../../components/InviteClientModal';
import { useNotifications } from '../../utils/notifications';
import './DashboardProfessional.css';

const DashboardProfessional = () => {
    const [showInvite, setShowInvite] = useState(false);
    const [clients, setClients] = useState([]);
    const [globalHistory, setGlobalHistory] = useState([]);
    const { notifications } = useNotifications('pro');

    useEffect(() => {
        // 1. Fetch Clients
        const storedClients = localStorage.getItem('shapeup_clients');
        const clientsList = storedClients ? JSON.parse(storedClients) : [];
        setClients(clientsList);

        // 2. Aggregate History from all clients
        let allEvents = [];
        clientsList.forEach(client => {
            const storedPlans = localStorage.getItem(`shapeup_client_plans_${client.id}`);
            if (storedPlans) {
                const plans = JSON.parse(storedPlans);
                plans.forEach(plan => {
                    (plan.history || []).forEach(historyItem => {
                        allEvents.push({
                            ...historyItem,
                            clientName: client.name,
                            clientId: client.id,
                            planName: plan.name,
                            timestamp: new Date(historyItem.date).getTime() || 0
                        });
                    });
                });
            }
        });

        // Sort by date descending
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        setGlobalHistory(allEvents);
    }, []);

    // ─── Metrics ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const activeCount = clients.filter(c => c.status !== 'Inactive').length;

        // Dynamic counts from global history
        let completedCount = 0;
        let skippedCount = 0;

        globalHistory.forEach(h => {
            const isSkipped = h.status === 'skipped' || (h.exercises || []).every(ex => ex.skipped);
            if (isSkipped) {
                skippedCount++;
            } else {
                completedCount++;
            }
        });

        // Compliance/Engagement average
        const avgCompliance = clients.length > 0
            ? Math.round(clients.reduce((acc, c) => acc + (parseFloat(c.compliance) || 0), 0) / clients.length)
            : 0;

        return {
            activeClients: activeCount,
            workoutsCompleted: completedCount,
            workoutsSkipped: skippedCount,
            engagement: avgCompliance
        };
    }, [clients, globalHistory]);

    // ─── Alerts (Synced with Notifications) ───────────────────────────
    const alerts = useMemo(() => {
        return notifications
            .filter(n => n.type === 'alert' || n.type === 'warning' || n.type === 'error')
            .slice(0, 10); // Show top 10 recent alerts
    }, [notifications]);

    // Helper for relative time (very simplified)
    const getRelativeTime = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const diff = Date.now() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="su-pro-dashboard">
            {showInvite && <InviteClientModal onClose={() => setShowInvite(false)} />}

            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Coach Overview</h1>
                    <p className="su-page-subtitle">A high-level look at your active clients and recent activity.</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>Invite New Client</Button>
            </div>

            {/* Aggregate Metrics Grid */}
            <div className="su-metrics-grid su-mt-4">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Active Clients</span>
                        <Users size={20} className="su-text-muted" />
                    </div>
                    <div className="su-metric-value">{stats.activeClients}</div>
                    <span className="su-metric-trend positive">Total assigned</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Workouts Completed</span>
                        <CheckCircle size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">{stats.workoutsCompleted}</div>
                    <span className="su-metric-trend positive">Lifetime total</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Workouts Skipped</span>
                        <XCircle size={20} className="su-error-text" />
                    </div>
                    <div className="su-metric-value">{stats.workoutsSkipped}</div>
                    <span className="su-metric-trend negative">Estimated</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">Client Engagement</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">{stats.engagement}%</div>
                    <span className="su-metric-trend">Avg. compliance</span>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="su-overview-layout">

                {/* Recent Client Logs Column */}
                <div className="su-client-feed">
                    <h3 className="su-section-title">Global Client Activity Feed</h3>

                    <div className="su-feed-list">
                        {globalHistory.length > 0 ? (
                            globalHistory.slice(0, 10).map((item) => (
                                <Card key={item.id} className="su-feed-item">
                                    <div className="su-feed-avatar">
                                        {item.clientName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="su-feed-content">
                                        <div className="su-feed-meta">
                                            <span className="su-feed-name">{item.clientName}</span>
                                            <span className="su-feed-time">{getRelativeTime(item.date)}</span>
                                        </div>
                                        <div className="su-feed-action">
                                            Completed session: <strong>{item.planName}</strong>
                                        </div>

                                        {(item.exercises || []).some(ex => !ex.skipped) && (
                                            <div className="su-feed-badges">
                                                <span className="su-badge workout-stat">
                                                    <Activity size={12} /> {item.totalVol}
                                                </span>
                                                <span className="su-badge duration-stat">
                                                    <CheckCircle size={12} /> {item.duration}
                                                </span>
                                            </div>
                                        )}

                                        {item.comments && (
                                            <div className="su-feed-comment-bubble">
                                                <MessageSquare size={14} />
                                                "{item.comments}"
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="su-empty-feed">
                                <p className="su-text-muted">No client activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary Area */}
                <div className="su-overview-sidebar">
                    <Card className="su-attention-card">
                        <h3 className="su-card-title">
                            <Bell size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            Client Alerts
                        </h3>
                        {alerts.length > 0 ? (
                            <ul className="su-alert-list">
                                {alerts.map(alert => (
                                    <li
                                        key={alert.id}
                                        className={`su-alert-status-${alert.iconColor || 'primary'}`}
                                        style={{ cursor: alert.link ? 'pointer' : 'default' }}
                                        onClick={() => alert.link && (window.location.hash = alert.link)}
                                    >
                                        <strong>{alert.title}:</strong> {alert.body}
                                        <div className="su-alert-time">{alert.time}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="su-text-muted" style={{ fontSize: '0.875rem' }}>
                                All clients are currently on track.
                            </p>
                        )}
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default DashboardProfessional;
