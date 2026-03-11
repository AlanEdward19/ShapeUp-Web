import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import { UserPlus, Calendar, Activity, CheckCircle, FileText, ArrowRight, MessageCircle, AlertTriangle, Users, Settings, Plus, XCircle, Search, Filter, MessageSquare, ExternalLink, Bell, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InviteClientModal from '../../components/InviteClientModal';
import { useNotifications } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import './DashboardProfessional.css';

const DashboardProfessional = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [showInvite, setShowInvite] = useState(false);
    const [justInvitedClient, setJustInvitedClient] = useState(false);
    const [clients, setClients] = useState([]);
    const [globalHistory, setGlobalHistory] = useState([]);
    const { notifications } = useNotifications('pro');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    useEffect(() => {
        const fetchClients = () => {
            // 1. Fetch Clients
            let storedClients = localStorage.getItem('shapeup_clients');
            let clientsList = storedClients ? JSON.parse(storedClients) : [];
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
        };

        fetchClients();

        // Listen for updates from other tabs/components
        const handleClientsUpdated = () => fetchClients();
        window.addEventListener('shapeup_clients_updated', handleClientsUpdated);
        
        return () => window.removeEventListener('shapeup_clients_updated', handleClientsUpdated);
    }, []);

    // ─── Tour trigger ─────────────────────────────────────────────────
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_pro_dashboard_tour_seen');
        if (!hasSeenTour) {
            const tourSteps = [
                {
                    selector: '[data-tour="pro-header"]',
                    content: t('tour.dashboard_pro.1'),
                },
                {
                    selector: '[data-tour="pro-metrics"]',
                    content: t('tour.dashboard_pro.2'),
                },
                {
                    selector: '[data-tour="pro-feed"]',
                    content: t('tour.dashboard_pro.3'),
                },
                {
                    selector: '[data-tour="pro-alerts"]',
                    content: t('tour.dashboard_pro.4'),
                }
            ];
            setSteps(tourSteps);
            setCurrentStep(0);
            
            const tId = setTimeout(() => {
                setIsOpen(true);
            }, 600);
            
            localStorage.setItem('shapeup_pro_dashboard_tour_seen', 'true');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setIsOpen, setSteps, setCurrentStep]);

    // ─── Post-Invite Tour Trigger (from Dashboard) ────────────────────
    useEffect(() => {
        if (justInvitedClient && !showInvite) {
            // First time they invite someone, we want to point out the side menu or the metrics
            // (Since the client list is not fully visible here)
            const tourSteps = [
                {
                    selector: '[data-tour="nav-clients"]',
                    content: t('tour.clients.7') || 'Seu novo cliente foi convidado com sucesso! Vá para a aba Clientes para gerenciá-lo.',
                }
            ];
            
            const t1 = setTimeout(() => {
                setSteps(tourSteps);
                setCurrentStep(0);
                setIsOpen(true);
            }, 800); 

            const t2 = setTimeout(() => {
                setJustInvitedClient(false);
            }, 2000);
            
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [justInvitedClient, showInvite, setIsOpen, setSteps, setCurrentStep]);

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
            .slice(0, 10) // Show top 10 recent alerts
            .map(n => {
                const clientId = n.clientId || n.link?.split('/').pop() || '';
                const clientMatch = clients.find(c => String(c.id) === String(clientId));
                const clientName = n.clientName || (clientMatch ? clientMatch.name : 'Client');

                // Replace generic 'Client' with actual name
                let personalizedBody = n.body;
                if (personalizedBody.startsWith('Client reported') || personalizedBody.startsWith('Client skipped')) {
                    personalizedBody = personalizedBody.replace('Client', clientName);
                }

                return {
                    ...n,
                    clientName,
                    personalizedBody,
                    subType: n.subType,
                    sessionId: n.sessionId
                };
            });
    }, [notifications, clients]);

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

    const handleInvite = (emailAddress) => {
        const normalizedEmail = emailAddress.trim().toLowerCase();
        const newClient = {
            id: Date.now(),
            name: normalizedEmail, // Will be updated on registration
            email: normalizedEmail, // Used to match during registration
            activePlan: '-',
            compliance: 0,
            lastCheckin: '-',
            status: 'Invited'
        };
        const updated = [...clients, newClient];
        setClients(updated);
        
        const currentStorage = JSON.parse(localStorage.getItem('shapeup_clients') || '[]');
        const updatedStorage = [...currentStorage, newClient];
        localStorage.setItem('shapeup_clients', JSON.stringify(updatedStorage));
        window.dispatchEvent(new Event('shapeup_clients_updated'));

        // Trigger post-invite tour or logic
        setJustInvitedClient(true);

        setTimeout(() => {
            addNotification('pro', 'system', 'New Client Registered', `${normalizedEmail} has accepted your invite and joined your roster.`, 'primary', {
                clientId: newClient.id,
                link: `/dashboard/clients/${newClient.id}`
            });

            const refreshed = JSON.parse(localStorage.getItem('shapeup_clients') || '[]');
            const finalized = refreshed.map(c => c.id === newClient.id ? { ...c, status: 'Active' } : c);
            localStorage.setItem('shapeup_clients', JSON.stringify(finalized));

            setClients(prev => prev.map(c => c.id === newClient.id ? { ...c, status: 'Active' } : c));
        }, 3000);
    };

    // ─── Unified Feed Logic ───────────────────────────────────────────
    const unifiedFeed = useMemo(() => {
        let feed = [];

        // 1. Add Workouts
        globalHistory.forEach((h, i) => {
            const isSkipped = h.status === 'skipped' || (h.exercises || []).every(ex => ex.skipped);
            feed.push({
                id: `workout_${h.clientId}_${h.timestamp}_${i}`,
                type: isSkipped ? 'skipped' : 'workout',
                category: 'workout',
                timestamp: h.timestamp,
                clientName: h.clientName,
                clientId: h.clientId,
                title: isSkipped ? 'Skipped session' : 'Completed session',
                subtitle: h.planName,
                dateObj: new Date(h.timestamp),
                raw: h
            });
        });

        // 2. Add Notifications
        notifications.forEach((n, i) => {
            const clientId = n.clientId || n.link?.split('/').pop() || '';
            const clientNameMatch = clients.find(c => String(c.id) === String(clientId));
            const clientName = n.clientName || (clientNameMatch ? clientNameMatch.name : 'System');

            let category = 'system';
            if (n.type === 'message') category = 'message';
            if (n.type === 'alert' || n.type === 'warning' || n.type === 'error') category = 'alert';

            feed.push({
                id: `notif_${n.id}_${i}`,
                type: n.type,
                category: category,
                timestamp: n.id, // Using the Date.now() id as timestamp
                clientName: clientName,
                clientId: clientId,
                title: n.title,
                subtitle: n.body,
                dateObj: new Date(n.id),
                raw: n
            });
        });

        // Sort combined feed
        return feed.sort((a, b) => b.timestamp - a.timestamp);
    }, [globalHistory, notifications, clients]);

    // ─── Filter & Search ──────────────────────────────────────────────
    const filteredFeed = useMemo(() => {
        return unifiedFeed.filter(item => {
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                (item.clientName && String(item.clientName).toLowerCase().includes(q)) ||
                (item.title && String(item.title).toLowerCase().includes(q)) ||
                (item.subtitle && String(item.subtitle).toLowerCase().includes(q));

            const matchesFilter = filterType === 'all' || item.category === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [unifiedFeed, searchQuery, filterType]);

    // ─── Pagination ───────────────────────────────────────────────────
    const totalPages = Math.ceil(filteredFeed.length / ITEMS_PER_PAGE);
    const paginatedFeed = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFeed.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredFeed, currentPage]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType]);

    return (
        <div className="su-pro-dashboard">
            {showInvite && <InviteClientModal onClose={() => setShowInvite(false)} />}

            <div className="su-dashboard-header-flex" data-tour="pro-header">
                <div>
                    <h1 className="su-page-title">{t('pro.dashboard.title')}</h1>
                    <p className="su-page-subtitle">{t('pro.dashboard.subtitle')}</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>{t('pro.dashboard.invite')}</Button>
            </div>

            {/* Aggregate Metrics Grid */}
            <div className="su-metrics-grid su-mt-4" data-tour="pro-metrics">
                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.dashboard.metric.active')}</span>
                        <Users size={20} className="su-text-muted" />
                    </div>
                    <div className="su-metric-value">{stats.activeClients}</div>
                    <span className="su-metric-trend positive">{t('pro.dashboard.metric.active.sub')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.dashboard.metric.completed')}</span>
                        <CheckCircle size={20} className="su-success-text" />
                    </div>
                    <div className="su-metric-value">{stats.workoutsCompleted}</div>
                    <span className="su-metric-trend positive">{t('pro.dashboard.metric.completed.sub')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.dashboard.metric.skipped')}</span>
                        <XCircle size={20} className="su-error-text" />
                    </div>
                    <div className="su-metric-value">{stats.workoutsSkipped}</div>
                    <span className="su-metric-trend negative">{t('pro.dashboard.metric.skipped.sub')}</span>
                </Card>

                <Card className="su-metric-card">
                    <div className="su-metric-header">
                        <span className="su-metric-label">{t('pro.dashboard.metric.engagement')}</span>
                        <Activity size={20} className="su-accent-text" />
                    </div>
                    <div className="su-metric-value">{stats.engagement}%</div>
                    <span className="su-metric-trend">{t('pro.dashboard.metric.engagement.sub')}</span>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="su-overview-layout">

                {/* Recent Client Logs Column */}
                <div className="su-client-feed" data-tour="pro-feed">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="su-section-title" style={{ marginBottom: 0 }}>{t('pro.dashboard.feed.title')}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div className="su-search-wrapper" style={{ width: '200px' }}>
                                <Search className="su-search-icon" size={18} />
                                <input
                                    type="text"
                                    className="su-input"
                                    placeholder={t('pro.dashboard.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', height: '40px', paddingTop: '0', paddingBottom: '0' }}
                                />
                            </div>
                            <div className="su-filter-wrapper">
                                <Filter className="su-filter-icon" size={16} />
                                <select
                                    className="su-select"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    style={{ height: '40px', paddingLeft: '2rem', paddingTop: '0', paddingBottom: '0' }}
                                >
                                    <option value="all">{t('pro.dashboard.filter.all')}</option>
                                    <option value="workout">{t('pro.dashboard.filter.workout')}</option>
                                    <option value="message">{t('pro.dashboard.filter.message')}</option>
                                    <option value="alert">{t('pro.dashboard.filter.alert')}</option>
                                    <option value="system">{t('pro.dashboard.filter.system')}</option>
                                </select>
                            </div>
                            {(searchQuery !== '' || filterType !== 'all') && (
                                <Button
                                    variant="secondary"
                                    onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                                    style={{ height: '40px', padding: '0 1rem', fontSize: '0.875rem' }}
                                >
                                    {t('pro.dashboard.btn.clear')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="su-feed-list">
                        {paginatedFeed.length > 0 ? (
                            paginatedFeed.map((item) => (
                                <Card
                                    key={item.id}
                                    className="su-feed-item"
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                    onClick={() => {
                                        if (item.category === 'workout') {
                                            if (item.clientId) {
                                                navigate(`/dashboard/clients/${item.clientId}`, { state: { tab: 'plans', highlightSessionId: item.raw.id } });
                                            }
                                        } else {
                                            const link = item.raw?.link;
                                            if (link) {
                                                const state = { tab: 'plans' };
                                                if (item.raw.sessionId) {
                                                    state.highlightSessionId = item.raw.sessionId;
                                                }
                                                navigate(link, { state });
                                            }
                                        }
                                    }}
                                >
                                    <div className="su-feed-avatar">
                                        {item.clientName !== 'System' ? item.clientName.split(' ').map(n => n[0]).join('').substring(0, 2) : <Activity size={18} />}
                                    </div>
                                    <div className="su-feed-content">
                                        <div className="su-feed-meta">
                                            <span className="su-feed-name">{item.clientName}</span>
                                            <span className="su-feed-time">{getRelativeTime(item.dateObj)}</span>
                                        </div>
                                        <div className="su-feed-action">
                                            {item.title}: <strong>{item.subtitle}</strong>
                                        </div>

                                        {/* Workout Specific Render */}
                                        {item.category === 'workout' && item.type === 'workout' && (() => {
                                            const h = item.raw;
                                            return (
                                                <>
                                                    {(h.exercises || []).some(ex => !ex.skipped) && (
                                                        <div className="su-feed-badges">
                                                            <span className="su-badge workout-stat">
                                                                <Activity size={12} /> {h.totalVol}
                                                            </span>
                                                            <span className="su-badge duration-stat">
                                                                <CheckCircle size={12} /> {h.duration}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {h.comments && (
                                                        <div className="su-feed-comment-bubble">
                                                            <MessageSquare size={14} />
                                                            "{h.comments}"
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        {/* Skipped Workout Render */}
                                        {item.category === 'workout' && item.type === 'skipped' && (
                                            <div className="su-feed-badges">
                                                <span className="su-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                                                    <XCircle size={12} /> Missed Session
                                                </span>
                                            </div>
                                        )}

                                        {/* Message/Alert Render */}
                                        {item.category !== 'workout' && (
                                            <div className="su-feed-badges">
                                                <span className={`su-badge`} style={{
                                                    backgroundColor: item.category === 'alert' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                                                    color: item.category === 'alert' ? 'var(--warning)' : 'var(--primary)'
                                                }}>
                                                    {item.category === 'alert' ? <AlertTriangle size={12} /> : item.category === 'message' ? <MessageSquare size={12} /> : <UserPlus size={12} />}
                                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="su-empty-feed">
                                <p className="su-text-muted">{t('pro.dashboard.feed.empty')}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button
                                variant="secondary"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '0.5rem' }}
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <span className="su-text-muted" style={{ fontSize: '0.875rem' }}>
                                {t('pro.dashboard.feed.page')} {currentPage} {t('pro.dashboard.feed.of')} {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '0.5rem' }}
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary Area */}
                <div className="su-overview-sidebar" data-tour="pro-alerts">
                    <Card className="su-attention-card">
                        <h3 className="su-card-title">
                            <Bell size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            {t('pro.dashboard.alerts.title')}
                        </h3>
                        {alerts.length > 0 ? (
                            <ul className="su-alert-list">
                                {alerts.map(alert => (
                                    <li
                                        key={alert.id}
                                        className={`su-alert-status-${alert.iconColor || 'primary'}`}
                                        style={{ cursor: alert.link ? 'pointer' : 'default' }}
                                        onClick={() => {
                                            if (alert.link) {
                                                const state = { tab: 'plans' };
                                                if (alert.sessionId) {
                                                    state.highlightSessionId = alert.sessionId;
                                                }
                                                navigate(alert.link, { state });
                                            }
                                        }}
                                    >
                                        <strong>{alert.clientName || 'Client'} - {alert.title}:</strong> {alert.personalizedBody || alert.body}
                                        <div className="su-alert-time">{alert.time}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="su-text-muted" style={{ fontSize: '0.875rem' }}>
                                {t('pro.dashboard.alerts.empty')}
                            </p>
                        )}
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default DashboardProfessional;
