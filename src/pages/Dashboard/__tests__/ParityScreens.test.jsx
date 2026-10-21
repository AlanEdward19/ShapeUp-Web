import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import LinksHub from '../LinksHub';
import TrainerInvites from '../TrainerInvites';
import CredentialRegistration from '../CredentialRegistration';
import NutritionPractice from '../Nutrition/NutritionPractice';

vi.mock('../../../services/parityClient', () => ({
    asList: (value) => (Array.isArray(value) ? value : value?.items ?? []),
    getMyTrainer: vi.fn(),
    listNutritionists: vi.fn(),
    removeNutritionist: vi.fn(),
    acceptTrainerInvite: vi.fn(),
    acceptNutritionInvite: vi.fn(),
    listTrainerInvites: vi.fn(),
    revokeTrainerInvite: vi.fn(),
    listNutritionClients: vi.fn(),
    listNutritionAdherence: vi.fn(),
    inviteNutritionClient: vi.fn(),
    listNutritionInvites: vi.fn(),
    revokeNutritionInvite: vi.fn(),
    endNutritionRelationship: vi.fn(),
    getClientDiary: vi.fn(),
    getClientProfile: vi.fn(),
    getClientWeight: vi.fn(),
    getClientHydration: vi.fn(),
    setClientGoal: vi.fn(),
    getClientFasting: vi.fn(),
    getClientFastingHistory: vi.fn(),
    listMealPlanTemplates: vi.fn(),
    createMealPlanTemplate: vi.fn(),
    deleteMealPlanTemplate: vi.fn(),
    assignMealPlanTemplate: vi.fn(),
    getMyCredentials: vi.fn(),
    submitCredential: vi.fn(),
    resubmitCredential: vi.fn(),
}));

const { getMe } = vi.hoisted(() => ({ getMe: vi.fn() }));

vi.mock('../../../hooks/api/useAuthorizationApi', () => ({
    useAuthorizationApi: () => ({ getMe }),
}));

import {
    acceptTrainerInvite,
    getMyCredentials,
    getMyTrainer,
    inviteNutritionClient,
    listMealPlanTemplates,
    listNutritionAdherence,
    listNutritionClients,
    listNutritionInvites,
    listNutritionists,
    listTrainerInvites,
    submitCredential,
} from '../../../services/parityClient';

const renderPage = (ui) => render(withLang(<MemoryRouter>{ui}</MemoryRouter>));

describe('parity management screens', () => {
    beforeEach(() => {
        localStorage.setItem('shapeup_language', 'en');
        vi.clearAllMocks();
        getMe.mockResolvedValue({ userId: 4 });
        getMyTrainer.mockResolvedValue({ hasTrainer: true, trainerId: 9 });
        listNutritionists.mockResolvedValue([{ nutritionistUserId: 3, name: 'Lia', startedAtUtc: '2026-01-01T00:00:00Z' }]);
        listTrainerInvites.mockResolvedValue({ items: [{ inviteId: 5, clientEmail: 'ana@example.com', status: 'Invited' }] });
        getMyCredentials.mockResolvedValue([]);
        submitCredential.mockResolvedValue({ id: 1, status: 'submitted' });
        listNutritionClients.mockResolvedValue([{ clientUserId: 8, name: 'Ana', startedAtUtc: '2026-02-01T00:00:00Z' }]);
        listNutritionAdherence.mockResolvedValue({ items: [{ clientUserId: 8, days: 7, daysLogged: 2 }] });
        listNutritionInvites.mockResolvedValue({ items: [] });
        listMealPlanTemplates.mockResolvedValue([]);
        inviteNutritionClient.mockResolvedValue({ token: 'one-time-token', inviteId: 2 });
        acceptTrainerInvite.mockResolvedValue({ trainerId: 9 });
    });

    it('shows the linked trainer and nutritionist', async () => {
        const { getByTestId } = renderPage(<LinksHub />);
        await waitFor(() => expect(getByTestId('trainer-status')).toHaveTextContent('Trainer #9'));
        expect(getByTestId('nutritionist-3')).toHaveTextContent('Lia');
    });

    it('lists a trainer invite that can be deactivated', async () => {
        const { getByTestId, getByRole } = renderPage(<TrainerInvites />);
        await waitFor(() => expect(getByTestId('invite-5')).toHaveTextContent('ana@example.com'));
        expect(getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    });

    it('submits a CREF credential', async () => {
        const { getByTestId, getByRole } = renderPage(<CredentialRegistration />);
        await waitFor(() => expect(getByTestId('credential-number')).toBeInTheDocument());
        fireEvent.change(getByTestId('credential-number'), { target: { value: '012345' } });
        fireEvent.click(getByRole('button', { name: 'Submit' }));
        await waitFor(() => expect(submitCredential).toHaveBeenCalledWith(expect.objectContaining({
            professionType: 'PersonalTrainer',
            issuingAuthority: 'CREF',
            credentialNumber: '012345',
            country: 'BR',
        })));
    });

    it('creates a nutrition invite and shows the one-time token', async () => {
        const { getByTestId, getByRole } = renderPage(<NutritionPractice />);
        await waitFor(() => expect(getByTestId('client-8')).toHaveTextContent('2/7'));
        fireEvent.click(getByRole('button', { name: 'Create invite' }));
        await waitFor(() => expect(getByTestId('invite-token')).toHaveTextContent('one-time-token'));
    });
});
