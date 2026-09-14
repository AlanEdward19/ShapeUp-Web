import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test' }, signOut: vi.fn() }),
}));
vi.mock('../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Test', initials: 'T', photo: '' }),
}));
vi.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key, language: 'pt-BR', setLanguage: vi.fn() }),
}));

import StitchMessages from '../MessagesShell';

describe('MessagesShell', () => {
  it('renders native stitch messages chrome without prototype coach copy', () => {
    localStorage.setItem('shapeup_role', 'client');
    localStorage.setItem('shapeup_coach_name', 'Coach Teste');
    localStorage.setItem('shapeup_client_id', '99');
    localStorage.setItem('shapeup_messages', JSON.stringify([]));

    const { container } = render(
      <MemoryRouter>
        <StitchMessages />
      </MemoryRouter>,
    );

    const host = container.querySelector('[data-stitch="messages"]');
    expect(host).toBeTruthy();
    const root = host.shadowRoot;
    const body = within(root.querySelector('.stitch-body'));
    expect(body.getByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
    expect(body.getByRole('heading', { name: 'Coach Teste', level: 2 })).toBeInTheDocument();
    expect(body.getByPlaceholderText('Enviar mensagem para Coach Teste...')).toBeInTheDocument();
    expect(root.querySelector('.stitch-body')).not.toHaveTextContent('Rodrigo Silva');
    expect(root.querySelector('.stitch-body')).not.toHaveTextContent('Online agora');
  });
});
