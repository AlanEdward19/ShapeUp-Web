/**
 * Unwrap GET /exercises/{id}/equivalents payload (array or paginated `{ items }`).
 */
export const unwrapEquivalentsPayload = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload.filter(Boolean);
    if (Array.isArray(payload.items)) return payload.items.filter(Boolean);
    return [];
};

const muscleStrings = (muscles) =>
    (Array.isArray(muscles) ? muscles : []).map((m) =>
        typeof m === 'object' ? (m.muscleNamePt || m.muscleName || '') : m
    ).filter(Boolean);

const toInspectRecord = (ex) => ({
    id: ex.id,
    name: ex.namePt || ex.name || '',
    muscles: muscleStrings(ex.muscles),
    equipments: ex.equipments || [],
    muscleDetails: Array.isArray(ex.muscles) ? ex.muscles : [],
    description: ex.description,
    descriptionPt: ex.descriptionPt,
    videoUrl: ex.videoUrl,
});

/**
 * Map API ExerciseResponse[] to drawer equivalents + inspect records (no fabricated matchLabel).
 */
export const mapExerciseEquivalents = (payload) => {
    const raw = unwrapEquivalentsPayload(payload);
    if (raw.length === 0) {
        return { equivalents: [], records: [] };
    }

    const equivalents = [];
    const records = [];

    for (const ex of raw) {
        if (!ex || ex.id == null) continue;
        equivalents.push({ exerciseId: ex.id });
        records.push(toInspectRecord(ex));
    }

    return { equivalents, records };
};
