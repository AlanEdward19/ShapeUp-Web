import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

type WorkspaceNavigationProps = {
  flow: boolean;
  open: boolean;
  close: () => void;
};

export default function WorkspaceNavigation({ flow, open, close }: WorkspaceNavigationProps) {
  const { pathname } = useLocation();
  const auth = useAuth() as { signOut: () => Promise<void> } | null;
  const signOut = auth?.signOut ?? (async () => {});
  const navigate = useNavigate();
  const role = localStorage.getItem('shapeup_role');
  const pro = role === 'professional' || role === 'gym';
  const profile = useUserProfile();
  const name = profile.name || 'Minha conta';

  useEffect(() => {
    const showMessages = () => navigate('/dashboard/messages');
    const escape = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') close();
    };
    window.addEventListener('open_client_chat', showMessages);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('open_client_chat', showMessages);
      window.removeEventListener('keydown', escape);
    };
  }, [navigate, open, close]);

  const items = [
    ['dashboard', pro ? 'Painel do Treinador' : 'Meu Painel', '/dashboard'],
    ...(pro ? [['group', 'Meus Alunos', '/dashboard/clients']] : []),
    ['event_repeat', pro ? 'Criador & Periodização' : 'Meus Treinos', '/dashboard/training'],
    ['fitness_center', 'Biblioteca de Exercícios', '/dashboard/exercises'],
    ['nutrition', 'Painel Nutricional', '/dashboard/nutrition/diary'],
    ['chat_bubble', 'Mensagens & Consultoria', '/dashboard/messages'],
    ...(pro
      ? [['assessment', 'Relatórios', '/dashboard/reports'], ['monitoring', 'Análises', '/dashboard/analytics']]
      : [['target', 'Meus Objetivos', '/dashboard/objectives']]),
    ...(!pro ? [['location_on', 'Buscar Academias', '/dashboard/gyms']] : []),
    ...(role === 'gym' ? [['payments', 'Gestão Financeira', '/dashboard/financial']] : []),
    ...(role === 'gym'
      ? [['groups', 'Equipe', '/dashboard/staff'], ['sensor_door', 'Controle de Acesso', '/dashboard/turnstile']]
      : []),
    ['settings', 'Configurações', '/dashboard/settings'],
    ...(localStorage.getItem('shapeup_platform_admin') === 'true'
      ? [
          ['verified_user', 'Moderação de Alimentos', '/dashboard/admin/food-moderation'],
          ['tune', 'Recursos da Plataforma', '/dashboard/admin/feature-flags'],
        ]
      : []),
  ] as [string, string, string][];

  return (
    <>
      {flow && <div className="sn-space" style={{ width: 256, flexShrink: 0 }} />}
      <aside data-unified-sidebar data-open={open}>
        <div className="sn-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/dashboard" aria-label="ShapeUp — Dashboard" onClick={close} style={{ padding: 0, border: 0 }}>
              <Logo variant="lockup" width="142" height="34" style={{}} />
            </a>
          </div>
          <small>{role === 'gym' ? 'Academia' : pro ? 'Personal' : 'Atleta'}</small>
        </div>
        <nav>
          <p>Gestão Atlética</p>
          {items.map(([icon, label, href], index) => (
            <div key={href}>
              {index === 5 && <p style={{ marginTop: 24 }}>Atendimento & Sistema</p>}
              <a href={href} aria-current={pathname === href ? 'page' : undefined} onClick={close}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                <span>{label}</span>
              </a>
            </div>
          ))}
        </nav>
        <div className="sn-profile">
          <span style={{ background: '#29211d', borderRadius: 6, padding: 6, color: '#e06c43' }}>
            {profile.photo ? (
              <img src={profile.photo} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
            ) : (
              profile.initials
            )}
          </span>
          <div style={{ flex: 1 }}>
            <strong>{name}</strong>
            <small>{role === 'gym' ? 'Dono de academia' : pro ? 'Personal Trainer' : 'Atleta ShapeUp'}</small>
          </div>
          <button
            type="button"
            title="Encerrar sessão"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
