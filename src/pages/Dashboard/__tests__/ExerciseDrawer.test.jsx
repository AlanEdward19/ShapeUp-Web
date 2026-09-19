import { render, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withLang } from '../../../test/withLang';
import { ExerciseDrawer } from '../markup/ExerciseDrawer';

beforeEach(() => {
  localStorage.setItem('shapeup_language', 'pt-BR');
});

function mockState(active, extra = {}) {
  return {
    exercises: extra.exercises || (active ? [active] : []),
    filtered: [],
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
    equipmentName: (ex) => ex.equipment || 'Não informado',
    ...extra,
  };
}

describe('ExerciseDrawer', () => {
  it('renders a dimming backdrop that closes the drawer on click', () => {
    const state = mockState({ id: 1, name: 'Supino', muscles: ['Peitoral'] });
    const { getByTestId } = render(withLang(<ExerciseDrawer state={state} />));
    const backdrop = getByTestId('drawer-backdrop');
    expect(backdrop.className).toMatch(/bg-black\/60/);
    expect(backdrop.className).toMatch(/backdrop-blur-xs/);
    fireEvent.click(backdrop);
    expect(state.close).toHaveBeenCalledTimes(1);
  });

  it('draws activation bars from muscleDetails percents and never hardcodes 95% or 75%', () => {
    const state = mockState({
      id: 1,
      name: 'Supino',
      muscles: ['Peitoral', 'Tríceps'],
      muscleDetails: [{ muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 62 }],
    });
    const { container } = render(withLang(<ExerciseDrawer state={state} />));
    expect(container).toHaveTextContent('62%');
    expect(container).not.toHaveTextContent('95%');
    expect(container).not.toHaveTextContent('75%');
    const bars = container.querySelectorAll('[data-activation-bar]');
    expect(bars).toHaveLength(2);
    expect(bars[0].style.width).toBe('62%');
    expect(Number.parseFloat(bars[1].style.width)).toBeGreaterThan(0);
  });

  it('fills a bar for every listed muscle even when only the agonist has activationPercent', () => {
    const state = mockState({
      id: 1,
      name: 'Supino',
      muscles: ['Peitoral', 'Tríceps', 'Deltóide anterior'],
      muscleDetails: [
        { muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 80 },
        { muscleGroup: 2, muscleNamePt: 'Tríceps', activationPercent: 0 },
      ],
    });
    const { container } = render(withLang(<ExerciseDrawer state={state} />));
    expect(container.querySelector('#drawerAgonist')).toHaveTextContent('Peitoral');
    expect(container.querySelector('#drawerSynergist')).toHaveTextContent('Tríceps');
    expect(container).toHaveTextContent('Deltóide anterior');
    const bars = [...container.querySelectorAll('[data-activation-bar]')];
    expect(bars).toHaveLength(3);
    bars.forEach((bar) => expect(Number.parseFloat(bar.style.width)).toBeGreaterThan(0));
    expect(bars[0].style.backgroundColor).toBe('rgb(224, 108, 67)');
    expect(bars[1].style.backgroundColor).toBe('rgb(133, 118, 111)');
    expect(bars[2].style.backgroundColor).toBe('rgb(133, 118, 111)');
  });

  it('renders description fallback as a styled 01. step, not a bare paragraph', () => {
    const state = mockState({
      id: 1,
      name: 'Supino',
      muscles: ['Peitoral'],
      descriptionPt: 'Desça controlado até o peito.',
    });
    const { container, getByText } = render(withLang(<ExerciseDrawer state={state} />));
    expect(getByText('01.')).toBeTruthy();
    expect(getByText('01.').className).toMatch(/terracotta/);
    expect(container.querySelector('#drawerStep1')).toHaveTextContent('Desça controlado até o peito.');
    expect(container.querySelector('#drawerStep1')?.tagName).not.toBe('P');
  });

  it('uses a 460px panel and terracotta drawer code', () => {
    const state = mockState({ id: 7, name: 'Supino', muscles: ['Peitoral'] });
    const { container } = render(withLang(<ExerciseDrawer state={state} />));
    const panel = container.querySelector('#exerciseDrawer');
    expect(panel.className).toMatch(/w-\[460px\]/);
    expect(panel.className).toMatch(/max-w-full/);
    const code = container.querySelector('#drawerCode');
    expect(code).toHaveTextContent('EX-7');
    expect(code.className).toMatch(/text-brand-terracotta/);
  });

  it('renders series stats with hairline border-y and no muted boxed frame', () => {
    const state = mockState({ id: 1, name: 'Supino', muscles: ['Peitoral'] });
    const { container } = render(withLang(<ExerciseDrawer state={state} />));
    const stats = container.querySelector('#drawerSets').closest('[data-drawer-stats]');
    expect(stats.className).toMatch(/border-y/);
    expect(stats.className).not.toMatch(/bg-surface-muted/);
    expect(stats.className).not.toMatch(/rounded/);
  });

  it('drops duplicate muscle/description dumps and keeps the student-sheet button copy', () => {
    const state = mockState({
      id: 1,
      name: 'Supino',
      muscles: ['Peitoral', 'Tríceps'],
      description: 'Texto solto duplicado',
      muscleDetails: [{ muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 62 }],
    });
    const { container, getByText, queryByRole } = render(withLang(<ExerciseDrawer state={state} />));
    expect(queryByRole('heading', { name: 'Músculos' })).toBeNull();
    expect(container.textContent).not.toMatch(/Peitoral: 62%/);
    expect(getByText('Adicionar à Ficha do Aluno')).toBeTruthy();
  });
});
