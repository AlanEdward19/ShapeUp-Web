/** Leaf regions painted on the body maps — matches MuscleGroup flags (not composites). */
export const LEAF_MUSCLES = [
    'MiddleChest',
    'UpperChest',
    'LowerChest',
    'Triceps',
    'Biceps',
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
    peitoral: CHEST,
    peitorais: CHEST,
    peitoralmaior: CHEST,
    peitoralmenor: ['UpperChest'],
    pectoral: CHEST,
    pectorales: CHEST,

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
    latissimododorso: ['Lats'],
    grandedorsal: ['Lats'],
    dorsallargo: ['Lats'],
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

const LEAF_PT = {
    UpperChest: 'Peito superior',
    MiddleChest: 'Peito médio',
    LowerChest: 'Peito inferior',
    Biceps: 'Bíceps',
    Triceps: 'Tríceps',
    Forearms: 'Antebraços',
    DeltoidAnterior: 'Deltóide anterior',
    DeltoidLateral: 'Deltóide lateral',
    DeltoidPosterior: 'Deltóide posterior',
    Traps: 'Trapézio',
    UpperBack: 'Costas superior',
    MiddleBack: 'Costas média',
    LowerBack: 'Costas inferior',
    Lats: 'Latíssimo',
    AbsUpper: 'Abdômen superior',
    AbsLower: 'Abdômen inferior',
    AbsObliques: 'Oblíquos',
    Quadriceps: 'Quadríceps',
    Hamstrings: 'Isquiotibiais',
    Glutes: 'Glúteos',
    Calves: 'Panturrilhas',
    HipFlexors: 'Flexores de quadril',
};

export function leafDisplayName(id, language = 'en') {
    if (language === 'pt-BR') return LEAF_PT[id] || id;
    return String(id || '').replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** API MuscleGroup is a [Flags] int aligned with LEAF_MUSCLES bit order. */
export function leavesFromMuscleGroup(value) {
    if (value == null || value === '') return [];
    const raw = String(value).trim();
    if (!/^-?\d+$/.test(raw)) return leavesForFolded(foldToken(raw));
    const n = Number(raw);
    if (!Number.isFinite(n) || n === 0) return [];
    return LEAF_MUSCLES.filter((_, i) => n & (1 << i));
}

function foldToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function leavesForFolded(key) {
    if (!key) return [];
    if (ALIAS_TO_LEAVES[key]) return ALIAS_TO_LEAVES[key];
    const pascal = LEAF_MUSCLES.find(id => foldToken(id) === key);
    return pascal ? [pascal] : [];
}

export function resolveMuscleToken(token) {
    if (LEAF_MUSCLES.includes(token)) return [token];
    const raw = String(token ?? '');
    const key = foldToken(raw);
    if (!key) return [];

    const direct = leavesForFolded(key);
    if (direct.length) return direct;

    const ids = new Set();
    raw.split(/[\s/_-]+/).forEach((part) => {
        leavesForFolded(foldToken(part)).forEach(id => ids.add(id));
    });
    if (ids.size) return [...ids];

    const contained = Object.keys(ALIAS_TO_LEAVES)
        .filter(alias => alias.length >= 4 && key.includes(alias))
        .sort((a, b) => b.length - a.length)[0];
    if (contained) return ALIAS_TO_LEAVES[contained];

    if (/^-?\d+$/.test(key)) return leavesFromMuscleGroup(key);
    return [];
}

function tokensFromExercise(ex) {
    const raw = [];
    const push = (item) => {
        if (item == null || item === '') return;
        if (Array.isArray(item) || Array.isArray(item?.$values)) {
            (Array.isArray(item) ? item : item.$values).forEach(push);
            return;
        }
        if (typeof item === 'object') {
            push(item.muscleGroup ?? item.MuscleGroup);
            push(item.muscleName ?? item.MuscleName);
            push(item.muscleNamePt ?? item.MuscleNamePt);
            push(item.name ?? item.Name);
            push(item.namePt ?? item.NamePt);
            return;
        }
        String(item)
            .split(/[•|,/;]+/)
            .forEach(part => raw.push(part.trim()));
    };

    push(ex?.muscles);
    push(ex?.Muscles);
    push(ex?.muscleDetails);
    push(ex?.muscleGroups);
    push(ex?.muscleGroup);
    push(ex?.exercise?.muscles);
    push(ex?.tags);
    push(ex?.target);
    if (ex?.muscleActivations && typeof ex.muscleActivations === 'object' && !Array.isArray(ex.muscleActivations)) {
        Object.keys(ex.muscleActivations).forEach((key) => {
            if (key !== '$id' && key !== '$values') raw.push(key);
        });
    }
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
