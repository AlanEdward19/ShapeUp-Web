import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, Plus, UserPlus, FileEdit, Filter } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Clients.css';

const ClientsGym = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTrainer, setFilterTrainer] = useState('all');

    // Assume the current user is a trainer inside a gym or an admin.
    // For this mock, we act as an Admin, but we can have a logic variable.
    const isCurrentUserTrainer = localStorage.getItem('shapeup_role') === 'professional';

    const mockClients = [
        { id: 1, name: 'Marcos Gomes', email: 'marcos@example.com', plan: 'Hypertrophy Basics', linkedTrainer: 'Carlos Silva', status: 'Active' },
        { id: 2, name: 'Julia Reis', email: 'julia@example.com', plan: '-', linkedTrainer: null, status: 'Inactive' },
        { id: 3, name: 'Roberto Lima', email: 'beto@example.com', plan: 'CrossFit WOD Build', linkedTrainer: 'Amanda Souza', status: 'Active' },
        { id: 4, name: 'Ana Costa', email: 'ana@example.com', plan: '-', linkedTrainer: null, status: 'Active' },
    ];

    const filteredClients = mockClients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTrainer = filterTrainer === 'all' || 
            (filterTrainer === 'unlinked' && !client.linkedTrainer) || 
            (client.linkedTrainer === filterTrainer);
        return matchesSearch && matchesTrainer;
    });

    const handleStealClient = (clientName) => {
        alert(t('gym.clients.alert.steal')?.replace('{name}', clientName) || `Client ${clientName} successfully linked to you!`);
    };

    const handleAssignTrainer = (clientName) => {
        alert(t('gym.clients.alert.assign')?.replace('{name}', clientName) || `Opening modal to change trainer for ${clientName}...`);
    };

    return (
        <div className="su-clients-dashboard">
            <div className="su-dashboard-header-flex">
                <div>
                    <h1 className="su-page-title">{t('gym.clients.title') || 'Alunos da Academia'}</h1>
                    <p className="su-page-subtitle">{t('gym.clients.subtitle') || 'Monitoramento de todos os alunos matriculados neste estabelecimento.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>

                    {!isCurrentUserTrainer && (
                        <Button>
                            <Plus size={18} /> {t('gym.clients.btn.add') || 'Matricular Aluno'}
                        </Button>
                    )}
                </div>
            </div>

            <Card className="su-clients-container su-mt-4">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input
                            type="text"
                            placeholder={t('gym.clients.search') || 'Buscar aluno...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="su-bare-input"
                        />
                    </div>
                    <div className="su-toolbar-actions">
                        <div className="su-filter-select-wrapper">
                            <select
                                value={filterTrainer}
                                onChange={(e) => setFilterTrainer(e.target.value)}
                                ref={el => { if (el) el.style.setProperty('background-color', getComputedStyle(document.documentElement).getPropertyValue('--bg-input').trim()); }}
                            >
                                <option value="all">{t('gym.clients.filter.all') || 'All Trainers'}</option>
                                <option value="unlinked">{t('gym.clients.filter.unlinked') || 'No Linked Trainer'}</option>
                                <option value="Carlos Silva">Carlos Silva</option>
                                <option value="Amanda Souza">Amanda Souza</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="su-table-responsive">
                    <table className="su-clients-table">
                    <thead>
                        <tr>
                            <th>{t('clients.table.client') || 'Aluno'}</th>
                            <th>{t('gym.clients.table.trainer') || 'Prof. Vinculado'}</th>
                            <th>{t('clients.table.plan') || 'Plano Ativo'}</th>
                            <th>{t('clients.table.status') || 'Status'}</th>
                            <th className="text-right">{t('clients.table.actions') || 'Ações'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((client) => (
                            <tr key={client.id}>
                                <td>
                                    <div className="client-cell">
                                        <div className="client-avatar">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="client-name">{client.name}</div>
                                            <div className="client-email">{client.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {client.linkedTrainer ? (
                                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                            {client.linkedTrainer}
                                        </span>
                                    ) : (
                                        <span className="badge warning">{t('gym.clients.unlinked') || 'Sem vínculo'}</span>
                                    )}
                                </td>
                                <td>{client.plan}</td>
                                <td>
                                    <span className={`status-badge ${client.status.toLowerCase()}`}>
                                        {client.status === 'Active' ? (t('gym.clients.status.active') || 'Active') : (t('gym.clients.status.inactive') || 'Inactive')}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        {isCurrentUserTrainer ? (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleStealClient(client.name)}
                                                title={t('gym.clients.btn.steal') || 'Vincular a mim para editar treinos'}
                                            >
                                                <UserPlus size={16} /> {t('gym.clients.btn.steal_short') || 'Link to me'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleAssignTrainer(client.name)}
                                                title={t('gym.clients.btn.assign') || 'Alterar Professor'}
                                            >
                                                <FileEdit size={16} /> {t('gym.clients.btn.assign_short') || 'Change Trainer'}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                    {t('gym.clients.empty') || 'Nenhum aluno encontrado.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
    );
};

export default ClientsGym;
