import { useCallback, useMemo, useRef } from 'react';
import { useTour as useReactourTour, type StepType } from '@reactour/tour';
import { findWorkspaceTarget } from './workspaceTour';

type RawStep = StepType;

/**
 * Drop-in for reactour's `useTour`. Most screens render inside a shadow root, where a plain CSS selector
 * finds nothing and the popover lands in the top-left corner. Steps are resolved to real elements
 * (shadow-aware) right before the tour opens; steps whose target is missing are skipped.
 */
export function useTour() {
  const tour = useReactourTour();
  const raw = useRef<RawStep[]>([]);
  const { setSteps: baseSetSteps, setIsOpen: baseSetIsOpen } = tour;

  const resolve = useCallback((steps: RawStep[]): RawStep[] => {
    return steps.flatMap(step => {
      if (typeof step.selector !== 'string') return [step];
      const el = findWorkspaceTarget(step.selector);
      return el ? [{ ...step, selector: el }] : [];
    });
  }, []);

  const setSteps = useCallback(
    (steps: RawStep[]) => {
      raw.current = steps;
      baseSetSteps?.(steps);
    },
    [baseSetSteps],
  );

  const setIsOpen = useCallback(
    (open: unknown) => {
      if (open === true && raw.current.length) {
        const resolved = resolve(raw.current);
        if (resolved.length === 0) return;
        baseSetSteps?.(resolved);
      }
      baseSetIsOpen?.(open as never);
    },
    [baseSetIsOpen, baseSetSteps, resolve],
  );

  return useMemo(() => ({ ...tour, setSteps, setIsOpen }), [tour, setSteps, setIsOpen]);
}
