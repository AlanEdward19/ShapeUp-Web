import { auth } from '../firebase';
import { logEvent } from '../utils/telemetry.js';

// Read-through cache (ROADMAP.md Fase 1 -- Offline foundation): the last successful response
// for each GET endpoint is kept in localStorage. If a GET can't reach the network at all
// (offline, DNS failure -- not a real error response from the server), it's served from here
// instead of failing outright, so previously-loaded screens (gym info, plans, etc.) stay
// usable offline. Deliberately simple: no TTL/invalidation, last-known-good always wins,
// overwritten on every successful fetch.
const READ_CACHE_PREFIX = 'shapeup_read_cache:';

const getCachedResponse = (url) => {
    try {
        const raw = localStorage.getItem(READ_CACHE_PREFIX + url);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const setCachedResponse = (url, data) => {
    try {
        localStorage.setItem(READ_CACHE_PREFIX + url, JSON.stringify({ data, cachedAt: Date.now() }));
    } catch {
        // Storage full/unavailable (private browsing) -- caching is best-effort, never fatal.
    }
};

/**
 * apiClient é uma função wrapper em volta do fetch nativo.
 * Ela cuida automaticamente de anexar o token JWT do Firebase (se o usuário estiver logado)
 * no cabeçalho Authorization de toda requisição.
 */
export const apiClient = async (endpoint, options = {}) => {
    let token = '';

    // Sempre pega um token fresco caso o currentUser exista
    if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // A rota relativa se beneficia do proxy do Vite em ambiente de desenvolvimento
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const isRead = (options.method || 'GET').toUpperCase() === 'GET';

    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (networkError) {
        // fetch() itself threw -- genuinely unreachable (offline/DNS), not a server error
        // response. Only GETs have somewhere safe to fall back to.
        if (isRead) {
            const cached = getCachedResponse(url);
            if (cached) {
                logEvent('read_cache_served', { url, cachedAt: cached.cachedAt });
                return cached.data;
            }
        }
        throw networkError;
    }

    if (!response.ok) {
        const error = new Error(`API Request to ${url} failed with status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    // Se a resposta for 204 No Content, apenas não dá erro e não faz parse de JSON
    if (response.status === 204) return null;

    let data;
    try {
        data = await response.json();
    } catch (_e) {
        // Fallback p/ rotas que não voltam JSON, mas dão sucesso
        data = null;
    }

    if (isRead && data !== null) {
        setCachedResponse(url, data);
    }

    return data;
};
