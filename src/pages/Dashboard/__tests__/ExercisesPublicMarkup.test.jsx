import { render } from '@testing-library/react';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test' }, signOut: vi.fn() }),
}));
vi.mock('../../../contexts/UserProfileContext', () => ({
  useUserProfile: () => ({ name: 'Test', initials: 'T', photo: '' }),
}));

import { ExercisesPublicMarkup } from '../markup/ExercisesPublicMarkup';

const active = {
  id: 7,
  name: 'Exercício real',
  muscles: ['Peitoral'],
  description: 'Texto solto',
  muscleDetails: [{ muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 62 }],
};

function state(extra = {}) {
  return {
    exercises: [active],
    filtered: [active],
    loading: false,
    error: false,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    group: 'all',
    setGroup: vi.fn(),
    equipment: 'all',
    setEquipment: vi.fn(),
    sort: 'name',
    setSort: vi.fn(),
    view: 'list',
    setView: vi.fn(),
    active,
    open: true,
    panelRef: createRef(),
    inspect: vi.fn(),
    close: vi.fn(),
    add: vi.fn(),
    notice: '',
    onCopyDetails: vi.fn(),
    onSuggestOpen: vi.fn(),
    navOpen: false,
    setNavOpen: vi.fn(),
    equipmentName: () => 'Não informado',
    ...extra,
  };
}

describe('ExercisesPublicMarkup', () => {
  it('mounts ExerciseDrawer with the stable drawer ids', () => {
    const { container } = render(
      <MemoryRouter>
        <ExercisesPublicMarkup state={state()} />
      </MemoryRouter>,
    );
    expect(container.querySelector('#exerciseDrawer')).toBeTruthy();
    expect(container.querySelector('#drawerCode')).toHaveTextContent('EX-7');
    expect(container.querySelector('#drawerTitle')).toHaveTextContent('Exercício real');
    expect(container.querySelector('#drawerBackdrop')).toBeTruthy();
  });

  it('does not inline the old video link, static subs copy, or muscle dump', () => {
    const { container } = render(
      <MemoryRouter>
        <ExercisesPublicMarkup state={state()} />
      </MemoryRouter>,
    );
    expect(container).not.toHaveTextContent('Vídeo do exercício');
    expect(container).not.toHaveTextContent('Consulte a biblioteca para selecionar uma substituição.');
    expect(container.querySelector('#drawerSubs')).toHaveTextContent(
      'Nenhuma substituição cadastrada para este exercício.',
    );
    expect(container.textContent).not.toMatch(/Peitoral: 62%/);
  });
});
