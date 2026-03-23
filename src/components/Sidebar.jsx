import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    LibrarySquare,
    FileBarChart,
    LineChart,
    Settings,
    Activity,
    MessageCircle,
    MessageSquare,
    LogOut,
    Target
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import ChatDrawer from './ChatDrawer';
import { useLanguage } from '../contexts/LanguageContext';
import './Sidebar.css';
import Logo from './Logo/Logo';

const Sidebar = ({ isProfessional, isIndependent }) => {
    const [showContactModal, setShowContactModal] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleOpenChat = () => setShowContactModal(true);
        window.addEventListener('open_client_chat', handleOpenChat);
        return () => window.removeEventListener('open_client_chat', handleOpenChat);
    }, []);

    const { t } = useLanguage();

    // Navigation structure switches based on context
    const proNavItems = [
        { name: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: t('nav.clients'), icon: <Users size={20} />, path: '/dashboard/clients' },
        { name: t('nav.training_plans'), icon: <Dumbbell size={20} />, path: '/dashboard/training' },
        { name: t('nav.exercises_library'), icon: <LibrarySquare size={20} />, path: '/dashboard/exercises' },
        { name: t('nav.reports'), icon: <FileBarChart size={20} />, path: '/dashboard/reports' },
        { name: t('nav.feedback'), icon: <MessageSquare size={20} />, path: '/dashboard/feedback' },
        { name: t('nav.analytics'), icon: <LineChart size={20} />, path: '/dashboard/analytics' },
        { name: t('nav.settings'), icon: <Settings size={20} />, path: '/dashboard/settings' },
    ];

    const clientNavItems = [
        { name: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: t('nav.my_training'), icon: <Activity size={20} />, path: '/dashboard/training' },
        { name: t('nav.objectives'), icon: <Target size={20} />, path: '/dashboard/objectives' },
        { name: t('nav.settings'), icon: <Settings size={20} />, path: '/dashboard/settings' },
    ];

    const independentNavItems = [
        { name: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: t('nav.training_plans'), icon: <Dumbbell size={20} />, path: '/dashboard/training' },
        { name: t('nav.exercises_library'), icon: <LibrarySquare size={20} />, path: '/dashboard/exercises' },
        { name: t('nav.objectives'), icon: <Target size={20} />, path: '/dashboard/objectives' },
        { name: t('nav.settings'), icon: <Settings size={20} />, path: '/dashboard/settings' },
    ];

    const navItems = isProfessional ? proNavItems : (isIndependent ? independentNavItems : clientNavItems);

    return (
        <aside className="su-sidebar">
            <div className="su-sidebar-header">
                <div className="su-sidebar-logo">
                    <Logo className="su-sidebar-logo-img" />
                    <span className="su-sidebar-logo-text">ShapeUp</span>
                </div>
            </div>

            <nav className="su-sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) => `su-nav-link ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="su-sidebar-footer">
                {!isProfessional && !isIndependent && (
                    <button className="su-contact-coach-btn" onClick={() => setShowContactModal(true)}>
                        <MessageCircle size={18} />
                        <span>{t('sidebar.chat')}</span>
                    </button>
                )}
                <button
                    className="su-logout-btn"
                    onClick={() => navigate('/')}
                >
                    <LogOut size={18} />
                    <span>{t('sidebar.logout')}</span>
                </button>
            </div>

            <ChatDrawer isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </aside>
    );
};

export default Sidebar;
