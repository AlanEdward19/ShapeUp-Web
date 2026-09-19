import { describe, expect, it, vi } from 'vitest';
import { resolveEquivalentSelection } from '../resolveEquivalentSelection';

describe('resolveEquivalentSelection', () => {
  it('toast and skips inspect when getExerciseById rejects', async () => {
    const getExerciseById = vi.fn().mockRejectedValue(new Error('404'));
    const inspect = vi.fn();
    const setNotice = vi.fn();
    await resolveEquivalentSelection({
      exerciseId: 99,
      exerciseLookup: [{ id: 7, name: 'Current' }],
      getExerciseById,
      mapExerciseEquivalents: () => ({ records: [] }),
      inspect,
      setNotice,
      inspectEventTarget: document.body,
    });
    expect(getExerciseById).toHaveBeenCalledWith(99);
    expect(setNotice).toHaveBeenCalledWith('Exercício não encontrado na lista atual');
    expect(inspect).not.toHaveBeenCalled();
  });
});
