/** Leaf regions painted on the body maps — matches MuscleGroup flags (not composites). */
export const LEAF_MUSCLES = [
    'UpperChest',
    'MiddleChest',
    'LowerChest',
    'Biceps',
    'Triceps',
    'Forearms',
    'DeltoidAnterior',
    'DeltoidLateral',
    'DeltoidPosterior',
    'Traps',
    'UpperBack',
    'MiddleBack',
    'LowerBack',
    'Lats',
    'AbsUpper',
    'AbsLower',
    'AbsObliques',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'HipFlexors',
];

const CHEST = ['UpperChest', 'MiddleChest', 'LowerChest'];
const ARMS = ['Triceps', 'Biceps', 'Forearms'];
const SHOULDERS = ['DeltoidAnterior', 'DeltoidLateral', 'DeltoidPosterior'];
const BACK = ['Traps', 'UpperBack', 'MiddleBack', 'LowerBack', 'Lats'];
const ABS = ['AbsUpper', 'AbsLower', 'AbsObliques'];
const LEGS = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'HipFlexors'];

const ALIAS_TO_LEAVES = {
    upperchest: ['UpperChest'],
    peitosuperior: ['UpperChest'],
    pechosuperior: ['UpperChest'],
    pectoralisminor: ['UpperChest'],
    upperpec: ['UpperChest'],
    pecsuperior: ['UpperChest'],

    middlechest: ['MiddleChest'],
    midchest: ['MiddleChest'],
    peitomedio: ['MiddleChest'],
    pechomedio: ['MiddleChest'],
    pectoralismajor: ['MiddleChest'],
    pectoralis: CHEST,
    pecs: CHEST,
    pec: CHEST,

    lowerchest: ['LowerChest'],
    peitoinferior: ['LowerChest'],
    pechoinferior: ['LowerChest'],
    lowerpec: ['LowerChest'],

    chest: CHEST,
    peito: CHEST,
    pecho: CHEST,

    biceps: ['Biceps'],
    bicep: ['Biceps'],
    bicipes: ['Biceps'],

    triceps: ['Triceps'],
    tricep: ['Triceps'],
    tricipes: ['Triceps'],

    forearms: ['Forearms'],
    forearm: ['Forearms'],
    antebracos: ['Forearms'],
    antebrazo: ['Forearms'],
    antebrazos: ['Forearms'],

    deltoidanterior: ['DeltoidAnterior'],
    frontdelt: ['DeltoidAnterior'],
    frontdelts: ['DeltoidAnterior'],
    anteriordelt: ['DeltoidAnterior'],
    anteriordeltoid: ['DeltoidAnterior'],
    deltoideanterior: ['DeltoidAnterior'],
    deltoidesanterior: ['DeltoidAnterior'],

    deltoidlateral: ['DeltoidLateral'],
    sidedelt: ['DeltoidLateral'],
    sidedelts: ['DeltoidLateral'],
    lateraldelt: ['DeltoidLateral'],
    lateraldeltid: ['DeltoidLateral'],
    medaldelt: ['DeltoidLateral'],
    deltoidelateral: ['DeltoidLateral'],
    deltoideslateral: ['DeltoidLateral'],

    deltoidposterior: ['DeltoidPosterior'],
    reardelt: ['DeltoidPosterior'],
    reardelts: ['DeltoidPosterior'],
    posteriordelt: ['DeltoidPosterior'],
    posteriordeltoid: ['DeltoidPosterior'],
    deltoideposterior: ['DeltoidPosterior'],
    deltoidesposterior: ['DeltoidPosterior'],

    shoulders: SHOULDERS,
    shoulder: SHOULDERS,
    delts: SHOULDERS,
    deltoids: SHOULDERS,
    deltoides: SHOULDERS,
    ombros: SHOULDERS,
    hombros: SHOULDERS,

    traps: ['Traps'],
    trap: ['Traps'],
    trapezius: ['Traps'],
    trapezio: ['Traps'],
    trapecio: ['Traps'],

    upperback: ['UpperBack'],
    costassuperior: ['UpperBack'],
    espaldasuperior: ['UpperBack'],

    middleback: ['MiddleBack'],
    midback: ['MiddleBack'],
    costasmedia: ['MiddleBack'],
    costasmedias: ['MiddleBack'],
    espaldamedia: ['MiddleBack'],
    rhomboid: ['MiddleBack'],
    rhomboids: ['MiddleBack'],
    romboides: ['MiddleBack'],
    serratus: ['MiddleBack'],

    lowerback: ['LowerBack'],
    costasinferior: ['LowerBack'],
    espaldabaja: ['LowerBack'],
    lombos: ['LowerBack'],
    lumbar: ['LowerBack'],

    lats: ['Lats'],
    lat: ['Lats'],
    latissimus: ['Lats'],
    latissimusdorsi: ['Lats'],
    latissimo: ['Lats'],
    dorsal: ['Lats'],
    dorsales: ['Lats'],
    dorsais: ['Lats'],

    back: BACK,
    costas: BACK,
    espalda: BACK,

    absupper: ['AbsUpper'],
    upperabs: ['AbsUpper'],
    abdomensuperior: ['AbsUpper'],
    abdominalessuperiores: ['AbsUpper'],

    abslower: ['AbsLower'],
    lowerabs: ['AbsLower'],
    abdomeninferior: ['AbsLower'],
    abdominalesinferiores: ['AbsLower'],

    absobliques: ['AbsObliques'],
    obliques: ['AbsObliques'],
    oblique: ['AbsObliques'],
    oblicuos: ['AbsObliques'],
    obliquos: ['AbsObliques'],

    abs: ABS,
    abdomen: ABS,
    abdominals: ABS,
    abdominales: ABS,
    core: ABS,

    quadriceps: ['Quadriceps'],
    quads: ['Quadriceps'],
    quad: ['Quadriceps'],
    cuadriceps: ['Quadriceps'],

    hamstrings: ['Hamstrings'],
    hamstring: ['Hamstrings'],
    hammies: ['Hamstrings'],
    isquiotibiais: ['Hamstrings'],
    isquiotibiales: ['Hamstrings'],

    glutes: ['Glutes'],
    glute: ['Glutes'],
    gluteus: ['Glutes'],
    gluteos: ['Glutes'],

    calves: ['Calves'],
    calf: ['Calves'],
    panturrilhas: ['Calves'],
    panturrilha: ['Calves'],
    gemelos: ['Calves'],
    gastrocnemius: ['Calves'],

    hipflexors: ['HipFlexors'],
    hipflexor: ['HipFlexors'],
    flexoresdequadril: ['HipFlexors'],
    flexoresdecadera: ['HipFlexors'],
    adductors: ['HipFlexors'],
    abductors: ['HipFlexors'],
    adutores: ['HipFlexors'],
    aductores: ['HipFlexors'],

    legs: LEGS,
    pernas: LEGS,
    piernas: LEGS,

    arms: ARMS,
    bracos: ARMS,
    brazos: ARMS,

    fullbody: [...CHEST, ...ARMS, ...SHOULDERS, ...BACK, ...ABS, ...LEGS],
    corpointeiro: [...CHEST, ...ARMS, ...SHOULDERS, ...BACK, ...ABS, ...LEGS],
    cuerpocompleto: [...CHEST, ...ARMS, ...SHOULDERS, ...BACK, ...ABS, ...LEGS],
};

function foldToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

export function resolveMuscleToken(token) {
    const key = foldToken(token);
    if (!key) return [];
    if (LEAF_MUSCLES.includes(token)) return [token];
    if (ALIAS_TO_LEAVES[key]) return ALIAS_TO_LEAVES[key];
    const pascal = LEAF_MUSCLES.find(id => foldToken(id) === key);
    return pascal ? [pascal] : [];
}

function tokensFromExercise(ex) {
    const raw = [];
    const push = (item) => {
        if (item == null || item === '') return;
        if (typeof item === 'object') {
            raw.push(item.muscleName, item.muscleNamePt, item.name, item.namePt, item.muscleGroup);
            return;
        }
        String(item)
            .split(/[•|,/;]+/)
            .forEach(part => raw.push(part.trim()));
    };

    if (Array.isArray(ex?.muscles)) ex.muscles.forEach(push);
    else push(ex?.muscles);
    if (Array.isArray(ex?.muscleGroups)) ex.muscleGroups.forEach(push);
    push(ex?.tags);
    push(ex?.target);
    return raw.filter(Boolean);
}

/** Count of exercises that hit each leaf region. */
export function collectMuscleHits(exercises = []) {
    const hits = {};
    for (const ex of exercises) {
        const ids = new Set();
        for (const token of tokensFromExercise(ex)) {
            resolveMuscleToken(token).forEach(id => ids.add(id));
        }
        for (const id of ids) hits[id] = (hits[id] || 0) + 1;
    }
    return hits;
}

export function maxHitCount(hits) {
    const values = Object.values(hits);
    return values.length ? Math.max(...values) : 0;
}
