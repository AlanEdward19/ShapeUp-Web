import { useEffect, useState } from 'react';
import Workspace from './Workspace';
import { sourceDocument, renderSource, nodeText } from './sourceRuntime';
import { useGymManagementApi } from '../hooks/api/useGymManagementApi';

export default function StitchGyms() {
  const { getGyms } = useGymManagementApi();
  const [gyms, setGyms] = useState([]), [query, setQuery] = useState(''), [selected, setSelected] = useState(null);
  useEffect(() => { let active = true; getGyms(undefined, 50).then(result => { if (active) { const list = Array.isArray(result) ? result : result?.items || result?.data || []; setGyms(list); setSelected(list[0] || null); } }).catch(() => {}); return () => { active = false; }; }, [getGyms]);
  const document = sourceDocument('gyms');
  const prototype = document.querySelector('article');
  const listColumn = prototype.parentElement.parentElement;
  const address = gym => typeof gym?.address === 'string' ? gym.address : [gym?.address?.street, gym?.address?.number, gym?.address?.city].filter(Boolean).join(', ');
  const mapQuery = selected ? `${selected.name}, ${address(selected)}` : '';
  return <Workspace name="gyms" css="@media(max-width:767px){[data-gym-page]{height:auto!important;overflow:visible!important}[data-gym-layout]{flex-direction:column!important;overflow:visible!important}[data-gym-list]{width:100%!important;border-right:0}[data-gym-map]{height:500px;min-height:500px;flex:none!important;width:100%}.stitch-body article{max-width:100%}.stitch-body article>div{flex-wrap:wrap;gap:8px}.stitch-body header{padding:16px;gap:12px}.stitch-body header input{min-width:0}.stitch-body header>div{max-width:100%;overflow:auto}}" bind={(node, props) => {
    if (node.classList.contains('material-symbols-outlined') && nodeText(node) === 'facial_recognition') return <span {...props}>face</span>;
    if (node === listColumn) props['data-gym-list'] = true;
    if (node === listColumn.parentElement) props['data-gym-layout'] = true;
    if (node === listColumn.nextElementSibling) return <div {...props} data-gym-map style={{ ...props.style, position: 'relative', minWidth: 0 }}><iframe title="Mapa das academias" style={{ width: '100%', height: '100%', minHeight: 500, border: 0 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'Brasil')}&output=embed`} />{selected && <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20, background: '#211a17', padding: 20, border: '1px solid #3a2d27', borderRadius: 8 }}><strong>{selected.name}</strong><p style={{ fontSize: 13, margin: '8px 0' }}>{address(selected)}</p><a target="_blank" rel="noopener noreferrer" style={{ color: '#e06c43', fontSize: 13 }} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}>Traçar rota</a></div>}</div>;
    if (node.localName === 'div' && node.classList.contains('h-screen')) props['data-gym-page'] = true;
    if (node === prototype.parentElement) return <div {...props}>{gyms.filter(gym => `${gym.name} ${address(gym)}`.toLowerCase().includes(query.toLowerCase())).map(gym => renderSource(prototype, (element, attributes) => {
      if (element === prototype) { attributes.onClick = () => setSelected(gym); attributes.style = { borderColor: gym.id === selected?.id ? '#e06c43' : '#3a2d27' }; }
      if (element.localName === 'h3') return <h3 {...attributes}>{gym.name}</h3>;
      if (element.localName === 'p') return <p {...attributes}>{address(gym) || 'Endereço não informado'}</p>;
      if (element.localName === 'div' && /Ocupação estimada agora/.test(nodeText(element)) && element.parentElement === prototype) return null;
      if (element.localName === 'span' && /Aberto até|Acesso Incluso|64%/.test(nodeText(element))) return null;
      if (element.localName === 'button' && /Fazer Check-in/.test(nodeText(element))) return null;
      if (element.localName === 'button') attributes.onClick = () => setSelected(gym);
    }, gym.id))}{gyms.length === 0 && <p className="text-on-surface-muted">Nenhuma academia disponível.</p>}</div>;
    if (node.localName === 'input') { props.value = query; props.onChange = event => setQuery(event.target.value); }
    if (node.localName === 'svg' && node.getAttribute('viewBox') === '0 0 1000 800') return <iframe key={props.key} title="Mapa das academias" style={{ width: '100%', height: '100%', minHeight: 500, border: 0, filter: 'grayscale(.7) invert(.9) hue-rotate(170deg)' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'Brasil')}&output=embed`} />;
    if (node.localName === 'button' && /Waze|Maps|Ver Espaço/.test(nodeText(node))) props.onClick = () => { if (selected) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank', 'noopener,noreferrer'); };
  }} />;
}



