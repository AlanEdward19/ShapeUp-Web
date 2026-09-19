import { render, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { lazy } from 'react';
import { withLang } from '../../../../test/withLang';
import NutritionWorkspaceShell from '../NutritionWorkspaceShell';

vi.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test' }, signOut: vi.fn() }),
}));
vi.mock('../../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Test', initials: 'T', photo: '' }),
}));

const LazyFoods = lazy(
  () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ default: () => <div data-testid="foods-child">Foods</div> }), 50);
    }),
);

function NutritionRoutes({ lazyFoods = false }) {
  return (
    <Routes>
      <Route path="/dashboard/nutrition" element={<NutritionWorkspaceShell />}>
        <Route path="diary" element={<div data-testid="diary-child">Diary</div>} />
        <Route
          path="foods"
          element={
            lazyFoods ? (
              <LazyFoods />
            ) : (
              <div data-testid="foods-child">Foods</div>
            )
          }
        />
        <Route path="meal-plans" element={<div data-testid="plans-child">Plans</div>} />
        <Route path="goal" element={<div data-testid="goal-child">Goal</div>} />
        <Route path="fasting" element={<div data-testid="fasting-child">Fasting</div>} />
      </Route>
    </Routes>
  );
}

const renderShell = (entry, options = {}) =>
  render(
    withLang(
      <MemoryRouter initialEntries={[entry]}>
        <NutritionRoutes lazyFoods={options.lazyFoods} />
      </MemoryRouter>,
    ),
  );

const shadowNav = (container) => {
  const host = container.querySelector('[data-shell="nutrition"]');
  expect(host).toBeTruthy();
  const nav = host.shadowRoot.querySelector('[data-testid="nutrition-nav"]');
  return { host, nav, body: within(host.shadowRoot.querySelector('.shell-body')) };
};

describe('NutritionWorkspaceShell', () => {
  it('renders nutrition nav in shadow root on diary route', () => {
    const { container } = renderShell('/dashboard/nutrition/diary');
    const { nav, body } = shadowNav(container);
    expect(nav).toBeInTheDocument();
    expect(body.getByTestId('diary-child')).toBeInTheDocument();
  });

  it('highlights active tab for direct URL to foods', () => {
    const { container } = renderShell('/dashboard/nutrition/foods');
    const { nav } = shadowNav(container);
    const foodsLink = within(nav).getByRole('link', { name: /alimentos|foods/i });
    expect(foodsLink.className).toMatch(/su-btn-primary/);
  });

  it('keeps the same nav node when switching tabs', () => {
    const { container } = renderShell('/dashboard/nutrition/diary');
    const { nav, body } = shadowNav(container);
    const navBefore = nav;
    fireEvent.click(within(nav).getByRole('link', { name: /alimentos|foods/i }));
    const { nav: navAfter } = shadowNav(container);
    expect(navAfter).toBe(navBefore);
    expect(body.getByTestId('foods-child')).toBeInTheDocument();
  });

  it('renders fasting child route in shell body', () => {
    const { container } = renderShell('/dashboard/nutrition/fasting');
    const { body } = shadowNav(container);
    expect(body.getByTestId('nutrition-workspace')).toBeInTheDocument();
    expect(body.getByTestId('fasting-child')).toBeInTheDocument();
  });

  it('uses Skeleton as Suspense fallback while lazy child loads', async () => {
    const { container } = renderShell('/dashboard/nutrition/foods', { lazyFoods: true });
    const host = container.querySelector('[data-shell="nutrition"]');
    expect(host.shadowRoot.querySelector('[data-testid="skeleton"]')).toBeTruthy();
    await waitFor(() => {
      expect(within(host.shadowRoot.querySelector('.shell-body')).getByTestId('foods-child')).toBeInTheDocument();
    });
  });
});
