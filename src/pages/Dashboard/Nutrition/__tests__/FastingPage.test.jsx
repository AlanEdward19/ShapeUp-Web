import { render, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { withLang } from '../../../../test/withLang';
import FastingPage from '../FastingPage';
import { maybeNotifyEatingWindow } from '../fastingPageNotify';

const mockGetClock = vi.fn();
const mockPutAgenda = vi.fn();
const mockStartOverride = vi.fn();
const mockEndOverrideEarly = vi.fn();
const mockEndEarly = vi.fn();
const mockDisableAgenda = vi.fn();
const mockDeclineRecommendation = vi.fn();
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
            endEarly: mockEndEarly,
            disableAgenda: mockDisableAgenda,
            declineRecommendation: mockDeclineRecommendation,
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
        boundaryAt: new Date(Date.now() + 3661 * 1000).toISOString(),
        source: 'Agenda',
    },
};

// The form is closed until the user turns fasting on or edits the schedule.
const openForm = async (getByTestId) => {
    await waitFor(() => {
        const trigger = document.querySelector('[data-testid="fasting-activate"], [data-testid="fasting-edit"]');
        expect(trigger).toBeTruthy();
    });
    fireEvent.click(document.querySelector('[data-testid="fasting-activate"], [data-testid="fasting-edit"]'));
    await waitFor(() => expect(getByTestId('fasting-save')).toBeInTheDocument());
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

describe('maybeNotifyEatingWindow (IFTW-10)', () => {
    it('fires one notification when status becomes Eating and permission granted', () => {
        const calls = [];
        class MockNotification {
            constructor(title, options) {
                calls.push([title, options]);
            }
        }
        MockNotification.permission = 'granted';
        vi.stubGlobal('Notification', MockNotification);
        maybeNotifyEatingWindow('Fasting', 'Eating', (key) => key);
        expect(calls).toEqual([
            ['nutrition.fasting.notifyTitle', { body: 'nutrition.fasting.notifyBody' }],
        ]);
        vi.unstubAllGlobals();
    });

    it('does nothing when permission is denied', () => {
        const calls = [];
        class MockNotification {
            constructor(title, options) {
                calls.push([title, options]);
            }
        }
        MockNotification.permission = 'denied';
        vi.stubGlobal('Notification', MockNotification);
        maybeNotifyEatingWindow('Fasting', 'Eating', (key) => key);
        expect(calls).toHaveLength(0);
        vi.unstubAllGlobals();
    });

    it('does nothing when permission is default', () => {
        const calls = [];
        class MockNotification {
            constructor(title, options) {
                calls.push([title, options]);
            }
        }
        MockNotification.permission = 'default';
        vi.stubGlobal('Notification', MockNotification);
        maybeNotifyEatingWindow('Fasting', 'Eating', (key) => key);
        expect(calls).toHaveLength(0);
        vi.unstubAllGlobals();
    });
});

describe('FastingPage notification permission default (IFTW-10)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetHistory.mockResolvedValue({ items: [] });
        class MockNotification {
            constructor() {
                throw new Error('Notification should not be constructed');
            }
        }
        MockNotification.permission = 'default';
        vi.stubGlobal('Notification', MockNotification);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows Eating clock without notification error toast when permission is default', async () => {
        mockGetClock.mockResolvedValue({
            ...agendaSnapshot,
            clock: {
                status: 'Eating',
                boundaryAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                source: 'Agenda',
            },
        });
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => {
            expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-status', 'Eating');
        });
        expect(queryByTestId('fasting-error')).not.toBeInTheDocument();
    });
});

describe('FastingPage (IFTW-01..05)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPutAgenda.mockResolvedValue({});
        mockStartOverride.mockResolvedValue({});
        mockEndOverrideEarly.mockResolvedValue({});
        mockEndEarly.mockResolvedValue({});
        mockDisableAgenda.mockResolvedValue({});
        mockDeclineRecommendation.mockResolvedValue({});
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
        const disclaimer = getByTestId('fasting-disclaimer');
        expect(disclaimer).toHaveTextContent(/not medical advice/i);
        expect(disclaimer).toHaveTextContent(/pregnant|under 18|eating disorder|clinician/i);
        await openForm(getByTestId);
        expect(getByTestId('fasting-save')).toBeEnabled();
    });

    it('shows presets, eating start grid, and save', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-page')).toBeInTheDocument());
        await openForm(getByTestId);
        expect(getByLabelText(/14:10/)).toBeInTheDocument();
        expect(getByLabelText(/16:8/)).toBeInTheDocument();
        expect(getByLabelText(/18:6/)).toBeInTheDocument();
        expect(getByLabelText(/20:4/)).toBeInTheDocument();
        const eatingStart = getByLabelText(/eating window starts|janela de alimentação/i);
        expect(eatingStart).toBeInTheDocument();
        expect(
            Array.from(eatingStart.querySelectorAll('option')).some((o) => o.value === '12:00'),
        ).toBe(true);
        expect(
            Array.from(eatingStart.querySelectorAll('option')).some((o) => o.value === '12:30'),
        ).toBe(true);
        expect(getByTestId('fasting-save')).toBeInTheDocument();
    });

    it('refuses Save with off-grid eating start and names the field', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText, getByText } = renderPage();
        await openForm(getByTestId);
        fireEvent.click(getByLabelText(/16:8/));
        fireEvent.change(getByLabelText(/eating window starts|janela de alimentação/i), {
            target: { value: '12:15' },
        });
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).not.toHaveBeenCalled();
            expect(getByText(/30-minute grid|intervalos de 30 minutos/i)).toBeInTheDocument();
        });
    });

    it('refuses Save with empty protocol from agenda and names the field', async () => {
        mockGetClock.mockResolvedValue({
            ...idleSnapshot,
            agenda: {
                protocol: '',
                fastHours: 16,
                eatHours: 8,
                eatingStartMinutes: 720,
                timeZone: 'America/Sao_Paulo',
            },
        });
        const { getByTestId, getByText } = renderPage();
        await openForm(getByTestId);
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).not.toHaveBeenCalled();
            expect(getByText(/Choose a protocol|Escolha um protocolo/i)).toBeInTheDocument();
        });
    });

    it('refuses Save with custom fast hours outside 12–23', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText, getByText } = renderPage();
        await openForm(getByTestId);
        fireEvent.click(getByLabelText(/custom|personalizado/i));
        const customHoursInput = getByTestId('fasting-custom-hours');
        customHoursInput.removeAttribute('min');
        customHoursInput.removeAttribute('max');
        fireEvent.change(customHoursInput, { target: { value: '8' } });
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).not.toHaveBeenCalled();
            expect(getByText(/between 12 and 23|entre 12 e 23/i)).toBeInTheDocument();
        });
        fireEvent.change(customHoursInput, { target: { value: '24' } });
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => expect(mockPutAgenda).not.toHaveBeenCalled());
    });

    it('PUTs agenda with eatingStartMinutes 720 for 16:8 at 12:00', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await openForm(getByTestId);
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
            expect(getByTestId('fasting-countdown')).toHaveTextContent(/^01:0[01]:\d{2}$/);
        });
    });

    it('shows Eating countdown with hh:mm:ss and clock status', async () => {
        mockGetClock.mockResolvedValue({
            ...agendaSnapshot,
            clock: {
                status: 'Eating',
                boundaryAt: new Date(Date.now() + 3661 * 1000).toISOString(),
                source: 'Agenda',
            },
        });
        const { getByTestId } = renderPage();
        await waitFor(() => {
            const countdown = getByTestId('fasting-countdown');
            expect(countdown).toHaveTextContent(/^01:0[01]:\d{2}$/);
            expect(countdown).toHaveAttribute('data-clock-status', 'Eating');
        });
    });

    it('GETs clock again when boundary passes and shows next status', async () => {
        vi.useFakeTimers();
        const pastBoundary = new Date(Date.now() - 1000).toISOString();
        const eatingBoundary = new Date(Date.now() + 3600 * 1000).toISOString();
        mockGetClock.mockReset();
        mockGetClock
            .mockResolvedValueOnce({
                ...agendaSnapshot,
                clock: { status: 'Fasting', boundaryAt: pastBoundary, source: 'Agenda' },
            })
            .mockResolvedValueOnce({
                ...agendaSnapshot,
                clock: { status: 'Eating', boundaryAt: eatingBoundary, source: 'Agenda' },
            });
        const { getByTestId } = renderPage();
        await act(async () => {
            await Promise.resolve();
        });
        expect(mockGetClock).toHaveBeenCalledTimes(1);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
            await Promise.resolve();
        });
        expect(mockGetClock.mock.calls.length).toBeGreaterThanOrEqual(2);
        expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-status', 'Eating');
    });

    it('POSTs start override when agenda exists', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeEnabled());
        fireEvent.click(getByTestId('fasting-start'));
        await waitFor(() => expect(mockStartOverride).toHaveBeenCalled());
    });

    it('renders Override source after Start and next GET', async () => {
        mockGetClock.mockReset();
        mockGetClock
            .mockResolvedValueOnce(agendaSnapshot)
            .mockResolvedValueOnce({
                ...agendaSnapshot,
                clock: {
                    status: 'Fasting',
                    boundaryAt: agendaSnapshot.clock.boundaryAt,
                    source: 'Override',
                },
            });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeEnabled());
        fireEvent.click(getByTestId('fasting-start'));
        await waitFor(() => {
            expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-source', 'Override');
        });
    });

    it('renders Agenda source after Cancel and next GET', async () => {
        mockGetClock.mockReset();
        mockGetClock
            .mockResolvedValueOnce({
                ...agendaSnapshot,
                clock: {
                    status: 'Fasting',
                    boundaryAt: agendaSnapshot.clock.boundaryAt,
                    source: 'Override',
                },
            })
            .mockResolvedValueOnce(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-cancel')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-cancel'));
        await waitFor(() => {
            expect(getByTestId('fasting-countdown')).toHaveAttribute('data-clock-source', 'Agenda');
        });
    });

    it('disables Start while clock source is Override', async () => {
        mockGetClock.mockResolvedValue({
            ...agendaSnapshot,
            clock: { status: 'Fasting', boundaryAt: agendaSnapshot.clock.boundaryAt, source: 'Override' },
        });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-start')).toBeDisabled());
    });

    it('is off by default: no countdown, no Start, only an activate button', async () => {
        const { getByTestId, queryByTestId, queryByLabelText } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-empty')).toBeInTheDocument());
        expect(getByTestId('fasting-activate')).toBeInTheDocument();
        expect(queryByTestId('fasting-start')).not.toBeInTheDocument();
        expect(queryByTestId('fasting-countdown')).not.toBeInTheDocument();
        expect(queryByTestId('fasting-save')).not.toBeInTheDocument();
        expect(queryByLabelText(/16:8/)).not.toBeInTheDocument();
    });

    it('asks for confirmation and an optional reason before ending a fast early', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-end-early')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-end-early'));
        expect(getByTestId('fasting-end-confirm')).toBeInTheDocument();
        expect(mockEndEarly).not.toHaveBeenCalled();
        fireEvent.change(getByTestId('fasting-end-reason'), { target: { value: ' Jantar de família ' } });
        fireEvent.click(getByTestId('fasting-end-confirm-btn'));
        await waitFor(() => expect(mockEndEarly).toHaveBeenCalledWith({ reason: 'Jantar de família' }));
        expect(queryByTestId('fasting-end-confirm')).not.toBeInTheDocument();
    });

    it('ends early without a reason when the field is left empty', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-end-early')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-end-early'));
        fireEvent.click(getByTestId('fasting-end-confirm-btn'));
        await waitFor(() => expect(mockEndEarly).toHaveBeenCalledWith({ reason: '' }));
    });

    it('does not offer ending early while in the eating window', async () => {
        mockGetClock.mockResolvedValue({ ...agendaSnapshot, clock: { ...agendaSnapshot.clock, status: 'Eating' } });
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-countdown')).toBeInTheDocument());
        expect(queryByTestId('fasting-end-early')).not.toBeInTheDocument();
    });

    it('turns fasting off only after confirmation', async () => {
        mockGetClock.mockResolvedValue(agendaSnapshot);
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-disable')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-disable'));
        expect(mockDisableAgenda).not.toHaveBeenCalled();
        fireEvent.click(getByTestId('fasting-disable-confirm-btn'));
        await waitFor(() => expect(mockDisableAgenda).toHaveBeenCalledTimes(1));
    });

    it('lets the client turn down the suggestion with an optional reason', async () => {
        mockGetClock.mockResolvedValue({
            ...idleSnapshot,
            recommendation: { protocol: '18:6', fastHours: 18, status: 'Pending' },
        });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-decline')).toBeInTheDocument());
        fireEvent.click(getByTestId('fasting-decline'));
        fireEvent.change(getByTestId('fasting-decline-reason'), { target: { value: 'Treino de manhã cedo' } });
        fireEvent.click(getByTestId('fasting-decline-confirm-btn'));
        await waitFor(() => expect(mockDeclineRecommendation).toHaveBeenCalledWith({ reason: 'Treino de manhã cedo' }));
    });

    it('shows that the suggestion was turned down and hides the decline button', async () => {
        mockGetClock.mockResolvedValue({
            ...idleSnapshot,
            recommendation: { protocol: '18:6', fastHours: 18, status: 'Declined' },
        });
        const { getByTestId, queryByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-declined')).toBeInTheDocument());
        expect(queryByTestId('fasting-decline')).not.toBeInTheDocument();
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
        const { getByLabelText, getByTestId } = renderPage();
        await waitFor(() => expect(getByTestId('fasting-suggestion')).toHaveTextContent('18:6'));
        await openForm(getByTestId);
        expect(getByLabelText(/18:6/)).toBeChecked();
    });

    it('PUTs a protocol different from recommendation when athlete saves', async () => {
        mockGetClock.mockResolvedValue({
            ...idleSnapshot,
            recommendation: { protocol: '18:6', fastHours: 18 },
        });
        const { getByTestId, getByLabelText } = renderPage();
        await openForm(getByTestId);
        expect(getByLabelText(/18:6/)).toBeChecked();
        fireEvent.click(getByLabelText(/16:8/));
        fireEvent.click(getByTestId('fasting-save'));
        await waitFor(() => {
            expect(mockPutAgenda).toHaveBeenCalledWith(
                expect.objectContaining({ protocol: '16:8' }),
            );
        });
    });

    it('GETs history on load and lists at most 14 items', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const items = Array.from({ length: 15 }, (_, i) => ({
            id: `fast-${i}`,
            protocol: '16:8',
            outcome: 'completed',
        }));
        mockGetHistory.mockResolvedValue({ items });
        const { getByTestId } = renderPage();
        await waitFor(() => expect(mockGetHistory).toHaveBeenCalled());
        await waitFor(() => {
            expect(getByTestId('fasting-history').querySelectorAll('li')).toHaveLength(14);
        });
    });

    it('PUTs custom protocol with fastHours', async () => {
        mockGetClock.mockResolvedValue(idleSnapshot);
        const { getByTestId, getByLabelText } = renderPage();
        await openForm(getByTestId);
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
        fireEvent.click(getByTestId('fasting-end-confirm-btn'));
        await waitFor(() => expect(mockEndEarly).toHaveBeenCalled());
        fireEvent.click(getByTestId('fasting-cancel'));
        await waitFor(() => expect(mockCancelOverride).toHaveBeenCalled());
    });
});
