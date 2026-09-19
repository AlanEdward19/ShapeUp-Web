import { expect,it } from 'vitest';
import { executedExercisesForMap, workoutHistory } from '../workoutHistory';
import { readAllPages } from '../readAllPages';
it('keeps duration and distance on TimeBased history sets (TBE-05)', () => {
    const item = workoutHistory({
        sessionId: 'run-1',
        startedAtUtc: '2026-09-12T12:00:00Z',
        isCompleted: true,
        exercises: [{
            exerciseId: 3,
            exerciseName: 'Run',
            sets: [{ durationSeconds: 600, distanceMeters: 1000, load: null, repetitions: null }],
        }],
    });
    expect(item.exercises[0].sets[0].duration).toBe(600);
    expect(item.exercises[0].sets[0].distance).toBe(1000);
});

it('maps numeric API setType to working for history badges', () => {
    const item = workoutHistory({
        sessionId: 's1',
        startedAtUtc: '2026-09-12T12:00:00Z',
        isCompleted: true,
        exercises: [{
            exerciseId: 1,
            exerciseName: 'Bench',
            sets: [{ setType: 3, load: 80, repetitions: 8 }],
        }],
    });
    expect(item.exercises[0].sets[0].type).toBe('working');
});

it('normalizes completed sessions and converts pounds for volume totals',()=>{
 const item=workoutHistory({sessionId:'real',startedAtUtc:'2026-09-12T12:00:00Z',isCompleted:true,exercises:[{exerciseId:7,exerciseName:'Real',sets:[{load:100,loadUnit:2,repetitions:10}]}]});
 expect(parseFloat(item.totalVol)).toBeCloseTo(453.59237);expect(item.exercises[0].name).toBe('Real');
});
it('reads each backend cursor once',async()=>{
 const calls=[];const items=await readAllPages(async cursor=>{calls.push(cursor);return cursor?{items:[2],nextCursor:null}:{items:[1],nextCursor:'next'};});
 expect(items).toEqual([1,2]);expect(calls).toEqual([undefined,'next']);
});

it('keeps only executed exercises for the session muscle map', () => {
    expect(executedExercisesForMap({
        exercises: [
            { name: 'Skip', skipped: true, sets: [] },
            { name: 'Do', skipped: false, sets: [{ type: 'working' }] },
        ],
    }).map((ex) => ex.name)).toEqual(['Do']);
});
