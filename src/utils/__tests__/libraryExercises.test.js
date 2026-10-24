import { describe, expect, it } from 'vitest';
import { appendExercisesToPlan, buildExerciseBlocks, exercisesFromState } from '../libraryExercises';

const picks = [{ id: 7, name: 'Supino' }, { id: 9, name: 'Remada' }];

describe('libraryExercises', () => {
  it('turns the picked exercises into one block with a default set each', () => {
    const [block] = buildExerciseBlocks(picks, 1);
    expect(block.exercises).toHaveLength(2);
    expect(block.exercises[0]).toMatchObject({ exerciseId: 7, name: 'Supino', sets: [expect.objectContaining({ type: 'working' })] });
    expect(new Set(block.exercises.map((exercise) => exercise.id)).size).toBe(2);
    expect(buildExerciseBlocks([])).toEqual([]);
  });

  it('appends the picks to an existing plan without touching its blocks', () => {
    const plan = { id: 31, name: 'Upper A', blocks: [{ id: 'old', exercises: [] }] };
    const next = appendExercisesToPlan(plan, picks, 2);
    expect(next.blocks).toHaveLength(2);
    expect(next.blocks[0]).toBe(plan.blocks[0]);
    expect(plan.blocks).toHaveLength(1);
  });

  it('reads one old-style exercise or the whole selection from navigation state', () => {
    expect(exercisesFromState({ exercise: picks[0] })).toEqual([picks[0]]);
    expect(exercisesFromState({ exercises: picks })).toEqual(picks);
    expect(exercisesFromState(null)).toEqual([]);
  });
});
