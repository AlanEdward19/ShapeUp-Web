import { Droplets, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import useHydration, { waterPercent } from '../hooks/useHydration';

export default function HydrationMetric({ date, goalMl }) {
  const { water, addWater, removeWater } = useHydration(date);
  const percent = waterPercent(water, goalMl);
  const liters = (ml) => (ml / 1000).toLocaleString('pt-BR');
  return (
    <div className="su-hydration-metric">
      <span>Hidratação{percent !== null && <> · {percent}%</>}</span>
      <div className="su-water-value">
        <strong>{liters(water)} <small>{goalMl ? `/ ${liters(goalMl)} litros` : 'litros'}</small></strong>
        <button type="button" aria-label="Remover 250 ml de água" disabled={water <= 0} onClick={removeWater}><Minus size={12} />−250ml</button>
        <button type="button" aria-label="Registrar 250 ml de água" onClick={addWater}><Droplets size={12} />+250ml</button>
      </div>
      {percent !== null && <progress max={100} value={percent} aria-label="Progresso da meta de água" />}
      <p>{goalMl ? 'Sincronizado com a sua conta' : <>Sem meta definida · <Link to="/dashboard/nutrition/goal">definir meta</Link></>}</p>
    </div>
  );
}
