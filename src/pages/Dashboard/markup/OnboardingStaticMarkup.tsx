/* eslint-disable */
/* Auto-generated from stitch/templates/onboarding.html — wire interactivity in OnboardingDashboardMarkup.tsx */
import type { ReactElement } from 'react';

export function OnboardingStaticMarkup(): ReactElement {
  return (
    <>


      <main
      className="w-full max-w-[1240px] bg-oxide-900 border border-oxide-750/80 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md"
      data-purpose="onboarding-container"
      >


        <header
      className="h-16 px-6 border-b border-oxide-750/80 flex items-center justify-between text-sm bg-oxide-850/60"
      data-purpose="modal-header"
        >


          <div
      className="flex items-center space-x-3"
          >

            <div
      className="flex items-center space-x-2"
            >


              <div
      className="w-7 h-7 bg-brand/10 border border-brand/40 rounded flex items-center justify-center text-brand"
              >

                <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 24 24"
                >

                  <path
      d="M4 6a2 2 0 012-2h1a2 2 0 012 2v1h6V6a2 2 0 012-2h1a2 2 0 012 2v12a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H9v1a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                  ></path>

                </svg>

              </div>

              <span
      className="font-condensed font-extrabold tracking-wider text-xl text-white"
              >SHAPEUP</span>

            </div>

            <span
      className="bg-oxide-800 text-oxide-400 border border-oxide-700/60 text-[10px] tracking-widest font-mono font-semibold px-2 py-0.5 rounded uppercase"
            >

          Setup Guiado
                    </span>

          </div>


          <nav
      className="hidden md:flex items-center space-x-1 sm:space-x-4 font-condensed tracking-wide text-xs"
      data-purpose="stepper-navigation"
          >


            <button
      className="step-nav-btn group flex items-center space-x-2 py-1.5 px-3 border-b-2 border-brand text-white font-semibold transition-all"
      id="nav-step-1"
      data-source-onclick="switchStep(1)"
      type="button"
            >

              <span
      className="text-brand font-mono font-bold"
              >01</span>

              <span
      className="text-oxide-400 text-[11px] group-hover:text-oxide-300"
              >de 04 ·</span>

              <span
      className="step-name uppercase text-sm tracking-wider text-white"
              >Metas &amp; Periodização</span>

            </button>


            <button
      className="step-nav-btn group flex items-center space-x-2 py-1.5 px-3 border-b-2 border-transparent text-oxide-400 hover:text-oxide-200 transition-all"
      id="nav-step-2"
      data-source-onclick="switchStep(2)"
      type="button"
            >

              <span
      className="font-mono text-oxide-400 group-hover:text-oxide-200"
              >02</span>

              <span
      className="step-name uppercase text-sm tracking-wider"
              >Nutrição &amp; NEAT</span>

            </button>


            <button
      className="step-nav-btn group flex items-center space-x-2 py-1.5 px-3 border-b-2 border-transparent text-oxide-400 hover:text-oxide-200 transition-all"
      id="nav-step-3"
      data-source-onclick="switchStep(3)"
      type="button"
            >

              <span
      className="font-mono text-oxide-400 group-hover:text-oxide-200"
              >03</span>

              <span
      className="step-name uppercase text-sm tracking-wider"
              >Perfil de Atleta</span>

            </button>


            <button
      className="step-nav-btn group flex items-center space-x-2 py-1.5 px-3 border-b-2 border-transparent text-oxide-400 hover:text-oxide-200 transition-all"
      id="nav-step-4"
      data-source-onclick="switchStep(4)"
      type="button"
            >

              <span
      className="font-mono text-oxide-400 group-hover:text-oxide-200"
              >04</span>

              <span
      className="step-name uppercase text-sm tracking-wider"
              >Workspace</span>

            </button>

          </nav>


          <button
      className="group flex items-center space-x-1.5 text-xs text-oxide-400 hover:text-brand transition-colors font-condensed tracking-wider font-semibold uppercase"
      data-source-onclick="switchStep(4)"
      type="button"
          >

            <span>Pular e configurar depois</span>

            <svg
      className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
            >

              <path
      d="M9 5l7 7-7 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
              ></path>

            </svg>

          </button>

        </header>



        <div
      className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]"
        >


          <aside
      className="lg:col-span-5 p-7 sm:p-9 border-b lg:border-b-0 lg:border-r border-oxide-750/70 flex flex-col justify-between bg-oxide-900/90"
      data-purpose="left-context-panel"
          >

            <div>


              <div
      className="flex items-center space-x-2 mb-3"
              >

                <span
      className="w-2 h-2 rounded-full bg-brand animate-pulse"
                ></span>

                <span
      className="text-[11px] font-condensed tracking-widest uppercase font-bold text-brand"
      id="left-badge-tag"
                >

              Calibração de Abertura
                            </span>

              </div>


              <h1
      className="text-3xl sm:text-4xl font-extrabold font-condensed tracking-tight text-white mb-3 leading-none"
      id="left-headline"
              >

            Bem-vindo ao ShapeUp.
                        </h1>


              <p
      className="text-xs sm:text-sm text-oxide-400 font-normal leading-relaxed mb-6"
      id="left-subtext"
              >

            Vamos calibrar seu ponto de partida para estruturar o primeiro ciclo de treinamento com intensidade precisa.
                        </p>


              <div
      className="relative w-full aspect-square max-w-[270px] mx-auto my-1 flex items-center justify-center bg-oxide-950/40 rounded-2xl border border-oxide-800 p-2 overflow-hidden shadow-inner group"
              >

                <div
      className="absolute inset-0 bg-gradient-to-t from-oxide-900 via-transparent to-transparent z-10 opacity-70"
                ></div>


                <img
      alt="Ryno ShapeUp Mascot"
      className="w-full h-full object-contain object-center z-0 transform group-hover:scale-105 transition-transform duration-500 filter drop-shadow-lg"
      id="mascot-image"
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrLv6rNXbw_PXxzerEb-zJHBoK7inkh8EFhdXk0KNGlb-7ZGfKoxVG0jOnwkwqlW-rpOOwh9dy888TYk3617UDuHOFMeVZxvT0MTmwQNs1QfhIHYoRlu38gjBX-nG7v27z9kfE9LBVm3N65N37tkZ1nUk9JZlSlUiZcIBKUOgel1llsKHoLZSHiLVmh4aFxyajytF7gslUrjuMY3Atn7GYwkRripv0F2U6bYJnn1gbiJagbv7iQbkl"
                />

              </div>


              <div
      className="mt-4 p-3.5 bg-oxide-850/90 border border-oxide-750/80 rounded-lg text-xs leading-relaxed"
      data-purpose="mascot-quote-box"
              >

                <div
      className="flex items-center justify-between mb-1.5"
                >

                  <div
      className="flex items-center space-x-2"
                  >

                    <span
      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    ></span>

                    <span
      className="font-condensed font-bold tracking-wider text-oxide-200 uppercase text-[12px]"
                    >Ryno</span>

                  </div>

                  <span
      className="text-[10px] text-oxide-400 font-mono tracking-wider uppercase"
                  >Guia Tático</span>

                </div>

                <p
      className="text-oxide-300 italic font-sans text-[11.5px]"
      id="mascot-quote"
                >

              "Personalize os parâmetros iniciais. Você ou seu treinador poderão ajustar tudo a qualquer momento no workspace."
                            </p>

              </div>

            </div>


            <div
      className="pt-6 mt-4 border-t border-oxide-800/80 flex items-center justify-between text-[11px] text-oxide-400 font-mono"
            >

              <div
      className="flex items-center space-x-1.5 text-emerald-400/90"
              >

                <svg
      className="w-3.5 h-3.5"
      fill="currentColor"
      viewBox="0 0 20 20"
                >

                  <path
      clipRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      fillRule="evenodd"
                  ></path>

                </svg>

                <span
      className="tracking-wide"
                >Algoritmo Adaptativo Ativo</span>

              </div>

              <span
      className="text-oxide-400"
              >Rev 3.4</span>

            </div>

          </aside>


          <section
      className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-oxide-900/40 relative overflow-y-auto"
      data-purpose="right-content-tabs"
          >


            <div
      className="step-panel space-y-6"
      id="step-content-1"
            >


              <div
      className="space-y-2.5"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-base sm:text-lg"
                  >

                1. Objetivo Principal (Próximos 90 Dias)
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Direcionador motor</span>

                </div>

                <div
      className="space-y-2"
                >


                  <label
      className="card-selected block p-3 rounded-lg border border-oxide-750 bg-oxide-850/60 hover:border-brand/70 cursor-pointer transition-all"
                  >

                    <div
      className="flex items-start space-x-3"
                    >

                      <div
      className="pt-0.5"
                      >

                        <span
      className="w-3.5 h-3.5 rounded-full border-2 border-brand flex items-center justify-center"
                        >

                          <span
      className="w-1.5 h-1.5 rounded-full bg-brand"
                          ></span>

                        </span>

                      </div>

                      <div
      className="flex-1"
                      >

                        <div
      className="flex items-center justify-between"
                        >

                          <span
      className="text-sm font-semibold text-white tracking-wide"
                          >Hipertrofia &amp; Força Máxima</span>

                          <span
      className="text-[9px] font-mono uppercase bg-brand/20 text-brand px-1.5 py-0.5 rounded font-bold tracking-widest"
                          >Padrão</span>

                        </div>

                        <p
      className="text-xs text-oxide-400 mt-0.5"
                        >
Foco em sobrecarga progressiva, tensão mecânica contínua e acúmulo de volume ótimo.                        </p>

                      </div>

                    </div>

                  </label>


                  <label
      className="block p-3 rounded-lg border border-oxide-750/70 bg-oxide-850/30 hover:border-oxide-600 cursor-pointer transition-all"
                  >

                    <div
      className="flex items-start space-x-3"
                    >

                      <div
      className="pt-0.5"
                      >

                        <span
      className="w-3.5 h-3.5 rounded-full border border-oxide-600 flex items-center justify-center"
                        ></span>

                      </div>

                      <div
      className="flex-1"
                      >

                        <span
      className="text-sm font-semibold text-oxide-200 tracking-wide"
                        >Recomposição Corporal</span>

                        <p
      className="text-xs text-oxide-400 mt-0.5"
                        >Equilíbrio estrito de densidade muscular sob déficit calórico controlado.</p>

                      </div>

                    </div>

                  </label>


                  <label
      className="block p-3 rounded-lg border border-oxide-750/70 bg-oxide-850/30 hover:border-oxide-600 cursor-pointer transition-all"
                  >

                    <div
      className="flex items-start space-x-3"
                    >

                      <div
      className="pt-0.5"
                      >

                        <span
      className="w-3.5 h-3.5 rounded-full border border-oxide-600 flex items-center justify-center"
                        ></span>

                      </div>

                      <div
      className="flex-1"
                      >

                        <span
      className="text-sm font-semibold text-oxide-200 tracking-wide"
                        >Condicionamento &amp; Potência</span>

                        <p
      className="text-xs text-oxide-400 mt-0.5"
                        >
Desenvolvimento de taxa de produção de força (RFD) e capacidade de trabalho metabólica.                        </p>

                      </div>

                    </div>

                  </label>


                  <label
      className="block p-3 rounded-lg border border-oxide-750/70 bg-oxide-850/30 hover:border-oxide-600 cursor-pointer transition-all"
                  >

                    <div
      className="flex items-start space-x-3"
                    >

                      <div
      className="pt-0.5"
                      >

                        <span
      className="w-3.5 h-3.5 rounded-full border border-oxide-600 flex items-center justify-center"
                        ></span>

                      </div>

                      <div
      className="flex-1"
                      >

                        <span
      className="text-sm font-semibold text-oxide-200 tracking-wide"
                        >Longevidade &amp; Saúde Articular</span>

                        <p
      className="text-xs text-oxide-400 mt-0.5"
                        >Amplitude ativa, integridade tendínea e controle motor preventivo de lesões.</p>

                      </div>

                    </div>

                  </label>

                </div>

              </div>


              <div
      className="space-y-2"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-sm sm:text-base"
                  >

                2. Frequência de Treino Semanal
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Dias de compromisso</span>

                </div>

                <div
      className="grid grid-cols-3 gap-2.5"
                >

                  <div
      className="p-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg cursor-pointer hover:border-oxide-600 transition-all"
                  >

                    <div
      className="text-xs font-bold text-oxide-200"
                    >2 a 3 Dias</div>

                    <div
      className="text-[10px] text-oxide-400 mt-0.5 leading-tight font-sans"
                    >Full Body / Compacto</div>

                  </div>


                  <div
      className="card-selected p-3 border rounded-lg cursor-pointer transition-all relative"
                  >

                    <div
      className="flex justify-between items-start"
                    >

                      <div
      className="text-xs font-bold text-white"
                      >4 a 5 Dias</div>

                      <span
      className="w-1.5 h-1.5 rounded-full bg-brand"
                      ></span>

                    </div>

                    <div
      className="text-[10px] text-brand/90 mt-0.5 leading-tight font-sans font-medium"
                    >Push-Pull-Legs / Ótimo</div>

                  </div>

                  <div
      className="p-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg cursor-pointer hover:border-oxide-600 transition-all"
                  >

                    <div
      className="text-xs font-bold text-oxide-200"
                    >6 Dias</div>

                    <div
      className="text-[10px] text-oxide-400 mt-0.5 leading-tight font-sans"
                    >Alto Volume Avançado</div>

                  </div>

                </div>

              </div>


              <div
      className="space-y-2"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-sm sm:text-base"
                  >

                3. Nível de Experiência em Musculação
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Tempo contínuo</span>

                </div>

                <div
      className="grid grid-cols-3 gap-2.5"
                >

                  <div
      className="py-2.5 px-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg text-center cursor-pointer hover:border-oxide-600 text-xs font-medium text-oxide-300 transition-all"
                  >

                Iniciante &lt; 1 ano
                                </div>


                  <div
      className="card-selected py-2.5 px-3 border rounded-lg text-center cursor-pointer text-xs font-bold text-white transition-all"
                  >

                Intermediário 1-3 anos
                                </div>

                  <div
      className="py-2.5 px-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg text-center cursor-pointer hover:border-oxide-600 text-xs font-medium text-oxide-300 transition-all"
                  >

                Avançado 3+ anos
                                </div>

                </div>

              </div>


              <div
      className="pt-5 mt-4 border-t border-oxide-750/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >

                <div
      className="flex items-center space-x-2 text-[11px] text-oxide-400"
                >

                  <svg
      className="w-4 h-4 text-oxide-400 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                  >

                    <path
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
                    ></path>

                  </svg>

                  <span>Todos os parâmetros podem ser refinados no editor.</span>

                </div>

                <div
      className="flex items-center space-x-3 w-full sm:w-auto justify-end"
                >

                  <button
      className="opacity-30 cursor-not-allowed px-4 py-2 text-xs font-semibold text-oxide-400 border border-oxide-700/60 rounded-md"
      disabled
      type="button"
                  >

                Voltar
                                </button>

                  <button
      className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-condensed font-bold tracking-wider uppercase text-sm rounded-md shadow-lg shadow-brand/20 flex items-center justify-center space-x-2 transition-all"
      data-source-onclick="switchStep(2)"
      type="button"
                  >

                    <span>Avançar para Nutrição</span>

                    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                    >

                      <path
      d="M14 5l7 7m0 0l-7 7m7-7H3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
                      ></path>

                    </svg>

                  </button>

                </div>

              </div>

            </div>



            <div
      className="step-panel hidden space-y-6"
      id="step-content-2"
            >


              <div
      className="space-y-2.5"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-base sm:text-lg"
                  >

                1. Direção Metabólica Primária
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Ajuste calórico basal</span>

                </div>

                <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                >

                  <label
      className="block p-3 rounded-lg border border-oxide-750/70 bg-oxide-850/30 hover:border-oxide-600 cursor-pointer transition-all"
                  >

                    <div
      className="text-xs font-bold text-white"
                    >Déficit Sustentável</div>

                    <div
      className="text-[11px] text-amber-500 font-mono mt-0.5"
                    >-350 kcal / dia</div>

                    <p
      className="text-[10px] text-oxide-400 mt-1"
                    >Oxidação de gordura sem perda muscular proteica.</p>

                  </label>


                  <label
      className="card-selected block p-3 rounded-lg border cursor-pointer transition-all"
                  >

                    <div
      className="flex items-center justify-between"
                    >

                      <span
      className="text-xs font-bold text-white"
                      >Manutenção &amp; Recomp</span>

                      <span
      className="text-[9px] font-mono uppercase bg-brand/20 text-brand px-1 py-0.2 rounded font-bold"
                      >Padrão</span>

                    </div>

                    <div
      className="text-[11px] text-brand font-mono mt-0.5"
                    >Iso-calórico equilibrado</div>

                    <p
      className="text-[10px] text-oxide-300 mt-1"
                    >Foco puro em troca de massa gorda por densidade magra.</p>

                  </label>

                  <label
      className="block p-3 rounded-lg border border-oxide-750/70 bg-oxide-850/30 hover:border-oxide-600 cursor-pointer transition-all"
                  >

                    <div
      className="text-xs font-bold text-white"
                    >Superávit Construtivo</div>

                    <div
      className="text-[11px] text-emerald-400 font-mono mt-0.5"
                    >+250 kcal / dia</div>

                    <p
      className="text-[10px] text-oxide-400 mt-1"
                    >Ganhos expressivos de massa hipertrófica.</p>

                  </label>

                </div>

              </div>


              <div
      className="space-y-2"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-sm sm:text-base"
                  >

                2. Nível de Atividade Extra-Treino (NEAT)
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Passos e rotina diária</span>

                </div>

                <div
      className="space-y-2"
                >

                  <div
      className="p-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg flex items-center justify-between cursor-pointer hover:border-oxide-600 transition-all"
                  >

                    <div>

                      <span
      className="text-xs font-semibold text-oxide-200"
                      >Trabalho Sentado / Mesa</span>

                      <p
      className="text-[10px] text-oxide-400"
                      >Passividade motora prolongada (&lt; 5.000 passos/dia)</p>

                    </div>

                    <span
      className="text-xs font-mono text-oxide-400"
                    >1.2x</span>

                  </div>


                  <div
      className="card-selected p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all"
                  >

                    <div>

                      <span
      className="text-xs font-bold text-white"
                      >Moderadamente Ativo</span>

                      <p
      className="text-[10px] text-oxide-300"
                      >Deslocamentos regulares a pé (7.500 - 10.000 passos/dia)</p>

                    </div>

                    <span
      className="text-xs font-mono text-brand font-bold"
                    >1.4x (Recomendado)</span>

                  </div>

                  <div
      className="p-3 border border-oxide-750/70 bg-oxide-850/30 rounded-lg flex items-center justify-between cursor-pointer hover:border-oxide-600 transition-all"
                  >

                    <div>

                      <span
      className="text-xs font-semibold text-oxide-200"
                      >Muito Ativo / Em Pé</span>

                      <p
      className="text-[10px] text-oxide-400"
                      >Rotina de chão de fábrica, saúde ou educação física ({'>'} 12.000 passos)</p>

                    </div>

                    <span
      className="text-xs font-mono text-oxide-400"
                    >1.65x</span>

                  </div>

                </div>

              </div>


              <div
      className="space-y-2"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-sm sm:text-base"
                  >

                3. Alquimia de Macronutrientes Padrão
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-brand tracking-wider"
                  >Fórmula Metabólica 40 / 35 / 25</span>

                </div>

                <div
      className="p-3.5 bg-oxide-850/50 border border-oxide-750/70 rounded-lg space-y-2.5"
                >

                  <div
      className="h-2 w-full bg-oxide-800 rounded-full flex overflow-hidden"
                  >

                    <div
      className="bg-brand h-full"
      style={{ width: '40%' }}
                    ></div>

                    <div
      className="bg-amber-600 h-full"
      style={{ width: '35%' }}
                    ></div>

                    <div
      className="bg-emerald-600 h-full"
      style={{ width: '25%' }}
                    ></div>

                  </div>

                  <div
      className="grid grid-cols-3 text-center text-xs"
                  >

                    <div>

                      <span
      className="block font-bold text-brand"
                      >40% Proteína</span>

                      <span
      className="text-[10px] text-oxide-400 font-mono"
                      >2.2g / kg peso</span>

                    </div>

                    <div>

                      <span
      className="block font-bold text-amber-500"
                      >35% Carboidratos</span>

                      <span
      className="text-[10px] text-oxide-400 font-mono"
                      >Energia glicolítica</span>

                    </div>

                    <div>

                      <span
      className="block font-bold text-emerald-400"
                      >25% Gorduras</span>

                      <span
      className="text-[10px] text-oxide-400 font-mono"
                      >Suporte hormonal</span>

                    </div>

                  </div>

                </div>

              </div>


              <div
      className="pt-5 mt-4 border-t border-oxide-750/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >

                <div
      className="flex items-center space-x-2 text-[11px] text-oxide-400"
                >

                  <svg
      className="w-4 h-4 text-oxide-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                  >

                    <path
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
                    ></path>

                  </svg>

                  <span>Metabolismo calculado via Harris-Benedict refinado.</span>

                </div>

                <div
      className="flex items-center space-x-3 w-full sm:w-auto justify-end"
                >

                  <button
      className="px-4 py-2 text-xs font-semibold text-oxide-300 hover:text-white border border-oxide-700/60 rounded-md transition-colors"
      data-source-onclick="switchStep(1)"
      type="button"
                  >

                Voltar
                                </button>

                  <button
      className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-condensed font-bold tracking-wider uppercase text-sm rounded-md shadow-lg shadow-brand/20 flex items-center justify-center space-x-2 transition-all"
      data-source-onclick="switchStep(3)"
      type="button"
                  >

                    <span>Avançar para Perfil Físico</span>

                    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                    >

                      <path
      d="M14 5l7 7m0 0l-7 7m7-7H3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
                      ></path>

                    </svg>

                  </button>

                </div>

              </div>

            </div>



            <div
      className="step-panel hidden space-y-5"
      id="step-content-3"
            >

              <div
      className="space-y-1"
              >

                <div
      className="flex items-baseline justify-between"
                >

                  <h2
      className="font-condensed font-bold uppercase tracking-wider text-oxide-100 text-base sm:text-lg"
                  >

                1. Registro Antropométrico &amp; Foto
                                </h2>

                  <span
      className="text-[11px] font-mono uppercase text-oxide-400 tracking-wider"
                  >Identificação do atleta</span>

                </div>

                <p
      className="text-xs text-oxide-400"
                >
Esses dados ajustam automaticamente a curva de intensidade das cargas no diário de bordo.                </p>

              </div>


              <div
      className="flex items-center space-x-4 p-3.5 bg-oxide-850/60 border border-oxide-750/80 rounded-lg"
              >

                <div
      className="w-14 h-14 rounded-full bg-oxide-800 border-2 border-dashed border-brand/50 flex items-center justify-center text-oxide-400 cursor-pointer hover:border-brand hover:text-brand transition-colors"
                >

                  <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                  >

                    <path
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
                    ></path>

                    <path
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
                    ></path>

                  </svg>

                </div>

                <div>

                  <div
      className="text-xs font-bold text-white"
                  >Foto de Perfil ou Snapshot Físico</div>

                  <div
      className="text-[11px] text-oxide-400"
                  >O Ryno registrará sua evolução visual a cada ciclo de 4 semanas.</div>

                  <button
      className="mt-1 text-[11px] font-condensed tracking-wider uppercase font-bold text-brand hover:underline"
      type="button"
                  >Carregar foto local</button>

                </div>

              </div>


              <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
              >

                <div>

                  <label
      className="block text-[11px] font-mono uppercase text-oxide-300 mb-1"
                  >Nome ou Tag de Treino</label>

                  <input
      className="w-full bg-oxide-850 border border-oxide-700/80 rounded px-3 py-2 text-white focus:ring-1 focus:ring-brand focus:border-brand"
      type="text"
      defaultValue="Rodrigo Silva"
                  />

                </div>

                <div>

                  <label
      className="block text-[11px] font-mono uppercase text-oxide-300 mb-1"
                  >Local / Academia Habitual</label>

                  <input
      className="w-full bg-oxide-850 border border-oxide-700/80 rounded px-3 py-2 text-white focus:ring-1 focus:ring-brand focus:border-brand"
      type="text"
      defaultValue="Iron Gym Club & Performance"
                  />

                </div>

                <div>

                  <label
      className="block text-[11px] font-mono uppercase text-oxide-300 mb-1"
                  >Peso Corporal Atual (kg)</label>

                  <div
      className="relative"
                  >

                    <input
      className="w-full bg-oxide-850 border border-oxide-700/80 rounded px-3 py-2 text-white font-mono focus:ring-1 focus:ring-brand focus:border-brand"
      type="number"
      defaultValue="82.4"
                    />

                    <span
      className="absolute right-3 top-2 text-oxide-400 font-mono text-[10px]"
                    >KG</span>

                  </div>

                </div>

                <div>

                  <label
      className="block text-[11px] font-mono uppercase text-oxide-300 mb-1"
                  >Estatura Corporal (cm)</label>

                  <div
      className="relative"
                  >

                    <input
      className="w-full bg-oxide-850 border border-oxide-700/80 rounded px-3 py-2 text-white font-mono focus:ring-1 focus:ring-brand focus:border-brand"
      type="number"
      defaultValue="181"
                    />

                    <span
      className="absolute right-3 top-2 text-oxide-400 font-mono text-[10px]"
                    >CM</span>

                  </div>

                </div>

              </div>


              <div
      className="p-3 bg-brand/5 border border-brand/20 rounded-lg flex items-center justify-between text-xs"
              >

                <span
      className="text-oxide-300"
                >Taxa Metabólica Basal Estimada:</span>

                <span
      className="font-mono font-bold text-brand text-sm"
                >1.845 kcal/dia</span>

              </div>


              <div
      className="pt-5 mt-4 border-t border-oxide-750/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >

                <div
      className="text-[11px] text-oxide-400 font-mono"
                >

              Etapa 3 de 4 concluída
                            </div>

                <div
      className="flex items-center space-x-3 w-full sm:w-auto justify-end"
                >

                  <button
      className="px-4 py-2 text-xs font-semibold text-oxide-300 hover:text-white border border-oxide-700/60 rounded-md transition-colors"
      data-source-onclick="switchStep(2)"
      type="button"
                  >

                Voltar
                                </button>

                  <button
      className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-condensed font-bold tracking-wider uppercase text-sm rounded-md shadow-lg shadow-brand/20 flex items-center justify-center space-x-2 transition-all"
      data-source-onclick="switchStep(4)"
      type="button"
                  >

                    <span>Concluir &amp; Criar Workspace</span>

                    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                    >

                      <path
      d="M14 5l7 7m0 0l-7 7m7-7H3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
                      ></path>

                    </svg>

                  </button>

                </div>

              </div>

            </div>



            <div
      className="step-panel hidden space-y-6"
      id="step-content-4"
            >

              <div
      className="text-center py-4"
              >

                <div
      className="w-12 h-12 rounded-full bg-brand/20 border border-brand text-brand mx-auto flex items-center justify-center mb-3"
                >

                  <svg
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 20 20"
                  >

                    <path
      clipRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      fillRule="evenodd"
                    ></path>

                  </svg>

                </div>

                <h2
      className="text-2xl font-extrabold font-condensed uppercase tracking-wide text-white"
                >

              Tudo calibrado e pronto para o primeiro ciclo!
                            </h2>

                <p
      className="text-xs text-oxide-400 mt-1 max-w-md mx-auto"
                >

              Seu ambiente foi parametrizado com base nos seus dados de hipertrofia, frequência e balanço calórico.
                            </p>

              </div>


              <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >

                <div
      className="p-3.5 bg-oxide-850/70 border border-oxide-750/90 rounded-lg text-center"
                >

                  <div
      className="text-brand font-mono text-xs font-bold uppercase mb-1"
                  >Módulo 01</div>

                  <div
      className="text-sm font-bold text-white"
                  >Periodização PPL</div>

                  <div
      className="text-[11px] text-oxide-400 mt-0.5"
                  >Push / Pull / Legs otimizado para 4-5 dias.</div>

                </div>

                <div
      className="p-3.5 bg-oxide-850/70 border border-oxide-750/90 rounded-lg text-center"
                >

                  <div
      className="text-amber-500 font-mono text-xs font-bold uppercase mb-1"
                  >Módulo 02</div>

                  <div
      className="text-sm font-bold text-white"
                  >Metabolismo Ativo</div>

                  <div
      className="text-[11px] text-oxide-400 mt-0.5"
                  >Macro Split de 40% Proteína configurado.</div>

                </div>

                <div
      className="p-3.5 bg-oxide-850/70 border border-oxide-750/90 rounded-lg text-center"
                >

                  <div
      className="text-emerald-400 font-mono text-xs font-bold uppercase mb-1"
                  >Módulo 03</div>

                  <div
      className="text-sm font-bold text-white"
                  >Command Bar Ativa</div>

                  <div
      className="text-[11px] text-oxide-400 mt-0.5"
                  >
Use                     <kbd
      className="px-1 py-0.5 bg-oxide-800 rounded font-mono text-[9px]"
                    >Ctrl+K</kbd>
 a qualquer momento.                  </div>

                </div>

              </div>


              <div
      className="pt-5 border-t border-oxide-750/80 flex flex-col items-center justify-center space-y-3"
              >

                <button
      className="w-full sm:w-auto px-8 py-3 bg-brand hover:bg-brand-hover text-white font-condensed font-extrabold tracking-wider uppercase text-base rounded-md shadow-xl shadow-brand/25 flex items-center justify-center space-x-3 transition-transform active:scale-95"
      data-source-onclick="alert(\'Seja bem-vindo ao ShapeUp Workspace!\')"
      type="button"
                >

                  <span>Acessar Meu Workspace ShapeUp</span>

                  <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
                  >

                    <path
      d="M13 7l5 5m0 0l-5 5m5-5H6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
                    ></path>

                  </svg>

                </button>

                <span
      className="text-[11px] text-oxide-400 font-mono"
                >
Dica do Ryno: Você pode refazer este setup a qualquer momento na engrenagem superior.                </span>

              </div>

            </div>


          </section>


        </div>


      </main>



    </>
  );
}
