import React, { useEffect, useRef } from 'react';
import { CheckCheck, X, MessageSquare, TrendingUp, AlertTriangle, Dumbbell, CreditCard, Bell } from 'lucide-react';
import './NotificationsPanel.css';

const proNotifications = [
    {
        id: 1,
        icon: <AlertTriangle size={18} />,
        iconColor: 'warning',
        title: 'Client Needs Attention',
        body: 'Sarah J. missed 2 consecutive sessions this week.',
        time: '2h ago',
        read: false,
    },
    {
        id: 2,
        icon: <MessageSquare size={18} />,
        iconColor: 'primary',
        title: 'New Feedback from Mike K.',
        body: 'Felt a pinch on split squats, RPE was higher than usual.',
        time: '4h ago',
        read: false,
    },
    {
        id: 3,
        icon: <TrendingUp size={18} />,
        iconColor: 'success',
        title: 'New PR Logged',
        body: 'David R. set a new PR on Bench Press — 100kg × 5.',
        time: 'Yesterday',
        read: false,
    },
    {
        id: 4,
        icon: <CreditCard size={18} />,
        iconColor: 'muted',
        title: 'Subscription Renewal',
        body: 'Your Professional plan renews in 7 days.',
        time: '2 days ago',
        read: true,
    },
];

const clientNotifications = [
    {
        id: 1,
        icon: <Dumbbell size={18} />,
        iconColor: 'primary',
        title: 'New Workout Assigned',
        body: 'Coach Alex assigned you a new plan: Lower Body Strength Phase 2.',
        time: '1h ago',
        read: false,
    },
    {
        id: 2,
        icon: <MessageSquare size={18} />,
        iconColor: 'success',
        title: 'Message from Coach Alex',
        body: 'Great session yesterday! Let\'s push harder on legs this week.',
        time: '3h ago',
        read: false,
    },
    {
        id: 3,
        icon: <TrendingUp size={18} />,
        iconColor: 'success',
        title: 'You hit a new PR!',
        body: 'Squat: 120kg × 3 — your strongest lift yet! 🎉',
        time: 'Yesterday',
        read: false,
    },
];

const NotificationsPanel = ({ isProfessional, notifications, onMarkRead, onMarkAllRead, onClose }) => {
    const panelRef = useRef(null);

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

    return (
        <div className="su-notif-panel" ref={panelRef}>
            <div className="su-notif-header">
                <div className="su-notif-header-left">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="su-notif-count-badge">{unreadCount} new</span>
                    )}
                </div>
                <div className="su-notif-header-actions">
                    {unreadCount > 0 && (
                        <button className="su-notif-mark-all" onClick={onMarkAllRead} title="Mark all as read">
                            <CheckCheck size={16} /> All read
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
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <button
                            key={n.id}
                            className={`su-notif-item ${n.read ? 'read' : 'unread'}`}
                            onClick={() => onMarkRead(n.id)}
                        >
                            <div className={`su-notif-icon ${n.iconColor}`}>
                                {n.icon}
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

export { proNotifications, clientNotifications };
export default NotificationsPanel;
