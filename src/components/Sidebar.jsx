import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ChatDrawer from './ChatDrawer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';
import Logo from './Logo/Logo';
import useDialogFocus from '../hooks/useDialogFocus';
import { LayoutDashboard, Users, Dumbbell, Library, ChartNoAxesCombined, MessageSquare, Settings, Utensils, Target, ShieldCheck, SlidersHorizontal, Building2, Wallet, ScanLine, LogOut, X } from 'lucide-react';

const navIcons = { dashboard: LayoutDashboard, clients: Users, training: Dumbbell, exercises: Library, reports: ChartNoAxesCombined, feedback: MessageSquare, analytics: ChartNoAxesCombined, settings: Settings, nutrition: Utensils, objectives: Target, admin: ShieldCheck, staff: Users, turnstile: ScanLine, financial: Wallet, gyms: Building2, messages: MessageSquare };

const Sidebar = ({ isProfessional, isIndependent, isGym, isOpen, onClose, profile }) => {
    const navigationRef = useDialogFocus(isOpen, onClose);
    const [showContactModal, setShowContactModal] = useState(false);
    const navigate = useNavigate();
    const { signOut } = useAuth();

    React.useEffect(() => {
        const handleOpenChat = () => setShowContactModal(true);
        window.addEventListener('open_client_chat', handleOpenChat);
        return () => window.removeEventListener('open_client_chat', handleOpenChat);
    }, []);

    const { t, language } = useLanguage();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error("Logout falhou no Sidebar:", error);
        }
    };

    // Navigation structure switches based on context
    const proNavItems = [
        { name: language === 'pt-BR' ? 'Painel do Treinador' : t('nav.dashboard'), path: '/dashboard' },
        { name: language === 'pt-BR' ? 'Meus Alunos' : t('nav.clients'), path: '/dashboard/clients' },
        { name: language === 'pt-BR' ? 'Criador & Periodização' : t('nav.training_plans'), path: '/dashboard/training' },
        { name: t('nav.exercises_library'), path: '/dashboard/exercises' },
        { name: t('nav.nutrition'), path: '/dashboard/nutrition/diary' },
        { name: t('nav.reports'), path: '/dashboard/reports' },
        { name: language === 'pt-BR' ? 'Mensagens & Consultoria' : t('nav.feedback'), path: '/dashboard/feedback' },
        { name: t('nav.analytics'), path: '/dashboard/analytics' },
        { name: t('nav.settings'), path: '/dashboard/settings' },
    ];

    const clientNavItems = [
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.my_training'), path: '/dashboard/training' },
        { name: t('nav.nutrition'), path: '/dashboard/nutrition/diary' },
        { name: t('nav.objectives'), path: '/dashboard/objectives' },
        { name: t('sidebar.chat'), path: '/dashboard/messages' },
        { name: t('nav.settings'), path: '/dashboard/settings' },
    ];

    const independentNavItems = [
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.training_plans'), path: '/dashboard/training' },
        { name: t('nav.exercises_library'), path: '/dashboard/exercises' },
        { name: t('nav.nutrition'), path: '/dashboard/nutrition/diary' },
        { name: t('nav.objectives'), path: '/dashboard/objectives' },
        { name: t('nav.settings'), path: '/dashboard/settings' },
    ];

    const adminNavItems = [
        { name: language === 'pt-BR' ? 'Moderação de alimentos' : 'Food moderation', path: '/dashboard/admin/food-moderation' },
        { name: language === 'pt-BR' ? 'Recursos da plataforma' : 'Platform features', path: '/dashboard/admin/feature-flags' },
    ];

    const gymNavItems = [
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.staff'), path: '/dashboard/staff' },
        { name: t('nav.clients'), path: '/dashboard/clients' },
        { name: t('nav.turnstile'), path: '/dashboard/turnstile' },
        { name: t('nav.financial'), path: '/dashboard/financial' },
        { name: t('nav.settings'), path: '/dashboard/settings' },
    ];

    const isPlatformAdmin = localStorage.getItem('shapeup_platform_admin') === 'true';
    const baseNavItems = isGym ? gymNavItems : (isProfessional ? proNavItems : (isIndependent ? independentNavItems : clientNavItems));
    if (!isGym && !isProfessional) baseNavItems.splice(3, 0, { name: language === 'pt-BR' ? 'Explorar academias' : 'Explore gyms', path: '/dashboard/gyms' });
    const navItems = isPlatformAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

    return (
        <aside ref={navigationRef} className={`su-sidebar ${isOpen ? 'is-open' : ''}`} id="workspace-navigation">
            <div className="su-sidebar-header">
                <div className="su-sidebar-logo">
                    <Logo className="su-sidebar-logo-img" />
                    <span className="su-sidebar-logo-text">ShapeUp</span>
                </div>
                <span className="su-sidebar-issue">{isGym ? 'Gestão' : isProfessional ? 'Coach Pro' : 'Atleta'}</span>
                <button className="su-sidebar-close" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
            </div>

            <nav className="su-sidebar-nav" aria-label="Primary">
                <p className="su-nav-group-label">{isProfessional || isGym ? 'Gestão atlética' : 'Minha rotina'}</p>
                <ol>
                    {navItems.map((item, index) => {
                        const Icon = navIcons[item.path.split('/')[2] || 'dashboard'] || SlidersHorizontal;
                        return (
                        <li key={item.path} style={{ '--i': index }}>
                            {((isProfessional && item.path === "/dashboard/reports") || item.path === "/dashboard/admin/food-moderation") && <p className="su-nav-group-label su-nav-secondary-label">{item.path.includes("admin") ? "Administração" : "Atendimento & sistema"}</p>}
                            <NavLink
                                to={item.path}
                                end={item.path === '/dashboard'}
                                onClick={onClose}
                                title={item.name}
                                data-tour={item.path.endsWith('/clients') ? 'nav-clients' : undefined}
                                className={({ isActive }) => `su-nav-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="su-nav-index" aria-hidden="true">
                                    <Icon size={19} strokeWidth={1.7} />
                                </span>
                                <span className="su-nav-label">{item.name}</span>
                            </NavLink>
                        </li>
                    ); })}
                </ol>
            </nav>

            <div className="su-sidebar-footer">
                <NavLink to="/dashboard/onboarding" className="su-setup-link" onClick={onClose} title={language === 'pt-BR' ? 'Configuração inicial' : 'Initial setup'}><SlidersHorizontal size={16} /><span>{language === 'pt-BR' ? 'Configuração inicial' : 'Initial setup'}</span></NavLink>
                <div className="su-sidebar-profile"><span className="su-avatar">{(profile?.name || 'SU').split(' ').slice(0, 2).map(part => part[0]).join('')}</span><div><strong>{profile?.name || 'ShapeUp'}</strong><small>{isProfessional ? t('header.role.pro') : isGym ? t('header.role.gym') : t('header.role.client')}</small></div></div>
                {!isProfessional && !isIndependent && !isGym && (
                    <button className="su-contact-coach-btn" onClick={() => setShowContactModal(true)}>
                        {t('sidebar.chat')}
                    </button>
                )}
                <button
                    className="su-logout-btn"
                    title={t('sidebar.logout')}
                    onClick={handleLogout}
                >
                    <LogOut size={16} /> {t('sidebar.logout')}
                </button>
            </div>

            <ChatDrawer isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </aside>
    );
};

export default Sidebar;
