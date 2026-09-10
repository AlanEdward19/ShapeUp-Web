export const isMacroGoalMet = (totals, goal) => {
    if (!goal || !totals) return false;
    const tolerance = 0.1;
    return ['proteinG', 'carbG', 'fatG'].every((macro) => {
        const target = goal[macro];
        const consumed = totals[macro] ?? 0;
        if (!target || target <= 0) return false;
        return Math.abs(consumed - target) / target <= tolerance;
    });
};

export const supportsBarcodeDetector = () =>
    typeof window !== 'undefined' && 'BarcodeDetector' in window;
