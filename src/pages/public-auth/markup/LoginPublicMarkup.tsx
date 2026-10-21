import type { FormEvent, ReactElement } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Logo from '../../../components/Logo/Logo';

export type LoginShellState = {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  rememberSession: boolean;
  setRememberSession: (value: boolean) => void;
  handleGoogleSignIn: () => void;
  loading: boolean;
};

const copy = {
  'pt-BR': {
    title: 'Bem-vindo de volta',
    subtitle: 'Entre para continuar o seu treino.',
    email: 'E-mail',
    emailPlaceholder: 'voce@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Sua senha',
    show: 'Mostrar senha',
    hide: 'Ocultar senha',
    forgot: 'Esqueceu a senha?',
    submit: 'Entrar',
    submitting: 'Entrando…',
    or: 'ou',
    google: 'Continuar com Google',
    remember: 'Manter sessão ativa neste dispositivo',
    noAccount: 'Ainda não tem conta?',
    create: 'Criar conta',
    home: 'Voltar ao início',
  },
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to pick up your training.',
    email: 'Email',
    emailPlaceholder: 'you@email.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    show: 'Show password',
    hide: 'Hide password',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    submitting: 'Signing in…',
    or: 'or',
    google: 'Continue with Google',
    remember: 'Keep me signed in on this device',
    noAccount: "Don't have an account?",
    create: 'Create account',
    home: 'Back to home',
  },
  es: {
    title: 'Te damos la bienvenida',
    subtitle: 'Inicia sesión para continuar tu entrenamiento.',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Tu contraseña',
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
    forgot: '¿Olvidaste tu contraseña?',
    submit: 'Entrar',
    submitting: 'Entrando…',
    or: 'o',
    google: 'Continuar con Google',
    remember: 'Mantener la sesión iniciada en este dispositivo',
    noAccount: '¿Aún no tienes cuenta?',
    create: 'Crear cuenta',
    home: 'Volver al inicio',
  },
} as const;

type Language = keyof typeof copy;

function GoogleMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginPublicMarkup({ state }: { state: LoginShellState }): ReactElement {
  const { language } = useLanguage() as { language: string };
  const c = copy[(language as Language) in copy ? (language as Language) : 'pt-BR'];

  return (
    <main className="lg">
      <section className="lg-card">
        <a href="/" className="st-auth-brand lg-brand" aria-label="ShapeUp">
          <Logo width="40" height="40" />
          <span>ShapeUp</span>
        </a>
        <h1>{c.title}</h1>
        <p className="lg-subtitle">{c.subtitle}</p>

        <form id="login-form" name="login" method="post" autoComplete="on" onSubmit={state.handleSubmit} noValidate>
          <div className="lg-field">
            <label htmlFor="email">{c.email}</label>
            <input id="email" name="email" type="email" inputMode="email" autoComplete="username" placeholder={c.emailPlaceholder} required />
          </div>

          <div className="lg-field">
            <div className="lg-label-row">
              <label htmlFor="password">{c.password}</label>
              <a href="/forgot-password">{c.forgot}</a>
            </div>
            <div className="lg-password">
              <input
                id="password"
                name="password"
                type={state.showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={c.passwordPlaceholder}
                required
              />
              <button
                type="button"
                id="toggle-pwd"
                aria-label={state.showPassword ? c.hide : c.show}
                aria-pressed={state.showPassword}
                onClick={() => state.setShowPassword(!state.showPassword)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {state.showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <label className="lg-remember">
            <input
              type="checkbox"
              checked={state.rememberSession}
              onChange={event => state.setRememberSession(event.target.checked)}
            />
            <span>{c.remember}</span>
          </label>

          {state.error ? <p role="alert" className="lg-alert">{state.error}</p> : null}

          <button type="submit" className="lg-primary" disabled={state.loading}>
            {state.loading ? c.submitting : c.submit}
          </button>

          <div className="lg-or" role="separator"><span>{c.or}</span></div>

          <button type="button" className="lg-secondary" disabled={state.loading} onClick={state.handleGoogleSignIn}>
            <GoogleMark />
            {c.google}
          </button>
        </form>

        <p className="lg-switch">
          {c.noAccount} <a href="/register">{c.create}</a>
        </p>
      </section>
      <a href="/" className="lg-home">{c.home}</a>
    </main>
  );
}
