import { buildWorkoutStatePayload } from './workoutStatePayload';

const operationKey = (sessionId, setId) => `shapeup_set_op_${sessionId}_${setId}`;

// Um operation_id por série na sessão: marcar, desmarcar e marcar de novo reenvia o mesmo id,
// e o servidor trata o repetido como sucesso sem criar segunda série.
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

/**
 * Corpo de POST /workouts/{sessionId}/sets para uma série marcada, com o mesmo preenchimento
 * (reps/carga/RPE prescritos) e validações que o restante do treino usa.
 * Devolve null quando não há o que enviar.
 */
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

/**
 * Marca a série pela fila offline (mutationQueue): a tela já mostra a série feita e o envio
 * é durável, com retry. Cada série tem a sua própria chave, então uma não substitui outra.
 */
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
