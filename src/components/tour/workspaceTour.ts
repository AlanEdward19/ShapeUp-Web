import type { StepType } from '@reactour/tour';

export type WorkspaceTourStepDef = {
  targetSelector: string;
  content: StepType['content'];
  required?: boolean;
};

export function findWorkspaceTarget(selector: string): Element | null {
  const shell = document.querySelector('[data-shell]');
  if (shell?.shadowRoot) {
    const inShadow = shell.shadowRoot.querySelector(selector);
    if (inShadow) return inShadow;
  }
  return document.querySelector(selector);
}

export async function waitForWorkspaceTarget(
  selector: string,
  { timeout = 8000, interval = 100 }: { timeout?: number; interval?: number } = {},
): Promise<Element | null> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const el = findWorkspaceTarget(selector);
    if (el) return el;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return findWorkspaceTarget(selector);
}

export async function resolveWorkspaceTourSteps(
  steps: WorkspaceTourStepDef[],
): Promise<WorkspaceTourStepDef[]> {
  const resolved: WorkspaceTourStepDef[] = [];
  for (const step of steps) {
    const el = await waitForWorkspaceTarget(step.targetSelector, { timeout: 3000 });
    if (el) {
      resolved.push(step);
    } else if (step.required !== false) {
      return [];
    }
  }
  return resolved;
}

type StartWorkspaceTourArgs = {
  setSteps: (steps: StepType[]) => void;
  setCurrentStep: (index: number) => void;
  setIsOpen: (open: boolean) => void;
  setAnchorTarget: (selector: string | null) => void;
  steps: WorkspaceTourStepDef[];
  storageKey: string;
};

export async function startWorkspaceTour({
  setSteps,
  setCurrentStep,
  setIsOpen,
  setAnchorTarget,
  steps,
  storageKey,
}: StartWorkspaceTourArgs): Promise<WorkspaceTourStepDef[]> {
  if (localStorage.getItem(storageKey)) return [];
  const resolved = await resolveWorkspaceTourSteps(steps);
  if (resolved.length === 0) return [];

  localStorage.setItem(storageKey, 'true');
  setAnchorTarget(resolved[0].targetSelector);
  setSteps(resolved.map(step => ({ selector: '#tour-anchor', content: step.content })));
  setCurrentStep(0);
  setTimeout(() => setIsOpen(true), 600);
  return resolved;
}
