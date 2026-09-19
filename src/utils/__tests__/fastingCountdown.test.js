import { describe, expect, it } from 'vitest';
import { formatFastingCountdown, fastingRemainingSeconds } from '../fastingCountdown';

describe('formatFastingCountdown (IFTW-02)', () => {
    const now = Date.parse('2026-06-15T12:00:00.000Z');

    it('formats 3661s remaining as 01:01:01', () => {
        const boundary = new Date(now + 3661 * 1000).toISOString();
        expect(formatFastingCountdown(boundary, now)).toBe('01:01:01');
        expect(fastingRemainingSeconds(boundary, now)).toBe(3661);
    });

    it('formats 59s remaining as 00:00:59', () => {
        const boundary = new Date(now + 59 * 1000).toISOString();
        expect(formatFastingCountdown(boundary, now)).toBe('00:00:59');
    });

    it('clamps past boundary to 00:00:00', () => {
        const boundary = new Date(now - 1000).toISOString();
        expect(formatFastingCountdown(boundary, now)).toBe('00:00:00');
        expect(fastingRemainingSeconds(boundary, now)).toBe(0);
    });
});
