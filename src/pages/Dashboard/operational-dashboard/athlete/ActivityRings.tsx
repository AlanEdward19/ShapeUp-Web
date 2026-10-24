import type { ReactElement } from 'react';

export type Ring = { pct: number | null; color: string; label: string };

type ActivityRingsProps = {
  rings: Ring[];
  size?: number;
  stroke?: number;
  gap?: number;
  summary: string;
};

/** Concentric progress rings (outermost first). A null pct draws an empty track. */
export default function ActivityRings({ rings, size = 176, stroke = 15, gap = 5, summary }: ActivityRingsProps): ReactElement {
  const center = size / 2;
  return (
    <svg className="ah-rings" viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={summary}>
      {rings.map((ring, index) => {
        const radius = center - stroke / 2 - index * (stroke + gap) - 1;
        const circumference = 2 * Math.PI * radius;
        const fill = Math.max(0, Math.min(100, ring.pct ?? 0)) / 100;
        return (
          <g key={ring.label} transform={`rotate(-90 ${center} ${center})`}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={ring.color} strokeOpacity={0.16} strokeWidth={stroke} />
            <circle
              className="ah-ring-fill"
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - fill)}
              opacity={fill > 0 ? 1 : 0}
            />
          </g>
        );
      })}
    </svg>
  );
}
