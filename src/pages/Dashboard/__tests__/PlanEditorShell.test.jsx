import { describe, expect, it } from 'vitest';
import PlanEditorShell, { PlanEditorShell as Named } from '../PlanEditorShell';
import { PlanEditor } from '../ClientDetail';

describe('PlanEditorShell (T19)', () => {
  it('re-exports the native PlanEditor from ClientDetail', () => {
    expect(PlanEditorShell).toBe(PlanEditor);
    expect(Named).toBe(PlanEditor);
  });
});
