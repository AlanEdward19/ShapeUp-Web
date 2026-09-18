import { describe, expect, it } from 'vitest';
import {
    formatDistanceMeters,
    formatDurationSeconds,
    parseDistanceMeters,
    parseDurationInput,
} from '../durationDistance';

describe('parseDurationInput (TBE-02, TBE-03)', () => {
    it('parses mm:ss to seconds', () => {
        expect(parseDurationInput('05:00')).toBe(300);
    });

    it('returns null for invalid or empty input', () => {
        expect(parseDurationInput('abc')).toBeNull();
        expect(parseDurationInput('')).toBeNull();
    });

    it('treats zero duration as invalid for gates', () => {
        expect(parseDurationInput('0:00')).toBeNull();
    });

    it('parses hh:mm:ss', () => {
        expect(parseDurationInput('1:05:00')).toBe(3900);
    });

    it('parses whole seconds', () => {
        expect(parseDurationInput('90')).toBe(90);
    });
});

describe('formatDurationSeconds (TBE-02)', () => {
    it('formats sub-hour durations as mm:ss', () => {
        expect(formatDurationSeconds(300)).toBe('05:00');
    });
});

describe('parseDistanceMeters (TBE-03, TBE-05)', () => {
    it('accepts empty distance as null', () => {
        expect(parseDistanceMeters('')).toEqual({ ok: true, value: null });
        expect(parseDistanceMeters('   ')).toEqual({ ok: true, value: null });
    });

    it('rejects negative distance', () => {
        expect(parseDistanceMeters('-1')).toEqual({ ok: false });
    });

    it('parses positive meters', () => {
        expect(parseDistanceMeters('1000')).toEqual({ ok: true, value: 1000 });
    });
});

describe('formatDistanceMeters (TBE-05)', () => {
    it('uses km at 1000 m and meters below', () => {
        expect(formatDistanceMeters(1000)).toBe('1 km');
        expect(formatDistanceMeters(500)).toBe('500 m');
    });
});
