import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Activity, UserCheck, Clock, Settings2, Unlock, Power, PowerOff, AlertTriangle, Plus, HardDrive, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
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

    const mockAccesses = Array.from({ length: 45 }).map((_, i) => {
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
    });

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

    const handleUnlock = (id) => {
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Main Content Column: Metrics + Access History */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="su-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <UserCheck size={24} color="var(--primary)" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {t('gym.turnstile.metric.today') || 'Acessos Hoje'}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>342</div>
                        </Card>
                        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Activity size={24} color="#ef4444" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {t('gym.turnstile.metric.blocked') || 'Bloqueados'}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>12</div>
                        </Card>
                        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <HardDrive size={24} color="#8b5cf6" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {t('gym.turnstile.metric.active') || 'Catracas Ativas'}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeDevices}/{turnstiles.length}</div>
                        </Card>
                        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <TrendingUp size={24} color="#10b981" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {t('gym.turnstile.metric.peak') || 'Horário de Pico'}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>18:00</div>
                        </Card>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} /> {t('gym.turnstile.history.title') || 'Histórico de Acessos'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {t('gym.turnstile.history.subtitle') || 'Acompanhe as passagens na catraca em tempo real.'}
                            </p>
                        </div>
                    </div>

                    <Card className="su-clients-container" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                        <div className="su-clients-toolbar" style={{ borderBottom: 'none', padding: '0', background: 'var(--bg-card)', borderRadius: '12px' }}>
                            <div className="su-search-box" style={{ flex: 1, maxWidth: '100%', border: '1px solid var(--border)' }}>
                                <Search size={18} className="su-text-muted" />
                                <input
                                    type="text"
                                    placeholder={t('gym.turnstile.search') || 'Buscar usuário...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="su-bare-input"
                                />
                            </div>
                        </div>
                    </Card>

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
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                                    <Clock size={16} /> {access.time}
                                                </div>
                                            </td>
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
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', borderTop: '1px solid var(--border)', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ 
                                        background: 'transparent', border: 'none', borderRadius: '8px', 
                                        padding: '0.5rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1,
                                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '8px',
                                            border: page === currentPage ? 'none' : '1px solid var(--border)',
                                            background: page === currentPage ? 'var(--primary)' : 'var(--bg-card-hover)',
                                            color: page === currentPage ? '#fff' : 'var(--text-main)',
                                            fontWeight: page === currentPage ? 600 : 400,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ 
                                        background: 'transparent', border: 'none', borderRadius: '8px', 
                                        padding: '0.5rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1,
                                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Hardware Management Sidebar */}
                <div style={{ flex: '1 1 350px', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings2 size={20} /> {t('gym.turnstile.hardware.title') || 'Gerenciador de Dispositivos'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {t('gym.turnstile.hardware.subtitle') || 'Controle e adicione pontos de acesso.'}
                            </p>
                        </div>
                        <Button onClick={handleAddTurnstile} style={{ padding: '0.5rem' }}>
                            <Plus size={18} />
                        </Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {turnstiles.map(turnstile => (
                            <Card key={turnstile.id} style={{ 
                                padding: '1.5rem', 
                                border: turnstile.hasError ? '1px solid #ef4444' : '1px solid var(--border)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {turnstile.hasError && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '0.25rem', background: '#ef4444', color: 'white', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                        <AlertTriangle size={14} /> {t('gym.turnstile.hardware.maintenance') || 'REQUER MANUTENÇÃO'}
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: turnstile.hasError ? '1rem' : '0' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{turnstile.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ 
                                                width: '8px', height: '8px', borderRadius: '50%', 
                                                background: turnstile.hasError ? '#ef4444' : (turnstile.status === 'active' ? 'var(--primary)' : 'var(--text-muted)') 
                                            }}></div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                {turnstile.hasError 
                                                    ? (t('gym.turnstile.hardware.error') || 'Erro de Hardware') 
                                                    : (turnstile.status === 'active' ? (t('gym.turnstile.hardware.online') || 'Online e Operante') : (t('gym.turnstile.hardware.offline') || 'Desativada'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <Button 
                                        variant={turnstile.status === 'active' && !turnstile.hasError ? "primary" : "outline"} 
                                        style={{ flex: 1, padding: '0.5rem', minWidth: '100px' }}
                                        onClick={() => handleUnlock(turnstile.id)}
                                        disabled={turnstile.status !== 'active' || turnstile.hasError}
                                    >
                                        <Unlock size={16} /> {t('gym.turnstile.hardware.unlock') || 'Liberar'}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline" 
                                        style={{ flex: 1, padding: '0.5rem', minWidth: '100px', color: turnstile.status === 'active' ? '#f59e0b' : 'var(--primary)', borderColor: turnstile.status === 'active' ? '#f59e0b' : 'var(--border)' }}
                                        onClick={() => toggleStatus(turnstile.id)}
                                    >
                                        {turnstile.status === 'active' 
                                            ? <><PowerOff size={16} /> {t('gym.turnstile.hardware.disable') || 'Desativar'}</> 
                                            : <><Power size={16} /> {t('gym.turnstile.hardware.enable') || 'Ativar'}</>}
                                    </Button>
                                </div>

                                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '1rem', paddingTop: '1rem', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => simulateError(turnstile.id)}
                                        style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {turnstile.hasError ? (t('gym.turnstile.hardware.resolve') || 'Resolver Erro (Dev)') : (t('gym.turnstile.hardware.simulate') || 'Simular Erro (Dev)')}
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TurnstileGym;
