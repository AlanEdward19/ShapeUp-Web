import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../test/withLang';
import { ThemeProvider } from '../../ThemeContext';
import Register from '../Register';
const register = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ register, signInWithGoogle: vi.fn() }) }));
function setup() { return render(withLang(<ThemeProvider><MemoryRouter><Register /></MemoryRouter></ThemeProvider>)); }
describe('Staged registration', () => {
  beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/register'); register.mockReset(); });
  it('keeps identity values when going back and blocks mismatching passwords before creating an account', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Alan Teste' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /continue setup/i }));
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ExampleTest123!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Different123!' } });
    fireEvent.click(screen.getByRole('button', { name: /continue setup/i }));
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back to previous step' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('Alan Teste');
    expect(screen.getByLabelText(/email/i)).toHaveValue('alan@example.com');
  });
});
