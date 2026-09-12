import { linkBinding } from './linkBinding';
import { createElement, useState } from 'react';
import StitchTemplate from './StitchTemplate';
import { nodeText } from './sourceRuntime';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import SeoHead from '../components/SeoHead';
import OrganizationJsonLd from '../components/OrganizationJsonLd';
import AuthBrand from './AuthBrand';
import publicCss from './publicUsability.css?inline';
import { useLanguage } from '../contexts/LanguageContext';

function Alert({ children }) { return children ? <p role="alert" style={{ color: '#ffb4ab', margin: '12px 0', fontSize: 14 }}>{children}</p> : null; }

export function StitchLanding() {
  const { t } = useLanguage();
  return <><SeoHead title={t('seo.home.title')} path="/" /><OrganizationJsonLd /><StitchTemplate name="landing" reveal css={publicCss} bind={(node, props) => {
    linkBinding(node, props);
    if (node.localName === 'a' && props.href === '#cadastro') props.href = /assinatura/i.test(nodeText(node)) ? '/register?role=independent' : '/register?role=professional';
    if (node.localName === 'a' && /consultor/i.test(nodeText(node))) props.href = '/register?role=gym';
    if (node.localName === 'a' && props.href === '#demo-modal') props.onClick = event => { event.preventDefault(); event.currentTarget.getRootNode().getElementById('demo-modal').showModal(); };
    if (['btn-close-modal', 'btn-cancel-modal'].includes(node.id)) props.onClick = event => event.currentTarget.getRootNode().getElementById('demo-modal').close();
    if (node.localName === 'a' && props.href === '#suporte') props.href = '/login';
  }} /></>;
}

function LoginView(state) {
  const [passkeyNotice, setPasskeyNotice] = useState('');
  return <StitchTemplate name="login" css={publicCss} bind={(node, props, children) => {
    if (node.localName === 'div' && node.classList.contains('mb-10') && nodeText(node) === 'ShapeUp') return <AuthBrand />;
    linkBinding(node, props);
    if (node.localName === 'form') return <form {...props} onSubmit={state.handleSubmit}>{state.availableRoles.length ? <div><h2 className="font-heading text-2xl">Selecione seu workspace</h2>{state.availableRoles.map((role, index) => <button key={index} type="button" className="w-full py-3 my-2 border border-brand-border rounded text-left px-3" onClick={() => state.handlePersonaSelect(role, index)}>{role.role}</button>)}</div> : children}<Alert>{state.error || passkeyNotice}</Alert></form>;
    if (node.id === 'password') props.type = state.showPassword ? 'text' : 'password';
    if (node.id === 'toggle-pwd') { props.onClick = () => state.setShowPassword(!state.showPassword); props['aria-label'] = state.showPassword ? 'Ocultar senha' : 'Mostrar senha'; props['aria-pressed'] = state.showPassword; }
    if (node.parentElement?.id === 'toggle-pwd') return <span {...props}>{state.showPassword ? 'visibility_off' : 'visibility'}</span>;
    if (node.localName === 'input' && props.type === 'checkbox') { delete props.defaultChecked; props.checked = state.rememberSession; props.onChange = event => state.setRememberSession(event.target.checked); }
    if (node.localName === 'button' && /Google Workspace/.test(nodeText(node))) props.onClick = state.handleGoogleSignIn;
    if (node.localName === 'button' && /Passkey/.test(nodeText(node))) props.onClick = () => setPasskeyNotice('O acesso por passkey ainda não está habilitado nesta conta. Use e-mail e senha ou Google.');
    if (node.localName === 'button' && props.type === 'submit') props.disabled = state.loading;
  }} />;
}
export function StitchLogin() { return <Login renderView={state => <LoginView {...state} />} />; }

export function StitchRecovery() { return <ForgotPassword renderView={state => <StitchTemplate name="recovery" bind={(node, props, children) => {
  linkBinding(node, props);
  if (node.id === 'recovery-form') return <form {...props} onSubmit={state.handleSubmit}>{children}<Alert>{state.error}</Alert></form>;
  if (node.id === 'recovery-email') { props.value = state.email; props.onChange = event => state.setEmail(event.target.value); }
  if (node.id === 'submit-btn') props.disabled = state.loading;
  if (node.id === 'recovery-state-form') props.hidden = Boolean(state.success);
  if (node.id === 'recovery-state-success') { props.className = props.className.replace('hidden', ''); props.hidden = !state.success; }
  if (node.id === 'sent-target-email') return createElement(node.localName, props, state.email);
  if (node.getAttribute('data-source-onclick')?.includes('resetRecoveryForm')) props.onClick = () => state.setSuccess('');
  if (node.localName === 'a' && /login|acesso/i.test(nodeText(node))) props.href = '/login';
}} />} />; }


