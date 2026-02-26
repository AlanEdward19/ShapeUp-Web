import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, ExternalLink, Play, Pause, Trash2, DollarSign } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InviteClientModal from '../../components/InviteClientModal';
import ClientBillingModal from '../../components/ClientBillingModal';
import { addNotification } from '../../utils/notifications';
import './Clients.css';

// Initial state is empty
const initialClientsList = [];

const Clients = () => {
    const navigate = useNavigate();
    const [showInvite, setShowInvite] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [billingClient, setBillingClient] = useState(null);

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
        };

        fetchAndComputeClients();
    }, []);

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
        localStorage.setItem('shapeup_clients', JSON.stringify(updated));

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

    const handleToggleStatus = (id, currentStatus) => {
        const updated = clients.map(c => {
            if (c.id === id) {
                let newStatus;
                if (currentStatus === 'Inactive') {
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
                        <h3 className="su-confirm-title">Delete Client?</h3>
                        <p className="su-confirm-body">
                            <strong>"{clientToDelete.name}"</strong> will be permanently removed from your client list. This action cannot be undone.
                        </p>
                        <div className="su-confirm-actions">
                            <Button variant="outline" onClick={() => setClientToDelete(null)}>
                                Cancel
                            </Button>
                            <Button
                                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                                onClick={confirmDeleteClient}
                            >
                                Delete Client
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">Client Management</h1>
                    <p className="su-page-subtitle">Directory of your {clients.length} active and inactive trainees.</p>
                </div>
                <Button onClick={() => setShowInvite(true)}>Invite New Client</Button>
            </div>

            <Card className="su-clients-container su-mt-4">
                {/* Toolbar */}
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input type="text" placeholder="Search clients..." className="su-bare-input" />
                    </div>
                    <div className="su-toolbar-actions">
                        <Button variant="outline" icon={<Filter size={16} />}>Filter</Button>
                    </div>
                </div>

                {/* Directory Table */}
                <div className="su-table-responsive">
                    <table className="su-clients-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Active Plan</th>
                                <th>Compliance</th>
                                <th>Last Check-in</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr
                                    key={client.id}
                                    className="su-clickable-row"
                                    onClick={() => handleRowClick(client.id)}
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
                                    <td>
                                        <span className={`su-status-badge ${client.status.toLowerCase().replace(' ', '-')}`}>
                                            {client.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <div className="su-table-actions" onClick={(e) => e.stopPropagation()}>

                                            {/* Activate / Deactivate Toggle */}
                                            {client.status === 'Inactive' ? (
                                                <button className="su-icon-btn su-text-muted" title="Activate Client" onClick={() => handleToggleStatus(client.id, client.status)}>
                                                    <Play size={16} />
                                                </button>
                                            ) : (
                                                <button className="su-icon-btn su-text-muted" title="Deactivate Client" onClick={() => handleToggleStatus(client.id, client.status)}>
                                                    <Pause size={16} />
                                                </button>
                                            )}

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
