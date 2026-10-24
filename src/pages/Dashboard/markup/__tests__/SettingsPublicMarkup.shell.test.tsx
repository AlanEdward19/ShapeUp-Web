import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPublicMarkup, type SettingsShellState } from '../SettingsPublicMarkup';

vi.mock('../../../../components/ProfileControls', () => ({
  ProfilePhoto: () => <div data-testid="profile-photo">photo</div>,
  ProfileSwitcher: () => <div data-testid="profile-switcher">switcher</div>,
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

describe('SettingsPublicMarkup role awareness', () => {
  it('hides professional fields from athletes and shows them to professionals', () => {
    localStorage.setItem('shapeup_role', 'independent');
    const { unmount } = render(<SettingsPublicMarkup state={baseState} />);
    expect(screen.queryByText('Apresentação profissional')).not.toBeInTheDocument();
    expect(screen.queryByText(/CREF/)).not.toBeInTheDocument();
    unmount();
    localStorage.setItem('shapeup_role', 'professional');
    render(<SettingsPublicMarkup state={baseState} />);
    expect(screen.getByText('Apresentação profissional')).toBeInTheDocument();
  });
});
