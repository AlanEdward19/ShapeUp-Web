import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Utensils } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNutritionApi } from '../hooks/api/useNutritionApi';
import UpcomingWorkout from './UpcomingWorkout';
import HydrationMetric from './HydrationMetric';
export default function AthleteDailyPanel({ volume, streak, sessions, totalPlans, chartData }) {
  const { getDiaryDay, getNutritionProfile } = useNutritionApi();
  const [nutrition, setNutrition] = useState(null);
  const date = new Date().toLocaleDateString('en-CA');
  useEffect(() => { let active = true; Promise.all([getDiaryDay(date), getNutritionProfile()]).then(([diary, profile]) => { if (active) setNutrition({ diary, goal: profile?.activeGoal }); }).catch(() => {}); return () => { active = false; }; }, [date, getDiaryDay, getNutritionProfile]);
  const totals = nutrition?.diary?.totals;
  return <div className="su-athlete-daily">
    <div className="su-athlete-metrics"><section><span>Frequência</span><strong>{streak} <small>dias em sequência</small></strong><p>{sessions} de {totalPlans} planos com sessões</p></section><section><span>Volume semanal</span><strong>{volume} <small>tonelagem</small></strong><p>Carga acumulada nas sessões registradas</p></section><section><span>Nutrição diária</span><strong>{totals?.kcal ?? '—'} <small>/ {nutrition?.goal?.kcal ?? '—'} kcal</small></strong><progress max={nutrition?.goal?.kcal || 1} value={totals?.kcal || 0} /><p>Proteína: <b>{totals?.proteinG ?? '—'}g</b> / {nutrition?.goal?.proteinG ?? '—'}g</p></section><section><HydrationMetric key={date} date={date} /></section></div>
    <div className="su-athlete-columns"><div><UpcomingWorkout /><section className="su-athlete-chart"><span className="su-nutrition-kicker">Sobrecarga progressiva real</span><h2>Evolução do volume de treino</h2>{chartData.length > 1 ? <div style={{height:240}}><ResponsiveContainer><LineChart data={chartData}><CartesianGrid vertical={false} stroke="var(--border-color)" strokeDasharray="3 3" /><XAxis dataKey="session" axisLine={false} tickLine={false} tick={{fill:'var(--text-muted)',fontSize:11}} /><Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border-color)'}} /><Line type="monotone" dataKey="volume" name="Volume" stroke="var(--primary)" strokeWidth={3} dot={{r:4,fill:'var(--bg-main)'}} /></LineChart></ResponsiveContainer></div> : <p>Registre duas sessões para acompanhar sua progressão.</p>}</section></div><aside><section><h2><MessageSquare size={18} />Feedback do treinador</h2><p>Consulte as orientações do seu treinador e envie suas dúvidas sobre a sessão.</p><Link to="/dashboard/messages">Abrir conversa com o treinador →</Link></section><section><h2><Utensils size={18} />Rotina alimentar</h2>{nutrition?.diary?.meals?.length ? <><strong>{nutrition.diary.meals.length} refeições no diário de hoje</strong><p>{totals?.kcal || 0} kcal · {totals?.proteinG || 0}g proteína · {totals?.carbG || 0}g carboidrato</p></> : <p>Acompanhe o cardápio prescrito e registre suas refeições do dia.</p>}<Link className="su-btn su-btn-secondary" to="/dashboard/nutrition/diary">Abrir diário de nutrição</Link></section><section className="su-athlete-note"><h2>Orientações da sessão</h2><p>Confira cadência, descanso e carga prescritos antes de iniciar. As notas de cada exercício estão na sua ficha.</p><Link to="/dashboard/training">Ver séries de hoje →</Link></section></aside></div>
  </div>;
}
