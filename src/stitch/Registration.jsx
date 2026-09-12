import { createElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { copy } from './copy';
import Register from '../pages/Register';
import StitchTemplate from './StitchTemplate';
import { sourceDocument, renderSource } from './sourceRuntime';
import { linkBinding } from './linkBinding';
import AuthBrand from './AuthBrand';
import publicCss from './publicUsability.css?inline';

const roleMap = { coach: 'professional', athlete: 'independent', manager: 'gym' };

function RegistrationView(state) {
  const { language, translateCopy } = useLanguage();
  const tr = value => { const clean = value.trim().replace(/\s+/g, ' '); const translated = language === 'pt-BR' ? clean : copy[clean]?.[language === 'es' ? 1 : 0] || translateCopy(clean); return value.replace(value.trim(), translated); };
  const invited = Boolean(state.inviteToken);
  const bind = (node, props, children) => {
    linkBinding(node, props);
    for (const attr of ['placeholder', 'title', 'aria-label']) if (props[attr]) props[attr] = tr(props[attr]);
    if (node.localName === 'input' && ['password', 'confirmPassword'].includes(node.id)) props.className += ' st-registration-password';
    if (!invited && node.localName === 'header') return <header {...props}><AuthBrand /></header>;
    if (node.localName === 'div' && node.textContent.includes('Segurança de dados e conformidade integral com LGPD.') && node.parentElement?.localName === 'footer') return null;
    if (!invited && node.localName === 'span' && node.textContent.trim() === 'Passo 1 de 3:') return <span {...props}>{tr(`Passo ${state.step + 1} de 3:`)}</span>;
    if (!invited && node.localName === 'div' && node.parentElement?.classList.contains('grid-cols-3') && node.classList.contains('h-1')) props.style = {background:[...node.parentElement.children].indexOf(node) <= state.step ? '#e06c43' : '#3a2d27'};
    if (node.localName === 'form') {
      props.onSubmit = state.handleSubmit;
      props.noValidate = true;
      return <form {...props}>{children}<input type="hidden" name="firstName" value={state.fullName.trim().split(/\s+/)[0] || ''} /><input type="hidden" name="lastName" value={state.fullName.trim().split(/\s+/).slice(1).join(' ')} /><input type="hidden" name="company_url" value="" />{invited && <input type="hidden" name="birthDate" value="" />}{state.error && <p role="alert" style={{ color: '#ffb4ab', fontSize: 14 }}>{state.error}</p>}</form>;
    }
    if (node.localName === 'input' && ['fullname', 'fullName'].includes(node.id)) { props.id = 'fullName'; props.name = 'fullName'; delete props.defaultValue; props.value = state.fullName; props.onChange = event => state.setFullName(event.target.value); }
    if (node.localName === 'label' && props.htmlFor === 'fullname') props.htmlFor = 'fullName';
    if (node.localName === 'input' && ['email', 'phone'].includes(node.id)) { props.defaultValue = ''; props.readOnly = false; }
    if (node.localName === 'input' && props.name === 'system_role') { delete props.defaultChecked; props.checked = state.selectedRole === roleMap[props.defaultValue]; props.onChange = () => state.setSelectedRole(roleMap[props.defaultValue]); }
    if (node.localName === 'input' && props.name === 'terms') { delete props.defaultChecked; props.checked = state.acceptedTerms; props.onChange = event => state.setAcceptedTerms(event.target.checked); }
    if (node.localName === 'button' && node.getAttribute('data-source-onclick')?.includes('togglePassword')) props.onClick = event => { const input = event.currentTarget.parentElement.querySelector('input'); input.type = input.type === 'password' ? 'text' : 'password'; };
    if (!invited && node.parentElement?.id === 'setup-form' && !node.querySelector('button[type="submit"]')) props.hidden = state.step !== 0;
    if (!invited && node.parentElement?.id === 'setup-form' && node.querySelector('button[type="submit"]')) {
      const passwordRow = sourceDocument('invitation').getElementById('password').closest('.grid');
      const inputClass = 'w-full bg-brand-input border border-brand-border rounded-[6px] px-3 py-2 text-sm text-brand-text';
      return <div {...props}><div hidden={state.step !== 1} style={{ display: 'grid', gap: 14 }}>{passwordRow ? renderSource(passwordRow, bind, 'credentials') : <><label>{tr('Senha')}<input name="password" className={inputClass} required minLength={8} type="password" /></label><label>{tr('Confirmar senha')}<input name="confirmPassword" className={inputClass} required type="password" /></label></>}</div><div hidden={state.step !== 2}><label htmlFor="birthDate" className="text-sm">{tr('Data de nascimento')}</label><input id="birthDate" name="birthDate" className={inputClass} type="date" /></div>{children}{state.step > 0 && <button type="button" onClick={() => state.setStep(state.step - 1)} className="text-sm text-brand-muted">{tr('Voltar')}</button>}</div>;
    }
    if (node.localName === 'button' && props.type === 'submit') { props.disabled = state.loading; if (state.step === 2 && !invited) return createElement('button', props, tr(state.loading ? 'Criando conta…' : 'Concluir cadastro')); }
    if (node.localName === 'span' && node.textContent.trim() === 'Etapa 01/03') return <span {...props}>{tr(`Etapa 0${state.step + 1}/03`)}</span>;
    if (invited && node.localName === 'span' && node.textContent.trim() === 'Rodrigo Vasconcelos') return <span {...props}>{tr('Convite de treinamento')}</span>;
    if (invited && node.localName === 'span' && node.textContent.includes('IronBox')) return null;
    if (invited && node.localName === 'p' && node.textContent.includes('Olá, Matheus!')) return <p {...props}>{tr('Complete seu cadastro para aceitar o convite e acessar seu espaço de treinamento no ShapeUp.')}</p>;
  };
  bind.translateText = (value, node) => node.parentElement?.closest('.material-symbols-outlined, [translate=no]') ? value : tr(value);
  return <StitchTemplate name={invited ? 'invitation' : 'register'} bind={bind} css={publicCss + '.role-option:has(input:checked){border-color:#e06c43;background:rgba(224,108,67,.06)}.role-option:has(input:checked) .role-dot{display:block}.role-option:has(input:checked) .role-radio{border-color:#e06c43}'} />;
}
export default function StitchRegistration() { return <Register renderView={state => <RegistrationView {...state} />} />; }


