export const maybeNotifyEatingWindow = (previousStatus, nextStatus, t) => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (nextStatus !== 'Eating' || previousStatus === 'Eating') return;
    void new Notification(t('nutrition.fasting.notifyTitle'), {
        body: t('nutrition.fasting.notifyBody'),
    });
};
