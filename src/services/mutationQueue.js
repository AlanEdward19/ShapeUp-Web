// Offline-first mutation queue (ROADMAP.md Fase 1 -- Offline foundation).
//
// State machine per queued mutation: local -> pending -> syncing -> synced | conflict | failed
//   local:    just created, not yet handed to the network layer
//   pending:  waiting for its turn (offline, or scheduled for retry after a transient failure)
//   syncing:  request currently in flight
//   synced:   delivered successfully -- removed from the queue right after
//   conflict: server returned 409 -- needs a human/app decision, never auto-retried
//   failed:   non-retryable 4xx (permission denied, bad request, not found -- retrying the
//             same request won't change the outcome), or exhausted MAX_ATTEMPTS retries
//
// 401 is deliberately NOT treated as permanent: apiClient fetches a fresh Firebase token on
// every attempt, so a 401 today (stale cached token) can legitimately succeed on the next
// attempt once the token refreshes -- it's retried with backoff like a network failure, not
// failed immediately. 403 (the token is fine, the user genuinely lost the permission) still
// fails immediately -- retrying can't fix a capability the user no longer has.
//
// Persisted to localStorage so queued writes survive reloads, app crashes, and being offline
// across sessions -- the whole point of a gym-floor "log now, sync later" workflow.
//
// Emits telemetry events for two of the roadmap's day-one SLIs that only make sense measured
// here: "sync success" (did a queued write eventually land?) and "queue delay" (createdAt ->
// synced/failed, i.e. how long the user's data sat unsynced).
import { logEvent, logError } from '../utils/telemetry.js';
// apiClient is loaded lazily (dynamic import) rather than statically -- it pulls in
// Firebase, which the state machine itself has no need for. This also lets the state
// machine be exercised without ever touching Firebase (see mutationQueue.selfcheck.mjs).
let sendMutation = null;
export const __setMutationSender = (fn) => { sendMutation = fn; };

const getSender = async () => {
    if (sendMutation) return sendMutation;
    const { apiClient } = await import('./apiClient');
    return apiClient;
};

const STORAGE_KEY = 'shapeup_mutation_queue';
const MAX_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 2000; // backoff: 2s, 4s, 8s, 16s, 32s
const POLL_INTERVAL_MS = 10000;

const loadQueue = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

let queue = loadQueue();
let processing = false;
const listeners = new Set();

const persist = (nextQueue) => {
    queue = nextQueue;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    listeners.forEach(cb => cb(queue));
};

export const subscribeMutationQueue = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export const getMutationQueue = () => queue;

/**
 * Enqueues a write request descriptor for durable, offline-safe delivery via apiClient.
 * Always succeeds synchronously (it's just a localStorage write) -- callers no longer need
 * try/catch around the actual network call, the queue handles retry/backoff/conflict.
 *
 * `dedupeKey`, when given, supersedes any not-yet-synced item sharing that key instead of
 * appending a duplicate -- for high-frequency "sync current state" writes (e.g. a workout
 * session's progress) where only the latest payload matters, not every intermediate delta.
 */
export const enqueueMutation = ({ endpoint, method = 'POST', body, dedupeKey = null }) => {
    const now = Date.now();
    const existingIndex = dedupeKey
        ? queue.findIndex(m => m.dedupeKey === dedupeKey && m.status !== 'syncing' && m.status !== 'synced')
        : -1;

    let id;
    let nextQueue;
    if (existingIndex >= 0) {
        id = queue[existingIndex].id;
        nextQueue = queue.map((m, i) => i === existingIndex
            ? { ...m, endpoint, method, body, status: 'pending', error: null, httpStatus: null, updatedAt: now, nextAttemptAt: now }
            : m);
    } else {
        id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
        const item = {
            id, endpoint, method, body, dedupeKey,
            status: 'pending',
            attempts: 0,
            error: null,
            httpStatus: null,
            createdAt: now,
            updatedAt: now,
            nextAttemptAt: now,
        };
        nextQueue = [...queue, item];
    }

    persist(nextQueue);
    processQueue();
    return id;
};

export const retryMutation = (id) => {
    const now = Date.now();
    persist(queue.map(m => m.id === id
        ? { ...m, status: 'pending', attempts: 0, error: null, httpStatus: null, nextAttemptAt: now }
        : m));
    processQueue();
};

export const discardMutation = (id) => {
    persist(queue.filter(m => m.id !== id));
};

export const processQueue = async () => {
    if (processing) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    processing = true;
    try {
        const now = Date.now();
        const runnableIds = queue.filter(m => m.status === 'pending' && m.nextAttemptAt <= now).map(m => m.id);

        for (const id of runnableIds) {
            const item = queue.find(m => m.id === id);
            if (!item) continue; // discarded mid-loop

            persist(queue.map(m => m.id === id ? { ...m, status: 'syncing' } : m));

            try {
                const send = await getSender();
                await send(item.endpoint, {
                    method: item.method,
                    body: item.body !== undefined ? JSON.stringify(item.body) : undefined,
                });
                // Delivered -- drop it, nothing left to show or retry.
                logEvent('mutation_sync_success', { endpoint: item.endpoint, queueDelayMs: Date.now() - item.createdAt });
                persist(queue.filter(m => m.id !== id));
            } catch (err) {
                const attempts = item.attempts + 1;
                const isPermanent4xx = err.status && err.status >= 400 && err.status < 500
                    && err.status !== 409 && err.status !== 401;

                let status;
                let nextAttemptAt = now;
                if (err.status === 409) {
                    status = 'conflict';
                } else if (isPermanent4xx || attempts >= MAX_ATTEMPTS) {
                    status = 'failed';
                } else {
                    status = 'pending';
                    nextAttemptAt = now + RETRY_BASE_DELAY_MS * (2 ** (attempts - 1));
                }
                if (status !== 'pending') {
                    logError('mutation_sync_failed', err, { endpoint: item.endpoint, status, attempts, httpStatus: err.status, queueDelayMs: Date.now() - item.createdAt });
                }
                persist(queue.map(m => m.id === id
                    ? { ...m, status, attempts, error: err.message || 'Unknown error', httpStatus: err.status ?? null, updatedAt: Date.now(), nextAttemptAt }
                    : m));
            }
        }
    } finally {
        processing = false;
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => processQueue());
    setInterval(processQueue, POLL_INTERVAL_MS);
    // Drain anything left over from a previous session/tab once the app boots.
    processQueue();
}
