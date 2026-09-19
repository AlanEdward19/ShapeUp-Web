export const eatingStartLabelFromMinutes = (minutes) => {
    if (minutes == null || Number.isNaN(minutes)) return '12:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};
