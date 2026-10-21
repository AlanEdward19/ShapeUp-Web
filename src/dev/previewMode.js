/**
 * Dev-only: with localStorage.shapeup_preview = '<role>' the authenticated routes render
 * without a Firebase session and every /api call answers with an empty page.
 * Never active in production builds.
 */
export const previewRole = () => (import.meta.env.DEV ? localStorage.getItem('shapeup_preview') : null);

export function installPreviewApi() {
  const role = previewRole();
  if (!role) return;
  localStorage.setItem('shapeup_role', role);
  const native = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api')) return native(input, init);
    const body = /\/me(\?|$)/.test(url)
      ? { id: 1, userId: 1, displayName: 'Alan Oliveira', email: 'alan@shapeup.app' }
      : { items: [], nextCursor: null };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  };
}
