import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Layout from '../Layout';

vi.mock('../Workspace/WorkspaceNavigation', () => ({
  WorkspaceNavigation: () => <nav data-testid="legacy-sidebar">Sidebar</nav>,
}));
vi.mock('../Header', () => ({
  default: () => <header data-testid="legacy-header">Header</header>,
}));
vi.mock('../OfflineQueueIndicator', () => ({ default: () => null }));
vi.mock('../ErrorBoundary', () => ({
  default: ({ children }) => children,
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard/*" element={<Layout />}>
          <Route path="nutrition/diary" element={<div data-testid="page">diary</div>} />
          <Route path="nutrition/foods" element={<div data-testid="page">foods</div>} />
          <Route path="nutrition/meal-plans" element={<div data-testid="page">plans</div>} />
          <Route path="nutrition/goal" element={<div data-testid="page">goal</div>} />
          <Route path="nutrition/fasting" element={<div data-testid="page">fasting</div>} />
          <Route path="clients" element={<div data-testid="page">clients</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Layout nutrition bypass', () => {
  it.each([
    '/dashboard/nutrition/diary',
    '/dashboard/nutrition/foods',
    '/dashboard/nutrition/meal-plans',
    '/dashboard/nutrition/goal',
    '/dashboard/nutrition/fasting',
  ])('bypasses legacy chrome for %s', (path) => {
    const { queryByTestId } = renderAt(path);
    expect(queryByTestId('legacy-sidebar')).not.toBeInTheDocument();
    expect(queryByTestId('legacy-header')).not.toBeInTheDocument();
    expect(queryByTestId('page')).toBeInTheDocument();
  });

  it('keeps legacy chrome on non-nutrition dashboard routes', () => {
    const { getByTestId } = renderAt('/dashboard/clients');
    expect(getByTestId('legacy-sidebar')).toBeInTheDocument();
    expect(getByTestId('legacy-header')).toBeInTheDocument();
  });
});
