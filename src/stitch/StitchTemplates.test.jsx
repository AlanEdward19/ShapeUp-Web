import { render, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StitchTemplate from './StitchTemplate';
import { sourceDocument } from './sourceRuntime';
import manifest from './manifest.json';
import StitchRegistration from './Registration';
import { withLang } from '../test/withLang';

const register = vi.fn().mockResolvedValue({ user: { uid: 'new-account' } });
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ register, signInWithGoogle: vi.fn() }) }));

describe('Original Stitch markup', () => {
  for (const name of Object.keys(manifest)) {
    it(`preserves the element hierarchy and classes of ${name}`, () => {
      const { container } = render(<MemoryRouter><StitchTemplate name={name} /></MemoryRouter>);
      const actual = container.querySelector('[data-stitch]').shadowRoot.querySelector('.stitch-body');
      const signature = root => [...root.querySelectorAll('*')].filter(node => !['script', 'style', 'link', 'meta'].includes(node.localName)).map(node => [node.localName, node.getAttribute('class') || '']);
      expect(signature(actual)).toEqual(signature(sourceDocument(name).body));
      expect(actual.querySelector('script')).toBeNull();
      expect(actual.querySelector('[onclick],[onsubmit]')).toBeNull();
    });
  }
});

it('keeps identity fields through the exported registration stages and submits existing authentication', async () => {
  localStorage.setItem('shapeup_language', 'pt-BR');
  const { container } = render(withLang(<MemoryRouter><StitchRegistration /></MemoryRouter>));
  const root = container.querySelector('[data-stitch]').shadowRoot;
  const query = within(root.querySelector('.stitch-body'));
  fireEvent.change(root.getElementById('fullName'), { target: { value: 'Alan Teste' } });
  fireEvent.change(root.getElementById('email'), { target: { value: 'alan@example.com' } });
  fireEvent.click(query.getByRole('button', { name: /Continuar configuração/i }));
  fireEvent.change(root.getElementById('password'), { target: { value: 'StrongPassword123!' } });
  fireEvent.change(root.getElementById('confirmPassword'), { target: { value: 'DifferentPassword123!' } });
  fireEvent.click(query.getByRole('button', { name: /Continuar configuração/i }));
  expect(query.getByRole('alert')).toHaveTextContent('As senhas não coincidem');
  expect(register).not.toHaveBeenCalled();
  fireEvent.change(root.getElementById('confirmPassword'), { target: { value: 'StrongPassword123!' } });
  fireEvent.click(query.getByRole('button', { name: /Continuar configuração/i }));
  fireEvent.change(root.getElementById('birthDate'), { target: { value: '1995-01-01' } });
  fireEvent.click(query.getByRole('button', { name: /Concluir cadastro/i }));
  await waitFor(() => expect(register).toHaveBeenCalledWith('alan@example.com', 'StrongPassword123!'));
  expect(localStorage.getItem('shapeup_registration_new-account')).not.toContain('StrongPassword');
});
