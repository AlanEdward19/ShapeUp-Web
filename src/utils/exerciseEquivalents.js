import { getCatalogLanguage, localizeExercise } from './exerciseCatalog';

/**
 * Unwrap GET /exercises/{id}/equivalents payload (array or paginated `{ items }`).
 */
export const unwrapEquivalentsPayload = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload.filter(Boolean);
    if (Array.isArray(payload.items)) return payload.items.filter(Boolean);
    return [];
};

const toInspectRecord = (ex, language) => {
    const localized = localizeExercise(ex, language);
    return {
        id: ex.id,
        name: localized.name,
        muscles: localized.muscles,
        equipments: ex.equipments || [],
        equipment: localized.equipment,
        muscleDetails: Array.isArray(ex.muscles) ? ex.muscles : [],
        description: ex.description,
        descriptionPt: ex.descriptionPt,
        videoUrl: ex.videoUrl,
    };
};

/**
 * Map API ExerciseResponse[] to drawer equivalents + inspect records (no fabricated matchLabel).
 */
export const mapExerciseEquivalents = (payload, language = getCatalogLanguage()) => {
    const raw = unwrapEquivalentsPayload(payload);
    if (raw.length === 0) {
        return { equivalents: [], records: [] };
    }

    const equivalents = [];
    const records = [];

    for (const ex of raw) {
        if (!ex || ex.id == null) continue;
        equivalents.push({ exerciseId: ex.id });
        records.push(toInspectRecord(ex, language));
    }

    return { equivalents, records };
};
