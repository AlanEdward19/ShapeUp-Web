import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminConsole from '../AdminConsole';
import { withLang } from '../../../test/withLang';

vi.mock('../../../services/platformClient', () => ({
    getAdminOverview: vi.fn(),
    listUsers: vi.fn(),
    setUserActive: vi.fn(),
    listCredentialsUnderReview: vi.fn(),
    approveCredential: vi.fn(),
    rejectCredential: vi.fn(),
    requestCredentialChanges: vi.fn(),
    suspendCredential: vi.fn(),
    revokeCredential: vi.fn(),
    listRoleAssignments: vi.fn(),
    assignUserRole: vi.fn(),
    listSafetyReports: vi.fn(),
    resolveSafetyReport: vi.fn(),
    sendNotice: vi.fn(),
}));

vi.mock('../../../hooks/api/useGymManagementApi', () => ({
    useGymManagementApi: () => ({
        getPlatformTiers: vi.fn().mockResolvedValue({ items: [] }),
        createPlatformTier: vi.fn(),
    }),
}));

vi.mock('../../../hooks/api/useTrainingApi', () => ({
    useTrainingApi: () => ({
        getExercises: vi.fn().mockResolvedValue({ items: [] }),
        createExercise: vi.fn(),
        deleteExercise: vi.fn(),
        getEquipments: vi.fn().mockResolvedValue({ items: [] }),
        createEquipment: vi.fn(),
        deleteEquipment: vi.fn(),
    }),
}));

vi.mock('../../../hooks/api/useAuditLogsApi', () => ({
    useAuditLogsApi: () => ({ getAuditLogs: vi.fn().mockResolvedValue({ items: [] }) }),
}));

import { getAdminOverview, listCredentialsUnderReview, listUsers, setUserActive } from '../../../services/platformClient';

describe('AdminConsole', () => {
    beforeEach(() => {
        localStorage.setItem('shapeup_language', 'en');
        vi.clearAllMocks();
        getAdminOverview.mockResolvedValue({
            usersTotal: 4,
            usersActive: 3,
            credentialsUnderReview: 2,
            openSafetyReports: 1,
        });
        listCredentialsUnderReview.mockResolvedValue({
            items: [{
                id: 9,
                userId: 3,
                requesterName: 'Ana',
                professionType: 'PersonalTrainer',
                issuingAuthority: 'CREF',
                issuingRegion: 'SP',
                credentialNumber: '012345',
            }],
            nextCursor: null,
        });
    });

    it('shows database metrics and a council lookup link', async () => {
        const { getByTestId } = render(withLang(
            <MemoryRouter>
                <AdminConsole />
            </MemoryRouter>,
        ));

        await waitFor(() => expect(getByTestId('metric-usersTotal')).toHaveTextContent('4'));
        expect(getByTestId('metric-openSafetyReports')).toHaveTextContent('1');

        const buttons = getByTestId('admin-console').querySelectorAll('button');
        fireEvent.click([...buttons].find((button) => button.textContent === 'Professionals'));

        await waitFor(() => expect(getByTestId('council-link-9')).toHaveAttribute('href', 'https://www.crefsp.gov.br/'));
    });

    it('shows the request error when a user status change fails', async () => {
        listUsers.mockResolvedValue({
            items: [{ userId: 7, email: 'ana@example.com', displayName: 'Ana', isActive: true }],
        });
        setUserActive.mockRejectedValue(new Error('denied'));

        const { getByTestId, getByRole } = render(withLang(
            <MemoryRouter>
                <AdminConsole />
            </MemoryRouter>,
        ));

        const buttons = getByTestId('admin-console').querySelectorAll('button');
        fireEvent.click([...buttons].find((button) => button.textContent === 'Users'));

        await waitFor(() => expect(getByTestId('user-7')).toBeInTheDocument());
        fireEvent.click(getByRole('button', { name: 'Deactivate' }));

        await waitFor(() => expect(getByRole('alert')).toHaveTextContent('denied'));
    });
});
