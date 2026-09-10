import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ObjectivesClient from '../ObjectivesClient';

const mockGetWeightRegisters = vi.fn();
const mockUpsertTargetWeight = vi.fn();
const mockUpsertDailyWeightRegister = vi.fn();

vi.mock('../../../hooks/api/useNutritionApi', () => ({
    useNutritionApi: () => ({
        getWeightRegisters: mockGetWeightRegisters,
        upsertTargetWeight: mockUpsertTargetWeight,
        upsertDailyWeightRegister: mockUpsertDailyWeightRegister,
    }),
}));

vi.mock('../../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => key,
        unitSystem: 'metric',
        convertWeight: (value) => parseFloat(value) || 0,
    }),
}));

vi.mock('@reactour/tour', () => ({
    useTour: () => ({
        setIsOpen: vi.fn(),
        setSteps: vi.fn(),
        setCurrentStep: vi.fn(),
    }),
}));

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
}));

describe('ObjectivesClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('shapeup_objectives_client_tour_seen', 'true');
        localStorage.setItem('shapeup_client_id', '1');
        mockGetWeightRegisters.mockResolvedValue([]);
    });

    it('renders and loads weight data via useNutritionApi', async () => {
        const { getByText } = render(<ObjectivesClient />);

        await waitFor(() => {
            expect(mockGetWeightRegisters).toHaveBeenCalled();
        });

        expect(getByText('client.objectives.title')).toBeInTheDocument();
        expect(mockGetWeightRegisters.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(mockGetWeightRegisters.mock.calls[0][1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});
