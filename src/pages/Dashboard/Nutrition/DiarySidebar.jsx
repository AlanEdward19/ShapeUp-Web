import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function DiarySidebar({ date, goal, totals }) {
    const { language } = useLanguage();
    const pt = language === 'pt-BR';
    const key = `shapeup_diary_note_${localStorage.getItem('shapeup_user_id') || 'current'}_${date}`;
    const [note, setNote] = useState(() => localStorage.getItem(key) || '');
    const [saved, setSaved] = useState(false);
    return <aside className="su-diary-sidebar"><section className="su-journal-sheet"><h2>{pt ? 'Meta do dia' : 'Daily goal'}</h2><strong className="su-diary-remaining">{goal ? Math.max(0, goal.kcal - totals.kcal).toLocaleString(language) : '—'} <small>kcal</small></strong><p>{pt ? 'restantes para a meta calórica' : 'remaining to your calorie goal'}</p><Link to="/dashboard/nutrition/goal">{pt ? 'Revisar minhas metas →' : 'Review my goals →'}</Link></section><section className="su-journal-sheet"><h2>{pt ? 'Anotação do dia' : 'Daily note'}</h2><label htmlFor="diary-note">{pt ? 'Como foi sua alimentação?' : 'How did your nutrition go?'}</label><textarea id="diary-note" className="su-input" rows={4} value={note} onChange={event => { setNote(event.target.value); setSaved(false); }} placeholder={pt ? 'Fome, disposição, ajustes para amanhã…' : 'Hunger, energy, changes for tomorrow…'} /><button className="su-btn su-btn-secondary" onClick={() => { localStorage.setItem(key, note); setSaved(true); }}>{pt ? 'Salvar nota' : 'Save note'}</button>{saved && <p role="status">{pt ? 'Nota salva neste dispositivo.' : 'Note saved on this device.'}</p>}</section><section className="su-journal-sheet"><h2>{pt ? 'Sua rotina alimentar' : 'Your nutrition routine'}</h2><Link className="su-btn su-btn-secondary" to="/dashboard/nutrition/foods">{pt ? 'Adicionar alimento' : 'Add food'}</Link><Link className="su-btn su-btn-secondary" to="/dashboard/nutrition/meal-plans">{pt ? 'Ver meu cardápio' : 'View meal plan'}</Link></section></aside>;
}
