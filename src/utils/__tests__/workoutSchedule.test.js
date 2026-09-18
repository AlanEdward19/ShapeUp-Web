import { describe, expect, it } from 'vitest';
import {
    computeSessionsTargetPerWeek,
    exercisesForToday,
    getLocalWeekday,
    mapAssignedWeekdaysToApi,
    plansForToday,
    unmapAssignedWeekdays,
} from '../workoutSchedule';

const plan = (id, assignedWeekdays, exerciseNames = []) => ({
    id,
    assignedWeekdays,
    blocks: exerciseNames.length
        ? [{ exercises: exerciseNames.map((name, i) => ({ id: `${id}-ex-${i}`, name })) }]
        : [],
});

describe('unmapAssignedWeekdays / mapAssignedWeekdaysToApi (WSD-03)', () => {
    it('round-trips Sunday=0 through Saturday=6', () => {
        for (let d = 0; d <= 6; d += 1) {
            expect(unmapAssignedWeekdays(mapAssignedWeekdaysToApi([d]))).toEqual([d]);
        }
    });

    it('maps API strings and dedupes duplicates stably', () => {
        expect(unmapAssignedWeekdays(undefined)).toEqual([]);
        expect(unmapAssignedWeekdays(['Monday', 'Thursday'])).toEqual([1, 4]);
        expect(unmapAssignedWeekdays([1, 1, 4])).toEqual([1, 4]);
    });
});

describe('plansForToday / exercisesForToday (WSD-03, WSD-04)', () => {
    it('aggregates all matching plans, not first-only', () => {
        const plans = [
            plan('a', [1], ['Squat']),
            plan('b', [2], ['Bench']),
            plan('c', [1], ['Row']),
        ];
        expect(plansForToday(plans, 1).map(p => p.id)).toEqual(['a', 'c']);
        expect(exercisesForToday(plans, 1).map(ex => ex.name)).toEqual(['Squat', 'Row']);
    });

    it('returns empty when no plan matches the weekday', () => {
        const plans = [plan('a', [], ['OnlyLegacy'])];
        expect(plansForToday(plans, 3)).toEqual([]);
        expect(exercisesForToday(plans, 3)).toEqual([]);
    });
});

describe('computeSessionsTargetPerWeek (WSD-05, WSD-06)', () => {
    it('returns null for zero plans', () => {
        expect(computeSessionsTargetPerWeek([])).toBeNull();
    });

    it('uses plan count when no weekdays are set', () => {
        expect(computeSessionsTargetPerWeek([plan('a', []), plan('b', [])])).toBe(2);
    });

    it('uses union size when any plan has weekdays (Mon+Thu and Tue → 3)', () => {
        const plans = [plan('a', [1, 4]), plan('b', [2])];
        expect(computeSessionsTargetPerWeek(plans)).toBe(3);
    });

    it('counts a shared weekday once across two plans', () => {
        const plans = [plan('a', [1], ['A']), plan('b', [1], ['B'])];
        expect(computeSessionsTargetPerWeek(plans)).toBe(1);
        expect(exercisesForToday(plans, 1).map(ex => ex.name)).toEqual(['A', 'B']);
    });
});

describe('getLocalWeekday', () => {
    it('matches Date#getDay for a fixed date', () => {
        const date = new Date(2026, 8, 18);
        expect(getLocalWeekday(date)).toBe(date.getDay());
    });
});
