import type { ReactNode } from 'react';

declare const HistoryChart: (props: {
  data?: Array<{ session: number; date: string; volume: number }>;
  periods?: number[];
  periodUnit?: string;
  seriesName?: string;
}) => ReactNode;

export default HistoryChart;
