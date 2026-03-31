import { useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const useNotificationsApi = () => {

    const sendHtmlEmail = useCallback(async (command) => {
        return await apiClient('/api/notifications/emails/send-html', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    const sendTemplateEmail = useCallback(async (command) => {
        return await apiClient('/api/notifications/emails/send-template', {
            method: 'POST',
            body: JSON.stringify(command)
        });
    }, []);

    return {
        sendHtmlEmail,
        sendTemplateEmail
    };
};
