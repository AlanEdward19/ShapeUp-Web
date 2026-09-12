import React, { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';
import { useNotifications } from '../utils/notifications';
import { useLanguage } from '../contexts/LanguageContext';
import './Header.css';
import { Menu, Bell, ChevronRight, Search, Plus, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const initialsFrom = (name) => {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0) return 'SU';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const Header = ({ isProfessional, isIndependent, isGym, profile, sessionTitle, navigationOpen, onToggleNavigation }) => {
    const { pathname } = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [query, setQuery] = useState('');
    const searchClients = (() => { try { return JSON.parse(localStorage.getItem('shapeup_clients') || '[]').filter(client => [client.name, client.objective, client.goal].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())).slice(0, 5); } catch { return []; } })();

    // Provide 'pro' or the client's ID dynamically based on auth
    const storedClientId = String(localStorage.getItem('shapeup_client_id') || '1');
    const targetUserId = isProfessional ? 'pro' : (isGym ? 'gym' : storedClientId);

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(targetUserId);
    const { t, language } = useLanguage();

    // Close notifications panel on toggle view
    React.useEffect(() => {
        setShowNotifications(false);
    }, [isProfessional]);

    const roleLabel = isProfessional
        ? t('header.role.pro')
        : (isGym
            ? t('header.role.gym')
            : (isIndependent ? t('header.role.independent') : t('header.role.client')));

    const displayName = profile?.name || (isProfessional ? 'Coach Alex' : (isGym ? 'Gym Admin' : 'Jane Doe'));
    const section = pathname.split('/')[2] || 'dashboard';
    const sectionKeys = { dashboard: 'nav.dashboard', clients: 'nav.clients', training: 'nav.training_plans', exercises: 'nav.exercises_library', nutrition: 'nav.nutrition', settings: 'nav.settings', feedback: 'nav.feedback', messages: 'nav.feedback', reports: 'nav.reports', analytics: 'nav.analytics', financial: 'nav.financial', staff: 'nav.staff', objectives: 'nav.objectives', turnstile: 'nav.turnstile', admin: 'nav.food_moderation' };
    const sectionLabel = pathname.includes('/nutrition/diary') && language === 'pt-BR' ? 'Diário de nutrição' : section === 'messages' && language === 'pt-BR' ? 'Mensagens' : section === 'gyms' ? (language === 'pt-BR' ? 'Explorar academias' : 'Explore gyms') : section === 'onboarding' ? (language === 'pt-BR' ? 'Configuração inicial' : 'Initial setup') : t(sectionKeys[section] || 'nav.dashboard');

    return (
        <header className="su-header">
            <div className="su-header-inner">
            <div className="su-header-lede">
                <button className="su-navigation-toggle" onClick={onToggleNavigation} aria-label="Abrir menu" aria-expanded={navigationOpen} aria-controls="workspace-navigation"><Menu size={21} /></button>
                <p className="su-header-kicker">{roleLabel} <ChevronRight size={14} /> <strong>{sectionLabel}</strong></p>
                {sessionTitle && (
                    <p className="su-header-session-title">{sessionTitle}</p>
                )}
            </div>

            {(isProfessional || isGym) && <div className="su-header-search"><Search size={17} /><input aria-label="Buscar aluno" placeholder="Buscar aluno por nome ou objetivo..." value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(''); }} />{query && <div className="su-header-search-results">{searchClients.map(client => <Link key={client.id} to={`/dashboard/clients/${client.id}`} onClick={() => setQuery('')}>{client.name}<small>{client.activePlan}</small></Link>)}{!searchClients.length && <p>Nenhum aluno encontrado.</p>}</div>}</div>}
            <div className="su-header-actions">
                {isProfessional && <><Link to="/dashboard/clients" className="su-header-quick-action"><UserPlus size={16} /><span>Matricular aluno</span></Link><Link to="/dashboard/training" state={{ create: true }} className="su-header-quick-action is-primary"><Plus size={18} /><span>Novo treino</span></Link></>}
                <div className="su-notif-wrapper">
                    <button
                        className={`su-header-alerts ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(v => !v)}
                        aria-label={t('notif.panel.title')}
                    >
                        <Bell size={19} />
                        {unreadCount > 0 && (
                            <span className="su-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <NotificationsPanel
                            isProfessional={isProfessional}
                            notifications={notifications}
                            onMarkRead={markAsRead}
                            onMarkAllRead={markAllAsRead}
                            onClose={() => setShowNotifications(false)}
                        />
                    )}
                </div>

                <div className={`su-profile-menu ${isProfessional ? 'su-profile-menu-secondary' : ''}`}>
                    <div className="su-avatar" aria-hidden="true">
                        {profile?.avatar ? (
                            <img src={profile.avatar} alt="" className="su-avatar-img" />
                        ) : (
                            <span className="su-avatar-initials">{initialsFrom(displayName)}</span>
                        )}
                    </div>
                    <div className="su-profile-info">
                        <span className="su-profile-name">{displayName}</span>
                        <span className="su-profile-role">{roleLabel}</span>
                    </div>
                </div>
            </div>
            </div>
        </header>
    );
};

export default Header;
