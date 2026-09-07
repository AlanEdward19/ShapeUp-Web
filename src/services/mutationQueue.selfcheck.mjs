// Runnable self-check for the mutation queue's state machine (no test framework in this repo).
// Run with: node src/services/mutationQueue.selfcheck.mjs
//
// Stubs localStorage/window/navigator and swaps the network sender via __setMutationSender
// so this never touches the real apiClient/Firebase wiring.
import assert from 'node:assert/strict';

const store = new Map();
global.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
};

let online = true;
Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: { get onLine() { return online; } },
});

const listeners = {};
global.window = {
    addEventListener: (evt, cb) => { (listeners[evt] ||= []).push(cb); },
};
global.setInterval = () => {}; // no background polling during the check

const {
    enqueueMutation,
    getMutationQueue,
    retryMutation,
    discardMutation,
    processQueue,
    __setMutationSender,
} = await import('./mutationQueue.js');

let responses = [];
__setMutationSender(async () => {
    const next = responses.shift();
    if (!next) return {};
    if (next.throw) throw next.throw;
    if (next.status >= 400) {
        const err = new Error(`status ${next.status}`);
        err.status = next.status;
        throw err;
    }
    return next.body ?? {};
});

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 1. enqueue creates an item and (being online) it settles as synced
const id1 = enqueueMutation({ endpoint: '/api/x', method: 'POST', body: { a: 1 } });
responses = [{ status: 200 }];
await wait(10);
let item = getMutationQueue().find(m => m.id === id1);
assert.equal(item, undefined, 'a successful sync is dropped from the queue');
console.log('1. enqueue + online sync -> synced and removed: OK');
store.clear();

// 2. dedupeKey supersedes instead of appending a duplicate
online = false; // keep it from auto-sending so we can inspect before it resolves
const idA = enqueueMutation({ endpoint: '/api/session/1/state', method: 'PUT', body: { v: 1 }, dedupeKey: 'session-1' });
const idB = enqueueMutation({ endpoint: '/api/session/1/state', method: 'PUT', body: { v: 2 }, dedupeKey: 'session-1' });
assert.equal(idA, idB, 'dedupeKey must reuse the same queue item id');
assert.equal(getMutationQueue().length, 1, 'dedupe must not append a second entry');
assert.deepEqual(getMutationQueue()[0].body, { v: 2 }, 'dedupe must keep the latest payload');
console.log('2. dedupeKey supersedes previous pending item: OK');
online = true;
store.clear();

// 3. offline: enqueue does not attempt to send, item stays pending
online = false;
const idOffline = enqueueMutation({ endpoint: '/api/offline-test', method: 'POST', body: {} });
await processQueue();
item = getMutationQueue().find(m => m.id === idOffline);
assert.equal(item.status, 'pending', 'must stay pending while offline');
console.log('3. offline enqueue stays pending: OK');

// 4. back online -> processes and succeeds -> removed from queue (synced)
online = true;
responses = [{ status: 200 }];
listeners.online.forEach(cb => cb());
await wait(10);
item = getMutationQueue().find(m => m.id === idOffline);
assert.equal(item, undefined, 'synced items are dropped from the queue');
console.log('4. reconnect drains queue, synced item removed: OK');
store.clear();

// 5. 409 -> conflict (never auto-retried)
const idConflict = enqueueMutation({ endpoint: '/api/conflict-test', method: 'PUT', body: {} });
responses = [{ status: 409 }];
await wait(10);
item = getMutationQueue().find(m => m.id === idConflict);
assert.equal(item.status, 'conflict');
console.log('5. 409 response -> conflict status: OK');
store.clear();

// 6. non-409 4xx -> failed immediately (no retry loop for a permanent client error)
const idFailed = enqueueMutation({ endpoint: '/api/bad-request', method: 'POST', body: {} });
responses = [{ status: 400 }];
await wait(10);
item = getMutationQueue().find(m => m.id === idFailed);
assert.equal(item.status, 'failed');
console.log('6. 4xx (non-409) -> failed status: OK');
store.clear();

// 6b. 403 -> failed immediately (permission genuinely denied, retrying can't fix it)
const idForbidden = enqueueMutation({ endpoint: '/api/no-permission', method: 'POST', body: {} });
responses = [{ status: 403 }];
await wait(10);
item = getMutationQueue().find(m => m.id === idForbidden);
assert.equal(item.status, 'failed');
assert.equal(item.httpStatus, 403);
console.log('6b. 403 -> failed immediately: OK');
store.clear();

// 6c. 401 -> retried (transient: apiClient fetches a fresh token every attempt), not failed
const idUnauthorized = enqueueMutation({ endpoint: '/api/stale-token', method: 'POST', body: {} });
responses = [{ status: 401 }];
await wait(10);
item = getMutationQueue().find(m => m.id === idUnauthorized);
assert.equal(item.status, 'pending', '401 must be retried, not failed immediately');
assert.equal(item.attempts, 1);
assert.equal(item.httpStatus, 401);
console.log('6c. 401 -> scheduled for retry, not failed: OK');
discardMutation(idUnauthorized);
store.clear();

// 7. retryMutation resets a failed item back to pending and re-attempts
responses = [{ status: 200 }];
retryMutation(idFailed);
await wait(10);
item = getMutationQueue().find(m => m.id === idFailed);
assert.equal(item, undefined, 'retry should succeed this time and be dropped as synced');
console.log('7. retryMutation resets + resyncs: OK');
store.clear();

// 8. discardMutation removes an item outright
const idDiscard = enqueueMutation({ endpoint: '/api/discard-test', method: 'POST', body: {} });
responses = [{ status: 500 }];
await wait(10);
discardMutation(idDiscard);
item = getMutationQueue().find(m => m.id === idDiscard);
assert.equal(item, undefined);
console.log('8. discardMutation removes item: OK');

console.log('\nAll mutation queue self-checks passed.');
