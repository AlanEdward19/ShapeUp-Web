/* eslint-disable */
import type { FormEvent, ReactElement } from 'react';
import AuthBrand from '../../../components/AuthBrand';

export type LoginShellState = {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  availableRoles: { role: string }[];
  handlePersonaSelect: (role: { role: string }, index: number) => void;
  error: string;
  passkeyNotice: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  rememberSession: boolean;
  setRememberSession: (value: boolean) => void;
  handleGoogleSignIn: () => void;
  onPasskeyClick: () => void;
  loading: boolean;
};

function Alert({ children }: { children?: string }) {
  return children ? (
    <p role="alert" style={{ color: '#ffb4ab', margin: '12px 0', fontSize: 14 }}>{children}</p>
  ) : null;
}

export function LoginPublicMarkup({ state }: { state: LoginShellState }): ReactElement {
  return (
    <>


    <main
      className="w-full flex-1 flex flex-col justify-center px-4 py-8 md:py-12"
    >

      <div
      className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
      >


        <div
      className="lg:col-span-7 flex flex-col justify-between py-2 sm:px-4"
        >

          <div>


            <AuthBrand />


            <div
      className="mb-8"
            >

              <h1
      className="font-heading font-bold text-3xl sm:text-4xl uppercase tracking-tight text-brand-text leading-tight mb-2"
              >

              Bom ter você de volta.
                          </h1>

              <p
      className="text-brand-textMuted text-base leading-normal"
              >

              Acesse seu workspace de performance física.
                          </p>

            </div>


            <form
      className="space-y-4 max-w-md"
      id="login-form"
      name="login"
      method="post"
      autoComplete="on"
      onSubmit={state.handleSubmit}
            >
            {state.availableRoles.length ? (
              <div>
                <h2 className="font-heading text-2xl">Selecione seu workspace</h2>
                {state.availableRoles.map((role, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full py-3 my-2 border border-brand-border rounded text-left px-3"
                    onClick={() => state.handlePersonaSelect(role, index)}
                  >
                    {role.role}
                  </button>
                ))}
              </div>
            ) : null}


              <div
      className="space-y-1.5"
              >

                <label
      className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted"
      htmlFor="email"
                >

                E-mail
                              </label>

                <div
      className="relative"
                >

                  <span
      className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-brand-textMuted/60 pointer-events-none"
                  >

                  mail
                                  </span>

                  <input
      className="w-full pl-11 pr-3.5 py-2.5 rounded bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-textMuted/40 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
      id="email"
      name="email"
      placeholder="seu.email@exemplo.com"
      required
      type="email"
      autoComplete="username"
      autoCapitalize="none"
      spellCheck={false}
                  />

                </div>

              </div>


              <div
      className="space-y-1.5"
              >

                <div
      className="flex items-center justify-between"
                >

                  <label
      className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted"
      htmlFor="password"
                  >

                  Senha
                                  </label>

                  <a
      className="text-xs text-brand-textMuted hover:text-brand-primary transition-colors"
      href="/forgot-password"
                  >

                  Esqueceu sua senha?
                                  </a>

                </div>

                <div
      className="relative"
                >

                  <span
      className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-brand-textMuted/60 pointer-events-none"
                  >

                  lock
                                  </span>

                  <input
      className="w-full pl-11 pr-11 py-2.5 rounded bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-textMuted/40 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
      id="password"
      name="password"
      placeholder="••••••••••••"
      required
      type={state.showPassword ? 'text' : 'password'}
      autoComplete="current-password"
                  />

                  <button
      aria-label={state.showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      aria-pressed={state.showPassword}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textMuted/70 hover:text-brand-text transition-colors p-1"
      id="toggle-pwd"
      type="button"
      onClick={() => state.setShowPassword(!state.showPassword)}
                  >

                    <span
      className="material-symbols-outlined text-[19px] leading-none"
                    >{state.showPassword ? 'visibility_off' : 'visibility'}</span>

                  </button>

                </div>

              </div>


              <div
      className="pt-0.5"
              >

                <label
      className="inline-flex items-center gap-2 cursor-pointer select-none"
                >

                  <input
      checked={state.rememberSession}
      onChange={(event) => state.setRememberSession(event.target.checked)}
      className="w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-primary focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
      type="checkbox"
                  />

                  <span
      className="text-xs text-brand-textMuted"
                  >Manter sessão ativa neste dispositivo</span>

                </label>

              </div>


              <div
      className="pt-2"
              >

                <button
      className="w-full py-2.5 px-5 rounded bg-brand-primary hover:bg-brand-primaryHover text-brand-text text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
      type="submit"
      disabled={state.loading}
                >

                  <span>Entrar no Workspace</span>

                  <span
      className="material-symbols-outlined text-[18px]"
                  >arrow_forward</span>

                </button>

              </div>

            <Alert>{state.error || state.passkeyNotice}</Alert>
            </form>


            <div
      className="max-w-md mt-6 pt-5 border-t border-brand-border/60 space-y-2.5"
            >

              <button
      className="w-full py-2 px-3.5 rounded bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-brand-textMuted hover:text-brand-text text-xs font-medium transition-colors flex items-center justify-center gap-2.5"
      type="button"
      onClick={state.handleGoogleSignIn}
              >

                <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
                >

                  <path
      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.9 9.2 5 12 5z"
      fill="#EA4335"
                  ></path>

                  <path
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      fill="#4285F4"
                  ></path>

                  <path
      d="M5.9 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1V7.1H2.2C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.7-2.8z"
      fill="#FBBC05"
                  ></path>

                  <path
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-2.8 0-5.2-1.9-6.1-4.5L2.2 16.6C4 20.3 7.7 23 12 23z"
      fill="#34A853"
                  ></path>

                </svg>

                <span>Continuar com Google Workspace</span>

              </button>

              <button
      className="w-full py-2 px-3.5 rounded bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-brand-textMuted hover:text-brand-text text-xs font-medium transition-colors flex items-center justify-center gap-2"
      type="button"
      onClick={state.onPasskeyClick}
              >

                <span
      className="material-symbols-outlined text-[17px] text-brand-textMuted"
                >fingerprint</span>

                <span>Acesso via Passkey / Biometria</span>

              </button>

              <div
      className="pt-2 text-center text-xs text-brand-textMuted"
              >

                <span>Ainda não possui acesso profissional? </span>

                <a
      className="text-brand-primary hover:underline font-medium transition-colors"
      href="/register"
                >Cadastre-se</a>

              </div>
            </div>

          </div>

          <div
      className="mt-8 pt-4"
          >

            <p
      className="text-xs text-brand-textMuted/70"
            >

            ShapeUp Workspace • Infraestrutura local e em nuvem criptografada
                      </p>

          </div>

        </div>


        <div
      className="lg:col-span-5 flex flex-col justify-center"
        >

          <div
      className="bg-brand-surface border border-brand-border rounded-md p-6 lg:p-8 space-y-6 relative overflow-hidden"
          >


            <div
      className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-brand-text"
            >

              <svg
      className="w-64 h-64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
              >

                <polygon
      points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2"
                ></polygon>

                <path
      d="M7 13.5l3-4 4 5 3-4"
      strokeLinecap="round"
      strokeLinejoin="round"
                ></path>

              </svg>

            </div>


            <div
      className="border-b border-brand-border/60 pb-5"
            >

              <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-surfaceAlt border border-brand-border/40 text-brand-olive text-xs font-medium mb-3"
              >

                <span
      className="w-2 h-2 rounded-full bg-brand-olive animate-pulse"
                ></span>

                <span>Ambiente Seguro ShapeUp</span>

              </div>

              <h2
      className="font-heading font-bold text-2xl uppercase tracking-tight text-brand-text leading-tight"
              >

Workspace de Performance Atlética
              </h2>

              <p
      className="text-xs text-brand-textMuted mt-1 leading-relaxed"
              >

Ambiente restrito e isolado para prescrição, periodização e acompanhamento de biofeedback físico de alto nível.
              </p>

            </div>


            <div
      className="space-y-3"
            >

              <div
      className="p-3 bg-brand-surfaceAlt/60 border border-brand-border/50 rounded flex items-start gap-3"
              >

                <span
      className="material-symbols-outlined text-[19px] text-brand-primary mt-0.5"
                >shield_lock</span>

                <div>

                  <div
      className="text-xs font-semibold text-brand-text tracking-wide"
                  >Criptografia e Proteção de Dados</div>

                  <div
      className="text-[11px] text-brand-textMuted leading-relaxed mt-0.5"
                  >

Prontuários e métricas periodizadas armazenados com isolamento estrito e conformidade LGPD.
                  </div>

                </div>

              </div>

              <div
      className="p-3 bg-brand-surfaceAlt/60 border border-brand-border/50 rounded flex items-start gap-3"
              >

                <span
      className="material-symbols-outlined text-[19px] text-brand-olive mt-0.5"
                >cloud_done</span>

                <div>

                  <div
      className="text-xs font-semibold text-brand-text tracking-wide"
                  >Sincronização Contínua em Nuvem</div>

                  <div
      className="text-[11px] text-brand-textMuted leading-relaxed mt-0.5"
                  >

Redundância local ativa com restauração instantânea de sessões de treinamento.
                  </div>

                </div>

              </div>

            </div>


            <div
      className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-brand-textMuted/70"
            >

              <span>ShapeUp Core Architecture • Build 4.2</span>

              <span
      className="flex items-center gap-1 text-brand-olive"
              >
                <span
      className="w-1.5 h-1.5 rounded-full bg-brand-olive"
                ></span>
 99.98% uptime              </span>

            </div>

          </div>

        </div>

      </div>

    </main>


    <footer
      className="w-full border-t border-brand-border/60 py-4 px-6 text-xs text-brand-textMuted bg-brand-surface/40"
    >

      <div
      className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"
      >

        <div
      className="flex items-center gap-2"
        >

          <span
      className="w-2 h-2 rounded-full bg-brand-olive"
          ></span>

          <span>Todos os serviços operacionais</span>

          <span
      className="text-brand-border"
          >•</span>

          <span>Criptografia ponta a ponta</span>

        </div>

        <div
      className="flex items-center gap-5"
        >

          <a
      className="hover:text-brand-text transition-colors"
      href="#"
          >Suporte Técnico</a>

          <span
      className="text-brand-border"
          >•</span>

          <a
      className="hover:text-brand-text transition-colors"
      href="#"
          >Termos de Uso</a>

          <span
      className="text-brand-border"
          >•</span>

          <a
      className="hover:text-brand-text transition-colors"
      href="#"
          >Privacidade</a>

        </div>

      </div>

    </footer>

    </>
  );
}
