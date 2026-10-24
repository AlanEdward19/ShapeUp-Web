import { describe, expect, it } from 'vitest';
import { buildNavigation, canOpen } from '../navigationModel';

const hrefs = (role: string) => buildNavigation({ role, platformAdmin: false }).flatMap(group => group.items.map(item => item.href));

describe('workspace navigation by profile', () => {
  it('keeps professional tools out of the athlete profile', () => {
    const athlete = hrefs('independent');
    for (const href of ['/dashboard/clients', '/dashboard/credential', '/dashboard/training-invites', '/dashboard/reports', '/dashboard/service-plans', '/dashboard/nutrition/practice']) {
      expect(athlete).not.toContain(href);
    }
    expect(athlete).toContain('/dashboard/objectives');
  });

  it('gives professionals their tools and gym owners the gym ones on top', () => {
    expect(hrefs('professional')).toEqual(expect.arrayContaining(['/dashboard/clients', '/dashboard/credential', '/dashboard/reports']));
    expect(hrefs('professional')).not.toContain('/dashboard/staff');
    expect(hrefs('gym')).toEqual(expect.arrayContaining(['/dashboard/staff', '/dashboard/financial']));
  });

  it('blocks direct navigation to routes the active profile does not own', () => {
    expect(canOpen('client', '/dashboard/clients')).toBe(false);
    expect(canOpen('client', '/dashboard/clients/12')).toBe(false);
    expect(canOpen('professional', '/dashboard/clients/12')).toBe(true);
    expect(canOpen('professional', '/dashboard/financial')).toBe(false);
    expect(canOpen('gym', '/dashboard/financial')).toBe(true);
    expect(canOpen('independent', '/dashboard/training')).toBe(true);
  });
});
