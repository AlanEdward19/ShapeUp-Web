import { useState, type PointerEvent, type ReactElement } from 'react';
import type { ChartPoint } from '../types';

type VolumeChartProps = {
  data: ChartPoint[];
  language: string;
  unit: string;
  empty: string;
};

const W = 640;
const H = 200;
const PAD = { top: 20, right: 18, bottom: 28, left: 18 };

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

/** Volume per completed session, last 8. Hover or tab through points to read a value. */
export default function VolumeChart({ data, language, unit, empty }: VolumeChartProps): ReactElement {
  const series = data.slice(-8);
  const [active, setActive] = useState<number | null>(null);

  if (series.length < 2) {
    return <p className="ah-empty">{empty}</p>;
  }

  const values = series.map(item => item.volume);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const points: [number, number][] = series.map((item, index) => [
    PAD.left + (innerW * index) / (series.length - 1),
    PAD.top + innerH - ((item.volume - min) / span) * innerH * 0.86 - innerH * 0.07,
  ]);
  const line = smoothPath(points);
  const area = `${line} L${points[points.length - 1][0]},${H - PAD.bottom} L${points[0][0]},${H - PAD.bottom} Z`;
  const shown = active ?? series.length - 1;
  const format = (value: number) => Math.round(value).toLocaleString(language);
  const dayLabel = (item: ChartPoint) =>
    new Date(item.startedAt).toLocaleDateString(language, { day: 'numeric', month: 'short' });

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * W;
    let best = 0;
    points.forEach(([px], index) => {
      if (Math.abs(px - x) < Math.abs(points[best][0] - x)) best = index;
    });
    setActive(best);
  };

  return (
    <div className="ah-chart">
      <p className="ah-chart-readout" aria-live="polite">
        <strong>{format(series[shown].volume)}</strong> {unit}
        <span>{dayLabel(series[shown])}</span>
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${series.length} sessões, de ${format(series[0].volume)} a ${format(series[series.length - 1].volume)} ${unit}`}
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="ah-volume-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(fraction => (
          <line key={fraction} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH * fraction} y2={PAD.top + innerH * fraction} className="ah-grid" />
        ))}
        <path d={area} fill="url(#ah-volume-fill)" />
        <path d={line} className="ah-line" fill="none" vectorEffect="non-scaling-stroke" />
        <line x1={points[shown][0]} x2={points[shown][0]} y1={PAD.top} y2={H - PAD.bottom} className="ah-cursor" vectorEffect="non-scaling-stroke" />
        {points.map(([x, y], index) => (
          <circle key={series[index].session} cx={x} cy={y} r={index === shown ? 6 : 3.5} className={index === shown ? 'ah-dot is-active' : 'ah-dot'} vectorEffect="non-scaling-stroke">
            <title>{`${dayLabel(series[index])} · ${format(series[index].volume)} ${unit}`}</title>
          </circle>
        ))}
      </svg>
      <div className="ah-chart-axis">
        <span>{dayLabel(series[0])}</span>
        <span>{dayLabel(series[series.length - 1])}</span>
      </div>
    </div>
  );
}
