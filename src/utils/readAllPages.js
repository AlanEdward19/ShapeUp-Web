export async function readAllPages(fetchPage) {
 const items = [];
 const seen = new Set();
 let cursor;
 do {
  const page = await fetchPage(cursor);
  items.push(...(Array.isArray(page) ? page : page?.items || []));
  cursor = page?.nextCursor;
  if (cursor && seen.has(cursor)) throw new Error('Repeated pagination cursor');
  if (cursor) seen.add(cursor);
 } while (cursor);
 return items;
}
