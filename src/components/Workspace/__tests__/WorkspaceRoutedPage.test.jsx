import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import WorkspaceRoutedPage from '../WorkspaceRoutedPage';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test' }, signOut: vi.fn() }),
}));
vi.mock('../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Test', initials: 'T', photo: '' }),
}));

describe('WorkspaceRoutedPage', () => {
  it('renders training content in the translated workspace shell', async () => {
    localStorage.setItem('shapeup_role', 'independent');
    localStorage.setItem('shapeup_language', 'en');
    const { container } = render(
      withLang(
        <MemoryRouter initialEntries={['/dashboard/training']}>
          <WorkspaceRoutedPage>
            <div data-testid="routed-child">Meus Treinos</div>
          </WorkspaceRoutedPage>
        </MemoryRouter>,
      ),
    );

    const host = container.querySelector('[data-shell="athlete"]');
    expect(host).toBeTruthy();
    await waitFor(() => {
      expect(host.shadowRoot.querySelector('[data-unified-sidebar]')).toBeTruthy();
      expect(host.shadowRoot.querySelector('[data-testid="workspace-routed-page"]')).toBeTruthy();
      expect(host.shadowRoot.querySelector('[data-testid="routed-child"]')).toBeTruthy();
    });
    await waitFor(() => {
      const labels = [...host.shadowRoot.querySelectorAll('[data-unified-sidebar] a span:last-child')].map(
        (node) => node.textContent,
      );
      expect(labels).toContain('My workouts');
    });
  });
});
