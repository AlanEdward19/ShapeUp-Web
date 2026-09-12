import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import Onboarding from '../Onboarding';

const completeOnboarding = vi.fn();
vi.mock('../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({ completeOnboarding }),
}));

const renderSetup = () => render(withLang(<MemoryRouter initialEntries={['/setup']}>
    <Routes><Route path="/setup" element={<Onboarding />} /><Route path="/dashboard" element={<h1>Workspace ready</h1>} /></Routes>
</MemoryRouter>));

describe('Initial workspace setup', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('shapeup_user_id', 'athlete-1');
        completeOnboarding.mockReset();
    });

    it('saves preferences for the current account without requesting a nutrition goal when skipped', async () => {
        renderSetup();
        fireEvent.click(screen.getByRole('button', { name: '3 days' }));
        for (let step = 0; step < 3; step++) fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
        fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));
        expect(await screen.findByRole('heading', { name: 'Workspace ready' })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem('shapeup_setup_athlete-1')).frequency).toBe('3');
        expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('keeps the setup open and preferences unsaved if the nutrition request fails', async () => {
        completeOnboarding.mockRejectedValue(new Error('Nutrition is temporarily unavailable'));
        const { container } = renderSetup();
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Set nutrition goal now' }));
        const numbers = container.querySelectorAll('input[type="number"]');
        fireEvent.change(numbers[0], { target: { value: '175' } });
        fireEvent.change(numbers[1], { target: { value: '30' } });
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
        fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Nutrition is temporarily unavailable'));
        expect(completeOnboarding).toHaveBeenCalledWith({ heightCm: 175, age: 30, biologicalSex: 'Male', activityLevel: 'ModeratelyActive' });
        expect(localStorage.getItem('shapeup_setup_athlete-1')).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Workspace ready' })).not.toBeInTheDocument();
    });
});
