import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import SuggestExerciseModal from './SuggestExerciseModal';

const mocks = vi.hoisted(() => ({
    createExerciseRequest: vi.fn(),
    listMyExerciseRequests: vi.fn(),
    getEquipments: vi.fn(),
}));
vi.mock('../hooks/api/useTrainingApi', () => ({ useTrainingApi: () => mocks }));

const renderModal = () => render(<LanguageProvider><SuggestExerciseModal onClose={() => {}} /></LanguageProvider>);

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('shapeup_language', 'en');
    mocks.getEquipments.mockResolvedValue({ items: [{ id: 3, name: 'Barbell', namePt: 'Barra' }] });
    mocks.createExerciseRequest.mockResolvedValue({ id: 91 });
    mocks.listMyExerciseRequests.mockResolvedValue({ items: [] });
});

describe('SuggestExerciseModal', () => {
    it('asks for a name and a muscle group before sending', async () => {
        renderModal();
        fireEvent.click(screen.getByTestId('exercise-request-send'));
        expect(await screen.findByRole('alert')).toHaveTextContent(/name/i);
        fireEvent.change(screen.getByPlaceholderText(/paused hack squat/i), { target: { value: 'Paused hack squat' } });
        fireEvent.click(screen.getByTestId('exercise-request-send'));
        expect(await screen.findByRole('alert')).toHaveTextContent(/muscle/i);
        expect(mocks.createExerciseRequest).not.toHaveBeenCalled();
    });

    it('sends the request to the API with muscles, equipment and notes', async () => {
        renderModal();
        fireEvent.change(screen.getByPlaceholderText(/paused hack squat/i), { target: { value: ' Paused hack squat ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Chest' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Barbell' }));
        fireEvent.change(screen.getByPlaceholderText(/describe the movement/i), { target: { value: 'Hold 2s at the bottom' } });
        fireEvent.click(screen.getByTestId('exercise-request-send'));
        await waitFor(() => expect(mocks.createExerciseRequest).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Paused hack squat',
            exerciseType: 'weightBased',
            muscleGroups: ['Chest'],
            equipmentIds: [3],
            notes: 'Hold 2s at the bottom',
        })));
        expect(await screen.findByTestId('exercise-request-sent')).toHaveTextContent('Paused hack squat');
    });

    it('lists my requests with status, linked exercise and rejection reason', async () => {
        mocks.listMyExerciseRequests.mockResolvedValue({ items: [
            { id: 1, name: 'Cable fly', status: 'Approved', exerciseName: 'Cable Chest Fly' },
            { id: 2, name: 'Odd move', status: 'Rejected', rejectionReason: 'Already covered by Row' },
            { id: 3, name: 'New thing', status: 'Pending' },
        ] });
        renderModal();
        fireEvent.click(screen.getByTestId('se-tab-mine'));
        const list = await screen.findByTestId('exercise-request-mine');
        await waitFor(() => expect(list).toHaveTextContent('Cable Chest Fly'));
        expect(list).toHaveTextContent('Already covered by Row');
        expect(list).toHaveTextContent('In review');
    });
});
