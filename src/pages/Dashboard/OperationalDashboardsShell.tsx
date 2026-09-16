// @ts-nocheck
import { readAllPages } from '../../utils/readAllPages';
import { workoutHistory } from '../../utils/workoutHistory';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LegacyDashboardClient from './DashboardClient';
import useHydration from '../../hooks/useHydration';
import { useNutritionApi } from '../../hooks/api/useNutritionApi';
import { useGymManagementApi } from '../../hooks/api/useGymManagementApi';
import { useAuthorizationApi } from '../../hooks/api/useAuthorizationApi';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { normalizePlan } from '../../utils/trainingNormalization';
import WorkspaceStitchPage from '../../components/Workspace/WorkspaceStitchPage';
import { workspaceNavStyle } from '../dashboard-stitch/workspaceNavStyle';
import { AthleteDashboardMarkup, type AthleteDashboardState } from './operational-dashboard/AthleteDashboardMarkup';
import {
  ProfessionalDashboardMarkup,
  type ProfessionalDashboardState,
} from './operational-dashboard/ProfessionalDashboardMarkup';
import type { ChartPoint, DashboardClientRow, NormalizedPlan, StoredMessage } from './operational-dashboard/types';
import { useDashboardCopy } from './operational-dashboard/useDashboardCopy';

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
  const navigate = useNavigate();
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

  const today = clientHistory.filter(
    session => new Date(session.date).toDateString() === new Date().toDateString(),
  );
  const pending = clients.filter(client => !client.activePlan || client.activePlan === '-').length;
  const adherence = clients.length
    ? Math.round(clients.reduce((sum, client) => sum + Number(client.compliance || 0), 0) / clients.length)
    : 0;
  const feedback = read<StoredMessage[]>('shapeup_messages', []).filter(
    message => message.sender === 'client' && message.status !== 'read',
  );
  const appointments = clients.filter(
    client =>
      client.nextSessionAt &&
      new Date(client.nextSessionAt).toDateString() === new Date().toDateString(),
  );

  const shellState: ProfessionalDashboardState = {
    userName: user.name || 'Minha conta',
    query,
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    filter,
    onFilterChange: setFilter,
    clients,
    filtered,
    loadError,
    todayCount: today.length,
    pending,
    adherence,
    feedback,
    appointments,
    language,
    tr,
    onOpenClient: id => navigate(`/dashboard/clients/${id}`),
    onOpenMessages: () => navigate('/dashboard/messages'),
    onEnrollClient: () => navigate('/dashboard/clients'),
    onNewWorkout: () => navigate('/dashboard/training', { state: { create: true } }),
    onOpenClients: () => navigate('/dashboard/clients'),
  };

  return (
    <WorkspaceStitchPage name="professional" css={workspaceNavStyle}>
      <ProfessionalDashboardMarkup state={shellState} />
    </WorkspaceStitchPage>
  );
}

function AthleteView(scoreboardState: AthleteDashboardState) {
  const user = useUserProfile();
  const { language, tr } = useDashboardCopy();
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString('en-CA');
  const { water, addWater } = useHydration(date);
  const { getDiaryDay, getNutritionProfile } = useNutritionApi();
  const { getDashboardMe, getWorkoutsByUser, getWorkoutPlansByUser } = useTrainingApi();
  const { getMe } = useAuthorizationApi();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
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
            .sort((a, b) => new Date(a.startedAtUtc).getTime() - new Date(b.startedAtUtc).getTime())
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

  const [dashboard, setDashboard] = useState<AthleteDashboardState['dashboard']>(null);
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

  const [nutrition, setNutrition] = useState<AthleteDashboardState['nutrition']>({});
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
  const exercises = plan?.blocks?.flatMap(block => block.exercises || []) || plan?.exercises || [];
  const messages = read<StoredMessage[]>('shapeup_messages', []).filter(
    message =>
      String(message.clientId) === String(localStorage.getItem('shapeup_client_id') || 1) &&
      message.sender === 'coach',
  );

  const athleteState: AthleteDashboardState = {
    ...scoreboardState,
    userName: user.name || 'Minha conta',
    plan,
    exercises,
    chartData,
    trainingError,
    dashboard,
    nutrition,
    water,
    onAddWater: addWater,
    messages,
    language,
    tr,
    onNavigate: path => navigate(path),
  };

  return (
    <WorkspaceStitchPage name="athlete" css={workspaceNavStyle}>
      <AthleteDashboardMarkup state={athleteState} />
    </WorkspaceStitchPage>
  );
}

export function StitchAthlete() {
  return <LegacyDashboardClient renderView={state => <AthleteView {...state} />} />;
}
