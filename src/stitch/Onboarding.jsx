import { createElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchTemplate from './StitchTemplate';
import { nodeText, sourceDocument } from './sourceRuntime';
import { useNutritionApi } from '../hooks/api/useNutritionApi';

const headings = ['Bem-vindo ao ShapeUp.', 'Nutrição & Gasto Calórico.', 'Seu Perfil de Atleta.', 'Seu Workspace Está Pronto.'];
const badges = ['Calibração de Abertura', 'Fórmula de Combustível', 'Registro de Performance', 'Setup Finalizado'];
export default function StitchOnboarding() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { completeOnboarding } = useNutritionApi();
  const key = `shapeup_setup_${localStorage.getItem('shapeup_user_id') || 'current'}`;
  const [values, setValues] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } });
  const navigate = useNavigate();
  const document = sourceDocument('onboarding');
  const update = (field, value) => setValues(previous => ({ ...previous, [field]: value }));
  const finish = async () => {
    if (saving) return;
    if (!values.age || !values.sex || !values['field-3']) { setStep(3); setError('Informe idade, sexo biológico e altura para calcular sua meta nutricional.'); return; }
    setSaving(true); setError('');
    try {
      await completeOnboarding({ age: Number(values.age), heightCm: Number(values['field-3']), biologicalSex: values.sex, activityLevel: values.activity || 'Moderate' });
      localStorage.setItem(key, JSON.stringify(values)); setSaved(true); setStep(4);
    } catch (error) { setError(error.message || 'Não foi possível salvar. Tente novamente.'); }
    finally { setSaving(false); }
  };
  return <StitchTemplate name="onboarding" after={error && <p role="alert" style={{position:'fixed',bottom:60,left:24,right:24,padding:16,background:'#211a17',color:'#ffb4ab',zIndex:90}}>{error}</p>} css="[data-selected=true]{border-color:#e06c43!important;background:rgba(224,108,67,.08)!important}[role=radio]:focus-visible{outline:2px solid #e06c43}" bind={(node, props, children) => {
    const action = node.getAttribute('data-source-onclick') || '';
    const target = action.match(/switchStep\((\d)\)/)?.[1];
    if (target) { props.onClick = () => Number(target) === 4 ? finish() : setStep(Number(target)); props.disabled = saving; }
    if (node.id.startsWith('step-content-')) { props.className = props.className.replace('hidden', ''); props.hidden = Number(node.id.slice(-1)) !== step; }
    if (node.id === 'step-content-3') return <div {...props}>{children}<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-sm"><label>Idade<input type="number" min="14" max="100" value={values.age || ''} onChange={event => update('age', event.target.value)} className="w-full bg-oxide-850 border rounded px-3 py-2" /></label><label>Sexo biológico<select value={values.sex || ''} onChange={event => update('sex', event.target.value)} className="w-full bg-oxide-850 border rounded px-3 py-2"><option value="">Selecionar</option><option value="Male">Masculino</option><option value="Female">Feminino</option></select></label><label>Atividade diária<select value={values.activity || 'Moderate'} onChange={event => update('activity', event.target.value)} className="w-full bg-oxide-850 border rounded px-3 py-2"><option value="Sedentary">Sedentário</option><option value="Light">Levemente ativo</option><option value="Moderate">Moderadamente ativo</option><option value="Active">Muito ativo</option></select></label></div></div>;
    if (node.id.startsWith('nav-step-')) { props['aria-current'] = Number(node.id.slice(-1)) === step ? 'step' : undefined; props.style = { borderColor: Number(node.id.slice(-1)) === step ? '#e06c43' : 'transparent' }; }
    if (node.id === 'left-headline') return <h1 {...props}>{headings[step - 1]}</h1>;
    if (node.id === 'left-badge-tag') return <span {...props}>{badges[step - 1]}</span>;
    if (node.id === 'mascot-image') props.src = '/stitch/ryno.png';
    if (['label', 'div'].includes(node.localName) && node.className.includes('cursor-pointer') && !node.querySelector('input') && [...node.parentElement.children].filter(item => item.classList.contains('cursor-pointer')).length > 1) {
      const group = [...document.querySelectorAll('label.cursor-pointer,div.cursor-pointer')].filter(item => item.parentElement === node.parentElement);
      const groupId = `choice-${[...document.querySelectorAll('label.cursor-pointer,div.cursor-pointer')].indexOf(group[0])}`;
      const selected = values[groupId] ?? group.findIndex(item => item.classList.contains('card-selected'));
      const index = group.indexOf(node);
      props.role = 'radio'; props.tabIndex = 0; props['aria-checked'] = selected === index; props['data-selected'] = selected === index;
      props.onClick = () => update(groupId, index); props.onKeyDown = event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); update(groupId, index); } };
      props.className = props.className.replace('card-selected', '');
    }
    if (['input', 'select'].includes(node.localName)) {
      const index = [...document.querySelectorAll('input,select')].indexOf(node);
      const field = `field-${index}`;
      props.defaultValue = values[field] ?? (node.type === 'text' ? (index === 0 ? localStorage.getItem('shapeup_user_name') || '' : '') : '');
      props.onChange = event => update(field, event.target.value);
      props['aria-label'] = node.parentElement.querySelector('label')?.textContent.trim() || node.closest('div')?.previousElementSibling?.textContent.trim() || `Parâmetro ${index + 1}`;
    }
    if (node.children.length === 0 && /1.845 kcal/.test(nodeText(node))) return createElement(node.localName, props, 'Configurar no diário');
    if (action.startsWith('alert(')) { props.onClick = () => saved ? navigate('/dashboard') : finish(); props.disabled = saving; }
    if (node.localName === 'button' && /Carregar foto/.test(nodeText(node))) return <label {...props}>Carregar foto local<input hidden type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file && file.size <= 5 * 1024 * 1024) { const reader = new FileReader(); reader.onload = () => update('avatar', reader.result); reader.readAsDataURL(file); } }} /></label>;
  }} />;
}



