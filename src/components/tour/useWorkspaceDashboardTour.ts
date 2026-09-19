import { useEffect, useRef } from 'react';
import { useTour } from '@reactour/tour';
import { useTourAnchor } from './tourAnchorContext';
import { startWorkspaceTour, type WorkspaceTourStepDef } from './workspaceTour';

export function useWorkspaceDashboardTour(storageKey: string, stepDefs: WorkspaceTourStepDef[]) {
  const { setIsOpen, setSteps, setCurrentStep, currentStep, isOpen } = useTour();
  const { setAnchorTarget } = useTourAnchor();
  const activeSteps = useRef<WorkspaceTourStepDef[]>([]);

  useEffect(() => {
    let cancelled = false;
    startWorkspaceTour({
      setSteps,
      setCurrentStep,
      setIsOpen,
      setAnchorTarget,
      steps: stepDefs,
      storageKey,
    }).then(resolved => {
      if (!cancelled) activeSteps.current = resolved;
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, stepDefs, setAnchorTarget, setIsOpen, setCurrentStep, setSteps]);

  useEffect(() => {
    if (!isOpen) return;
    const step = activeSteps.current[currentStep];
    if (step) setAnchorTarget(step.targetSelector);
  }, [currentStep, isOpen, setAnchorTarget]);
}
