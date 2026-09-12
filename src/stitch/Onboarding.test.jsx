import { render, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Onboarding from './Onboarding';
const completeOnboarding = vi.hoisted(() => vi.fn().mockResolvedValue({}));
vi.mock('../hooks/api/useNutritionApi', () => ({ useNutritionApi: () => ({ completeOnboarding }) }));

it('validates required nutrition fields and saves the backend contract before showing completion', async () => {
  const {container} = render(<MemoryRouter><Onboarding /></MemoryRouter>);
  const root = container.querySelector('[data-stitch]').shadowRoot;
  fireEvent.click(root.getElementById('nav-step-4'));
  expect(completeOnboarding).not.toHaveBeenCalled();
  const panel = root.getElementById('step-content-3');
  const query = within(panel);
  fireEvent.change(query.getByLabelText('Idade'), {target:{value:'30'}});
  fireEvent.change(query.getByLabelText('Sexo biológico'), {target:{value:'Male'}});
  fireEvent.change(panel.querySelectorAll('input[type=number]')[1], {target:{value:'180'}});
  fireEvent.click(root.getElementById('nav-step-4'));
  await waitFor(() => expect(completeOnboarding).toHaveBeenCalledWith({age:30,heightCm:180,biologicalSex:'Male',activityLevel:'Moderate'}));
  await waitFor(() => expect(root.getElementById('step-content-4')).not.toHaveAttribute('hidden'));
});
