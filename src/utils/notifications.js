// Simple global store for notifications using localStorage
// Triggers a custom event so React components can re-render automatically

const STORAGE_KEY = 'shapeup_notifications';

const getStoredNotifications = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const notifyListeners = () => {
    window.dispatchEvent(new Event('shapeup_notifications_updated'));
};

export const getNotifications = (targetUserId) => {
    const all = getStoredNotifications();
    return all.filter(n => n.targetUserId === targetUserId).sort((a, b) => b.id - a.id);
};

export const addNotification = (targetUserId, type, title, body, iconColor = 'primary', additionalData = {}) => {
    const all = getStoredNotifications();
    const newNotif = {
        id: Date.now(),
        targetUserId, // 'pro' or a clientId like '1'
        type,         // 'message', 'alert', 'system'
        title,
        body,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        iconColor,    // 'primary', 'warning', 'success', 'error', 'muted'
        ...additionalData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newNotif, ...all]));
    notifyListeners();
    return newNotif;
};

export const markAsRead = (id) => {
    const all = getStoredNotifications();
    const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyListeners();
};

export const markAllAsRead = (targetUserId) => {
    const all = getStoredNotifications();
    const updated = all.map(n => n.targetUserId === targetUserId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyListeners();
};

// React Hook for easy component integration
import { useState, useEffect } from 'react';

export const useNotifications = (targetUserId) => {
    const [notifications, setNotifications] = useState(() => getNotifications(targetUserId));

    useEffect(() => {
        const handleUpdate = () => {
            setNotifications(getNotifications(targetUserId));
        };

        // Listen to the custom event triggered by mutations directly in this window
        window.addEventListener('shapeup_notifications_updated', handleUpdate);

        // Optional: also listen to storage events if multiple tabs are open
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('shapeup_notifications_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [targetUserId]);

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        markAsRead,
        markAllAsRead: () => markAllAsRead(targetUserId)
    };
};
