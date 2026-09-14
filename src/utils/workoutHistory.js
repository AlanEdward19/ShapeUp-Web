export function workoutHistory(session) {
 const exercises = (session.exercises || []).map(ex => ({
  ...ex, id: ex.exerciseId, name: ex.exerciseName, skipped: !(ex.sets || []).length,
  sets: (ex.sets || []).map(set => ({...set,reps:set.repetitions,weight:set.load,completed:true})),
 }));
 const volume = exercises.flatMap(ex=>ex.sets).reduce((sum,set)=>sum+Number(set.load || 0)*Number(set.repetitions || 0)*(String(set.loadUnit)==='2'||set.loadUnit==='Lbs'?0.45359237:1),0);
 return {...session,id:session.sessionId,date:session.startedAtUtc,status:session.isCancelled?'skipped':'completed',exercises,totalVol:`${volume} kg`,duration:session.durationSeconds || 0,rpe:session.perceivedExertion};
}
