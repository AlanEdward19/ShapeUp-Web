import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Header.css';
import { Menu, ChevronRight, Search, Plus, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isProfessional, isIndependent, isGym, sessionTitle, navigationOpen, onToggleNavigation }) => {
    const { pathname } = useLocation();
    const [query, setQuery] = useState('');
    const searchClients = (() => { try { return JSON.parse(localStorage.getItem('shapeup_clients') || '[]').filter(client => [client.name, client.objective, client.goal].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())).slice(0, 5); } catch { return []; } })();

    const { t, language } = useLanguage();

    const roleLabel = isProfessional
        ? t('header.role.pro')
        : (isGym
            ? t('header.role.gym')
            : (isIndependent ? t('header.role.independent') : t('header.role.client')));

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
            </div>
            </div>
        </header>
    );
};

export default Header;
