export type NavItem = { icon: string; label: string; href: string };
export type NavGroup = { id: string; label: string; items: NavItem[] };

type NavigationInput = { role: string | null; platformAdmin: boolean; language?: string };

const labels: Record<string, [en: string, es: string]> = {
  'Principal': ['Main', 'Principal'],
  'Início': ['Home', 'Inicio'],
  'Alunos': ['Clients', 'Alumnos'],
  'Treinos e periodização': ['Training & programming', 'Entrenamientos y periodización'],
  'Meus treinos': ['My workouts', 'Mis entrenamientos'],
  'Nutrição': ['Nutrition', 'Nutrición'],
  'Mensagens': ['Messages', 'Mensajes'],
  'Gestão': ['Management', 'Gestión'],
  'Relatórios': ['Reports', 'Informes'],
  'Análises': ['Analytics', 'Análisis'],
  'Planos de atendimento': ['Service plans', 'Planes de atención'],
  'Financeiro': ['Finances', 'Finanzas'],
  'Equipe': ['Staff', 'Equipo'],
  'Controle de acesso': ['Access control', 'Control de acceso'],
  'Explorar': ['Explore', 'Explorar'],
  'Biblioteca de exercícios': ['Exercise library', 'Biblioteca de ejercicios'],
  'Meus objetivos': ['My goals', 'Mis objetivos'],
  'Academias': ['Gyms', 'Gimnasios'],
  'Profissionais': ['Professionals', 'Profesionales'],
  'Prática nutricional': ['Nutrition practice', 'Práctica nutricional'],
  'Conta': ['Account', 'Cuenta'],
  'Vínculos': ['Connections', 'Vínculos'],
  'Convites': ['Invites', 'Invitaciones'],
  'Credencial': ['Credential', 'Credencial'],
  'Avisos': ['Notices', 'Avisos'],
  'Configurações': ['Settings', 'Configuración'],
  'Plataforma': ['Platform', 'Plataforma'],
  'Administração': ['Administration', 'Administración'],
  'Moderação de alimentos': ['Food moderation', 'Moderación de alimentos'],
  'Recursos da plataforma': ['Platform features', 'Funciones de la plataforma'],
  'Academia': ['Gym', 'Gimnasio'],
  'Personal trainer': ['Personal trainer', 'Entrenador personal'],
  'Atleta': ['Athlete', 'Atleta'],
};

function translate(text: string, language?: string): string {
  if (language === 'en') return labels[text]?.[0] ?? text;
  if (language === 'es') return labels[text]?.[1] ?? text;
  return text;
}

const item = (icon: string, label: string, href: string): NavItem => ({ icon, label, href });

/** Single source of truth for the workspace sidebar; every shell renders from it. */
export function buildNavigation({ role, platformAdmin, language }: NavigationInput): NavGroup[] {
  const gym = role === 'gym';
  const pro = role === 'professional' || gym;

  const groups: NavGroup[] = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        item('home', 'Início', '/dashboard'),
        ...(pro ? [item('group', 'Alunos', '/dashboard/clients')] : []),
        item('fitness_center', pro ? 'Treinos e periodização' : 'Meus treinos', '/dashboard/training'),
        item('nutrition', 'Nutrição', '/dashboard/nutrition/diary'),
        item('chat_bubble', 'Mensagens', '/dashboard/messages'),
      ],
    },
  ];

  if (pro) {
    groups.push({
      id: 'manage',
      label: 'Gestão',
      items: [
        item('assessment', 'Relatórios', '/dashboard/reports'),
        item('monitoring', 'Análises', '/dashboard/analytics'),
        item('sell', 'Planos de atendimento', '/dashboard/service-plans'),
        ...(gym
          ? [
              item('payments', 'Financeiro', '/dashboard/financial'),
              item('groups', 'Equipe', '/dashboard/staff'),
              item('sensor_door', 'Controle de acesso', '/dashboard/turnstile'),
            ]
          : []),
      ],
    });
  }

  groups.push({
    id: 'explore',
    label: 'Explorar',
    items: [
      item('exercise', 'Biblioteca de exercícios', '/dashboard/exercises'),
      ...(!pro
        ? [item('flag', 'Meus objetivos', '/dashboard/objectives'), item('location_on', 'Academias', '/dashboard/gyms')]
        : []),
      item('badge', 'Profissionais', '/dashboard/professionals'),
      item('restaurant', 'Prática nutricional', '/dashboard/nutrition/practice'),
    ],
  });

  groups.push({
    id: 'account',
    label: 'Conta',
    items: [
      item('link', 'Vínculos', '/dashboard/links'),
      item('mail', 'Convites', '/dashboard/training-invites'),
      item('id_card', 'Credencial', '/dashboard/credential'),
      item('notifications', 'Avisos', '/dashboard/notifications'),
      item('settings', 'Configurações', '/dashboard/settings'),
    ],
  });

  if (platformAdmin) {
    groups.push({
      id: 'admin',
      label: 'Plataforma',
      items: [
        item('admin_panel_settings', 'Administração', '/dashboard/admin'),
        item('verified_user', 'Moderação de alimentos', '/dashboard/admin/food-moderation'),
        item('tune', 'Recursos da plataforma', '/dashboard/admin/feature-flags'),
      ],
    });
  }

  return groups.map(group => ({
    ...group,
    label: translate(group.label, language),
    items: group.items.map(entry => ({ ...entry, label: translate(entry.label, language) })),
  }));
}

export function roleLabel(role: string | null, language?: string): string {
  if (role === 'gym') return translate('Academia', language);
  if (role === 'professional') return translate('Personal trainer', language);
  return translate('Atleta', language);
}
