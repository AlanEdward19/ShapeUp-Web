import { buildWorkoutStatePayload } from './workoutStatePayload';

const operationKey = (sessionId, setId) => `shapeup_set_op_${sessionId}_${setId}`;

// Mesmo operation_id por série na sessão, para o reenvio não criar segunda série.
const operationIdFor = (sessionId, setId) => {
    const key = operationKey(sessionId, setId);
    try {
        const stored = localStorage.getItem(key);
        if (stored) return stored;
    } catch { /* storage indisponível: o id vale só para este envio */ }
    const id = crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try { localStorage.setItem(key, id); } catch { /* ignore */ }
    return id;
};

// Corpo de POST /workouts/{sessionId}/sets; null quando não há o que enviar.
export const buildMarkSetBody = ({ sessionId, exercise, set, unitSystem }) => {
    const { exercises } = buildWorkoutStatePayload({
        sessionId,
        exercises: [{ ...exercise, sets: [{ ...set, completed: true }] }],
        unitSystem,
    });
    const built = exercises[0];
    if (!built) return null;
    return {
        operationId: operationIdFor(sessionId, set.id),
        exerciseId: built.exerciseId,
        set: built.sets[0],
    };
};

// Envia pela fila offline, com uma chave por série para uma não substituir a outra.
export const enqueueMarkedSet = ({ enqueueMutation, sessionId, exercise, set, unitSystem }) => {
    if (!sessionId) return;
    const body = buildMarkSetBody({ sessionId, exercise, set, unitSystem });
    if (!body) return;
    enqueueMutation({
        endpoint: `/api/training/workouts/${sessionId}/sets`,
        method: 'POST',
        body,
        dedupeKey: `workout-set-${sessionId}-${set.id}`,
    });
};
