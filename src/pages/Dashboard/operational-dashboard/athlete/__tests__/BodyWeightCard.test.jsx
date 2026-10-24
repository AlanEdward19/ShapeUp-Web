import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { withLang } from '../../../../../test/withLang';
import BodyWeightCard from '../BodyWeightCard';

const mockGetWeightRegisters = vi.fn();
const mockEnqueue = vi.fn();

vi.mock('../../../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({ getWeightRegisters: mockGetWeightRegisters }),
}));
vi.mock('../../../../../services/mutationQueue', () => ({
    enqueueMutation: (...args) => mockEnqueue(...args),
}));

describe('BodyWeightCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetWeightRegisters.mockResolvedValue({
            items: [
                { date: '2026-10-20', weight: 82 },
                { date: '2026-10-22', weight: 81.4 },
            ],
            targetWeight: 78,
        });
    });

    it('shows the latest weight, the change and how far the goal is', async () => {
        render(withLang(<BodyWeightCard />));
        expect(await screen.findByText(/81[.,]4/)).toBeInTheDocument();
        expect(screen.getByText(/−0[.,]6/)).toBeInTheDocument();
        expect(screen.getByText(/3[.,]4 kg/)).toBeInTheDocument();
    });

    it('queues the weigh-in for today', async () => {
        render(withLang(<BodyWeightCard />));
        await screen.findByText(/81[.,]4/);
        fireEvent.change(screen.getByLabelText(/peso de hoje|today's weight/i), { target: { value: '80,5' } });
        fireEvent.click(screen.getByRole('button', { name: /registrar peso|log today/i }));
        await waitFor(() => expect(mockEnqueue).toHaveBeenCalledWith(expect.objectContaining({
            endpoint: '/api/nutrition/weight/registers',
            body: expect.objectContaining({ weight: 80.5 }),
        })));
    });

    it('asks for the first weigh-in when there is none', async () => {
        mockGetWeightRegisters.mockResolvedValue({ items: [] });
        render(withLang(<BodyWeightCard />));
        expect(await screen.findByText(/sem pesagens|no weigh-ins/i)).toBeInTheDocument();
    });
});
