import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPublicMarkup, type SettingsShellState } from '../SettingsPublicMarkup';

vi.mock('../../../../components/ProfileControls', () => ({
  ProfilePhoto: () => <div data-testid="profile-photo">photo</div>,
}));

const baseState: SettingsShellState = {
  values: { name: 'Ana', email: 'ana@example.com' },
  update: vi.fn(),
  notice: '',
  language: 'pt-BR',
  setLanguage: vi.fn(),
  unitSystem: 'metric',
  setUnitSystem: vi.fn(),
  langTitle: 'Idioma',
  langDesc: 'Desc',
  onSave: vi.fn(),
  onResetPassword: vi.fn(),
  onStubAction: vi.fn(),
};

describe('SettingsPublicMarkup shell layout', () => {
  it('uses data-shell-content and does not nest a second aside', () => {
    const { container } = render(<SettingsPublicMarkup state={baseState} />);
    expect(screen.getByText('Configurações da Conta')).toBeInTheDocument();
    const mainColumn = container.querySelector('[data-shell-content]');
    expect(mainColumn).toBeTruthy();
    expect(mainColumn).toHaveStyle({ marginLeft: '256px' });
    expect(container.querySelector('aside[data-unified-sidebar]')).toBeNull();
  });
});
