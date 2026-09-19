import { describe, expect, it } from 'vitest';
import {
    collapseSameDayWeight,
    entryDayKey,
    localDateKey,
    localDayUtcNoonIso,
    upsertSameDayWeight,
} from '../weightHistory';

describe('upsertSameDayWeight', () => {
    const morning = new Date(2026, 8, 18, 8, 0, 0);
    const evening = new Date(2026, 8, 18, 20, 0, 0);
    const nextDay = new Date(2026, 8, 19, 8, 0, 0);

    it('replaces an existing same-calendar-day entry with the latest weight', () => {
        const first = { id: 'a', weight: 80, originalDateObj: morning };
        const second = { id: 'b', weight: 81.5, originalDateObj: evening };
        const result = upsertSameDayWeight([first], second);
        expect(result).toHaveLength(1);
        expect(result[0].weight).toBe(81.5);
        expect(result[0].id).toBe('b');
    });

    it('keeps entries from other days', () => {
        const yesterday = { id: 'y', weight: 79, originalDateObj: nextDay };
        const today = { id: 't', weight: 80, originalDateObj: evening };
        const result = upsertSameDayWeight([yesterday], today);
        expect(result).toHaveLength(2);
        expect(result.map((item) => item.id).sort()).toEqual(['t', 'y']);
    });

    it('collapses API DateOnly rows against a local log without originalDateObj', () => {
        const fromApi = { id: '2026-09-18', date: '2026-09-18', weight: 80 };
        const local = {
            id: 'local-2026-09-18',
            day: '2026-09-18',
            date: 'Sep 18, 2026',
            weight: 81.2,
            originalDateObj: '2026-09-18T23:10:00.000Z',
        };
        const result = upsertSameDayWeight([fromApi], local);
        expect(result).toHaveLength(1);
        expect(result[0].weight).toBe(81.2);
    });

    it('collapses persisted locale-only history (JSON.stringify dropped Dates)', () => {
        const stored = { id: 1, date: 'Sep 18, 2026', weight: 80 };
        const local = { id: 'local-x', date: 'Sep 18, 2026', weight: 82, originalDateObj: new Date(2026, 8, 18, 21, 0, 0) };
        const result = upsertSameDayWeight([stored], local);
        expect(result).toHaveLength(1);
        expect(result[0].weight).toBe(82);
    });

    it('localDateKey is calendar-day local, not UTC instant', () => {
        expect(localDateKey(morning)).toBe(localDateKey(evening));
        expect(localDateKey(morning)).not.toBe(localDateKey(nextDay));
    });

    it('localDayUtcNoonIso keeps the user calendar day as UTC DateOnly', () => {
        expect(localDayUtcNoonIso(evening)).toBe(`${localDateKey(evening)}T12:00:00.000Z`);
    });
});

describe('entryDayKey', () => {
    it('uses the local calendar of the timestamp, not API DateOnly', () => {
        const updatedAtUtc = '2026-09-19T01:22:00.000Z';
        expect(entryDayKey({ date: '2026-09-19', updatedAtUtc })).toBe(localDateKey(updatedAtUtc));
    });
});

describe('collapseSameDayWeight', () => {
    it('keeps the newest row when GET and localStorage both have today', () => {
        const result = collapseSameDayWeight([
            { id: 'api', date: '2026-09-18', weight: 80, originalDateObj: '2026-09-18T12:00:00.000Z' },
            { id: 'local-2026-09-18', day: '2026-09-18', weight: 81, originalDateObj: '2026-09-18T20:00:00.000Z' },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].weight).toBe(81);
    });

    it('collapses two rows that show the same date but used different API days', () => {
        const result = collapseSameDayWeight([
            { id: 'local-2026-09-18', date: 'Sep 18, 2026', weight: 96, originalDateObj: '2026-09-18T22:22:00.000-03:00' },
            { id: '2026-09-19', date: 'Sep 18, 2026', weight: 95.6, originalDateObj: '2026-09-19T01:22:00.000Z' },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].weight).toBe(96);
    });
});
