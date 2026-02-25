import React, { useState } from 'react';
import { Bell, User, Dumbbell } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import { useNotifications } from '../utils/notifications';
import './Header.css';

const Header = ({ isProfessional, profile, sessionTitle }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    // Provide 'pro' or the client's ID (mocked as '1' for now since we don't have a full auth context)
    const targetUserId = isProfessional ? 'pro' : '1';

    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(targetUserId);

    // Close notifications panel on toggle view
    React.useEffect(() => {
        setShowNotifications(false);
    }, [isProfessional]);

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
                            onMarkRead={markAsRead}
                            onMarkAllRead={markAllAsRead}
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
