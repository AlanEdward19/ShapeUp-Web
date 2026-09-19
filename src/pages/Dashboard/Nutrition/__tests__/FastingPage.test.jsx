import { render, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { withLang } from '../../../../test/withLang';
import FastingPage from '../FastingPage';

const mockGetClock = vi.fn();
const mockPutAgenda = vi.fn();
const mockStartOverride = vi.fn();
const mockEndOverrideEarly = vi.fn();
const mockCancelOverride = vi.fn();
const mockGetHistory = vi.fn();

vi.mock('../../../../hooks/api/useFastingApi', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useFastingApi: () => ({
            getClock: mockGetClock,
            putAgenda: mockPutAgenda,
            startOverride: mockStartOverride,
            endOverrideEarly: mockEndOverrideEarly,
            cancelOverride: mockCancelOverride,
            getHistory: mockGetHistory,
        }),
    };
});

const idleSnapshot = {
    agenda: null,
    override: null,
    recommendation: null,
    clock: { status: 'Idle', boundaryAt: null, source: null },
};

const agendaSnapshot = {
    agenda: {
        protocol: '16:8',
        fastHours: 16,
        eatHours: 8,
        eatingStartMinutes: 720,
        timeZone: 'America/Sao_Paulo',
    },
    override: null,
    recommendation: null,
    clock: {
        status: 'Fasting',
        boundaryAt: new Date(Date.now() + 3600 * 1000 + 500).toISOString(),
        source: 'Agenda',
    },
};

const renderPage = () =>
    render(
        withLang(
            <MemoryRouter initialEntries={['/dashboard/nutrition/fasting']}>
                <Routes>
                    <Route path="/dashboard/nutrition/fasting" element={<FastingPage />} />
                    <Route path="/dashboard/nutrition/diary" element={<div data-testid="diary-redirect" />} />
                </Routes>
            </MemoryRouter>,
        ),
    );

describe('FastingPage (IFTW-01..05)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPutAgenda.mockResolvedValue({});
        mockStartOverride.mockResolvedValue({});
        mockEndOverrideEarly.mockResolvedValue({});
        mockCancelOverride.mockResolvedValue({});
        mockGetHistory.mockResolvedValue({ items: [] });
        mockGetClock.mockResolvedValue(idleSnapshot);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('shows disclaimer without blocking save', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-disclaimer')).toBeInTheDocument());
        expect(getByTestId('fasting-save')).toBeEnabled();
    });

    it('shows presets, eating start grid, and save', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-page')).toBeInTheDocument());
        expect(getByLabelText(/16:8/)).toBeInTheDocument();
        expect(getByLabelText(/eating window starts|janela de alimentação/i)).toBeInTheDocument();
        expect(getByTestId('fasting-save')).toBeInTheDocument();
    });

    it('PUTs agenda with eatingStartMinutes 720 for 16:8 at 12:00', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-save')).toBeInTheDocument());
        fireEvent.click(getByLabelText(/16:8/));
        fireEvent.change(getByLabelText(/eating window starts|janela de alimentação/i), {
            target: { value: '12:00' },
        });
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).toHaveBeenCalledWith(
                expect.objectContaining({
                    protocol: '16:8',
                    eatingStartMinutes: 720,
                    timeZone: expect.any(String),
                }),
            );
        });
    });

    it('shows empty state without countdown when Idle and no agenda', async () => {
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-empty')).toBeInTheDocument());
        expect(queryByTestId('fasting-countdown')).not.toBeInTheDocument();
    });

    it('shows hh:mm:ss countdown while Fasting', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => {
            expect(getByTestId('fasting-countdown')).toHaveTextContent(/^01:00:0[0-1]$/);
        });
    });

    it('POSTs start override when agenda exists', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeEnabled());
        fireEvent.click(getByTestId('fasting-start'));
        await waitFor(() => expect(mockStartOverride).toHaveBeenCalled());
    });

    it('disables Start while clock source is Override', async () => {
        mockGetClock.mockResolvedValue({
            ...agendaSnapshot,
            clock: { status: 'Fasting', boundaryAt: agendaSnapshot.clock.boundaryAt, source: 'Override' },
        });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeDisabled());
    });

    it('refuses Start without agenda', async () => {
        const { getByTestId, getByText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-start'));
        await waitFor(() => {
            expect(mockStartOverride).not.toHaveBeenCalled();
            expect(getByText(/Save an agenda|Salve uma agenda/i)).toBeInTheDocument();
        });
    });

    it('shows load error and does not invent snapshot', async () => {
        mockGetClock.mockRejectedValue(new Error('Server exploded'));
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => {
            expect(getByTestId('fasting-error')).toHaveTextContent('Server exploded');
        });
        expect(queryByTestId('fasting-countdown')).not.toBeInTheDocument();
    });

    it('redirects to diary when fasting is disabled', async () => {
        const err = new Error('disabled');
        err.status = 404;
        err.code = 'nutrition.fasting.disabled';
        mockGetClock.mockRejectedValue(err);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('diary-redirect')).toBeInTheDocument());
    });

    it('preselects recommendation protocol when agenda is null', async () => {
        mockGetClock.mockResolvedValue({
            ...idleSnapshot,
            recommendation: { protocol: '18:6', fastHours: 18 },
        });
        const { getByLabelText } = renderPage();
        await waitFor(() => expect(getByLabelText(/18:6/)).toBeChecked());
    });

    it('PUTs custom protocol with fastHours', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-save')).toBeInTheDocument());
        fireEvent.click(getByLabelText(/custom|personalizado/i));
        fireEvent.change(getByTestId('fasting-custom-hours'), { target: { value: '15' } });
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).toHaveBeenCalledWith(
                expect.objectContaining({ protocol: 'custom', fastHours: 15 }),
            );
        });
    });

    it('shows empty history state without placeholder zeros', async () => {
        mockGetHistory.mockResolvedValue({ items: [] });
        const { getByTestId } = renderPage();
        await waitFor(() => {
            expect(getByTestId('fasting-history')).toHaveTextContent(/No completed fasts|Nenhum jejum/i);
        });
        expect(getByTestId('fasting-history')).not.toHaveTextContent('0');
    });

    it('posts end-early and cancel during override', async () => {
        mockGetClock.mockResolvedValue({
            ...agendaSnapshot,
            clock: { status: 'Fasting', boundaryAt: agendaSnapshot.clock.boundaryAt, source: 'Override' },
        });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-end-early')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-end-early'));
        await waitFor(() => expect(mockEndOverrideEarly).toHaveBeenCalled());
        fireEvent.click(getByTestId('fasting-cancel'));
        await waitFor(() => expect(mockCancelOverride).toHaveBeenCalled());
    });
});
