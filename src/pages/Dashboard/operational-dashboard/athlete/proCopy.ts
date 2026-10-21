const pt = {
  morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite',
  enroll: 'Matricular aluno', newWorkout: 'Novo treino',
  summary: (clients: number, pending: number) => `${clients} ${clients === 1 ? 'aluno ativo' : 'alunos ativos'} · ${pending} ${pending === 1 ? 'revisão pendente' : 'revisões pendentes'}`,
  adherence: 'Adesão da carteira', adherenceHint: 'Média da semana entre seus alunos',
  onTrack: 'Em dia', watch: 'Atenção', late: 'Atrasados', noData: 'Sem alunos ainda',
  today: 'Hoje', trained: 'Treinaram', review: 'Para revisar',
  agenda: 'Agenda de hoje', agendaEmpty: 'Nenhum atendimento agendado para hoje.',
  clients: 'Seus alunos', search: 'Buscar aluno',
  filters: { all: 'Todos', late: 'Atrasados', review: 'Revisão' },
  goalMissing: 'Objetivo não informado', noPlan: 'Sem ficha', open: 'Abrir ficha',
  showing: (n: number, total: number) => `Mostrando ${n} de ${total}`, seeAll: 'Ver todos',
  none: 'Nenhum aluno encontrado.',
  feedback: 'Feedbacks em aberto', feedbackEmpty: 'Nenhum feedback pendente.', reply: 'Responder',
} as const;
type Copy = { [K in keyof typeof pt]: (typeof pt)[K] };
const en: Copy = {
  morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
  enroll: 'Add client', newWorkout: 'New workout',
  summary: (c, p) => `${c} active ${c === 1 ? 'client' : 'clients'} · ${p} ${p === 1 ? 'review pending' : 'reviews pending'}`,
  adherence: 'Client adherence', adherenceHint: 'Weekly average across your clients',
  onTrack: 'On track', watch: 'Watch', late: 'Behind', noData: 'No clients yet',
  today: 'Today', trained: 'Trained', review: 'To review',
  agenda: "Today's schedule", agendaEmpty: 'No sessions scheduled for today.',
  clients: 'Your clients', search: 'Search clients',
  filters: { all: 'All', late: 'Behind', review: 'Review' },
  goalMissing: 'No goal set', noPlan: 'No plan', open: 'Open plan',
  showing: (n, total) => `Showing ${n} of ${total}`, seeAll: 'See all',
  none: 'No clients found.',
  feedback: 'Open feedback', feedbackEmpty: 'No pending feedback.', reply: 'Reply',
};
const es: Copy = {
  morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches',
  enroll: 'Añadir alumno', newWorkout: 'Nuevo entrenamiento',
  summary: (c, p) => `${c} ${c === 1 ? 'alumno activo' : 'alumnos activos'} · ${p} ${p === 1 ? 'revisión pendiente' : 'revisiones pendientes'}`,
  adherence: 'Adherencia de la cartera', adherenceHint: 'Promedio semanal de tus alumnos',
  onTrack: 'Al día', watch: 'Atención', late: 'Atrasados', noData: 'Aún no hay alumnos',
  today: 'Hoy', trained: 'Entrenaron', review: 'Por revisar',
  agenda: 'Agenda de hoy', agendaEmpty: 'No hay atenciones agendadas para hoy.',
  clients: 'Tus alumnos', search: 'Buscar alumno',
  filters: { all: 'Todos', late: 'Atrasados', review: 'Revisión' },
  goalMissing: 'Objetivo no informado', noPlan: 'Sin ficha', open: 'Abrir ficha',
  showing: (n, total) => `Mostrando ${n} de ${total}`, seeAll: 'Ver todos',
  none: 'No se encontraron alumnos.',
  feedback: 'Feedback abierto', feedbackEmpty: 'Sin feedback pendiente.', reply: 'Responder',
};
export function proCopy(language: string): Copy {
  if (language === 'en') return en;
  if (language === 'es') return es;
  return pt as unknown as Copy;
}
