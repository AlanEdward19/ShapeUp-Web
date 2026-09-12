import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function HistoryChart({ data = [], periods = [4, 8], periodUnit = 'sessões', seriesName = 'Volume' }) {
  const [limit, setLimit] = useState(periods.at(-1));
  return <div style={{ width: '100%', minWidth: 0, height: 220 }}>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', fontSize: 12 }} role="group" aria-label="Período do gráfico">{periods.map(value => <button key={value} aria-pressed={limit === value} onClick={() => setLimit(value)} style={{ color: limit === value ? '#e06c43' : '#b8aaa2' }}>{value} {periodUnit}</button>)}</div>
    {data.length ? <ResponsiveContainer width="100%" height={185}><AreaChart accessibilityLayer data={data.slice(-limit)} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="#3a2d27" strokeDasharray="3 3"/><XAxis dataKey="session" stroke="#b8aaa2" fontSize={11}/><YAxis stroke="#b8aaa2" fontSize={11} width={44}/><Tooltip contentStyle={{ background: '#211a17', border: '1px solid #3a2d27', color: '#f3eae5' }} labelFormatter={(label, payload) => payload[0]?.payload?.date || label}/><Area dataKey="volume" name={seriesName} stroke="#e06c43" fill="#e06c43" fillOpacity={.15} isAnimationActive={false}/></AreaChart></ResponsiveContainer> : <p style={{ padding: '40px 16px', color: '#b8aaa2', fontSize: 13 }}>Registre uma sessão para acompanhar sua evolução.</p>}
  </div>;
}

