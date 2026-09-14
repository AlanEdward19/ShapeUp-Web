import { useState } from 'react';
import Workspace from './Workspace';
import { nodeText } from './sourceRuntime';

export function StitchFinance() {
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState('');
  return <Workspace name="finance" after={payment && <p role="status" style={{position:'fixed',bottom:60,right:20,padding:16,background:'#211a17',border:'1px solid #3a2d27',color:'#f3eae5',zIndex:80}}>{payment}</p>} css="[data-stitch-content]{min-width:0}@media(max-width:767px){.stitch-body{max-width:100vw;overflow-x:clip}header>*{min-width:0;max-width:100%}#finance-tabs{max-width:100%;gap:16px}main{overflow-x:clip}.stitch-body .flex.items-center{flex-wrap:wrap}.stitch-body .relative{max-width:100%}.stitch-body input{max-width:100%}.finance-tab-btn{flex:0 0 auto}}[role=button][aria-pressed=true]{outline:2px solid #e06c43;outline-offset:2px}" bind={(node, props) => {
    if (node.title && node.style.width && node.parentElement.classList.contains('h-3')) { props.role = 'button'; props.tabIndex = 0; props['aria-label'] = node.title; props['aria-pressed'] = payment === node.title; props.onClick = () => setPayment(node.title); props.onKeyDown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPayment(node.title); } }; }
    if (node.localName === 'span' && nodeText(node) === 'Gateway de pagamento conectado e operando normalmente') return <span {...props}>Prévia demonstrativa • Sem cobranças reais</span>;
    const action = node.getAttribute('data-source-onclick') || '';
    const target = action.match(/switchFinanceTab\('([^']+)'/);
    if (target) { props.onClick = () => setTab(target[1]); props['aria-pressed'] = tab === target[1]; }
    if (node.classList.contains('finance-tab-panel')) { props.className = props.className.replace('hidden', ''); props.hidden = node.id !== 'tab-panel-' + tab; }
    if (node.localName === 'input' && ['text', 'search'].includes(props.type)) { props.value = query; props.onChange = event => setQuery(event.target.value); }
    if (node.localName === 'tr' && node.parentElement.localName === 'tbody') props.hidden = !nodeText(node).toLowerCase().includes(query.toLowerCase());
    if (node.localName === 'button' && /exportar/i.test(nodeText(node))) props.onClick = event => {
      const rows = [...event.currentTarget.getRootNode().querySelectorAll('tr')].filter(row => !row.closest('[hidden]')).map(row => [...row.children].map(cell => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(';'));
      const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })); const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = 'financeiro.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }} />;
}
