import { createElement, useEffect, useState } from 'react';
import Workspace from './Workspace';
import { nodeText, sourceDocument } from './sourceRuntime';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserManagementApi } from '../hooks/api/useUserManagementApi';

export default function StitchSettings() {
  const key = `shapeup_profile_details_${localStorage.getItem('shapeup_user_id') || 'current'}`;
  const [values, setValues] = useState(() => { try { return { name: localStorage.getItem('shapeup_user_name') || '', email: localStorage.getItem('shapeup_user_email') || '', ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return {}; } });
  const [notice, setNotice] = useState('');
  const { getMe } = useUserManagementApi();
  useEffect(() => { let active = true; getMe().then(user => { if (active) setValues(previous => ({ ...previous, name: user.name || user.fullName || previous.name, email: user.email || previous.email })); }).catch(() => {}); return () => { active = false; }; }, [getMe]);
  const { resetPassword } = useAuth();
  const { setUnitSystem, language, setLanguage, t } = useLanguage();
  const document = sourceDocument('settings');
  const profileFields = [...document.querySelectorAll('#perfil input,#perfil textarea,#perfil select')];
  const fieldNames = ['name', 'email', 'cref', 'phone', 'bio', 'specialty'];
  const update = (field, value) => { setNotice(''); setValues(previous => ({ ...previous, [field]: value })); };
  return <Workspace name="settings" bind={(node, props, children) => {
    if (node.id === 'notacao') return <section {...props}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap',paddingBottom:24,marginBottom:24,borderBottom:'1px solid #3a2d27'}}><div><label htmlFor="settings-language" style={{fontSize:14,fontWeight:600,color:'#f3eae5'}}>{t('preferences.lang.title')}</label><p style={{fontSize:12,color:'#968882',marginTop:4}}>{t('preferences.lang.desc')}</p></div><select id="settings-language" value={language} onChange={event => setLanguage(event.target.value)} style={{background:'#211a17',color:'#f3eae5',border:'1px solid #3a2d27',borderRadius:4,padding:'8px 12px'}}><option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="es">Español</option></select></div>{children}</section>;
    const index = profileFields.indexOf(node);
    if (index >= 0) { delete props.defaultValue; props.value = values[fieldNames[index]] || ''; props.onChange = event => update(fieldNames[index], event.target.value); props['aria-label'] = node.parentElement.querySelector('label')?.textContent.trim() || fieldNames[index]; }
    if (node.id === 'save-btn') props.onClick = () => { localStorage.setItem(key, JSON.stringify(values)); localStorage.setItem('shapeup_user_name', values.name || ''); window.dispatchEvent(new Event('shapeup_profile_updated')); setNotice('Alterações salvas com sucesso.'); };
    if (node.id === 'toast') { props.className = props.className.replace('hidden', 'flex'); props.hidden = !notice; props.role = 'status'; return <div {...props}>{notice}</div>; }
    if (node.localName === 'input' && props.name === 'unit_system') props.onChange = () => { const metric = node === document.querySelector('[name=unit_system]'); setUnitSystem(metric ? 'metric' : 'imperial'); update('units', metric ? 'metric' : 'imperial'); };
    if (node.localName === 'input' && props.type === 'checkbox') { const field = `notification-${[...document.querySelectorAll('input[type=checkbox]')].indexOf(node)}`; props.defaultChecked = values[field] ?? props.defaultChecked; props.onChange = event => update(field, event.target.checked); }
    if (node.localName === 'select' && index < 0) { const field = `notation-${[...document.querySelectorAll('select')].indexOf(node)}`; props.defaultValue = values[field] ?? props.defaultValue; props.onChange = event => update(field, event.target.value); }
    const text = nodeText(node);
    if (node.localName === 'button' && text === 'Atualizar senha') props.onClick = async () => { try { await resetPassword(values.email); setNotice('Enviamos as instruções de redefinição para seu e-mail.'); } catch { setNotice('Não foi possível enviar. Confira seu e-mail e tente novamente.'); } };
    if (node.children.length === 0 && text === 'Ativado via TOTP') return createElement(node.localName, props, 'Não configurado');
    if (node.children.length === 0 && /Última alteração realizada|Chrome 124|iOS 17.4/.test(text)) return createElement(node.localName, props, '');
    if (node.children.length === 0 && text === 'MacBook Pro 16″') return createElement(node.localName, props, 'Navegador atual');
    if (node.localName === 'button' && /Reconfigurar|Encerrar outras sessões/.test(text)) props.onClick = () => setNotice('Esta operação ainda não está disponível no serviço de autenticação.');
  }} />;
}

