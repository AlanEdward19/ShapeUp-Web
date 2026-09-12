import rows from './copy.tsv?raw';
export const copy = Object.fromEntries(rows.trim().split('\n').map(row => { const [source, en, es] = row.trim().split('|'); return [source, [en, es]]; }));
