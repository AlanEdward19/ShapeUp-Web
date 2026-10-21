import type { ChangeEvent, ReactElement } from 'react';
import { ProfilePhoto, ProfileSwitcher } from '../../../components/ProfileControls';

export type SettingsValues = Record<string, string | boolean | undefined>;

export type SettingsShellState = {
  values: SettingsValues;
  update: (field: string, value: string | boolean) => void;
  notice: string;
  language: string;
  setLanguage: (value: string) => void;
  unitSystem: string;
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  onSave: () => void;
  onResetPassword: () => void | Promise<void>;
  onStubAction: () => void;
  langTitle: string;
  langDesc: string;
};

const copy = {
  'pt-BR': {
    title: 'Configurações da Conta',
    lede: 'Perfil, preferências e segurança.',
    save: 'Salvar alterações',
    profile: 'Perfil',
    name: 'Nome completo',
    email: 'E-mail',
    phone: 'Telefone',
    bio: 'Apresentação profissional',
    bioHint: 'Aparece para os alunos que você atende.',
    preferences: 'Preferências',
    units: 'Sistema de unidades',
    metric: 'Métrico (kg / cm)',
    imperial: 'Imperial (lb / in)',
    security: 'Segurança',
    password: 'Senha de acesso',
    passwordHint: 'Enviamos um link de redefinição para o seu e-mail.',
    reset: 'Redefinir senha',
    credentialNote: 'Registro profissional (CREF/CRN) fica em Credencial.',
  },
  en: {
    title: 'Account settings',
    lede: 'Profile, preferences and security.',
    save: 'Save changes',
    profile: 'Profile',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    bio: 'Professional introduction',
    bioHint: 'Shown to the clients you coach.',
    preferences: 'Preferences',
    units: 'Unit system',
    metric: 'Metric (kg / cm)',
    imperial: 'Imperial (lb / in)',
    security: 'Security',
    password: 'Password',
    passwordHint: 'We email you a reset link.',
    reset: 'Reset password',
    credentialNote: 'Your professional registration (CREF/CRN) lives under Credential.',
  },
  es: {
    title: 'Configuración de la cuenta',
    lede: 'Perfil, preferencias y seguridad.',
    save: 'Guardar cambios',
    profile: 'Perfil',
    name: 'Nombre completo',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    bio: 'Presentación profesional',
    bioHint: 'Se muestra a los alumnos que atiendes.',
    preferences: 'Preferencias',
    units: 'Sistema de unidades',
    metric: 'Métrico (kg / cm)',
    imperial: 'Imperial (lb / in)',
    security: 'Seguridad',
    password: 'Contraseña',
    passwordHint: 'Te enviamos un enlace de restablecimiento.',
    reset: 'Restablecer contraseña',
    credentialNote: 'Tu registro profesional (CREF/CRN) está en Credencial.',
  },
} as const;

export function SettingsPublicMarkup({ state }: { state: SettingsShellState }): ReactElement {
  const c = copy[(state.language as keyof typeof copy) in copy ? (state.language as keyof typeof copy) : 'pt-BR'];
  const role = localStorage.getItem('shapeup_role');
  const professional = role === 'professional' || role === 'gym';
  const field = (name: string) => ({
    value: String(state.values[name] ?? ''),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => state.update(name, event.target.value),
  });

  return (
    <div className="ah st" data-shell-content style={{ marginLeft: 256 }}>
      <main className="ah-page st-page">
        <header className="ah-header ah-header-split">
          <div>
            <h1>{c.title}</h1>
            <p className="ah-lede">{c.lede}</p>
          </div>
          <button type="button" id="save-btn" className="ah-solid-cta" onClick={state.onSave}>{c.save}</button>
        </header>

        <section className="st-group" id="perfil" aria-labelledby="st-profile">
          <h2 id="st-profile" className="st-label">{c.profile}</h2>
          <div className="st-card">
            <div className="st-row st-row-photo"><ProfilePhoto /></div>
            <label className="st-row"><span>{c.name}</span><input type="text" autoComplete="name" {...field('name')} /></label>
            <label className="st-row"><span>{c.email}</span><input type="email" autoComplete="email" {...field('email')} /></label>
            <label className="st-row"><span>{c.phone}</span><input type="tel" autoComplete="tel" {...field('phone')} /></label>
            {professional && (
              <label className="st-row st-row-block">
                <span>{c.bio}<small>{c.bioHint}</small></span>
                <textarea rows={3} {...field('bio')} />
              </label>
            )}
          </div>
          {professional && <p className="st-hint">{c.credentialNote}</p>}
        </section>

        <section className="st-group" id="notacao" aria-labelledby="st-prefs">
          <h2 id="st-prefs" className="st-label">{c.preferences}</h2>
          <div className="st-card">
            <label className="st-row">
              <span>{state.langTitle}<small>{state.langDesc}</small></span>
              <select id="settings-language" value={state.language} onChange={event => state.setLanguage(event.target.value)}>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <div className="st-row" role="group" aria-label={c.units}>
              <span>{c.units}</span>
              <div className="ah-segmented">
                {([['metric', c.metric], ['imperial', c.imperial]] as const).map(([unit, label]) => (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={state.unitSystem === unit}
                    onClick={() => {
                      state.setUnitSystem(unit);
                      state.update('units', unit);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="st-group" aria-label="Perfil ativo">
          <div className="st-card st-card-pad"><ProfileSwitcher /></div>
        </section>

        <section className="st-group" id="seguranca" aria-labelledby="st-security">
          <h2 id="st-security" className="st-label">{c.security}</h2>
          <div className="st-card">
            <div className="st-row">
              <span>{c.password}<small>{c.passwordHint}</small></span>
              <button type="button" className="ah-soft-cta" onClick={() => void state.onResetPassword()}>{c.reset}</button>
            </div>
          </div>
        </section>
      </main>

      <div id="toast" className="st-toast" role="status" hidden={!state.notice}>{state.notice}</div>
    </div>
  );
}
