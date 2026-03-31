import { unmapSetType, unmapTechnique, unmapDifficulty } from './trainingEnums';

/**
 * Normalizes a single set from API shape to internal PlanEditor shape.
 */
export const normalizeSet = (s, idx) => ({
    id: s.setId ?? s.id ?? `set_${idx}`,
    type: unmapSetType(s.setType ?? s.type ?? 3),
    reps: String(s.repetitions ?? s.reps ?? ''),
    load: String(s.load ?? ''),
    loadUnit: s.loadUnit ?? 1,
    rpe: String(s.rpe ?? ''),
    rest: String(s.restSeconds ?? s.rest ?? '90'),
    technique: unmapTechnique(s.technique ?? 1),
    isExtra: s.isExtra ?? false,
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
    exercises: (tmpl.exercises ?? []).map((ex, idx) => ({
        ...ex,
        id: ex.exerciseId ?? ex.id ?? `ex_${idx}`,
        exerciseId: ex.exerciseId ?? (typeof ex.id === 'number' ? ex.id : null),
        name: ex.namePt ?? ex.exerciseNamePt ?? ex.name ?? ex.exerciseName ?? ex.exercise?.namePt ?? ex.exercise?.translatedName ?? ex.exercise?.name ?? '',
        muscles: Array.isArray(ex.muscles) 
            ? ex.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName || m.namePt || m.name) : m)
            : (ex.exercise?.muscles ? ex.exercise.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName) : m) : []),
        sets: (ex.sets ?? []).map((s, sIdx) => normalizeSet(s, sIdx)),
    })),
    _templateId: tmpl.templateId,
});

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
    exercises: (plan.exercises ?? []).map((ex, idx) => ({
        ...ex,
        id: ex.exerciseId ?? ex.id ?? `ex_${idx}`,
        exerciseId: ex.exerciseId ?? (typeof ex.id === 'number' ? ex.id : null),
        name: ex.namePt ?? ex.exerciseNamePt ?? ex.name ?? ex.exerciseName ?? ex.exercise?.namePt ?? ex.exercise?.translatedName ?? ex.exercise?.name ?? '',
        muscles: Array.isArray(ex.muscles) 
            ? ex.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName || m.namePt || m.name) : m)
            : (ex.exercise?.muscles ? ex.exercise.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName) : m) : []),
        sets: (ex.sets ?? []).map((s, sIdx) => normalizeSet(s, sIdx)),
    })),
    history: plan.history ?? [],
    _planId: plan.planId,
});
