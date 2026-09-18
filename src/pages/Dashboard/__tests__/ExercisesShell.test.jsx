import { render, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../shell-assets/styles/exercises.css?inline', () => ({ default: '' }));
vi.mock('../../../contexts/AuthContext', () => ({useAuth:()=>({currentUser:{uid:'test'},signOut:vi.fn()})}));
vi.mock('../../../contexts/UserProfileContext', () => ({useUserProfile:()=>({name:'Test',initials:'T',photo:''})}));
vi.mock('../../../hooks/useExercises', () => ({useExercises: vi.fn()}));
import { useExercises } from '../../../hooks/useExercises';
import Exercises from '../ExercisesShell';

const baseExercise = {
  id: 7,
  name: 'Exercício real',
  muscles: ['Peitoral'],
  equipments: [],
  steps: ['Instrução da API'],
  muscleDetails: [{ muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 62 }],
};
const variant = {
  id: 8,
  name: 'Variação em máquina',
  muscles: ['Peitoral'],
  equipments: [{ equipmentNamePt: 'Máquina' }],
  steps: ['Passo da variação'],
};

function mockCatalog(exercises) {
  useExercises.mockReturnValue({
    exercises,
    loading: false,
    searchTerm: '',
    setSearchTerm: vi.fn(),
  });
}

function renderShell() {
  localStorage.setItem('shapeup_language', 'pt-BR');
  const { container } = render(
    <MemoryRouter>
      <Exercises />
    </MemoryRouter>,
  );
  const root = container.querySelector('[data-shell]').shadowRoot;
  return { container, root, drawer: root.getElementById('exerciseDrawer') };
}

beforeEach(() => {
  mockCatalog([baseExercise]);
});

describe('ExercisesShell', () => {
  it('opens details only on inspection, uses real data, and closes with Escape', () => {
    const { root, drawer } = renderShell();
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
    const row = root.querySelector('.exercise-item');
    fireEvent.click(row);
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveTextContent('Instrução da API');
    expect(drawer).toHaveTextContent('62%');
    expect(drawer).not.toHaveTextContent('95%');
    expect(root.querySelector('.shell-body')).not.toHaveTextContent('PÁGINA 1 DE 15');
    expect(row).not.toHaveTextContent('Glúteo Máximo, Adutores, Lombar');
    fireEvent.keyDown(within(drawer).getByTitle('Fechar Painel'), { key: 'Escape' });
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
    expect(root.activeElement).toBe(row);
  });

  it('sizes the overlay to 460px and includes backdrop CSS in the overlay stack', () => {
    const { root } = renderShell();
    const css = [...root.querySelectorAll('style')].map((node) => node.textContent).join('');
    expect(css).toContain('min(460px,100vw)');
    expect(css).not.toContain('min(440px,100vw)');
    expect(css).toContain('#drawerBackdrop');
  });

  it('shows empty video and substitutions copy when those fields are absent', () => {
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    expect(drawer).toHaveTextContent('Vídeo de execução não cadastrado');
    expect(drawer).toHaveTextContent('Nenhuma substituição cadastrada para este exercício.');
    expect(drawer).not.toHaveTextContent('Consulte a biblioteca para selecionar uma substituição.');
  });

  it('closes the drawer when the backdrop is clicked', () => {
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    expect(drawer).toHaveAttribute('data-open', 'true');
    fireEvent.click(root.getElementById('drawerBackdrop'));
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  it('navigates the drawer to an in-memory equivalent on click', () => {
    mockCatalog([
      { ...baseExercise, equivalents: [{ exerciseId: 8, matchLabel: '90% similaridade motora' }] },
      variant,
    ]);
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    fireEvent.click(within(drawer).getByText('Variação em máquina'));
    expect(drawer).toHaveTextContent('Variação em máquina');
    expect(drawer).toHaveTextContent('Passo da variação');
    expect(drawer.querySelector('#drawerTitle')).toHaveTextContent('Variação em máquina');
  });

  it('toasts when the equivalent id is missing and keeps the current exercise', () => {
    mockCatalog([{ ...baseExercise, equivalents: [{ exerciseId: 99 }] }]);
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    fireEvent.click(within(drawer).getByRole('button', { name: /EX-99/i }));
    expect(root.getElementById('toastMessage')).toHaveTextContent(
      'Exercício não encontrado na lista atual',
    );
    expect(drawer.querySelector('#drawerTitle')).toHaveTextContent('Exercício real');
  });
});
