import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, X, MessageSquare, TrendingUp, AlertTriangle, Dumbbell, CreditCard, Bell, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './NotificationsPanel.css';

const getIcon = (type) => {
    switch (type) {
        case 'message':
            return <MessageSquare size={18} />;
        case 'alert':
            return <AlertTriangle size={18} />;
        case 'system':
            return <UserPlus size={18} />;
        case 'workout':
            return <Dumbbell size={18} />;
        case 'pr':
            return <TrendingUp size={18} />;
        case 'billing':
            return <CreditCard size={18} />;
        default:
            return <Bell size={18} />;
    }
};

const NotificationsPanel = ({ isProfessional, notifications, onMarkRead, onMarkAllRead, onClose }) => {
    const panelRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (n) => {
        onMarkRead(n.id);

        if (n.type === 'message' && !isProfessional) {
            // Client message notification clicked -> Trigger global chat drawer open
            window.dispatchEvent(new Event('open_client_chat'));
        } else if (n.link) {
            navigate(n.link, { state: n.state });
        }

        onClose();
    };

    return (
        <div className="su-notif-panel" ref={panelRef}>
            <div className="su-notif-header">
                <div className="su-notif-header-left">
                    <h3>{t('notif.panel.title')}</h3>
                    {unreadCount > 0 && (
                        <span className="su-notif-count-badge">{unreadCount} {t('notif.panel.new')}</span>
                    )}
                </div>
                <div className="su-notif-header-actions">
                    {unreadCount > 0 && (
                        <button className="su-notif-mark-all" onClick={onMarkAllRead} title="Mark all as read">
                            <CheckCheck size={16} /> {t('notif.panel.mark_read')}
                        </button>
                    )}
                    <button className="su-notif-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="su-notif-list">
                {notifications.length === 0 ? (
                    <div className="su-notif-empty">
                        <Bell size={32} className="su-notif-empty-icon" />
                        <p>{t('notif.panel.empty')}</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <button
                            key={n.id}
                            className={`su-notif-item ${n.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(n)}
                        >
                            <div className={`su-notif-icon ${n.iconColor || 'primary'}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="su-notif-body">
                                <span className="su-notif-title">{n.title}</span>
                                <span className="su-notif-text">{n.body}</span>
                                <span className="su-notif-time">{n.time}</span>
                            </div>
                            {!n.read && <span className="su-notif-dot" />}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
