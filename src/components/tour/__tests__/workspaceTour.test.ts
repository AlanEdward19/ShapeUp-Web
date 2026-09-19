import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  findWorkspaceTarget,
  resolveWorkspaceTourSteps,
  startWorkspaceTour,
  toReactourSteps,
} from '../workspaceTour';

describe('workspaceTour', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('finds targets inside dashboard shell shadow root', () => {
    const host = document.createElement('div');
    host.setAttribute('data-shell', '');
    const shadow = host.attachShadow({ mode: 'open' });
    const target = document.createElement('section');
    target.setAttribute('data-tour', 'client-header');
    shadow.appendChild(target);
    document.body.appendChild(host);

    expect(findWorkspaceTarget('[data-tour="client-header"]')).toBe(target);
  });

  it('falls back to document when shadow has no match', () => {
    const light = document.createElement('div');
    light.setAttribute('data-tour', 'client-metrics');
    document.body.appendChild(light);

    expect(findWorkspaceTarget('[data-tour="client-metrics"]')).toBe(light);
  });

  it('skips optional steps and keeps required ones', async () => {
    const header = document.createElement('div');
    header.setAttribute('data-tour', 'client-header');
    document.body.appendChild(header);

    const resolved = await resolveWorkspaceTourSteps([
      { targetSelector: '[data-tour="client-header"]', content: 'a', required: true },
      { targetSelector: '[data-tour="client-optional"]', content: 'b', required: false },
    ]);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].targetSelector).toBe('[data-tour="client-header"]');
  });

  it('returns empty when a required step is missing', async () => {
    const resolved = await resolveWorkspaceTourSteps([
      { targetSelector: '[data-tour="missing"]', content: 'a', required: true },
    ]);
    expect(resolved).toHaveLength(0);
  });

  it('gives each tour step its own light-DOM anchor', () => {
    const steps = toReactourSteps([
      { targetSelector: '[data-tour="client-header"]', content: 'one' },
      { targetSelector: '[data-tour="client-metrics"]', content: 'two' },
    ]);
    expect(steps.map(step => step.selector)).toEqual(['#tour-anchor-0', '#tour-anchor-1']);
    expect(new Set(steps.map(step => step.selector)).size).toBe(2);
  });

  it('places a distinct anchor for every resolved dashboard region', async () => {
    localStorage.clear();
    const header = document.createElement('div');
    header.setAttribute('data-tour', 'client-header');
    const metrics = document.createElement('div');
    metrics.setAttribute('data-tour', 'client-metrics');
    document.body.append(header, metrics);

    const setAnchors = vi.fn();
    const setSteps = vi.fn();
    await startWorkspaceTour({
      setSteps,
      setCurrentStep: vi.fn(),
      setIsOpen: vi.fn(),
      setAnchors,
      storageKey: 'tour-test',
      steps: [
        { targetSelector: '[data-tour="client-header"]', content: 'one', required: true },
        { targetSelector: '[data-tour="client-metrics"]', content: 'two', required: true },
      ],
    });

    expect(setAnchors).toHaveBeenCalledWith([
      { id: 'tour-anchor-0', selector: '[data-tour="client-header"]' },
      { id: 'tour-anchor-1', selector: '[data-tour="client-metrics"]' },
    ]);
    expect(setSteps.mock.calls[0][0].map(step => step.selector)).toEqual([
      '#tour-anchor-0',
      '#tour-anchor-1',
    ]);
  });
});
