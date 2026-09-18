import { useState, type ReactElement } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export type HistoryChartDatum = {
  session: number;
  date?: string;
  startedAt?: string;
  volume: number;
};

export type HistoryChartProps = {
  data?: HistoryChartDatum[];
  periods?: number[];
  periodUnit?: string;
  seriesName?: string;
};

export default function HistoryChart({
  data = [],
  periods = [4, 8],
  periodUnit = 'sessões',
  seriesName = 'Volume',
}: HistoryChartProps): ReactElement {
  const [limit, setLimit] = useState(periods[periods.length - 1]);

  return (
    <div style={{ width: '100%', minWidth: 0, height: 220 }}>
      <div
        style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', fontSize: 12 }}
        role="group"
        aria-label="Período do gráfico"
      >
        {periods.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={limit === value}
            onClick={() => setLimit(value)}
            style={{ color: limit === value ? '#e06c43' : 'var(--text-muted)' }}
          >
            {value} {periodUnit}
          </button>
        ))}
      </div>
      {data.length ? (
        <ResponsiveContainer width="100%" height={185}>
          <AreaChart
            accessibilityLayer
            data={data.slice(-limit)}
            margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis dataKey="session" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} width={44} />
            <Tooltip
              contentStyle={{
                background: '#211a17',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
              }}
              labelFormatter={(label, payload) => payload[0]?.payload?.date || label}
            />
            <Area
              dataKey="volume"
              name={seriesName}
              stroke="#e06c43"
              fill="#e06c43"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ padding: '40px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
          Registre uma sessão para acompanhar sua evolução.
        </p>
      )}
    </div>
  );
}
