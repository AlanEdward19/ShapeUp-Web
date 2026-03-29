/**
 * Enum mappings for the ShapeUp Training API.
 * All enums are integers on the backend.
 *
 * Components store friendly string values internally (e.g. "working", "Intermediate").
 * Use these helpers to convert before sending to the API, and to normalize on read.
 */

// ─── SET TYPE ────────────────────────────────────────────────────────────────
// SetType: 1=Warmup, 2=Feeder, 3=Working, 4=TopSet, 5=DropSet, 6=BackOff
export const SET_TYPE_TO_INT = {
    warmup: 1,
    feeder: 2,
    working: 3,
    topset: 4,
    dropset: 5,
    backoff: 6,
};
export const INT_TO_SET_TYPE = Object.fromEntries(
    Object.entries(SET_TYPE_TO_INT).map(([k, v]) => [v, k])
);
export const mapSetType = (value) => {
    if (typeof value === 'number') return value;
    return SET_TYPE_TO_INT[String(value).toLowerCase()] ?? 3; // Default: working
};
export const unmapSetType = (value) => {
    if (typeof value === 'string' && isNaN(value)) return value.toLowerCase();
    return INT_TO_SET_TYPE[parseInt(value)] ?? 'working';
};

// ─── LOAD UNIT ───────────────────────────────────────────────────────────────
// LoadUnit: 1=Kg, 2=Lbs
export const LOAD_UNIT_TO_INT = {
    kg: 1,
    lbs: 2,
    metric: 1,
    imperial: 2,
};
export const mapLoadUnit = (value) => {
    if (typeof value === 'number') return value;
    return LOAD_UNIT_TO_INT[String(value).toLowerCase()] ?? 1;
};

// ─── TECHNIQUE ───────────────────────────────────────────────────────────────
// Technique: 1=Straight, 2=DropSet, 3=RestPause, 4=ClusterSet, 5=MuscleRound
export const TECHNIQUE_TO_INT = {
    straight: 1,
    dropset: 2,
    'drop set': 2,
    restpause: 3,
    'rest pause': 3,
    clusterset: 4,
    cluster: 4,
    muscleround: 5,
    'muscle round': 5,
};
export const INT_TO_TECHNIQUE = {
    1: 'Straight',
    2: 'Drop Set',
    3: 'Rest Pause',
    4: 'Cluster',
    5: 'Muscle Round',
};
export const mapTechnique = (value) => {
    if (typeof value === 'number') return value;
    return TECHNIQUE_TO_INT[String(value).toLowerCase()] ?? 1;
};
export const unmapTechnique = (value) => {
    if (typeof value === 'string' && isNaN(value)) return value;
    return INT_TO_TECHNIQUE[parseInt(value)] ?? 'Straight';
};

// ─── DIFFICULTY ──────────────────────────────────────────────────────────────
// Difficulty: 1=Easy, 2=Intermediate, 3=Hard, 4=Advanced
export const DIFFICULTY_TO_INT = {
    easy: 1,
    beginner: 1, // alias
    intermediate: 2,
    hard: 3,
    advanced: 4,
};
export const INT_TO_DIFFICULTY = {
    1: 'Easy',
    2: 'Intermediate',
    3: 'Hard',
    4: 'Advanced',
};
export const mapDifficulty = (value) => {
    if (typeof value === 'number') return value;
    return DIFFICULTY_TO_INT[String(value).toLowerCase()] ?? 2; // Default: intermediate
};
export const unmapDifficulty = (value) => {
    if (typeof value === 'string' && isNaN(value)) return value;
    return INT_TO_DIFFICULTY[parseInt(value)] ?? 'Intermediate';
};
