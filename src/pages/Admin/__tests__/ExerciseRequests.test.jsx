import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import ExerciseRequests from '../ExerciseRequests';
import { buildApproveBody } from '../exerciseRequestBody';

const mocks = vi.hoisted(() => ({
    listExerciseRequests: vi.fn(),
    approveExerciseRequest: vi.fn(),
    rejectExerciseRequest: vi.fn(),
    getEquipments: vi.fn(),
}));
vi.mock('../../../hooks/api/useTrainingApi', () => ({ useTrainingApi: () => mocks }));

const pending = {
    id: 12, status: 'Pending', name: 'Paused hack squat', notes: 'Hold at the bottom', kind: 'weight', referenceUrl: 'https://example.com/v',
    muscleGroups: ['Quadriceps'], equipmentIds: [3], equipmentNames: ['Barbell'], requestedByUserId: 5, requestedByName: 'Ana', requestedByRole: 'Trainer', createdAtUtc: '2026-10-20T12:00:00Z',
};

const renderPage = () => render(<LanguageProvider><MemoryRouter><ExerciseRequests /></MemoryRouter></LanguageProvider>);

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('shapeup_language', 'en');
    mocks.listExerciseRequests.mockResolvedValue({ items: [pending] });
    mocks.getEquipments.mockResolvedValue({ items: [{ id: 3, name: 'Barbell', namePt: 'Barra' }] });
    mocks.approveExerciseRequest.mockResolvedValue({});
    mocks.rejectExerciseRequest.mockResolvedValue({});
});

describe('buildApproveBody', () => {
    it('turns the form into the create-exercise command with muscle flags', () => {
        const body = buildApproveBody({
            name: ' Paused hack squat ', namePt: 'Hack squat com pausa', description: '', videoUrl: '', exerciseType: 'weightBased',
            leaves: ['Quadriceps', 'Glutes'], activation: { Glutes: '40' }, equipmentIds: [3], steps: ['Descend', '  ', 'Hold'], adminNote: '',
        });
        expect(body.name).toBe('Paused hack squat');
        expect(body.description).toBeNull();
        expect(body.muscles).toEqual([
            expect.objectContaining({ activationPercent: 100 }),
            expect.objectContaining({ activationPercent: 40 }),
        ]);
        expect(body.muscles.every((m) => Number.isInteger(m.muscleGroup) && m.muscleGroup > 0)).toBe(true);
        expect(body.steps).toEqual([{ description: 'Descend' }, { description: 'Hold' }]);
    });
});

describe('ExerciseRequests admin screen', () => {
    it('shows who asked and registers the exercise linked to the request', async () => {
        renderPage();
        fireEvent.click(await screen.findByTestId('xr-row-12'));
        expect(screen.getByTestId('xr-request')).toHaveTextContent('Ana');
        expect(screen.getByTestId('xr-name-pt')).toHaveValue('Paused hack squat');
        fireEvent.change(screen.getByTestId('xr-name-pt'), { target: { value: 'Hack squat com pausa' } });
        fireEvent.click(screen.getByTestId('xr-approve'));
        await waitFor(() => expect(mocks.approveExerciseRequest).toHaveBeenCalledWith(12, expect.objectContaining({ name: 'Paused hack squat', namePt: 'Hack squat com pausa', equipmentIds: [3] })));
    });

    it('needs a reason to reject', async () => {
        renderPage();
        fireEvent.click(await screen.findByTestId('xr-row-12'));
        fireEvent.click(screen.getByTestId('xr-reject'));
        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(mocks.rejectExerciseRequest).not.toHaveBeenCalled();
        fireEvent.change(screen.getByTestId('xr-reject-reason'), { target: { value: 'Already in the library' } });
        fireEvent.click(screen.getByTestId('xr-reject'));
        await waitFor(() => expect(mocks.rejectExerciseRequest).toHaveBeenCalledWith(12, { reason: 'Already in the library' }));
    });

    it('shows the linked exercise on an approved request and no form', async () => {
        mocks.listExerciseRequests.mockResolvedValue({ items: [{ ...pending, status: 'Approved', approvedExerciseId: 77, exerciseName: 'Hack Squat Paused', reviewedByUserId: 1, reviewedAtUtc: '2026-10-21T12:00:00Z' }] });
        renderPage();
        fireEvent.click(await screen.findByTestId('xr-row-12'));
        expect(screen.getByTestId('xr-linked')).toHaveTextContent('Hack Squat Paused');
        expect(screen.queryByTestId('exercise-request-admin-form')).not.toBeInTheDocument();
    });
});
