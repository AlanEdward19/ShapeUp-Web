/* eslint-disable */
import type { FormEvent, ReactElement } from 'react';

export type RecoveryShellState = {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (value: string) => void;
  error: string;
  success: string;
  setSuccess: (value: string) => void;
  loading: boolean;
};

function Alert({ children }: { children?: string }) {
  return children ? (
    <p role="alert" style={{ color: '#ffb4ab', margin: '12px 0', fontSize: 14 }}>{children}</p>
  ) : null;
}

export function RecoveryPublicMarkup({ state }: { state: RecoveryShellState }): ReactElement {
  const showSuccess = Boolean(state.success);
  return (
    <>
    <main
      className="w-full flex-1 flex items-center justify-center p-gutter-sm sm:p-gutter"
    >
      <div
      className="flex flex-col w-full items-center justify-center py-margin-sm sm:py-margin-lg"
      >

        <div
      className="w-full max-w-[460px] flex flex-col items-center"
        >


          <div
      className="flex items-center gap-space-sm mb-space-lg select-none"
          >

            <img
      alt="ShapeUp Logo"
      className="w-8 h-8 object-contain"
      src="https://lh3.googleusercontent.com/aida/AEtjO1UEc9nRoR-8qbPC-MNsHRTEi9BLn6bgtcv2SW5cCTgsOlh4e0BkOpZRKMFbiaY80G3wZctGCfAp3UCrwBaJln9Fdqqy_1Tmy7Nq5WXWkxyJnX3t86ZEZyAoyAoBYmt7GSKrnKqjvJvfVjYpZ7622SGBdljRJw5Ipysr5ChFaG9KHVKOf1QwHjhsMg_3VrD1SiZXvpC74urs6fqq22sprYEof69AQ5hVARwBFtMs5AAh5W6a2mJSAqMdl8M"
            />

            <span
      className="font-headline text-headline-sm tracking-wider uppercase text-on-surface"
            >
ShapeUp               <span
      className="font-body text-body-sm tracking-normal text-on-surface-variant font-semibold"
              >Workspace</span>
            </span>

          </div>


          <div
      className="w-full bg-surface-container-low rounded-xl shadow-xl p-gutter sm:p-space-xl relative overflow-hidden"
          >


            <div
      className="absolute -top-16 -right-16 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"
            ></div>


            <div
      className="flex flex-col"
      id="recovery-state-form"
      hidden={showSuccess}
            >

              <header
      className="flex flex-col mb-space-lg"
              >

                <div
      className="flex items-center gap-space-xs text-primary mb-space-xs"
                >

                  <span
      className="material-symbols-outlined text-[18px]"
                  >lock_reset</span>

                  <span
      className="font-label-sm text-label-sm uppercase tracking-wider text-primary"
                  >Autenticação • Proteção de Credenciais</span>

                </div>

                <h1
      className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold"
                >

            Recuperação de Acesso
                          </h1>

                <p
      className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed"
                >

            Informe o e-mail associado à sua conta institucional ou pessoal. Enviaremos um link seguro para redefinição de senha com validade de 30 minutos.
                          </p>

              </header>

              <form
      className="flex flex-col gap-space-md"
      id="recovery-form"
      onSubmit={state.handleSubmit}
              >

                <div
      className="flex flex-col gap-space-xs"
                >

                  <div
      className="flex justify-between items-center"
                  >

                    <label
      className="font-label-lg text-label-lg text-on-surface font-semibold"
      htmlFor="recovery-email"
                    >

                E-mail cadastrado
                                  </label>

                    <span
      className="hidden font-label-sm text-label-sm text-error flex items-center gap-1"
      id="email-error"
                    >

                      <span
      className="material-symbols-outlined text-[14px]"
                      >error</span>
 Formato inválido
                                  </span>

                  </div>

                  <div
      className="relative flex items-center"
                  >

                    <span
      className="material-symbols-outlined absolute left-space-md text-outline pointer-events-none text-[20px] transition-colors duration-150"
      id="mail-icon"
                    >

                mail
                                  </span>

                    <input
      autoComplete="email"
      className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline/70 pl-11 pr-space-md py-space-sm rounded-lg outline-none transition-all duration-200 focus:bg-surface-container focus:ring-1 focus:ring-primary-container"
      id="recovery-email"
      name="email"
      placeholder="ex: atleta@shapeup.com"
      required
      type="email"
      value={state.email}
      onChange={(event) => state.setEmail(event.target.value)}
                    />

                  </div>

                </div>

                <button
      className="mt-space-xs w-full bg-primary-container hover:bg-primary text-on-primary-container font-label-lg text-label-lg font-bold py-space-sm px-space-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-space-sm shadow-md active:scale-[0.99] cursor-pointer"
      id="submit-btn"
      type="submit"
      disabled={state.loading}
                >

                  <span>Enviar Link de Redefinição</span>

                  <span
      className="material-symbols-outlined text-[18px]"
                  >arrow_forward</span>

                </button>

              <Alert>{state.error}</Alert>
              </form>


              <div
      className="mt-space-lg pt-space-md bg-surface-container-highest/20 rounded-lg p-space-md"
              >

                <div
      className="flex items-start gap-space-sm"
                >

                  <span
      className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0"
                  >help_center</span>

                  <div
      className="flex flex-col"
                  >

                    <p
      className="font-body-sm text-body-sm text-on-surface-variant leading-snug"
                    >

                Dúvidas ou perda de acesso ao e-mail? Fale com a equipe de suporte ou com a administração da sua academia.
                                  </p>

                  </div>

                </div>

              </div>

            </div>


            <div
      className={`${showSuccess ? 'flex' : 'hidden'} flex-col items-center text-center py-space-sm`}
      id="recovery-state-success"
      hidden={!showSuccess}
            >

              <div
      className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-space-md"
              >

                <span
      className="material-symbols-outlined text-[26px]"
                >mark_email_read</span>

              </div>

              <h2
      className="font-headline-sm text-headline-sm text-on-surface font-bold"
              >

          E-mail de verificação despachado
                      </h2>

              <p
      className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed max-w-sm"
              >

          Se o endereço                 <span
      className="text-on-surface font-semibold"
      id="sent-target-email"
                >{state.email}</span>
 existir em nossa base, as instruções de redefinição foram entregues com token unívoco.
                      </p>

              <div
      className="w-full bg-surface-container-lowest p-space-md rounded-lg my-space-md text-left flex items-start gap-space-sm"
              >

                <span
      className="material-symbols-outlined text-tertiary text-[18px] mt-0.5"
                >timer</span>

                <p
      className="font-body-sm text-body-sm text-on-surface-variant leading-normal"
                >

            O link expira impreterivelmente em                   <strong
      className="text-on-surface"
                  >30 minutos</strong>
 por razões de conformidade institucional.
                          </p>

              </div>

              <button
      className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg py-space-sm px-space-md rounded-lg transition-colors cursor-pointer"
      type="button"
      onClick={() => state.setSuccess('')}
              >

          Tentar outro e-mail
                      </button>

            </div>


            <div
      className="mt-space-lg flex justify-center"
            >

              <a
      className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-150 group cursor-pointer"
      href="/login"
              >

                <span
      className="material-symbols-outlined text-[16px] transition-transform duration-150 group-hover:-translate-x-0.5"
                >arrow_back</span>

                <span>Voltar para o login</span>

              </a>

            </div>

          </div>


          <div
      className="mt-space-lg flex items-center justify-center gap-space-xs text-on-surface-variant/70 select-none"
          >

            <span
      className="material-symbols-outlined text-[14px]"
            >encrypted</span>

            <span
      className="font-label-sm text-label-sm tracking-wide uppercase"
            >

        ShapeUp Security Protocol • Criptografia ponta a ponta
                  </span>

          </div>

        </div>

      </div>

    </main>
    </>
  );
}
