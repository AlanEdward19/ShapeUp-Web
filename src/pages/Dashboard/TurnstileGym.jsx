import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Unlock, Power, PowerOff, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { addNotification } from '../../utils/notifications';
import './Clients.css'; // Reusing some base styles

const TurnstileGym = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Hardware Management State
    const [turnstiles, setTurnstiles] = useState([
        { id: 't1', name: 'Catraca Principal (Recepção)', status: 'active', hasError: false },
        { id: 't2', name: 'Catraca Musculação', status: 'inactive', hasError: false }
    ]);

    const [mockAccesses] = useState(() => Array.from({ length: 45 }).map((_, i) => {
        const h = String(Math.floor(Math.random() * 12) + 6).padStart(2, '0');
        const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const isTrainer = i % 5 === 0;
        const isBlocked = i % 7 === 0;
        return {
            id: i + 1,
            name: `Usuário Teste ${i + 1}`,
            time: `${h}:${m}`,
            status: isBlocked ? 'Blocked' : 'Allowed',
            type: isTrainer ? 'Trainer' : 'Client',
            reason: isBlocked ? 'Pagamento Atrasado' : undefined
        };
    }));

    const filteredAccess = mockAccesses.filter(access => 
        access.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredAccess.length / itemsPerPage);
    const paginatedAccess = filteredAccess.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Dynamic Metrics
    const activeDevices = turnstiles.filter(t => t.status === 'active' && !t.hasError).length;

    // Turnstile Management Functions
    const handleAddTurnstile = () => {
        const newId = `t${Date.now()}`;
        const newName = `${t('gym.turnstile.hardware.add') || 'Nova Catraca'} (${newId.slice(-4)})`;
        setTurnstiles([...turnstiles, { id: newId, name: newName, status: 'inactive', hasError: false }]);
        addNotification('gym', 'system', t('gym.turnstile.notification.new') || 'Nova catraca registrada no sistema. Por favor, configure os IPs de rede.', '/dashboard/turnstile');
    };

    const handleUnlock = (_id) => {
        // Mock unlock pulse
        alert(`BIP! Catraca liberada remotamente.`);
    };

    const toggleStatus = (id) => {
        setTurnstiles(turnstiles.map(t => {
            if (t.id === id) {
                return { ...t, status: t.status === 'active' ? 'inactive' : 'active', hasError: false };
            }
            return t;
        }));
    };

    const simulateError = (id) => {
        setTurnstiles(turnstiles.map(turnstile => {
            if (turnstile.id === id) {
                const isGettingError = !turnstile.hasError;
                if (isGettingError) {
                    const msgTemplate = t('gym.turnstile.notification.error') || `🚨 URGENTE: A {name} perdeu conexão ou requer manutenção física imediata!`;
                    addNotification('gym', 'system', msgTemplate.replace('{name}', turnstile.name), '/dashboard/turnstile');
                }
                return { ...turnstile, hasError: isGettingError };
            }
            return turnstile;
        }));
    };

    return (
        <div className="su-clients-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('gym.turnstile.title') || 'Catraca Integrada'}</h1>
                    <p className="su-page-subtitle">{t('gym.turnstile.subtitle') || 'Monitoramento de passagens em tempo real.'}</p>
                </div>
            </div>

            <div className="su-turnstile-layout">
                <div>
                    <div className="su-journal-kpis">
                        <div className="su-journal-kpi">
                            <span className="su-journal-kpi-label">{t('gym.turnstile.metric.today') || 'Acessos Hoje'}</span>
                            <span className="su-journal-kpi-value">342</span>
                        </div>
                        <div className="su-journal-kpi">
                            <span className="su-journal-kpi-label">{t('gym.turnstile.metric.blocked') || 'Bloqueados'}</span>
                            <span className="su-journal-kpi-value">12</span>
                        </div>
                        <div className="su-journal-kpi">
                            <span className="su-journal-kpi-label">{t('gym.turnstile.metric.active') || 'Catracas Ativas'}</span>
                            <span className="su-journal-kpi-value">{activeDevices}/{turnstiles.length}</span>
                        </div>
                        <div className="su-journal-kpi">
                            <span className="su-journal-kpi-label">{t('gym.turnstile.metric.peak') || 'Horário de Pico'}</span>
                            <span className="su-journal-kpi-value">18:00</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.75rem' }}>
                        <h2 className="su-journal-kicker">{t('gym.turnstile.history.title') || 'Histórico de Acessos'}</h2>
                        <p className="su-journal-lede">{t('gym.turnstile.history.subtitle') || 'Acompanhe as passagens na catraca em tempo real.'}</p>
                    </div>

                    <div className="su-clients-toolbar">
                        <div className="su-search-box" style={{ flex: 1, maxWidth: '100%' }}>
                            <Search size={16} className="su-text-muted" />
                            <input
                                type="text"
                                placeholder={t('gym.turnstile.search') || 'Buscar usuário...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="su-bare-input"
                            />
                        </div>
                    </div>

                    <Card className="su-clients-container">
                        <div className="su-table-responsive">
                            <table className="su-clients-table">
                                <thead>
                                    <tr>
                                        <th>{t('gym.turnstile.table.user') || 'Usuário'}</th>
                                        <th>{t('gym.turnstile.table.type') || 'Tipo'}</th>
                                        <th>{t('gym.turnstile.table.time') || 'Horário'}</th>
                                        <th>{t('gym.turnstile.table.status') || 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAccess.map((access) => (
                                        <tr key={access.id}>
                                            <td>
                                                <div className="client-cell">
                                                    <div className="client-avatar">
                                                        {access.name.charAt(0)}
                                                    </div>
                                                    <div className="client-name">{access.name}</div>
                                                </div>
                                            </td>
                                            <td>{access.type === 'Trainer' ? (t('gym.turnstile.table.type.trainer') || 'Treinador') : (t('gym.turnstile.table.type.client') || 'Cliente')}</td>
                                            <td className="su-text-muted">{access.time}</td>
                                            <td>
                                                {access.status === 'Allowed' ? (
                                                    <span className="su-status-badge active">{t('gym.turnstile.status.allowed') || 'Liberado'}</span>
                                                ) : (
                                                    <span className="su-status-badge inactive" title={access.reason}>{t('gym.turnstile.status.blocked') || 'Bloqueado'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedAccess.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                {t('gym.turnstile.table.empty') || 'Nenhum acesso encontrado.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="su-ledger-pager">
                                <button
                                    className="su-ledger-page"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`su-ledger-page ${page === currentPage ? 'is-current' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="su-ledger-page"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </Card>
                </div>

                <aside>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div>
                            <h2 className="su-journal-kicker">{t('gym.turnstile.hardware.title') || 'Gerenciador de Dispositivos'}</h2>
                            <p className="su-journal-lede">{t('gym.turnstile.hardware.subtitle') || 'Controle e adicione pontos de acesso.'}</p>
                        </div>
                        <Button onClick={handleAddTurnstile} style={{ padding: '0.5rem' }}>
                            <Plus size={18} />
                        </Button>
                    </div>

                    <div className="su-device-list">
                        {turnstiles.map(turnstile => (
                            <div key={turnstile.id} className={`su-device-entry ${turnstile.hasError ? 'is-error' : ''}`}>
                                {turnstile.hasError && (
                                    <div className="su-device-flag">{t('gym.turnstile.hardware.maintenance') || 'REQUER MANUTENÇÃO'}</div>
                                )}
                                <h3 className="su-device-name">{turnstile.name}</h3>
                                <p className="su-device-meta">
                                    {turnstile.hasError
                                        ? (t('gym.turnstile.hardware.error') || 'Erro de Hardware')
                                        : (turnstile.status === 'active' ? (t('gym.turnstile.hardware.online') || 'Online e Operante') : (t('gym.turnstile.hardware.offline') || 'Desativada'))}
                                </p>
                                <div className="su-device-actions">
                                    <Button
                                        variant={turnstile.status === 'active' && !turnstile.hasError ? "primary" : "outline"}
                                        onClick={() => handleUnlock(turnstile.id)}
                                        disabled={turnstile.status !== 'active' || turnstile.hasError}
                                    >
                                        <Unlock size={16} /> {t('gym.turnstile.hardware.unlock') || 'Liberar'}
                                    </Button>
                                    <Button variant="outline" onClick={() => toggleStatus(turnstile.id)}>
                                        {turnstile.status === 'active'
                                            ? <><PowerOff size={16} /> {t('gym.turnstile.hardware.disable') || 'Desativar'}</>
                                            : <><Power size={16} /> {t('gym.turnstile.hardware.enable') || 'Ativar'}</>}
                                    </Button>
                                </div>
                                <button
                                    type="button"
                                    className="su-dev-link"
                                    onClick={() => simulateError(turnstile.id)}
                                >
                                    {turnstile.hasError ? (t('gym.turnstile.hardware.resolve') || 'Resolver Erro (Dev)') : (t('gym.turnstile.hardware.simulate') || 'Simular Erro (Dev)')}
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TurnstileGym;
