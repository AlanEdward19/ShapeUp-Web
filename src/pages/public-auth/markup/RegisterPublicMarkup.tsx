/* eslint-disable */
import type { FormEvent, MouseEvent, ReactElement } from 'react';
import AuthBrand from '../../../components/AuthBrand';
import DatePicker from '../../../components/DatePicker';
import { copy } from '../../../stitch/copy';
import { useLanguage } from '../../../contexts/LanguageContext';

const roleMap: Record<string, string> = { coach: 'professional', athlete: 'independent', manager: 'gym' };
const inputClass =
  'w-full bg-brand-input border border-brand-border rounded-[6px] px-3 py-2 text-sm text-brand-text';

export type RegisterShellState = {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  step: number;
  setStep: (step: number) => void;
  fullName: string;
  setFullName: (name: string) => void;
  error: string;
  loading: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function togglePassword(event: MouseEvent<HTMLButtonElement>) {
  const input = event.currentTarget.parentElement?.querySelector('input');
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

export function RegisterPublicMarkup({ state }: { state: RegisterShellState }): ReactElement {
  const { language, translateCopy } = useLanguage();
  const tr = (value: string) => {
    const clean = value.trim().replace(/\s+/g, ' ');
    const translated =
      language === 'pt-BR'
        ? clean
        : copy[clean]?.[language === 'es' ? 1 : 0] || translateCopy(clean);
    return value.replace(value.trim(), translated);
  };

  const stepBarColor = (index: number) =>
    index <= state.step ? '#e06c43' : '#3a2d27';

  return (
    <main className="w-full max-w-[560px] mx-auto flex flex-col my-auto">
      <header className="flex items-center justify-between pb-6 border-b border-brand-border">
        <AuthBrand />
      </header>

      <div className="py-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-brand-text">
            <span className="text-brand-terracotta font-semibold">
              {tr(`Passo ${state.step + 1} de 3:`)}
            </span>{' '}
            {tr('Identificação & Perfil de Uso')}
          </span>
          <span className="text-brand-muted font-mono">{tr(`Etapa 0${state.step + 1}/03`)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-1 rounded-full"
              style={{ background: stepBarColor(index) }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-brand-muted mt-1.5 font-mono">
          <span className="text-brand-text">{tr('1. Perfil & Identificação')}</span>
          <span>{tr('2. Credenciais')}</span>
          <span>{tr('3. Parâmetros')}</span>
        </div>
      </div>

      <form
        className="flex flex-col gap-6"
        id="setup-form"
        name="register"
        method="post"
        autoComplete="on"
        noValidate
        onSubmit={state.handleSubmit}
      >
        <div className="flex flex-col gap-1" hidden={state.step !== 0}>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-brand-text">
            {tr('Como você pretende usar o ShapeUp?')}
          </h1>
          <p className="text-sm text-brand-muted leading-relaxed">
            {tr('Configure seu ambiente de trabalho de acordo com seu papel de atuação.')}
          </p>
        </div>

        <fieldset className="flex flex-col gap-2.5" role="radiogroup" hidden={state.step !== 0}>
          <legend className="sr-only">{tr('Selecione seu perfil de configuração')}</legend>
          {(
            [
              {
                value: 'coach',
                title: 'Personal Trainer / Coach',
                desc: 'Prescrição de treinos, periodização técnica, gestão de alunos e acompanhamento de cargas.',
              },
              {
                value: 'athlete',
                title: 'Atleta / Aluno',
                desc: 'Acesso ao plano prescrito, registro de cargas em tempo real, diário de nutrição e métricas corporais.',
              },
              {
                value: 'manager',
                title: 'Gestor de Academia ou Studio',
                desc: 'Controle de catracas e acessos em tempo real, fluxo de caixa, gestão de equipe e relatórios operacionais.',
              },
            ] as const
          ).map((role) => (
            <label
              key={role.value}
              className="role-option group relative flex items-start gap-3.5 p-3.5 rounded-[8px] bg-brand-card border border-brand-border hover:bg-brand-card-hover hover:border-brand-border transition-colors cursor-pointer"
              data-role={role.value}
            >
              <input
                className="sr-only"
                name="system_role"
                type="radio"
                value={role.value}
                checked={state.selectedRole === roleMap[role.value]}
                onChange={() => state.setSelectedRole(roleMap[role.value])}
              />
              <div className="role-radio mt-0.5 w-4 h-4 rounded-full border border-brand-border flex items-center justify-center flex-shrink-0 group-hover:border-brand-muted transition-colors">
                <div className="role-dot w-2 h-2 rounded-full bg-brand-terracotta hidden" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                <span className="text-sm font-semibold text-brand-text group-hover:text-white transition-colors">
                  {tr(role.title)}
                </span>
                <span className="text-xs text-brand-muted leading-normal">{tr(role.desc)}</span>
              </div>
            </label>
          ))}
        </fieldset>

        <div
          className="flex flex-col gap-3.5 pt-2 border-t border-brand-border"
          hidden={state.step !== 0}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted font-mono">
            {tr('Dados de Identificação')}
          </h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-text" htmlFor="fullName">
              {tr('Nome completo')}
            </label>
            <input
              className="w-full bg-brand-input border border-brand-border rounded-[6px] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors"
              id="fullName"
              name="fullName"
              placeholder={tr('Seu nome completo')}
              required
              type="text"
              autoComplete="name"
              value={state.fullName}
              onChange={(event) => state.setFullName(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-text" htmlFor="email">
              {tr('E-mail profissional')}
            </label>
            <input
              className="w-full bg-brand-input border border-brand-border rounded-[6px] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors"
              id="email"
              name="email"
              placeholder={tr('nome@dominio.com.br')}
              required
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-text" htmlFor="phone">
              {tr('Telefone / WhatsApp com DDD')}
            </label>
            <input
              className="w-full bg-brand-input border border-brand-border rounded-[6px] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors"
              id="phone"
              name="phone"
              placeholder="(11) 98765-4321"
              required
              type="tel"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div hidden={state.step !== 1} style={{ display: 'grid', gap: 14 }}>
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
                    className={`${inputClass} st-registration-password pr-10 placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors`}
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
                  {tr('Confirmar senha')}
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass} st-registration-password pr-10 placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta transition-colors`}
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
          </div>
          <div hidden={state.step !== 2}>
            <label htmlFor="birthDate" className="text-sm">
              {tr('Data de nascimento')}
            </label>
            <DatePicker
              id="birthDate"
              name="birthDate"
              autoComplete="bday"
              className={inputClass}
              required
              disabled={false}
              onChange={() => undefined}
              value=""
              min={undefined}
              max={undefined}
              style={undefined}
              aria-label={undefined}
            />
          </div>
          <button
            className="w-full h-11 bg-[#E06C43] hover:bg-[#cc5c35] text-white font-medium text-sm rounded-[6px] flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
            type="submit"
            disabled={state.loading}
          >
            <span>
              {state.step === 2
                ? tr(state.loading ? 'Criando conta…' : 'Concluir cadastro')
                : tr('Continuar configuração')}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          {state.step > 0 ? (
            <button
              type="button"
              onClick={() => state.setStep(state.step - 1)}
              className="text-sm text-brand-muted"
            >
              {tr('Voltar')}
            </button>
          ) : null}
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
        {state.error ? (
          <p role="alert" style={{ color: '#ffb4ab', fontSize: 14 }}>
            {state.error}
          </p>
        ) : null}
      </form>

      <footer className="mt-8 pt-5 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-muted">
        <div className="flex items-center gap-1">
          <span>{tr('Já possui uma conta?')}</span>
          <a className="text-brand-terracotta hover:underline font-medium ml-0.5" href="/login">
            {tr('Entrar')}
          </a>
        </div>
      </footer>
    </main>
  );
}
