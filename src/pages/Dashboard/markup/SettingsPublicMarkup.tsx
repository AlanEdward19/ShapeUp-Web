/* eslint-disable */
import type { ChangeEvent, ReactElement } from 'react';
import WorkspaceNavigation from '../../shell-assets/WorkspaceNavigation';

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
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const profileField = (state: SettingsShellState, name: string, label: string) => ({
  value: String(state.values[name] ?? ''),
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    state.update(name, e.target.value),
  'aria-label': label,
});

export function SettingsPublicMarkup({ state }: { state: SettingsShellState }): ReactElement {
  const pf = (name: string, label: string) => profileField(state, name, label);
  return (
    <>
      <WorkspaceNavigation flow open={state.navOpen} close={() => state.setNavOpen(false)} />
<div
      className="flex-1 flex flex-col min-h-screen"
    >
      <header
      className="sticky top-0 z-40 h-14 bg-[color-mix(in_srgb,var(--bg-main)_90%,transparent)] backdrop-blur border-b border-[color:var(--border-color)] px-8 flex items-center justify-between"
      >

        <div
      className="flex items-center gap-2 text-xs text-[#968882]"
        >

          <span
      className="text-[#b3a39c]"
          >Configurações</span>

          <span
      className=""
          >/</span>

          <span
      className="text-[color:var(--text-main)] font-medium"
          >Conta &amp; Preferências</span>

        </div>

        <div
      className="flex items-center gap-3"
        >

          <button
      className="px-3 py-1.5 rounded text-xs font-medium text-[#b3a39c] hover:text-[color:var(--text-main)] transition-colors"
      type="button"
          >

          Descartar
                  </button>

          <button
      className="px-3.5 py-1.5 rounded bg-[#e06c43] hover:bg-[#cf5d35] text-white text-xs font-medium transition-colors"
      id="save-btn"
      type="button"
      onClick={state.onSave}
          >

          Salvar alterações
                  </button>

        </div>

      </header>

      <div
      className="max-w-4xl mx-auto px-8 py-10"
      >

        <div
      className="pb-8 mb-8 border-b border-[color:var(--border-color)]"
        >

          <h1
      className="font-headline-md text-3xl uppercase tracking-tight text-[color:var(--text-main)]"
          >Configurações da Conta</h1>

          <p
      className="text-sm text-[#968882] mt-1 font-normal"
          >

          Gerencie suas informações profissionais, convenções métricas de prescrição, notificações e segurança de acesso.
                  </p>

        </div>

        <nav
      className="flex items-center gap-6 border-b border-[color:var(--border-color)] text-sm mb-10"
        >

          <a
      className="pb-3 text-[#e06c43] border-b-2 border-[#e06c43] font-medium"
      href="#perfil"
          >Perfil &amp; Registro</a>

          <a
      className="pb-3 text-[#968882] hover:text-[color:var(--text-main)] transition-colors"
      href="#notacao"
          >Notação &amp; Treino</a>

          <a
      className="pb-3 text-[#968882] hover:text-[color:var(--text-main)] transition-colors"
      href="#notificacoes"
          >Notificações</a>

          <a
      className="pb-3 text-[#968882] hover:text-[color:var(--text-main)] transition-colors"
      href="#seguranca"
          >Segurança &amp; Sessões</a>

        </nav>

        <div
      className="flex flex-col gap-12"
        >

          <section
      className="pt-2"
      id="perfil"
          >

            <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >

              <div>

                <h2
      className="text-base font-semibold text-[color:var(--text-main)]"
                >Perfil &amp; Identidade Profissional</h2>

                <p
      className="text-xs text-[#968882] mt-1 leading-relaxed"
                >

                Dados exibidos nas planilhas, assinaturas digitais de laudos e perfil visível para os atletas.
                              </p>

              </div>

              <div
      className="md:col-span-2 flex flex-col gap-5"
              >

                <div
      className="flex items-center gap-4 pb-2"
                >

                  <img
      alt="Foto de perfil"
      className="w-16 h-16 rounded-full object-cover border border-[color:var(--border-color)]"
      src="https://lh3.googleusercontent.com/aida/AEtjO1VcvgpwuiKK3hu_9KYWEBUt-1aZ49wRlSA9fG1EtilO7V9ZDiiFFEkVBgIoCzTxFBOB_OwzR4bVoXlT70LtBOGsIQWG3fN3Yq5-ICGZ4S71s7wt2LjVQBQBtj2jjY28UYwGK8oQqeS78lkVqXPMMEmnRXggU_6fuR7SD96PsABn-V5KP8huPLxEpLe9k4raV85qjTF2aPzTyaPHkj8WgbwfrOOemCKKxn1xZYcFt6oDCiIqNmEtN9Je4A"
                  />

                  <div
      className="flex items-center gap-2"
                  >

                    <button
      className="px-3 py-1.5 text-xs font-medium rounded border border-[color:var(--border-color)] bg-[#211A17] text-[color:var(--text-main)] hover:bg-[#29211D] transition-colors"
      type="button"
                    >

                    Alterar foto
                                      </button>

                    <button
      className="px-3 py-1.5 text-xs font-medium text-[#968882] hover:text-[#f28b82] transition-colors"
      type="button"
                    >

                    Remover
                                      </button>

                  </div>

                </div>

                <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >

                  <div
      className="flex flex-col gap-1.5"
                  >

                    <label className="text-xs font-medium text-[#b3a39c]">Nome completo</label>
                    <input
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] transition-colors"
      type="text"
      {...pf('name', 'Nome completo')}
                    />

                  </div>

                  <div
      className="flex flex-col gap-1.5"
                  >

                    <label className="text-xs font-medium text-[#b3a39c]">E-mail profissional</label>
                    <input
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] transition-colors"
      type="email"
      {...pf('email', 'E-mail profissional')}
                    />

                  </div>

                </div>

                <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >

                  <div
      className="flex flex-col gap-1.5"
                  >

                    <div
      className="flex items-center justify-between"
                    >

                      <label
      className="text-xs font-medium text-[#b3a39c]"
                      >Registro CREF / Regional</label>

                      <span
      className="text-[11px] text-[#a1be8e]"
                      >Ativo</span>

                    </div>

                    <input
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] font-mono transition-colors"
      type="text"
      defaultValue="089281-G/SP"
                    />

                  </div>

                  <div
      className="flex flex-col gap-1.5"
                  >

                    <label className="text-xs font-medium text-[#b3a39c]">Telefone operacional</label>
                    <input
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] transition-colors"
      type="tel"
      {...pf('phone', 'Telefone operacional')}
                    />

                  </div>

                </div>

                <div
      className="flex flex-col gap-1.5"
                >

                  <label
      className="text-xs font-medium text-[#b3a39c]"
                  >Especialidade &amp; Biografia curta</label>

                  <textarea
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] transition-colors leading-relaxed"
      rows={3}
      {...pf('bio', 'Especialidade & Biografia curta')}
                  />

                </div>

                <div
      className="flex flex-col gap-1.5"
                >

                  <label
      className="text-xs font-medium text-[#b3a39c]"
                  >Unidade principal de atendimento</label>

                  <select
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e06c43] focus:ring-1 focus:ring-[#e06c43] transition-colors"
      {...pf('specialty', 'Unidade principal de atendimento')}
                  >
                    <option value="jardins">ShapeUp — Unidade Jardins (São Paulo, SP)</option>
                    <option value="itaim">ShapeUp — Unidade Itaim Bibi (São Paulo, SP)</option>
                    <option value="alphaville">ShapeUp Lab — Alphaville (Barueri, SP)</option>
                  </select>

                </div>

              </div>

            </div>

          </section>

          <div
      className="border-t border-[color:var(--border-color)]"
          ></div>

          <section className="pt-2" id="notacao">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                paddingBottom: 24,
                marginBottom: 24,
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <label htmlFor="settings-language" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                  {state.langTitle}
                </label>
                <p style={{ fontSize: 12, color: '#968882', marginTop: 4 }}>{state.langDesc}</p>
              </div>
              <select
                id="settings-language"
                value={state.language}
                onChange={(e) => state.setLanguage(e.target.value)}
                style={{
                  background: '#211a17',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  padding: '8px 12px',
                }}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >

              <div>

                <h2
      className="text-base font-semibold text-[color:var(--text-main)]"
                >Notação de Treino &amp; Biomecânica</h2>

                <p
      className="text-xs text-[#968882] mt-1 leading-relaxed"
                >

                Padrões metrológicos adotados na montagem de planilhas e no aplicativo móvel dos seus atletas.
                              </p>

              </div>

              <div
      className="md:col-span-2 flex flex-col gap-6"
              >

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[color:var(--border-color)]"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                    >Sistema de unidades</span>

                    <p
      className="text-xs text-[#968882]"
                    >Cálculo de volume e tonelagem acumulada.</p>

                  </div>

                  <div
      className="flex items-center gap-4 text-xs"
                  >

                    <label
      className="flex items-center gap-2 cursor-pointer"
                    >

                      <input
      checked={state.unitSystem === 'metric'}
      className="text-[#e06c43] focus:ring-[#e06c43] bg-[#211A17] border-[color:var(--border-color)]"
      name="unit_system"
      type="radio"
      onChange={() => {
        state.setUnitSystem('metric');
        state.update('units', 'metric');
      }}
                    />

                      <span
      className="text-[color:var(--text-main)]"
                      >Métrico (kg / cm)</span>

                    </label>

                    <label
      className="flex items-center gap-2 cursor-pointer"
                    >

                      <input
      checked={state.unitSystem === 'imperial'}
      className="text-[#e06c43] focus:ring-[#e06c43] bg-[#211A17] border-[color:var(--border-color)]"
      name="unit_system"
      type="radio"
      onChange={() => {
        state.setUnitSystem('imperial');
        state.update('units', 'imperial');
      }}
                    />

                      <span
      className="text-[#b3a39c]"
                      >Imperial (lbs / in)</span>

                    </label>

                  </div>

                </div>

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[color:var(--border-color)]"
                >

                  <div
      className="max-w-xs"
                  >

                    <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                    >Formato de cadência (TUT)</span>

                    <p
      className="text-xs text-[#968882]"
                    >Convenção para prescrição de tempo sob tensão.</p>

                  </div>

                  <div
      className="w-full sm:w-64"
                  >

                    <select
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#e06c43]"
      value={String(state.values['notation-1'] ?? '4-0-1-0')}
      onChange={(e) => state.update('notation-1', e.target.value)}
                  >
                    <option value="4-0-1-0">4 dígitos (Exc-Pausa-Conc-Pausa, ex: 3-0-1-0)</option>
                    <option value="3-1-1">3 dígitos (Exc-Pausa-Conc, ex: 3-1-1)</option>
                    <option value="continuous">Tempo total por repetição (ex: 4s contínuos)</option>
                    
                  </select>

                  </div>

                </div>

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[color:var(--border-color)]"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                    >Métrica de percepção de esforço</span>

                    <p
      className="text-xs text-[#968882]"
                    >Guia padrão para autorregulação de séries principais.</p>

                  </div>

                  <div
      className="flex items-center gap-4 text-xs"
                  >

                    <label
      className="flex items-center gap-2 cursor-pointer"
                    >

                      <input
      defaultChecked
      className="text-[#e06c43] focus:ring-[#e06c43] bg-[#211A17] border-[color:var(--border-color)]"
      name="effort_scale"
      type="radio"
                      />

                      <span
      className="text-[color:var(--text-main)]"
                      >RPE (Escala Borg 1–10)</span>

                    </label>

                    <label
      className="flex items-center gap-2 cursor-pointer"
                    >

                      <input
      className="text-[#e06c43] focus:ring-[#e06c43] bg-[#211A17] border-[color:var(--border-color)]"
      name="effort_scale"
      type="radio"
                      />

                      <span
      className="text-[#b3a39c]"
                      >RIR (Repetições na reserva)</span>

                    </label>

                  </div>

                </div>

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >

                  <div
      className="max-w-xs"
                  >

                    <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                    >Incremento mínimo de carga</span>

                    <p
      className="text-xs text-[#968882]"
                    >Arredondamento automático em sugestões de progressão de carga.</p>

                  </div>

                  <div
      className="w-full sm:w-36"
                  >

                    <select
      className="w-full bg-[#211A17] text-[color:var(--text-main)] border border-[color:var(--border-color)] rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#e06c43]"
      value={String(state.values['notation-2'] ?? '1.0')}
      onChange={(e) => state.update('notation-2', e.target.value)}
                  >
                    
                    <option value="0.5">0,5 kg (Fracionado)</option><option value="1.0">1,0 kg</option><option value="2.0">2,0 kg</option><option value="2.5">2,5 kg (Padrão anilhas)</option>
                  </select>

                  </div>

                </div>

              </div>

            </div>

          </section>

          <div
      className="border-t border-[color:var(--border-color)]"
          ></div>

          <section
      className="pt-2"
      id="notificacoes"
          >

            <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >

              <div>

                <h2
      className="text-base font-semibold text-[color:var(--text-main)]"
                >Notificações &amp; Alertas</h2>

                <p
      className="text-xs text-[#968882] mt-1 leading-relaxed"
                >

                Controle o volume e os canais de recebimento de atualizações da sua carteira de atletas.
                              </p>

              </div>

              <div
      className="md:col-span-2 flex flex-col gap-4"
              >

                <label
      className="flex items-start justify-between gap-4 py-2 cursor-pointer"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)] block"
                    >Check-ins de treino concluídos</span>

                    <span
      className="text-xs text-[#968882] leading-relaxed"
                    >Receba um e-mail instantâneo quando um atleta finalizar a sessão prescrita.</span>

                  </div>

                  <input
      className="mt-1 rounded bg-[#211A17] border-[color:var(--border-color)] text-[#e06c43] focus:ring-[#e06c43]"
      type="checkbox"
      checked={Boolean(state.values['notification-0'])}
      onChange={(e) => state.update('notification-0', e.target.checked)}
                  />

                </label>

                <div
      className="border-t border-[color:var(--border-color)]"
                ></div>

                <label
      className="flex items-start justify-between gap-4 py-2 cursor-pointer"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)] block"
                    >Resumo diário de feedbacks</span>

                    <span
      className="text-xs text-[#968882] leading-relaxed"
                    >
Compilado matinal com notas de esforço, dores articulares relatadas e vídeos anexados pelos alunos.                    </span>

                  </div>

                  <input
      className="mt-1 rounded bg-[#211A17] border-[color:var(--border-color)] text-[#e06c43] focus:ring-[#e06c43]"
      type="checkbox"
      checked={Boolean(state.values['notification-1'])}
      onChange={(e) => state.update('notification-1', e.target.checked)}
                  />

                </label>

                <div
      className="border-t border-[color:var(--border-color)]"
                ></div>

                <label
      className="flex items-start justify-between gap-4 py-2 cursor-pointer"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)] block"
                    >Alerta de sobrecarga e queda de rendimento</span>

                    <span
      className="text-xs text-[#968882] leading-relaxed"
                    >
Notificação imediata se um atleta reportar RPE acima de 9 por 3 sessões seguidas ou queda de velocidade de execução.                    </span>

                  </div>

                  <input
      className="mt-1 rounded bg-[#211A17] border-[color:var(--border-color)] text-[#e06c43] focus:ring-[#e06c43]"
      type="checkbox"
      checked={Boolean(state.values['notification-2'])}
      onChange={(e) => state.update('notification-2', e.target.checked)}
                  />

                </label>

              </div>

            </div>

          </section>

          <div
      className="border-t border-[color:var(--border-color)]"
          ></div>

          <section
      className="pt-2"
      id="seguranca"
          >

            <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >

              <div>

                <h2
      className="text-base font-semibold text-[color:var(--text-main)]"
                >Segurança &amp; Sessões</h2>

                <p
      className="text-xs text-[#968882] mt-1 leading-relaxed"
                >

                Autenticação de dois fatores, alteração de senha de acesso e aparelhos atualmente logados.
                              </p>

              </div>

              <div
      className="md:col-span-2 flex flex-col gap-6"
              >

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[color:var(--border-color)]"
                >

                  <div>

                    <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                    >Senha de acesso</span>

                    <p className="text-xs text-[#968882]"></p>

                  </div>

                  <button
      className="px-3 py-1.5 text-xs font-medium rounded border border-[color:var(--border-color)] bg-[#211A17] text-[color:var(--text-main)] hover:bg-[#29211D] self-start sm:self-auto transition-colors"
      type="button"
      onClick={() => void state.onResetPassword()}
                  >
                  Atualizar senha
                                  </button>

                </div>

                <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[color:var(--border-color)]"
                >

                  <div>

                    <div
      className="flex items-center gap-2"
                    >

                      <span
      className="text-sm font-medium text-[color:var(--text-main)]"
                      >Autenticação em duas etapas (2FA)</span>

                      <span
      className="text-xs text-[#a1be8e] font-medium"
                      >Não configurado</span>

                    </div>

                    <p
      className="text-xs text-[#968882] mt-0.5"
                    >Google Authenticator ou chave de segurança de hardware.</p>

                  </div>

                  <button
      className="px-3 py-1.5 text-xs font-medium rounded border border-[color:var(--border-color)] bg-[#211A17] text-[color:var(--text-main)] hover:bg-[#29211D] self-start sm:self-auto transition-colors"
      type="button"
      onClick={state.onStubAction}
                  >
                  Reconfigurar
                                  </button>

                </div>

                <div>

                  <div
      className="flex items-center justify-between mb-3"
                  >

                    <span
      className="text-xs font-medium text-[#b3a39c] uppercase tracking-wider"
                    >Sessões ativas</span>

                    <button
      className="text-xs text-[#968882] hover:text-[#f28b82] transition-colors"
      type="button"
      onClick={state.onStubAction}
                    >
                    Encerrar outras sessões
                                      </button>

                  </div>

                  <div
      className="divide-y divide-[var(--border-color)] border-t border-b border-[color:var(--border-color)] text-xs"
                  >

                    <div
      className="py-2.5 flex items-center justify-between"
                    >

                      <div>

                        <div
      className="flex items-center gap-2"
                        >

                          <span
      className="font-medium text-[color:var(--text-main)]"
                          >Navegador atual</span>

                          <span
      className="text-[10px] text-[#a1be8e]"
                          >Esta sessão</span>

                        </div>

                        <span
      className="text-[#7e6e67]"
                        ></span>

                      </div>

                      <span
      className="text-[#a1be8e] text-[11px]"
                      >Online</span>

                    </div>

                    <div
      className="py-2.5 flex items-center justify-between"
                    >

                      <div>

                        <span
      className="font-medium text-[color:var(--text-main)]"
                        >iPhone 15 Pro — App Coach</span>

                        <div
      className="text-[#7e6e67]"
                        ></div>

                      </div>

                      <button
      className="text-[#968882] hover:text-[#f28b82] transition-colors"
      type="button"
                      >

                      Encerrar
                                          </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>
    </div>


    <div
      className={`fixed bottom-6 right-6 z-50 bg-[#231c19] text-[color:var(--text-main)] border border-[#332822] px-4 py-2.5 rounded text-xs items-center gap-2.5 shadow-lg ${state.notice ? 'flex' : 'hidden'}`}
      id="toast"
      role="status"
      hidden={!state.notice}
    >

      <span
      className="w-1.5 h-1.5 rounded-full bg-[#a1be8e]"
      ></span>

      <span className="">{state.notice}</span>

    </div>
    </>
  );
}
