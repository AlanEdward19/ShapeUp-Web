import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { navStyle, WorkspaceNavigation } from '../WorkspaceNavigation';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));
vi.mock('../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Test', initials: 'T', photo: '' }),
}));

const leakCss = `.material-symbols-outlined{font-family:serif!important;text-transform:uppercase!important;letter-spacing:8px!important}`;

const renderNav = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <style>{leakCss}</style>
      <WorkspaceNavigation />
    </MemoryRouter>,
  );

describe('WorkspaceNavigation logout icon', () => {
  beforeEach(() => {
    localStorage.setItem('shapeup_role', 'independent');
  });

  it('scopes Material Symbols so page CSS cannot restyle sidebar icons', () => {
    expect(navStyle).toContain('[data-unified-sidebar] .material-symbols-outlined');
    expect(navStyle).not.toMatch(/(^|\n)\.material-symbols-outlined\{/);
  });

  it.each(['/dashboard/training', '/dashboard/objectives'])(
    'keeps the logout ligature on %s even if the page restyles material icons',
    async (path) => {
      const { container } = renderNav(path);
      const host = container.querySelector('[data-layout-sidebar]');
      await waitFor(() => {
        const icon = host.shadowRoot?.querySelector('[data-testid="sidebar-logout"] .material-symbols-outlined');
        expect(icon).toBeTruthy();
        expect(icon.textContent).toBe('logout');
      });
    },
  );
});
