import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import { Search, Filter, MessageCircle, TrendingUp, MoreVertical, Edit3, Trash2, Calendar, CheckCircle, Activity, SkipForward, Play, Pause, DollarSign, X, Power, AlertCircle, PauseCircle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InviteClientModal from '../../components/InviteClientModal';
import ClientBillingModal from '../../components/ClientBillingModal';
import { addNotification } from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import './Clients.css';

// Initial state is empty
const initialClientsList = [];

const Clients = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [showInvite, setShowInvite] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientsLoaded, setClientsLoaded] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [clientToToggle, setClientToToggle] = useState(null);
    const [billingClient, setBillingClient] = useState(null);
    const [justInvitedClient, setJustInvitedClient] = useState(false);

    useEffect(() => {
        const fetchAndComputeClients = () => {
            let storedClients = localStorage.getItem('shapeup_clients');
            let clientsList = storedClients ? JSON.parse(storedClients) : [];

            // Compute real compliance for each client from their plan history
            const updatedList = clientsList.map(c => {
                const storedPlans = localStorage.getItem(`shapeup_client_plans_${c.id}`);
                let compliance = c.compliance; // fallback to mock
                let activePlanName = c.activePlan;

                if (storedPlans) {
                    const plans = JSON.parse(storedPlans);
                    if (plans.length > 0) {
                        activePlanName = plans.length === 1 ? plans[0].name : `${plans.length} Active Plans`;
                    }

                    const allHistory = plans.flatMap(p => p.history || []);
                    if (allHistory.length > 0) {
                        let totalEx = 0;
                        let skippedEx = 0;
                        allHistory.forEach(h => {
                            h.exercises.forEach(ex => {
                                totalEx++;
                                if (ex.skipped) skippedEx++;
                            });
                        });
                        compliance = totalEx === 0 ? 100 : Math.round(((totalEx - skippedEx) / totalEx) * 100);
                    } else if (plans.length > 0) {
                        compliance = 0; // Has plans but no history yet
                    }
                }

                let newStatus = c.status;
                if (c.status === 'Active' && compliance < 70) {
                    newStatus = 'Needs Attention';
                } else if (c.status === 'Needs Attention' && compliance >= 70) {
                    newStatus = 'Active';
                }

                return { ...c, compliance, activePlan: activePlanName, status: newStatus };
            });

            setClients(updatedList);
            setClientsLoaded(true);
        };

        fetchAndComputeClients();

        // Listen for updates from other tabs/components
        const handleClientsUpdated = () => fetchAndComputeClients();
        window.addEventListener('shapeup_clients_updated', handleClientsUpdated);
        
        return () => window.removeEventListener('shapeup_clients_updated', handleClientsUpdated);
    }, []);

    // ─── Tour Trigger ─────────────────────────────────────────────────
    useEffect(() => {
        if (!clientsLoaded) return; // Wait for initial data to be loaded
        const hasSeenTour = localStorage.getItem('shapeup_clients_tour_seen');
        if (!hasSeenTour) {
            // Base steps
            const tourSteps = [
                {
                    selector: '[data-tour="clients-header"]',
                    content: t('tour.clients.1'),
                },
                {
                    selector: '[data-tour="clients-invite-btn"]',
                    content: t('tour.clients.2'),
                },
                {
                    selector: '[data-tour="clients-toolbar"]',
                    content: t('tour.clients.3'),
                }
            ];

            // If we have clients, we can add steps pointing to the table rows
            if (clients.length > 0) {
                tourSteps.push({
                    selector: '[data-tour="clients-row"]:first-child',
                    content: t('tour.clients.4'),
                });
                tourSteps.push({
                    selector: '[data-tour="clients-actions"]:first-child',
                    content: t('tour.clients.5'),
                });
                tourSteps.push({
                    selector: '[data-tour="assign-billing-btn"]',
                    content: t('tour.clients.9') || 'Click here to assign or modify the billing plan for this client.',
                });
            } else {
                tourSteps.push({
                    selector: '.su-clients-table',
                    content: t('tour.clients.6'),
                });
            }

            setSteps(tourSteps);
            setCurrentStep(0);
            
            // Allow time for DOM parsing before opening
            setTimeout(() => {
                setIsOpen(true);
            }, 600); 

            localStorage.setItem('shapeup_clients_tour_seen', 'true');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setIsOpen, setSteps, setCurrentStep, clientsLoaded]);

    // ─── Post-Invite Tour Trigger ─────────────────────────────────────
    useEffect(() => {
        // Wait until the modal is closed and we have just invited someone
        if (justInvitedClient && !showInvite) {
            // Always show the post-invite tour on every fresh invite (it's contextual)
            const tourSteps = [
                {
                    selector: 'tr[data-tour="clients-row"]:last-child',
                    content: t('tour.clients.7'),
                },
                {
                    selector: 'tr:last-child [data-tour="clients-status"]',
                    content: t('tour.clients.8'),
                }
            ];
            
            // Wait for modal to fully disappear and DOM to update
            const t1 = setTimeout(() => {
                setSteps(tourSteps);
                setCurrentStep(0);
                setIsOpen(true);
            }, 800); 

            // Reset the flag to let UI settle
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

        setJustInvitedClient(true); // Flag that we just invited a client

        // Simulate client registration
        setTimeout(() => {
            addNotification('pro', 'system', 'New Client Registered', `${email} has accepted your invite and joined your roster.`, 'primary', {
                clientId: newClient.id,
                link: `/dashboard/clients/${newClient.id}`
            });

            // Optionally, we update the local storage to reflect 'Active' status to complete the illusion
            const refreshed = JSON.parse(localStorage.getItem('shapeup_clients') || '[]');
            const finalized = refreshed.map(c => c.id === newClient.id ? { ...c, status: 'Active' } : c);
            localStorage.setItem('shapeup_clients', JSON.stringify(finalized));

            // If the user is still on the Clients screen, trigger a re-render
            setClients(prev => prev.map(c => c.id === newClient.id ? { ...c, status: 'Active' } : c));
        }, 3000);
    };

    const handleRowClick = (id) => {
        navigate(`/dashboard/clients/${id}`);
    };

    const handleToggleStatusRequest = (e, client) => {
        e.stopPropagation();
        setClientToToggle(client);
    };

    const confirmToggleStatus = () => {
        if (!clientToToggle) return;
        const updated = clients.map(c => {
            if (c.id === clientToToggle.id) {
                let newStatus;
                if (clientToToggle.status === 'Inactive') {
                    // When reactivating, restore the correct status based on compliance
                    newStatus = c.compliance < 70 ? 'Needs Attention' : 'Active';
                } else {
                    newStatus = 'Inactive';
                }
                return { ...c, status: newStatus };
            }
            return c;
        });
        setClients(updated);
        localStorage.setItem('shapeup_clients', JSON.stringify(updated));
        setClientToToggle(null);
    };

    const handleDeleteClient = (client) => {
        setClientToDelete(client);
    };

    const confirmDeleteClient = () => {
        if (!clientToDelete) return;
        const updated = clients.filter(c => c.id !== clientToDelete.id);
        setClients(updated);
        localStorage.setItem('shapeup_clients', JSON.stringify(updated));
        setClientToDelete(null);
    };

    const handleSaveBilling = (billingData) => {
        if (!billingClient) return;
        const updated = clients.map(c => {
            if (c.id === billingClient.id) {
                return { ...c, ...billingData };
            }
            return c;
        });
        setClients(updated);
        localStorage.setItem('shapeup_clients', JSON.stringify(updated));
    };

    return (
        <div className="su-clients-dashboard">
            {showInvite && <InviteClientModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

            <ClientBillingModal
                isOpen={!!billingClient}
                client={billingClient}
                onClose={() => setBillingClient(null)}
                onSave={handleSaveBilling}
            />

            {/* Delete Confirmation Modal */}
            {clientToDelete && (
                <div className="su-modal-overlay" onClick={() => setClientToDelete(null)}>
                    <div className="su-modal-box su-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="su-confirm-icon">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="su-confirm-title">{t('clients.modal.delete.title')}</h3>
                        <p className="su-confirm-body">
                            <strong>"{clientToDelete.name}"</strong> {t('clients.modal.delete.body') || 'will be permanently removed from your client list. This action cannot be undone.'}
                        </p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setClientToDelete(null)}>
                                {t('clients.modal.delete.cancel')}
                            </Button>
                            <Button
                                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                                onClick={confirmDeleteClient}
                            >
                                {t('clients.modal.delete.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Toggle Confirmation Modal */}
            {clientToToggle && (
                <div className="su-modal-overlay" onClick={() => setClientToToggle(null)}>
                    <div className="su-modal-box su-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="su-confirm-icon" style={{ background: clientToToggle.status === 'Inactive' ? '#dcfce7' : '#fee2e2', color: clientToToggle.status === 'Inactive' ? '#166534' : '#991b1b' }}>
                            {clientToToggle.status === 'Inactive' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                        </div>
                        <h3 className="su-confirm-title">{clientToToggle.status === 'Inactive' ? t('clients.modal.toggle.title.act') : t('clients.modal.toggle.title.inact')}</h3>
                        <p className="su-confirm-body">
                            {clientToToggle.status === 'Inactive' 
                                ? t('clients.modal.toggle.body.act').replace('{{name}}', clientToToggle.name)
                                : t('clients.modal.toggle.body.inact').replace('{{name}}', clientToToggle.name)}
                        </p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setClientToToggle(null)}>
                                {t('clients.modal.toggle.cancel')}
                            </Button>
                            <Button
                                style={{ background: clientToToggle.status === 'Inactive' ? '#16a34a' : '#ef4444', borderColor: clientToToggle.status === 'Inactive' ? '#16a34a' : '#ef4444' }}
                                onClick={confirmToggleStatus}
                            >
                                {clientToToggle.status === 'Inactive' ? t('clients.modal.toggle.confirm.act') : t('clients.modal.toggle.confirm.inact')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="su-dashboard-header-flex" data-tour="clients-header">
                <div>
                    <h1 className="su-page-title">{t('clients.title')}</h1>
                    <p className="su-page-subtitle">{t('clients.subtitle')}</p>
                </div>
                <Button onClick={() => setShowInvite(true)} data-tour="clients-invite-btn">{t('clients.invite')}</Button>
            </div>

            <Card className="su-clients-container su-mt-4">
                {/* Toolbar */}
                <div className="su-clients-toolbar" data-tour="clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input type="text" placeholder={t('clients.search')} className="su-bare-input" />
                    </div>
                    <div className="su-toolbar-actions">
                        <Button variant="outline" icon={<Filter size={16} />}>{t('clients.filter')}</Button>
                    </div>
                </div>

                {/* Directory Table */}
                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>{t('clients.table.client')}</th>
                                <th>{t('clients.table.plan')}</th>
                                <th>{t('clients.table.compliance')}</th>
                                <th>{t('clients.table.checkin')}</th>
                                <th>{t('clients.table.status')}</th>
                                <th>{t('clients.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr
                                    key={client.id}
                                    className="su-clickable-row"
                                    onClick={() => handleRowClick(client.id)}
                                    data-tour="clients-row"
                                >
                                    {/* Client Name/Avatar */}
                                    <td>
                                        <div className="su-client-cell-user">
                                            <div className="su-client-avatar">
                                                {client.name.includes('@')
                                                    ? client.name.substring(0, 2).toUpperCase()
                                                    : client.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <span className="su-client-name">{client.name}</span>
                                        </div>
                                    </td>

                                    {/* Plan */}
                                    <td className="su-text-main">{client.activePlan}</td>

                                    {/* Compliance */}
                                    <td>
                                        <div className="su-compliance-bar-rail">
                                            <div
                                                className={`su-compliance-bar-fill ${client.compliance < 70 ? 'poor' : 'good'}`}
                                                style={{ width: `${client.compliance}%` }}
                                            ></div>
                                        </div>
                                        <span className="su-compliance-text">{client.compliance}%</span>
                                    </td>

                                    {/* Checkin */}
                                    <td className="su-text-muted">{client.lastCheckin}</td>

                                    {/* Status Badge */}
                                    <td data-tour="clients-status">
                                        <span className={`su-status-badge ${client.status.toLowerCase().replace(' ', '-')}`}>
                                            {client.status === 'Active' ? t('clients.status.active') :
                                                client.status === 'Needs Attention' ? t('clients.status.attention') :
                                                    client.status === 'Invited' ? t('clients.status.invited') :
                                                        client.status === 'Inactive' ? t('clients.status.inactive') : client.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <div className="su-table-actions" onClick={(e) => e.stopPropagation()} data-tour="clients-actions">

                                            {/* Activate / Deactivate Toggle */}
                                            <button
                                                className="su-icon-btn su-text-muted"
                                                title="Toggle Status"
                                                onClick={(e) => handleToggleStatusRequest(e, client)}
                                                data-tour="clients-actions"
                                            >
                                                {client.status === 'Inactive' ? <Power size={18} /> : <PauseCircle size={18} />}
                                            </button>

                                            {/* Billing Action */}
                                            <button className="su-icon-btn su-text-muted" title="Manage Billing" onClick={() => setBillingClient(client)}>
                                                <DollarSign size={16} />
                                            </button>

                                            {/* Delete Action (Warning Color) */}
                                            <button className="su-icon-btn" style={{ color: 'var(--error)' }} title="Delete Client" onClick={() => handleDeleteClient(client)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Clients;
