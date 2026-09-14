import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HistoryChart from '../stitch/HistoryChart';

const fixture = [
  { session: 1, date: '01/09/2026', volume: 18200 },
  { session: 2, date: '03/09/2026', volume: 21400 },
  { session: 3, date: '05/09/2026', volume: 19850 },
  { session: 4, date: '08/09/2026', volume: 23100 },
  { session: 5, date: '10/09/2026', volume: 22600 },
  { session: 6, date: '12/09/2026', volume: 24800 },
  { session: 7, date: '14/09/2026', volume: 25200 },
  { session: 8, date: '16/09/2026', volume: 26400 },
];

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <div
        data-historychart-preview
        style={{ maxWidth: '100%', padding: 16, boxSizing: 'border-box' }}
      >
        <HistoryChart data={fixture} />
      </div>
    </StrictMode>,
  );
}
