import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import SeoHead from '../components/SeoHead';
import OrganizationJsonLd from '../components/OrganizationJsonLd';
import publicCss from './public-auth/publicUsability.css?inline';
import { useLanguage } from '../contexts/LanguageContext';
import PublicShellHost from './public-auth/PublicShellHost';
import { LandingStaticMarkup } from './public-auth/markup/LandingStaticMarkup';
import { LoginPublicMarkup } from './public-auth/markup/LoginPublicMarkup';
import { RecoveryPublicMarkup } from './public-auth/markup/RecoveryPublicMarkup';

function landingBodyClick(event: MouseEvent<HTMLDivElement>, navigate: (path: string) => void) {
  const target = event.target as HTMLElement;
  const button = target.closest('button');
  if (button?.id === 'btn-close-modal' || button?.id === 'btn-cancel-modal') {
    event.preventDefault();
    (
      (event.currentTarget.getRootNode() as ShadowRoot).getElementById('demo-modal') as HTMLDialogElement | null
    )?.close();
    return;
  }
  const anchor = target.closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href') ?? '';
  const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
  const lower = text.toLowerCase();
  if (href === '#cadastro') {
    event.preventDefault();
    navigate(/assinatura/i.test(text) ? '/register?role=independent' : '/register?role=professional');
    return;
  }
  if (/consultor/i.test(text)) {
    event.preventDefault();
    navigate('/register?role=gym');
    return;
  }
  if (href === '#demo-modal') {
    event.preventDefault();
    (
      (event.currentTarget.getRootNode() as ShadowRoot).getElementById('demo-modal') as HTMLDialogElement | null
    )?.showModal();
    return;
  }
  if (href === '#suporte') {
    event.preventDefault();
    navigate('/login');
    return;
  }
  if (/privacidade/.test(lower)) {
    event.preventDefault();
    navigate('/privacy');
    return;
  }
  if (/termos/.test(lower)) {
    event.preventDefault();
    navigate('/terms');
    return;
  }
  if (/entrar|login|área do cliente|voltar ao acesso/.test(lower)) {
    event.preventDefault();
    navigate('/login');
  }
}

export function LandingShell() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <>
      <SeoHead title={t('seo.home.title')} path="/" />
      <OrganizationJsonLd />
      <PublicShellHost
        name="landing"
        reveal
        css={publicCss}
        onBodyClick={(event) => landingBodyClick(event, navigate)}
      >
        <LandingStaticMarkup />
      </PublicShellHost>
    </>
  );
}

export function LoginShell() {
  const [passkeyNotice, setPasskeyNotice] = useState('');
  return (
    <Login
      renderView={(state) => (
        <PublicShellHost name="login" css={publicCss}>
          <LoginPublicMarkup
            state={{
              ...(state as import('./public-auth/markup/LoginPublicMarkup').LoginShellState),
              passkeyNotice,
              onPasskeyClick: () =>
                setPasskeyNotice(
                  'O acesso por passkey ainda não está habilitado nesta conta. Use e-mail e senha ou Google.',
                ),
            }}
          />
        </PublicShellHost>
      )}
    />
  );
}

export function RecoveryShell() {
  return (
    <ForgotPassword
      renderView={(state) => (
        <PublicShellHost name="recovery">
          <RecoveryPublicMarkup
            state={state as import('./public-auth/markup/RecoveryPublicMarkup').RecoveryShellState}
          />
        </PublicShellHost>
      )}
    />
  );
}
