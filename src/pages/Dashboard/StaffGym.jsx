import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTour } from '@reactour/tour';
import { Search, Plus, MoreVertical, Shield, Dumbbell } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Clients.css'; // Reuse table styles

const StaffGym = () => {
    const { t } = useLanguage();
    const { setIsOpen, setSteps } = useTour();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('shapeup_gym_staff_tour_seen');
        if (!hasSeenTour) {
            setSteps([
                {
                    selector: '.gym-staff-header',
                    content: t('tour.gym_staff.1') || 'Bem-vindo à Gestão de Equipe. Aqui você controla todos os administradores e treinadores da sua academia.',
                },
                {
                    selector: '.gym-staff-add-btn',
                    content: t('tour.gym_staff.2') || 'Clique aqui para convidar um novo membro para sua equipe.',
                },
                {
                    selector: '.gym-staff-table',
                    content: t('tour.gym_staff.3') || 'Na tabela, você acompanha quantos alunos cada treinador tem vinculado a ele no momento.',
                }
            ]);
            setIsOpen(true);
            localStorage.setItem('shapeup_gym_staff_tour_seen', 'true');
        }
    }, [setIsOpen, setSteps, t]);

    // Mock data
    const mockStaff = [
        { id: 1, name: 'Alan Edward', email: 'alan@shapeup.com', role: 'admin', status: 'Active', clientsCount: '-' },
        { id: 2, name: 'Carlos Silva', email: 'carlos@shapeup.com', role: 'trainer', status: 'Active', clientsCount: 42 },
        { id: 3, name: 'Amanda Souza', email: 'amanda@shapeup.com', role: 'trainer', status: 'Active', clientsCount: 15 },
        { id: 4, name: 'Beto Fitness', email: 'beto@shapeup.com', role: 'trainer', status: 'Invited', clientsCount: 0 },
    ];

    const filteredStaff = mockStaff.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || staff.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="su-clients-dashboard">
            <div className="su-dashboard-header-flex gym-staff-header">
                <div>
                    <h1 className="su-page-title">{t('gym.staff.title') || 'Gestão de Equipe'}</h1>
                    <p className="su-page-subtitle">{t('gym.staff.subtitle') || 'Administradores e Treinadores da sua academia.'}</p>
                </div>
                <Button className="gym-staff-add-btn">
                    <Plus size={18} /> {t('gym.staff.btn.add') || 'Adicionar Membro'}
                </Button>
            </div>

            <Card className="su-clients-container su-mt-4">
                <div className="su-clients-toolbar">
                    <div className="su-search-box">
                        <Search size={18} className="su-text-muted" />
                        <input
                            type="text"
                            placeholder={t('gym.staff.search') || 'Buscar equipe...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="su-bare-input"
                        />
                    </div>
                    <div className="su-toolbar-actions">
                        <div className="su-filter-select-wrapper">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                ref={el => { if (el) el.style.setProperty('background-color', getComputedStyle(document.documentElement).getPropertyValue('--bg-input').trim()); }}
                            >
                                <option value="all">{t('gym.staff.filter.all') || 'All Roles'}</option>
                                <option value="admin">{t('gym.staff.filter.admin') || 'Administrators'}</option>
                                <option value="trainer">{t('gym.staff.filter.trainer') || 'Trainers'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="su-table-responsive gym-staff-table">
                    <table className="su-clients-table">
                    <thead>
                        <tr>
                            <th>{t('gym.staff.table.member') || 'Membro'}</th>
                            <th>{t('gym.staff.table.role') || 'Cargo'}</th>
                            <th>{t('gym.staff.table.clients') || 'Alunos Vinculados'}</th>
                            <th>{t('gym.staff.table.status') || 'Status'}</th>
                            <th className="text-right">{t('gym.staff.table.actions') || 'Ações'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map((staff) => (
                            <tr key={staff.id}>
                                <td>
                                    <div className="client-cell">
                                        <div className="client-avatar">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="client-name">{staff.name}</div>
                                            <div className="client-email">{staff.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {staff.role === 'admin' ? <Shield size={16} color="var(--primary)" /> : <Dumbbell size={16} color="#8b5cf6" />}
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {staff.role === 'admin' ? (t('gym.staff.role.admin') || 'Admin') : (t('gym.staff.role.trainer') || 'Treinador')}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge neutral">{staff.clientsCount}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${staff.status.toLowerCase()}`}>
                                        {staff.status === 'Active' ? (t('gym.staff.status.active') || 'Active') : (t('gym.staff.status.pending') || 'Pending')}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="su-table-actions" style={{ justifyContent: 'flex-end' }}>
                                        <button className="su-icon-btn su-text-muted"><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStaff.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                    {t('gym.staff.empty') || 'Nenhum membro encontrado.'}
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

export default StaffGym;
