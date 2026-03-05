import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@reactour/tour';
import { Search, Filter, MessageSquare, ExternalLink, Play, Pause, Trash2, DollarSign } from 'lucide-react';
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
    const { setIsOpen, setSteps } = useTour();
    const [showInvite, setShowInvite] = useState(false);
    const [clients, setClients] = useState([]);
    const [clientsLoaded, setClientsLoaded] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
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
                    content: 'Nesta tela você gerencia toda a sua carteira de clientes, acompanhando status e acesso aos detalhes de cada um.',
                },
                {
                    selector: '[data-tour="clients-invite-btn"]',
                    content: 'Você sempre pode convidar um novo aluno clicando aqui.',
                },
                {
                    selector: '[data-tour="clients-toolbar"]',
                    content: 'Use a barra de pesquisa para buscar pelo nome, e o filtro para exibir clientes por status (Ativos, Inativos, etc).',
                }
            ];

            // If we have clients, we can add steps pointing to the table rows
            if (clients.length > 0) {
                tourSteps.push({
                    selector: '[data-tour="clients-row"]:first-child',
                    content: 'Clique em qualquer lugar da linha para abrir o perfil detalhado do cliente.',
                });
                tourSteps.push({
                    selector: '[data-tour="clients-actions"]:first-child',
                    content: 'Aqui você tem atalhos rápidos: suspender acesso temporariamente (pausar), gerenciar faturamento, ou excluir o cliente.',
                });
            } else {
                tourSteps.push({
                    selector: '.su-clients-table',
                    content: 'Seus clientes cadastrados aparecerão aqui nesta tabela em formato de lista.',
                });
            }

            setSteps(tourSteps);
            setTimeout(() => {
                setIsOpen(true);
            }, 600); // Slight delay for render

            localStorage.setItem('shapeup_clients_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps, clients.length, clientsLoaded]); // Depend on clients.length so we capture the first load of data

    // ─── Post-Invite Tour Trigger ─────────────────────────────────────
    useEffect(() => {
        // Wait until the modal is closed and we have just invited someone
        if (justInvitedClient && !showInvite) {
            const hasSeenPostInviteTour = localStorage.getItem('shapeup_clients_post_invite_tour_seen');
            if (!hasSeenPostInviteTour) {
                const tourSteps = [
                    {
                        selector: '[data-tour="clients-row"]:last-child',
                        content: 'Pronto! Seu novo convite foi enviado. Observe que o novo cliente já aparece na sua lista, inicialmente com o status de "Convidado".',
                    },
                    {
                        selector: '[data-tour="clients-actions"]:last-child',
                        content: 'Assim que ele criar a conta com o e-mail convidado, seu status mudará para "Ativo" e a assiduidade e o último check-in começarão a ser rastreados automaticamente!',
                    }
                ];
                setSteps(tourSteps);
                setTimeout(() => {
                    setIsOpen(true);
                }, 1000); // 1000ms delay to wait for modal fade out

                localStorage.setItem('shapeup_clients_post_invite_tour_seen', 'true');
            }

            // Wait slightly before resetting the flag to let the UI settle
            setTimeout(() => {
                setJustInvitedClient(false);
            }, 2000);
        }
    }, [justInvitedClient, showInvite, setIsOpen, setSteps]);


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
                                    <td>
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
