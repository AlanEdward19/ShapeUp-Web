import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTour } from '@reactour/tour';
import { useTourAnchor } from './tourAnchorContext';
import { findWorkspaceTarget, startWorkspaceTour, type WorkspaceTourStepDef } from './workspaceTour';

export function useWorkspaceDashboardTour(storageKey: string, stepDefs: WorkspaceTourStepDef[]) {
  const { setIsOpen, setSteps, setCurrentStep, currentStep, isOpen } = useTour();
  const { setAnchors } = useTourAnchor();
  const activeSteps = useRef<WorkspaceTourStepDef[]>([]);

  useEffect(() => {
    let cancelled = false;
    startWorkspaceTour({
      setSteps,
      setCurrentStep,
      setIsOpen,
      setAnchors,
      steps: stepDefs,
      storageKey,
    }).then(resolved => {
      if (!cancelled) activeSteps.current = resolved;
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, stepDefs, setAnchors, setIsOpen, setCurrentStep, setSteps]);

  useEffect(() => {
    if (!isOpen) return undefined;
    return () => setAnchors([]);
  }, [isOpen, setAnchors]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const step = activeSteps.current[currentStep];
    const el = step && findWorkspaceTarget(step.targetSelector);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentStep, isOpen]);
}
