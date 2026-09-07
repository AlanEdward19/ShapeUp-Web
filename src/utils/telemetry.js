// Client-side observability foundation (ROADMAP.md Fase 1 -- Observabilidade day one).
//
// No SaaS/error-tracking vendor is wired up yet (that needs an account + DSN only the
// product owner can provide). Until then this gives the same day-one visibility locally:
// a structured event log (ring buffer in localStorage, inspectable via DevTools or a future
// "send diagnostics" button) and the one SLI that's purely client-side -- crash-free sessions.
//
// A "session" here is one browser tab's lifetime from load to unload. It counts as crashed
// the moment an uncaught render error, uncaught exception, or unhandled promise rejection is
// observed -- matching how crash-free-session-rate is defined for mobile apps (Firebase
// Crashlytics, etc): distinct sessions with zero crashes / total sessions.

const EVENTS_KEY = 'shapeup_telemetry_events';
const SESSIONS_KEY = 'shapeup_telemetry_sessions';
const MAX_EVENTS = 200;
const MAX_SESSIONS = 100;

const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
let sessionCrashed = false;

const readJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or unavailable (private browsing) -- telemetry is best-effort, never fatal.
    }
};

const appendEvent = (event) => {
    const events = readJson(EVENTS_KEY, []);
    events.push({ ...event, sessionId, timestamp: new Date().toISOString() });
    writeJson(EVENTS_KEY, events.slice(-MAX_EVENTS));
};

const upsertSession = (patch) => {
    const sessions = readJson(SESSIONS_KEY, []);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
        sessions[idx] = { ...sessions[idx], ...patch };
    } else {
        sessions.push({ id: sessionId, startedAt: new Date().toISOString(), crashed: false, ...patch });
    }
    writeJson(SESSIONS_KEY, sessions.slice(-MAX_SESSIONS));
};

/** Logs a structured diagnostic event. Always console-logs too, so DevTools alone is enough locally. */
export const logEvent = (name, data = {}) => {
    console.log(`[telemetry] ${name}`, data);
    appendEvent({ type: 'event', name, data });
};

/** Logs an error and marks the current session as crashed (idempotent per session). */
export const logError = (source, error, data = {}) => {
    const message = error?.message || String(error);
    const stack = error?.stack || null;
    console.error(`[telemetry] ${source}:`, error);
    appendEvent({ type: 'error', source, message, stack, data });

    if (!sessionCrashed) {
        sessionCrashed = true;
        upsertSession({ crashed: true, crashedAt: new Date().toISOString(), crashSource: source });
    }
};

/** Crash-free sessions % over the locally retained session history (see MAX_SESSIONS). */
export const getCrashFreeSessionRate = () => {
    const sessions = readJson(SESSIONS_KEY, []);
    if (sessions.length === 0) return 1;
    const healthy = sessions.filter(s => !s.crashed).length;
    return healthy / sessions.length;
};

export const getTelemetryEvents = () => readJson(EVENTS_KEY, []);
export const getTelemetrySessions = () => readJson(SESSIONS_KEY, []);

upsertSession({});

if (typeof window !== 'undefined') {
    window.addEventListener('error', (e) => {
        logError('window.onerror', e.error || e.message);
    });
    window.addEventListener('unhandledrejection', (e) => {
        logError('unhandledrejection', e.reason);
    });
}
