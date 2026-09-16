/* eslint-disable */
import type { FormEvent, MouseEvent, ReactElement } from 'react';
import { copy } from '../../dashboard-stitch/copy';
import { useLanguage } from '../../../contexts/LanguageContext';

export type InvitationShellState = {
  fullName: string;
  setFullName: (name: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
  error: string;
  loading: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function togglePassword(event: MouseEvent<HTMLButtonElement>) {
  const input = event.currentTarget.parentElement?.querySelector('input');
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

export function InvitationPublicMarkup({ state }: { state: InvitationShellState }): ReactElement {
  const { language, translateCopy } = useLanguage();
  const tr = (value: string) => {
    const clean = value.trim().replace(/\s+/g, ' ');
    const translated =
      language === 'pt-BR'
        ? clean
        : copy[clean]?.[language === 'es' ? 1 : 0] || translateCopy(clean);
    return value.replace(value.trim(), translated);
  };

  return (
    <main className="w-full max-w-[560px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <img
          src="https://lh3.googleusercontent.com/aida/AEtjO1UEc9nRoR-8qbPC-MNsHRTEi9BLn6bgtcv2SW5cCTgsOlh4e0BkOpZRKMFbiaY80G3wZctGCfAp3UCrwBaJln9Fdqqy_1Tmy7Nq5WXWkxyJnX3t86ZEZyAoyAoBYmt7GSKrnKqjvJvfVjYpZ7622SGBdljRJw5Ipysr5ChFaG9KHVKOf1QwHjhsMg_3VrD1SiZXvpC74urs6fqq22sprYEof69AQ5hVARwBFtMs5AAh5W6a2mJSAqMdl8M"
          alt="ShapeUp Logo"
          className="w-8 h-8 rounded object-cover"
        />
        <span className="font-headline text-2xl tracking-wide uppercase font-bold text-brand-text">
          ShapeUp
        </span>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl p-7 sm:p-9 shadow-sm">
        <div className="flex items-start gap-4 pb-6 border-b border-brand-border">
          <img
            alt="Foto do treinador Rodrigo Vasconcelos"
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-brand-border"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VcvgpwuiKK3hu_9KYWEBUt-1aZ49wRlSA9fG1EtilO7V9ZDiiFFEkVBgIoCzTxFBOB_OwzR4bVoXlT70LtBOGsIQWG3fN3Yq5-ICGZ4S71s7wt2LjVQBQBtj2jjY28UYwGK8oQqeS78lkVqXPMMEmnRXggU_6fuR7SD96PsABn-V5KP8huPLxEpLe9k4raV85qjTF2aPzTyaPHkj8WgbwfrOOemCKKxn1xZYcFt6oDCiIqNmEtN9Je4A"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-brand-text text-base">
                {tr('Convite de treinamento')}
              </span>
            </div>
            <p className="text-brand-muted text-sm mt-1 leading-relaxed">
              {tr(
                'Complete seu cadastro para aceitar o convite e acessar seu espaço de treinamento no ShapeUp.',
              )}
            </p>
          </div>
        </div>

        <div className="pt-6 pb-5">
          <h1 className="font-headline text-2xl font-bold tracking-tight text-brand-text">
            {tr('Ativação de Conta')}
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">
            {tr('Defina suas credenciais para vincular seu perfil e acessar sua rotina.')}
          </p>
        </div>

        <form
          className="space-y-4"
          id="invite-form"
          name="register"
          method="post"
          autoComplete="on"
          noValidate
          onSubmit={state.handleSubmit}
        >
          <div>
            <label
              className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5"
              htmlFor="fullName"
            >
              {tr('Nome Completo')}
            </label>
            <input
              className="w-full bg-[#1A1412] border border-brand-border rounded-md px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-dim focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors"
              id="fullName"
              name="fullName"
              required
              type="text"
              autoComplete="name"
              value={state.fullName}
              onChange={(event) => state.setFullName(event.target.value)}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5"
              htmlFor="email"
            >
              {tr('E-mail')}
            </label>
            <input
              className="w-full bg-[#171311] border border-brand-border/70 rounded-md px-3.5 py-2.5 text-sm text-brand-muted cursor-not-allowed select-none focus:outline-none"
              id="email"
              name="email"
              readOnly={false}
              type="email"
              autoComplete="username"
            />
            <span className="block text-xs text-brand-dim mt-1.5">
              {tr('Convite exclusivo enviado para este endereço.')}
            </span>
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5"
              htmlFor="phone"
            >
              {tr('Celular / WhatsApp')}
            </label>
            <input
              className="w-full bg-[#1A1412] border border-brand-border rounded-md px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-dim focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors"
              id="phone"
              name="phone"
              placeholder="(11) 90000-0000"
              type="tel"
              autoComplete="tel"
            />
            <span className="block text-xs text-brand-dim mt-1.5">
              {tr('Usado para recados e avisos sobre sua periodização.')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label
                className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5"
                htmlFor="password"
              >
                {tr('Senha')}
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#1A1412] border border-brand-border rounded-md px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-dim focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors pr-10 st-registration-password"
                  id="password"
                  name="password"
                  placeholder={tr('Mínimo 8 caracteres')}
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                />
                <button
                  aria-label={tr('Alternar exibição da senha')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dim hover:text-brand-text"
                  type="button"
                  onClick={togglePassword}
                >
                  <span className="material-symbols-outlined text-[1.125rem]">visibility</span>
                </button>
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5"
                htmlFor="confirmPassword"
              >
                {tr('Confirmar Senha')}
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#1A1412] border border-brand-border rounded-md px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-dim focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors pr-10 st-registration-password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder={tr('Repita a senha')}
                  required
                  type="password"
                  autoComplete="new-password"
                />
                <button
                  aria-label={tr('Alternar exibição da confirmação de senha')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dim hover:text-brand-text"
                  type="button"
                  onClick={togglePassword}
                >
                  <span className="material-symbols-outlined text-[1.125rem]">visibility</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-start gap-2.5 cursor-pointer text-xs text-brand-muted select-none">
              <input
                className="rounded bg-[#1A1412] border-brand-border text-brand-terracotta focus:ring-brand-terracotta focus:ring-offset-0 mt-0.5"
                name="terms"
                required
                type="checkbox"
                checked={state.acceptedTerms}
                onChange={(event) => state.setAcceptedTerms(event.target.checked)}
              />
              <span className="leading-relaxed">
                {tr('Li e concordo com os')}{' '}
                <a className="text-brand-text underline hover:text-brand-terracotta" href="/terms">
                  {tr('Termos de Uso')}
                </a>{' '}
                {tr('e a')}{' '}
                <a
                  className="text-brand-text underline hover:text-brand-terracotta"
                  href="/privacy"
                >
                  {tr('Política de Privacidade')}
                </a>
                .
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              className="w-full py-3 px-4 bg-brand-terracotta hover:bg-brand-terracottaHover text-white font-medium rounded-md transition-colors text-sm flex items-center justify-center gap-2"
              id="submit-btn"
              type="submit"
              disabled={state.loading}
            >
              <span>{tr('Ativar conta e entrar')}</span>
              <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
            </button>
          </div>

          <input
            type="hidden"
            name="firstName"
            value={state.fullName.trim().split(/\s+/)[0] || ''}
          />
          <input
            type="hidden"
            name="lastName"
            value={state.fullName.trim().split(/\s+/).slice(1).join(' ')}
          />
          <input type="hidden" name="company_url" value="" />
          <input type="hidden" name="birthDate" value="" />
          {state.error ? (
            <p role="alert" style={{ color: '#ffb4ab', fontSize: 14 }}>
              {state.error}
            </p>
          ) : null}
        </form>
      </div>

      <div className="text-center mt-6 text-xs text-brand-dim">
        {tr('Ao ativar, você terá acesso imediato às planilhas e orientações do seu treinador.')}
      </div>
    </main>
  );
}
