import { render, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import StitchModeration from './Moderation';

const mocks = vi.hoisted(() => ({
  decideModeration: vi.fn().mockResolvedValue({}),
  getPendingModerations: vi.fn().mockResolvedValue({ items: [{ requestId: 'synthetic-request', foodName: 'Alimento de teste isolado', requestedByUserId: 'synthetic-user', createdAtUtc: '2026-09-12', publicMacros: { kcal: 100, proteinG: 10, carbG: 10, fatG: 2 }, proposedMacros: { kcal: 110, proteinG: 11, carbG: 12, fatG: 2 } }] }),
}));
// No API client is used: these functions never perform network or persistence operations.
vi.mock('../hooks/api/useNutritionApi', () => ({ useNutritionApi: () => mocks }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ signOut: vi.fn() }) }));

it('connects the exported inspection drawer to the existing decision callback', async () => {
  const { container } = render(<MemoryRouter><StitchModeration /></MemoryRouter>);
  const root = container.querySelector('[data-stitch]').shadowRoot;
  const query = within(root.querySelector('.stitch-body'));
  await query.findByText('Alimento de teste isolado');
  fireEvent.click(query.getByRole('button', { name: /Inspecionar/ }));
  const drawer = root.getElementById('inspectionDrawer');
  expect(drawer).not.toHaveAttribute('hidden');
  expect(drawer.style.transform).toBe('translateX(0)');
  fireEvent.click(within(drawer).getByRole('button', { name: /Aprovar e Publicar/, hidden: true }));
  await waitFor(() => expect(mocks.decideModeration).toHaveBeenCalledWith('synthetic-request', 'Approved'));
  await waitFor(() => expect(drawer).toHaveAttribute('hidden'));
});
