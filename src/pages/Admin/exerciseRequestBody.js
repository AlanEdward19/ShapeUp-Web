import { LEAF_MUSCLES, MUSCLE_GROUPS } from '../../components/anatomy/muscleRegions';

const flagOf = (leaf) => 1 << LEAF_MUSCLES.indexOf(leaf);
export const groupLeaves = (groups = []) => groups.flatMap((group) => MUSCLE_GROUPS[group] ?? []);

/** Builds the approve command (CreateExerciseCommand shape plus an internal note). */
export function buildApproveBody(form) {
    return {
        name: form.name.trim(),
        namePt: form.namePt.trim(),
        description: form.description.trim() || null,
        videoUrl: form.videoUrl.trim() || null,
        exerciseType: form.exerciseType,
        muscles: form.leaves.map((leaf) => ({ muscleGroup: flagOf(leaf), activationPercent: Number(form.activation[leaf] ?? 100) })),
        equipmentIds: form.equipmentIds,
        steps: form.steps.map((step) => step.trim()).filter(Boolean).map((description) => ({ description })),
        adminNote: form.adminNote.trim() || null,
    };
}
