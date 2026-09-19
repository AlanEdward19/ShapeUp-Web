import { afterEach, describe, expect, it } from 'vitest';
import { findWorkspaceTarget, resolveWorkspaceTourSteps } from '../workspaceTour';

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
});
