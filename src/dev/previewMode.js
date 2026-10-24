/**
 * Dev-only: with localStorage.shapeup_preview = '<role>' the authenticated routes render
 * without a Firebase session and every /api call answers with an empty page.
 * Never active in production builds.
 */
export const previewRole = () => (import.meta.env.DEV ? localStorage.getItem('shapeup_preview') : null);

const set = (reps, load, rest = 90) => ({ setType: 3, repetitions: reps, load, loadUnit: 1, restSeconds: rest });
const exercise = (id, name, muscles, sets) => ({ exerciseId: id, exerciseName: name, muscles, sets });
const plan = (id, name, days, createdBy) => ({
  planId: id, id, name, notes: 'Foco em progressão de carga.', phase: 'Bloco de volume', assignedWeekdays: days, createdByUserId: createdBy, isActive: true,
  blocks: [{ id: id * 10, type: 1, exercises: [
    exercise(1, 'Supino reto', ['Peitoral', 'Tríceps'], [set(8, 80), set(8, 80), set(8, 80), set(8, 80)]),
    exercise(2, 'Remada curvada', ['Dorsais', 'Bíceps'], [set(10, 70), set(10, 70), set(10, 70)]),
    exercise(3, 'Desenvolvimento com halteres', ['Ombros'], [set(10, 28), set(10, 28), set(10, 28)]),
  ] }],
});
const day = offset => new Date(Date.now() - offset * 86400000).toISOString();
const sessions = [7, 5, 3, 1].map((offset, index) => ({ sessionId: index + 1, id: index + 1, planName: 'Upper A', isCompleted: true, startedAtUtc: day(offset), finishedAtUtc: day(offset), exercises: [] }));

const ex = (id, name, namePt, group, equipment, equipmentPt, type = 1) => ({
  id, name, namePt, exerciseType: type, muscles: [{ muscleGroup: group }], equipments: equipment ? [{ equipmentName: equipment, equipmentNamePt: equipmentPt }] : [],
});
const exercises = [
  ex(1, 'Bench press', 'Supino reto', 1, 'Barbell', 'Barra'), ex(2, 'Incline dumbbell press', 'Supino inclinado com halteres', 2, 'Dumbbell', 'Halteres'),
  ex(3, 'Barbell row', 'Remada curvada', 8192, 'Barbell', 'Barra'), ex(4, 'Lat pulldown', 'Puxada alta', 8192, 'Cable', 'Polia'),
  ex(5, 'Back squat', 'Agachamento livre', 131072, 'Barbell', 'Barra'), ex(6, 'Romanian deadlift', 'Levantamento terra romeno', 262144, 'Barbell', 'Barra'),
  ex(7, 'Plank', 'Prancha', 16384, null, null, 2), ex(8, 'Hamstring stretch', 'Alongamento de posterior de coxa', 262144, null, null, 2),
  ex(9, 'Biceps curl', 'Rosca direta', 16, 'Dumbbell', 'Halteres'), ex(10, 'Triceps pushdown', 'Tríceps na polia', 8, 'Cable', 'Polia'),
];

function mockBody(url) {
  if (/\/me(\?|$)/.test(url)) return { id: 1, userId: 1, displayName: 'Alan Oliveira', email: 'alan@shapeup.app' };
  if (url.includes('/training/workout-plans/user/')) return { items: [plan(1, 'Hipertrofia — Upper A', [1, 4], 1), plan(2, 'Lower B', [2, 5], 9)], nextCursor: null };
  if (/\/training\/exercises(\?|$)/.test(url)) return { items: exercises, nextCursor: null };
  if (url.includes('/training/workouts/user/')) return { items: sessions, nextCursor: null };
  return { items: [], nextCursor: null };
}

export function installPreviewApi() {
  const role = previewRole();
  if (!role) return;
  localStorage.setItem('shapeup_role', role);
  const native = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api')) return native(input, init);
    const body = mockBody(url);
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  };
}
