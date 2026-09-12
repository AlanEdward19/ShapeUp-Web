import { createElement, useEffect, useState } from 'react';
import Workspace from './Workspace';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';
import { useNutritionApi } from '../hooks/api/useNutritionApi';

export default function StitchModeration() {
  const { getPendingModerations, decideModeration } = useNutritionApi();
  const [items, setItems] = useState([]), [selected, setSelected] = useState(null), [error, setError] = useState(''), [deciding, setDeciding] = useState(false), [query, setQuery] = useState('');
  useEffect(() => { let active = true; getPendingModerations().then(result => { if (active) setItems(result?.items || []); }).catch(error => { if (active) setError(error.message); }); return () => { active = false; }; }, [getPendingModerations]);
  const document = sourceDocument('moderation');
  const prototype = document.querySelector('[data-source-onclick^="openInspectionDrawer"]');
  const decide = async decision => { if (!selected || deciding) return; setDeciding(true); try { await decideModeration(selected.requestId, decision); setItems(items => items.filter(item => item.requestId !== selected.requestId)); setSelected(null); } catch (error) { setError(error.message); } finally { setDeciding(false); } };
  return <Workspace name="moderation" after={error && <p role="alert" style={{ position: 'fixed', bottom: 24, right: 24, background: '#211a17', padding: 16, color: '#ffb4ab', zIndex: 100 }}>{error}</p>} bind={(node, props) => {
    const action = node.getAttribute('data-source-onclick') || '';
    if (node === prototype.parentElement) return <div {...props}>{items.filter(item => item.foodName.toLowerCase().includes(query.toLowerCase())).map(item => renderSource(prototype, (element, attributes) => {
      if (element === prototype) attributes.onClick = () => setSelected(item);
      if (element.localName === 'h3') return <h3 {...attributes}>{item.foodName}</h3>;
      if (element.localName === 'strong') { const index = [...prototype.querySelectorAll('strong')].indexOf(element); return <strong {...attributes}>{item.proposedMacros?.[['kcal', 'proteinG', 'carbG', 'fatG'][index]] ?? '—'}</strong>; }
      if (element.children.length === 0 && nodeText(element).startsWith('#ALM')) return <span {...attributes}>#{item.requestId}</span>;
    }, item.requestId))}{items.length === 0 && <p className="p-5 text-[#85766f]">Nenhuma solicitação aguardando moderação.</p>}</div>;
    if (node.id === 'inspectionDrawer') { props.style = { ...props.style, transform: selected ? 'translateX(0)' : 'translateX(100%)' }; props.role = 'dialog'; props['aria-modal'] = true; props['aria-label'] = 'Inspeção nutricional'; props.hidden = !selected; }
    if (node.id === 'drawerBackdrop') { props.hidden = !selected; props.className = props.className.replace('hidden', '').replace('opacity-0', ''); props.onClick = () => setSelected(null); }
    if (action.includes('closeInspectionDrawer')) props.onClick = () => setSelected(null);
    if (node.id === 'drawerTitle') return <h3 {...props}>{selected?.foodName}</h3>;
    if (node.id === 'drawerItemCode') return <span {...props}>Solicitação #{selected?.requestId}</span>;
    if (node.id === 'drawerMeta') return <div {...props}>Enviado por: {selected?.requestedByUserId} • {selected ? new Date(selected.createdAtUtc).toLocaleString('pt-BR') : ''}</div>;
    if (node.id === 'drawerTableBody') return <tbody {...props}>{[['kcal', 'Valor Energético'], ['proteinG', 'Proteínas'], ['carbG', 'Carboidratos'], ['fatG', 'Gorduras Totais']].map(([key, label]) => <tr key={key}><td className="py-2 px-4">{label}</td><td className="py-2 px-4 text-right">{selected?.publicMacros?.[key]}</td><td className="py-2 px-4 text-right">{selected?.proposedMacros?.[key]}</td><td className="py-2 px-4 text-right">Proposta</td></tr>)}</tbody>;
    if (node.localName === 'button' && /Aprovar/.test(nodeText(node))) { props.onClick = () => decide('Approved'); props.disabled = deciding; }
    if (node.localName === 'button' && /Rejeitar|Recusar/.test(nodeText(node))) { props.onClick = () => decide('Rejected'); props.disabled = deciding; }
    if (node.localName === 'input') { props.value = query; props.onChange = event => setQuery(event.target.value); }
    if (node.children.length === 0 && node.id === 'drawerAlertTitle') return createElement(node.localName, props, 'Compare os valores publicados com a proposta');
    if (node.id === 'drawerAlertDesc') return <span {...props}>A decisão só é aplicada após a confirmação do serviço de moderação.</span>;
    if (node.id === 'drawerAlertBadge') return <span {...props}>Aguardando revisão</span>;
  }} />;
}

