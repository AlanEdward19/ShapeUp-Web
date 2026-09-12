import { useState } from 'react';
import { Droplets } from 'lucide-react';
export default function HydrationMetric({ date }) {
  const key = `shapeup_water_${localStorage.getItem('shapeup_user_id') || 'current'}_${date}`;
  const [water, setWater] = useState(() => Number(localStorage.getItem(key)) || 0);
  return <div className="su-hydration-metric"><span>Hidratação</span><div className="su-water-value"><strong>{(water / 1000).toLocaleString('pt-BR')} <small>litros</small></strong><button type="button" aria-label="Registrar 250 ml de água" onClick={() => { const next = water + 250; setWater(next); localStorage.setItem(key, String(next)); }}><Droplets size={12} />+250ml</button></div><p>Registro diário neste dispositivo</p></div>;
}
