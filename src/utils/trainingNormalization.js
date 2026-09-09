import { unmapSetType, unmapTechnique, unmapDifficulty, unmapBlockType, unmapIntensityType } from './trainingEnums';

/**
 * Normalizes a single set from API shape to internal PlanEditor shape.
 * Intensity is exclusive: intensityType is 'rpe'|'rir'|null (null = no intensity set),
 * intensityValue is its value as a string. RestSeconds/reps may be blank (nullable on the API).
 */
export const normalizeSet = (s, idx) => ({
    id: s.setId ?? s.id ?? `set_${idx}`,
    type: unmapSetType(s.setType ?? s.type ?? 3),
    reps: s.repetitions == null && s.reps == null ? '' : String(s.repetitions ?? s.reps),
    load: String(s.load ?? ''),
    loadUnit: s.loadUnit ?? 1,
    intensityType: s.intensity ? unmapIntensityType(s.intensity.type) : null,
    intensityValue: s.intensity ? String(s.intensity.value ?? '') : '',
    rest: s.restSeconds == null && s.rest == null ? '' : String(s.restSeconds ?? s.rest),
    technique: unmapTechnique(s.technique ?? 1),
    isExtra: s.isExtra ?? false,
});

const normalizeBlockExercise = (ex, idx) => ({
    ...ex,
    id: ex.exerciseId ?? ex.id ?? `ex_${idx}`,
    exerciseId: ex.exerciseId ?? (typeof ex.id === 'number' ? ex.id : null),
    name: ex.namePt ?? ex.exerciseNamePt ?? ex.name ?? ex.exerciseName ?? ex.exercise?.namePt ?? ex.exercise?.translatedName ?? ex.exercise?.name ?? '',
    muscles: Array.isArray(ex.muscles)
        ? ex.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName || m.namePt || m.name) : m)
        : (ex.exercise?.muscles ? ex.exercise.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName) : m) : []),
    sets: (ex.sets ?? []).map((s, sIdx) => normalizeSet(s, sIdx)),
});

/**
 * Normalizes a single block from API shape to internal PlanEditor shape.
 */
export const normalizeBlock = (block, idx) => ({
    id: block.id ?? `block_${idx}`,
    type: unmapBlockType(block.type ?? 1),
    timeCapSeconds: block.timeCapSeconds == null ? '' : String(block.timeCapSeconds),
    intervalSeconds: block.intervalSeconds == null ? '' : String(block.intervalSeconds),
    totalRounds: block.totalRounds == null ? '' : String(block.totalRounds),
    restAfterSeconds: block.restAfterSeconds == null ? '' : String(block.restAfterSeconds),
    exercises: (block.exercises ?? []).map((ex, exIdx) => normalizeBlockExercise(ex, exIdx)),
});

/**
 * Normalizes a workout template from API shape to internal PlanEditor shape.
 */
export const normalizeTemplate = (tmpl) => ({
    id: tmpl.templateId ?? tmpl.id ?? `tmpl_${Date.now()}`,
    name: tmpl.name ?? '',
    notes: tmpl.notes ?? '',
    phase: tmpl.phase ?? 'Hypertrophy',
    difficulty: unmapDifficulty(tmpl.difficulty ?? 2),
    weeks: tmpl.durationInWeeks ?? tmpl.weeks ?? 4,
    blocks: (tmpl.blocks ?? []).map((b, idx) => normalizeBlock(b, idx)),
    _templateId: tmpl.templateId,
});

/**
 * Flattens a plan/template's blocks into a single exercise list, in block order.
 * Used wherever a flat exercise list is still needed downstream of the Block model:
 * starting a workout session (execution stays flat per AD-007) and exercise/set-count
 * displays that don't care which block an exercise came from.
 */
export const flattenBlockExercises = (blocks) => (blocks ?? []).flatMap(b => b.exercises ?? []);

/**
 * Total sets across every exercise in every block (for summary displays).
 */
export const countBlockSets = (blocks) =>
    flattenBlockExercises(blocks).reduce((total, ex) => total + (ex.sets?.length || 0), 0);

/**
 * Normalizes a workout plan from API shape to internal PlanEditor shape.
 */
export const normalizePlan = (plan) => ({
    id: plan.planId ?? plan.id ?? `plan_${Date.now()}`,
    name: plan.name ?? '',
    notes: plan.notes ?? '',
    phase: plan.phase ?? 'Hypertrophy',
    difficulty: unmapDifficulty(plan.difficulty ?? 2),
    weeks: plan.durationInWeeks ?? plan.weeks ?? 4,
    active: plan.active ?? true,
    blocks: (plan.blocks ?? []).map((b, idx) => normalizeBlock(b, idx)),
    history: plan.history ?? [],
    _planId: plan.planId,
});
