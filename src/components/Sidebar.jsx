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
import './Sidebar.css';
import logo from '../assets/logo.png';

const Sidebar = ({ isProfessional }) => {
    const [showContactModal, setShowContactModal] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleOpenChat = () => setShowContactModal(true);
        window.addEventListener('open_client_chat', handleOpenChat);
        return () => window.removeEventListener('open_client_chat', handleOpenChat);
    }, []);

    // Navigation structure switches based on context
    const proNavItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Clients', icon: <Users size={20} />, path: '/dashboard/clients' },
        { name: 'Training Plans', icon: <Dumbbell size={20} />, path: '/dashboard/training' },
        { name: 'Exercises Library', icon: <LibrarySquare size={20} />, path: '/dashboard/exercises' },
        { name: 'Reports', icon: <FileBarChart size={20} />, path: '/dashboard/reports' },
        { name: 'Feedback', icon: <MessageSquare size={20} />, path: '/dashboard/feedback' },
        { name: 'Analytics', icon: <LineChart size={20} />, path: '/dashboard/analytics' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ];

    const clientNavItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'My Training', icon: <Activity size={20} />, path: '/dashboard/training' },
        { name: 'Objectives', icon: <Target size={20} />, path: '/dashboard/objectives' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ];

    const navItems = isProfessional ? proNavItems : clientNavItems;

    return (
        <aside className="su-sidebar">
            <div className="su-sidebar-header">
                <div className="su-sidebar-logo">
                    <img src={logo} alt="ShapeUp Logo" className="su-sidebar-logo-img" />
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
                {!isProfessional && (
                    <button className="su-contact-coach-btn" onClick={() => setShowContactModal(true)}>
                        <MessageCircle size={18} />
                        <span>Chat with Coach</span>
                    </button>
                )}
                <button
                    className="su-logout-btn"
                    onClick={() => navigate('/')}
                >
                    <LogOut size={18} />
                    <span>Log out</span>
                </button>
            </div>

            <ChatDrawer isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
        </aside>
    );
};

export default Sidebar;
