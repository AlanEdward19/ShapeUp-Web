export const calculateMuscleSetsTotal = (sessions, exercisesDB) => {
    const muscleSets = {};

    (sessions || []).forEach(session => {
        const isSessionSkipped = session.status === 'skipped' || (session.exercises || []).every(ex => ex.skipped);
        if (isSessionSkipped) return;

        (session.exercises || []).forEach(ex => {
            if (ex.skipped) return;

            // Find definition
            const exDef = exercisesDB.find(e => e.name.toLowerCase() === (ex.name || '').toLowerCase());
            if (!exDef || !exDef.muscleActivations) return;

            const actualSets = (ex.sets || []).length;
            if (actualSets === 0) return;

            // Accumulate
            Object.entries(exDef.muscleActivations).forEach(([muscleName, activationObj]) => {
                const percentage = typeof activationObj === 'number' ? activationObj : activationObj.activation || 0;
                if (!muscleSets[muscleName]) {
                    muscleSets[muscleName] = 0;
                }
                muscleSets[muscleName] += actualSets * percentage;
            });
        });
    });

    // Round to 1 decimal
    Object.keys(muscleSets).forEach(k => {
        muscleSets[k] = parseFloat(muscleSets[k].toFixed(1));
    });

    return muscleSets;
};

// Returns chronological array of data points for stacked bar or similar charts
export const calculateMuscleSetsOverTime = (sessions, exercisesDB, groupBy = 'week') => {
    // 1. group sessions by date string key (Week or Month)
    const getWeekKey = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid';
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    const periodMap = {};
    (sessions || []).forEach(session => {
        const key = getWeekKey(session.date);
        if (key === 'Invalid') return;

        if (!periodMap[key]) periodMap[key] = [];
        periodMap[key].push(session);
    });

    const result = [];
    Object.keys(periodMap).sort().forEach(key => {
        const periodSessions = periodMap[key];
        const muscleSetsThisPeriod = calculateMuscleSetsTotal(periodSessions, exercisesDB);
        
        result.push({
            period: key,
            ...muscleSetsThisPeriod
        });
    });

    return result;
};
