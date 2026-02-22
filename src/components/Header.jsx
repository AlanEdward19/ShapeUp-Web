import React, { useState } from 'react';
import { Bell, User, Dumbbell } from 'lucide-react';
import NotificationsPanel, { proNotifications, clientNotifications } from './NotificationsPanel';
import './Header.css';

const Header = ({ isProfessional, profile, sessionTitle }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    const seedData = isProfessional ? proNotifications : clientNotifications;
    const [notifications, setNotifications] = useState(seedData);

    // Update notifications when view switches
    React.useEffect(() => {
        setNotifications(isProfessional ? proNotifications : clientNotifications);
        setShowNotifications(false);
    }, [isProfessional]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="su-header">
            {/* Left area: session title when active, otherwise empty */}
            {sessionTitle ? (
                <div className="su-header-session">
                    <Dumbbell size={16} className="su-header-session-icon" />
                    <span className="su-header-session-title">{sessionTitle}</span>
                </div>
            ) : <div />}

            <div className="su-header-actions">
                {/* Bell + Notifications Panel */}
                <div className="su-notif-wrapper">
                    <button
                        className={`su-icon-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(v => !v)}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="su-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <NotificationsPanel
                            isProfessional={isProfessional}
                            notifications={notifications}
                            onMarkRead={handleMarkRead}
                            onMarkAllRead={handleMarkAllRead}
                            onClose={() => setShowNotifications(false)}
                        />
                    )}
                </div>

                <div className="su-profile-menu">
                    <div className="su-avatar">
                        {profile?.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="su-avatar-img" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div className="su-profile-info">
                        <span className="su-profile-name">{profile?.name || (isProfessional ? 'Coach Alex' : 'Jane Doe')}</span>
                        <span className="su-profile-role">{isProfessional ? 'Professional' : 'Client'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
