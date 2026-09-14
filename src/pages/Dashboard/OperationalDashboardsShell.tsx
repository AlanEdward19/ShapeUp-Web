// @ts-nocheck
import { readAllPages } from '../../utils/readAllPages';
import { workoutHistory } from '../../utils/workoutHistory';
import AthleteScoreboard from '../../stitch/AthleteScoreboard';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { createElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Workspace from '../../stitch/Workspace';
import { nodeText, sourceDocument, renderSource } from '../../stitch/sourceRuntime';
import LegacyDashboardClient from './DashboardClient';
import useHydration from '../../stitch/useHydration';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import HistoryChart from '../../stitch/HistoryChart';
import { useLanguage } from '../../contexts/LanguageContext';
import { copy } from '../../stitch/copy';
import { normalizePlan } from '../../utils/trainingNormalization';

type BindProps = Record<string, unknown> & {
  className?: string;
  style?: CSSProperties;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  hidden?: boolean;
  title?: string;
  key?: string | number;
  href?: string;
  role?: string;
  tabIndex?: number;
  ['aria-pressed']?: boolean;
  ['aria-current']?: string | boolean;
  ['aria-label']?: string;
  ['data-workout-completed']?: boolean;
};

type DashboardClientRow = {
  id: string | number;
  name?: string;
  clientId?: string | number;
  clientName?: string;
  planName?: string;
  activePlan?: string;
  compliance?: number;
  adherencePercentage?: number;
  goal?: string;
  objective?: string;
  lastCheckin?: string;
  phase?: string;
  nextSessionAt?: string;
};

type StoredMessage = {
  id: string | number;
  sender: string;
  status?: string;
  clientName?: string;
  text?: string;
  clientId?: string | number;
};

type ChartPoint = {
  session: number;
  date: string;
  startedAt: string;
  volume: number;
};

type AthleteShellState = Record<string, unknown>;

function useDashboardCopy() {
  const { language, translateCopy } = useLanguage();
  return {
    language,
    tr: (text: string) =>
      language === 'pt-BR'
        ? text
        : copy[text]?.[language === 'es' ? 1 : 0] || translateCopy(text),
  };
}

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

export function StitchProfessional() {
  const user = useUserProfile();
  const { language, tr } = useDashboardCopy();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [clients, setClients] = useState<DashboardClientRow[]>([]);
  const [loadError, setLoadError] = useState('');
  const { getTrainerClients } = useGymManagementApi();
  const { getWorkoutsByUser: getClientWorkouts } = useTrainingApi();
  const [clientHistory, setClientHistory] = useState<ReturnType<typeof workoutHistory>[]>([]);
  const { getMe } = useAuthorizationApi();
  useEffect(() => {
    let active = true;
    getMe()
      .then(me => readAllPages(cursor => getTrainerClients(me.id || me.userId, cursor)))
      .then(async result => {
        const sessions = await Promise.all(
          result.map(client => readAllPages(cursor => getClientWorkouts(client.clientId, cursor))),
        );
        if (active) {
          setClientHistory(
            sessions.flat().filter(session => session.isCompleted).map(workoutHistory),
          );
          setClients(
            (result.items || result || []).map(item => ({
              ...item,
              id: item.clientId || item.id,
              name: item.clientName || item.name,
              activePlan: item.planName || '',
              compliance: item.adherencePercentage ?? 0,
            })),
          );
        }
      })
      .catch(() => {
        if (active) setLoadError('Não foi possível carregar os alunos. Tente novamente.');
      });
    return () => {
      active = false;
    };
  }, [getMe, getTrainerClients, getClientWorkouts]);
  const filtered = clients.filter(
    client =>
      (client.name || '').toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'Todos' ||
        (filter.includes('Atras')
          ? Number(client.compliance) < 50
          : !client.activePlan || client.activePlan === '-')),
  );
  const navigate = useNavigate();
  const row = sourceDocument('professional').querySelector('tbody tr');
  const history = clientHistory;
  const today = history.filter(
    session => new Date(session.date).toDateString() === new Date().toDateString(),
  );
  const pending = clients.filter(client => !client.activePlan || client.activePlan === '-').length;
  const adherence = clients.length
    ? Math.round(
        clients.reduce((sum, client) => sum + Number(client.compliance || 0), 0) / clients.length,
      )
    : 0;
  const feedback = read<StoredMessage[]>('shapeup_messages', []).filter(
    message => message.sender === 'client' && message.status !== 'read',
  );
  const appointments = clients.filter(
    client =>
      client.nextSessionAt &&
      new Date(client.nextSessionAt).toDateString() === new Date().toDateString(),
  );
  const agenda = [...sourceDocument('professional').querySelectorAll('section')].find(
    section => section.querySelector('h3')?.textContent === 'Agenda de Hoje',
  );
  const feedbackSection = [...sourceDocument('professional').querySelectorAll('section')].find(
    section => section.querySelector('h3')?.textContent === 'Feedbacks em Aberto',
  );
  return (
    <Workspace
      name="professional"
      after={loadError ? <p role="alert">{loadError}</p> : undefined}
      bind={(node, props, children) => {
        const bindProps = props as BindProps;
        const text = nodeText(node);
        if (node.localName === 'span' && text.includes('+3%')) return null;
        const metricText: Record<string, string> = {
          '8 alunos': `${today.length} alunos`,
          '6 concluídos': `${today.length} concluídos`,
          '2 sessões ainda em andamento': 'Sessões registradas hoje',
          '3 fichas': `${pending} fichas`,
          '94%': `${adherence}%`,
          '09:00': appointments[0]
            ? new Date(appointments[0].nextSessionAt!).toLocaleTimeString(language, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—',
          'Juliana M.': appointments[0]?.name || 'Sem agendamento',
          'Presencial • Treino de Hipertrofia': 'Próximo atendimento',
          '3 Sessões': `${appointments.length} sessões`,
          'Sexta-feira • 3 sessões agendadas': new Date().toLocaleDateString(language, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }),
          '2 Pendentes': `${feedback.length} pendentes`,
          'Acima da meta mínima estabelecida (85%)': 'Aderência registrada pelos alunos',
        };
        if (node.children.length === 0 && metricText[text] !== undefined) {
          return createElement(node.localName, bindProps, metricText[text]);
        }
        if (node.localName === 'p' && node.previousElementSibling?.localName === 'h1') {
          return (
            <p {...bindProps}>
              {clients.length} alunos ativos • {pending} revisões pendentes • {feedback.length}{' '}
              feedbacks aguardando revisão
            </p>
          );
        }
        if (node.parentElement === agenda && node.className.includes('divide-y')) {
          return (
            <div {...bindProps}>
              {appointments.length ? (
                appointments.map(client => (
                  <div key={client.id} className="p-4 border-b border-brand-border">
                    <strong className="text-xs text-brand-text">{client.name}</strong>
                    <p className="text-xs text-brand-secondary">
                      {new Date(client.nextSessionAt!).toLocaleTimeString(language, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {client.activePlan}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-xs text-brand-muted">
                  Nenhum atendimento agendado para hoje.
                </p>
              )}
            </div>
          );
        }
        if (node.parentElement === feedbackSection && node.className.includes('divide-y')) {
          return (
            <div {...bindProps}>
              {feedback.length ? (
                feedback.slice(-2).map(message => (
                  <div key={message.id} className="p-4 space-y-2.5">
                    <strong className="text-xs text-brand-text">{message.clientName}</strong>
                    <p className="bg-brand-bg border border-brand-border rounded p-2.5 text-xs text-brand-secondary">
                      {message.text}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-terracotta"
                      onClick={() => navigate('/dashboard/messages')}
                    >
                      Responder Aluno
                    </button>
                  </div>
                ))
              ) : (
                <p className="p-4 text-xs text-brand-muted">Nenhum feedback pendente.</p>
              )}
            </div>
          );
        }
        if (node.localName === 'input') {
          bindProps.value = query;
          bindProps.onChange = event => setQuery(event.target.value);
        }
        if (node.localName === 'button' && /^(Todos|Atrasados|Revisão)/.test(text)) {
          const label = text.split(' (')[0];
          const count =
            label === 'Todos'
              ? clients.length
              : label === 'Atrasados'
                ? clients.filter(client => Number(client.compliance) < 50).length
                : pending;
          bindProps.onClick = () => setFilter(label);
          bindProps['aria-pressed'] = filter === label;
          return createElement('button', bindProps, `${tr(label)} (${count})`);
        }
        if (node.children.length === 0 && text.startsWith('Exibindo 4 de 14')) {
          return createElement(
            node.localName,
            bindProps,
            `${tr('Exibindo')} ${Math.min(4, filtered.length)} / ${filtered.length} ${tr('alunos em acompanhamento contínuo')}`,
          );
        }
        if (node.localName === 'tbody' && row) {
          return (
            <tbody {...bindProps}>
              {filtered.length ? (
                filtered.slice(0, 4).map(client =>
                  renderSource(
                    row,
                    (item, itemProps) => {
                      const itemBind = itemProps as BindProps;
                      const value = nodeText(item);
                      const replacements: Record<string, string> = {
                        'Juliana Mendes': client.name || '',
                        'Hipertrofia Glúteos & Posteriores':
                          client.goal || client.objective || 'Objetivo não informado',
                        'Hoje, 08:30': client.lastCheckin || 'Sem registro',
                        'Treino A concluído': client.activePlan || 'Sem ficha',
                        '4/4': `${client.compliance || 0}%`,
                        'Semana 5 de 12': client.activePlan || 'Sem periodização',
                        'Fase Acúmulo de Volume': client.phase || '—',
                      };
                      if (item.children.length === 0 && replacements[value] !== undefined) {
                        return createElement(item.localName, itemBind, replacements[value]);
                      }
                      if (item.localName === 'img') {
                        return (
                          <span
                            className={itemBind.className}
                            style={{
                              display: 'grid',
                              placeItems: 'center',
                              background: '#29211d',
                            }}
                          >
                            {(client.name || '?').slice(0, 2)}
                          </span>
                        );
                      }
                      if ((item as HTMLElement).style.width) {
                        itemBind.style = {
                          width: `${Math.min(100, client.compliance || 0)}%`,
                        };
                      }
                      if (item.localName === 'button') {
                        itemBind.onClick = () => navigate(`/dashboard/clients/${client.id}`);
                      }
                    },
                    client.id,
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-brand-muted">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          );
        }
        if (node.children.length === 0 && text === 'Rodrigo Silva') {
          return createElement(node.localName, bindProps, user.name || 'Minha conta');
        }
        if (node.localName === 'button' && /Responder|feedback/i.test(text)) {
          bindProps.onClick = () => navigate('/dashboard/messages');
        }
      }}
    />
  );
}

function AthleteView(state: AthleteShellState) {
  const user = useUserProfile();
  const { language, tr } = useDashboardCopy();
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString('en-CA');
  const { water, addWater } = useHydration(date);
  const { getDiaryDay, getNutritionProfile } = useNutritionApi();
  const { getDashboardMe, getWorkoutsByUser, getWorkoutPlansByUser } = useTrainingApi();
  const { getMe } = useAuthorizationApi();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [plans, setPlans] = useState<ReturnType<typeof normalizePlan>[]>([]);
  const [trainingError, setTrainingError] = useState('');
  useEffect(() => {
    let active = true;
    getMe()
      .then(me =>
        Promise.all([
          readAllPages(cursor => getWorkoutsByUser(me.id || me.userId, cursor, 50)),
          readAllPages(cursor => getWorkoutPlansByUser(me.id || me.userId, cursor)),
        ]),
      )
      .then(([sessions, result]) => {
        if (!active) return;
        setPlans((result.items || result || []).map(normalizePlan));
        setChartData(
          (sessions.items || sessions || [])
            .filter(item => item.isCompleted)
            .sort((a, b) => new Date(a.startedAtUtc) - new Date(b.startedAtUtc))
            .map((item, index) => ({
              session: index + 1,
              date: new Date(item.startedAtUtc).toLocaleDateString(language),
              startedAt: item.startedAtUtc,
              volume: parseFloat(workoutHistory(item).totalVol),
            })),
        );
      })
      .catch(() => {
        if (active) setTrainingError('Não foi possível carregar seu histórico de treinamento.');
      });
    return () => {
      active = false;
    };
  }, [getMe, getWorkoutsByUser, getWorkoutPlansByUser, language]);
  const [dashboard, setDashboard] = useState<{
    sessionsCompletionRate?: number;
    weeklyVolumeProgressPercent?: number;
    weeklyVolume?: number;
    sessionsCompletedThisWeek?: number;
    sessionsTargetPerWeek?: number;
  } | null>(null);
  useEffect(() => {
    let active = true;
    getDashboardMe(5)
      .then(data => {
        if (active) setDashboard(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getDashboardMe]);
  const [nutrition, setNutrition] = useState<{
    totals?: { kcal?: number; proteinG?: number };
    goal?: { kcal?: number; proteinG?: number };
    meals?: unknown[];
  }>({});
  useEffect(() => {
    let active = true;
    Promise.all([getDiaryDay(date), getNutritionProfile()])
      .then(([diary, profile]) => {
        if (active) setNutrition({ ...diary, goal: profile?.activeGoal });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [date, getDiaryDay, getNutritionProfile]);
  const plan = plans[0];
  const exercises =
    plan?.blocks?.flatMap(block => block.exercises || []) || plan?.exercises || [];
  const prototype = sourceDocument('athlete')
    .querySelector('#tabela-exercicios h3')
    ?.closest('.group');
  const chartPanel = sourceDocument('athlete').querySelector('svg')?.parentElement?.parentElement
    ?.parentElement;
  const messages = read<StoredMessage[]>('shapeup_messages', []).filter(
    message =>
      String(message.clientId) === String(localStorage.getItem('shapeup_client_id') || 1) &&
      message.sender === 'coach',
  );
  return (
    <Workspace
      name="athlete"
      after={trainingError ? <p role="alert">{trainingError}</p> : undefined}
      bind={(node, props, children) => {
        const bindProps = props as BindProps;
        if (node.localName === 'section' && node.querySelector('h1')) {
          return (
            <>
              {createElement(node.localName, bindProps, children as ReactNode)}
              <AthleteScoreboard state={state} />
            </>
          );
        }
        const text = nodeText(node);
        if (node.localName === 'div' && node.classList.contains('border-l') && text.includes('CREF 089124')) {
          return null;
        }
        if (node.children.length === 0 && text === 'Mesociclo de Hipertrofia') {
          return createElement(node.localName, bindProps, plan?.name || tr('Plano de treinamento'));
        }
        if (
          node.children.length === 0 &&
          /Coach Rodrigo|CREF 089124|^RS$|^Rodrigo Silva$/.test(text)
        ) {
          return null;
        }
        if (
          node.children.length === 0 &&
          [
            'Recuperação dos superiores: 48h',
            'Meta: 28.000 kg',
            '88% atingido',
            'Baseado no teste de 1RM do ciclo • RPE alvo médio: 8.5',
            'Ontem às 21:15',
            'meta no ritmo',
            'Semana 3 de 6',
          ].includes(text)
        ) {
          return null;
        }
        if (node.localName === 'span' && text.includes('pronto para progressão')) return null;
        if (node.children.length === 0 && text === '80%') {
          return createElement(
            node.localName,
            bindProps,
            Number.isFinite(dashboard?.sessionsCompletionRate)
              ? `${dashboard.sessionsCompletionRate}%`
              : '—',
          );
        }
        if (node.children.length === 0 && text === '+8% vs ant.') {
          return createElement(
            node.localName,
            bindProps,
            Number.isFinite(dashboard?.weeklyVolumeProgressPercent)
              ? `${dashboard.weeklyVolumeProgressPercent}%`
              : '—',
          );
        }
        const nutritionPercent = nutrition.goal?.kcal
          ? Math.round(((nutrition.totals?.kcal || 0) / nutrition.goal.kcal) * 100)
          : null;
        if (node.children.length === 0 && text === '71%') {
          return createElement(
            node.localName,
            bindProps,
            nutritionPercent === null ? '—' : `${nutritionPercent}%`,
          );
        }
        if ((node as HTMLElement).style.width === '71%') {
          bindProps.style = {
            ...bindProps.style,
            width: `${Math.min(100, nutritionPercent || 0)}%`,
          };
        }
        if (node.localName === 'span' && text.startsWith('1.840')) {
          return (
            <span {...bindProps}>{`${Number(nutrition.totals?.kcal || 0).toLocaleString(language)} / ${nutrition.goal?.kcal || '—'} kcal`}</span>
          );
        }
        const weekday = [
          'Segunda',
          'Terça',
          'Quarta (Descanso)',
          'Quinta',
          'Sexta',
          'Sábado (Hoje)',
          'Domingo',
        ].indexOf(node.title);
        if (weekday >= 0) {
          const day = new Date();
          day.setDate(day.getDate() - ((day.getDay() + 6) % 7) + weekday);
          const done = chartData.some(
            item => new Date(item.startedAt).toDateString() === day.toDateString(),
          );
          const isToday = day.toDateString() === new Date().toDateString();
          bindProps.title = day.toLocaleDateString(language, { dateStyle: 'full' });
          bindProps['aria-current'] = isToday ? 'date' : undefined;
          bindProps['data-workout-completed'] = done;
          bindProps.style = {
            color: done ? '#f3eae5' : '#b8aaa2',
            background: done ? '#506443' : 'transparent',
            border: `2px solid ${isToday ? '#e06c43' : done ? '#506443' : '#3a2d27'}`,
            boxShadow: isToday ? '0 0 0 2px #171311' : undefined,
          };
          return createElement(
            node.localName,
            bindProps,
            day.toLocaleDateString(language, { weekday: 'short' }).slice(0, 1).toUpperCase(),
          );
        }
        if (text === 'Sábado, 24 de Maio') {
          return createElement(
            node.localName,
            bindProps,
            new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' }),
          );
        }
        if (node === chartPanel) {
          return (
            <div {...bindProps}>
              <h3 className="font-headline text-lg font-bold uppercase">Histórico de Volume</h3>
              <HistoryChart data={chartData} />
            </div>
          );
        }
        if (node.localName === 'div' && node.classList.contains('pb-5') && text.includes('Refeição Programada')) {
          return (
            <div {...bindProps}>
              <h3 className="text-xs font-bold uppercase">Diário de Nutrição</h3>
              <p className="text-sm py-3">{nutrition.meals?.length || 0} refeições registradas</p>
              <button
                type="button"
                className="text-xs text-[#e06c43]"
                onClick={() => navigate('/dashboard/nutrition/diary')}
              >
                Abrir diário
              </button>
            </div>
          );
        }
        if (
          node.localName === 'div' &&
          node.classList.contains('p-3') &&
          text.includes('Cuidado com a Articulação do Ombro')
        ) {
          return null;
        }
        if (node.children.length === 0 && text === '24.800' && dashboard) {
          return createElement(
            node.localName,
            bindProps,
            Number(dashboard.weeklyVolume || 0).toLocaleString(language),
          );
        }
        if (node.children.length === 0 && text === '4 de 5 dias' && dashboard) {
          return createElement(
            node.localName,
            bindProps,
            `${dashboard.sessionsCompletedThisWeek ?? 0} / ${dashboard.sessionsTargetPerWeek ?? '—'}`,
          );
        }
        if (node.localName === 'h1') {
          return <h1 {...bindProps}>{plan?.name || 'Seu Plano de Treinamento'}</h1>;
        }
        if (node.localName === 'p' && node.previousElementSibling?.localName === 'h1') {
          return (
            <p {...bindProps}>
              {exercises.length} exercícios programados •{' '}
              {plan?.notes || tr('Siga as orientações da sua ficha.')}
            </p>
          );
        }
        if (node === prototype?.parentElement && prototype) {
          return (
            <div {...bindProps}>
              {exercises.length ? (
                exercises.map((exercise, index) =>
                  renderSource(
                    prototype,
                    (item, itemProps) => {
                      const itemBind = itemProps as BindProps;
                      const value = nodeText(item);
                      if (item.localName === 'h3') {
                        return <h3 {...itemBind}>{exercise.name}</h3>;
                      }
                      if (item.children.length === 0 && value === '01') {
                        return (
                          <span {...itemBind}>{String(index + 1).padStart(2, '0')}</span>
                        );
                      }
                      if (item.children.length === 0 && value === '+2.5kg sugerido') return null;
                      if (item.localName === 'p' && value.startsWith('Pegada aberta')) {
                        return (
                          <p {...itemBind}>
                            {exercise.notes || exercise.muscles?.join(', ')}
                          </p>
                        );
                      }
                      if (item.localName === 'p' && value.includes('séries ×')) {
                        return (
                          <p {...itemBind}>{`${exercise.sets?.length || 0} ${tr('séries ×')} ${exercise.sets?.[0]?.reps || '—'} reps`}</p>
                        );
                      }
                      if (item.localName === 'p' && value.startsWith('Carga:')) {
                        return (
                          <p {...itemBind}>{`${tr('Carga:')} ${exercise.sets?.[0]?.load || '—'} kg`}</p>
                        );
                      }
                      if (item.localName === 'input') {
                        itemBind.onChange = () => navigate('/dashboard/training');
                        itemBind.title = 'Abrir sessão para registrar a execução';
                      }
                    },
                    exercise.id || index,
                  ),
                )
              ) : (
                <p className="py-4 text-xs text-[#82736b]">
                  Seu treino aparecerá aqui após a prescrição.
                </p>
              )}
            </div>
          );
        }
        if (node.id === 'waterDisplay') {
          return <span {...bindProps}>{(water / 1000).toLocaleString(language)}</span>;
        }
        if (node.id === 'waterPct') {
          return <span {...bindProps}>Registro diário</span>;
        }
        if (node.id === 'addWaterQuickBtn') bindProps.onClick = addWater;
        const values: Record<string, string> = {
          '24.800': '—',
          '4 de 5 dias': '—',
          '145g': `${nutrition.totals?.proteinG || 0}g`,
          '/ 210g': `/ ${nutrition.goal?.proteinG || '—'}g`,
          '/ 2.600 kcal': `/ ${nutrition.goal?.kcal || '—'} kcal`,
          '/ 3.5 Litros': 'litros registrados',
          'Restam 1.3L até o encerramento do dia': 'Registro diário neste dispositivo',
          '5 de 5 pendentes': `${exercises.length} exercícios`,
          'Sessão 18 • Fase de Sobrecarga': plan?.phase || 'Plano de treinamento',
        };
        if (node.children.length === 0 && values[text] !== undefined) {
          return createElement(node.localName, bindProps, values[text]);
        }
        if (node.localName === 'p' && text.includes('Execução do terra na terça')) {
          return (
            <p {...bindProps}>
              {messages[messages.length - 1]?.text || 'Nenhuma orientação nova do treinador.'}
            </p>
          );
        }
        if (node.localName === 'button' && /Responder|Confirmar Ingestão/.test(text)) {
          bindProps.onClick = () =>
            navigate(text.includes('Responder') ? '/dashboard/messages' : '/dashboard/nutrition/foods');
        }
        if (
          node.children.length === 0 &&
          /^(Lucas Vianna|Lucas|Rodrigo Silva)$/.test(nodeText(node))
        ) {
          return createElement(node.localName, bindProps, user.name || 'Minha conta');
        }
        if (node.localName === 'button' && /iniciar|treino|sessão/i.test(nodeText(node))) {
          bindProps.onClick = () => navigate('/dashboard/training');
        }
        if (node.localName === 'button' && /mensagem|coach/i.test(nodeText(node))) {
          bindProps.onClick = () => navigate('/dashboard/messages');
        }
        if (node.localName === 'button' && /alimento|refeição/i.test(nodeText(node))) {
          bindProps.onClick = () => navigate('/dashboard/nutrition/foods');
        }
      }}
    />
  );
}

export function StitchAthlete() {
  return (
    <LegacyDashboardClient renderView={state => <AthleteView {...state} />} />
  );
}
