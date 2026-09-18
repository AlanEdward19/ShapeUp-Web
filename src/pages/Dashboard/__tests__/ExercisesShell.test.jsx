import { render, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../shell-assets/styles/exercises.css?inline', () => ({ default: '' }));
vi.mock('../../../contexts/AuthContext', () => ({useAuth:()=>({currentUser:{uid:'test'},signOut:vi.fn()})}));
vi.mock('../../../contexts/UserProfileContext', () => ({useUserProfile:()=>({name:'Test',initials:'T',photo:''})}));
vi.mock('../../../hooks/useExercises', () => ({useExercises: vi.fn()}));
vi.mock('../../../hooks/api/useTrainingApi', () => ({ useTrainingApi: vi.fn() }));
import { useExercises } from '../../../hooks/useExercises';
import { useTrainingApi } from '../../../hooks/api/useTrainingApi';
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

let getExerciseEquivalents;

beforeEach(() => {
  getExerciseEquivalents = vi.fn().mockResolvedValue([]);
  useTrainingApi.mockReturnValue({ getExerciseEquivalents, getExerciseById: vi.fn() });
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

  it('loads equivalents from GET when inspecting an exercise', async () => {
    getExerciseEquivalents.mockResolvedValue([variant]);
    mockCatalog([baseExercise, variant]);
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    expect(getExerciseEquivalents).toHaveBeenCalledWith(7);
    await within(drawer).findByText('Variação em máquina');
    expect(drawer).toHaveTextContent('1 opções');
  });

  it('keeps empty substitutions when GET fails', async () => {
    getExerciseEquivalents.mockRejectedValue(new Error('network'));
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    await vi.waitFor(() => expect(getExerciseEquivalents).toHaveBeenCalled());
    expect(drawer).toHaveTextContent('Nenhuma substituição cadastrada para este exercício.');
  });

  it('does not apply a stale GET to a newer inspection', async () => {
    const second = { ...baseExercise, id: 9, name: 'Outro exercício' };
    mockCatalog([baseExercise, second]);
    let resolveFirst;
    getExerciseEquivalents.mockImplementation((id) => {
      if (id === 7) {
        return new Promise((resolve) => {
          resolveFirst = () => resolve([variant]);
        });
      }
      return Promise.resolve([]);
    });
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelectorAll('.exercise-item')[0]);
    fireEvent.click(root.querySelectorAll('.exercise-item')[1]);
    resolveFirst();
    await vi.waitFor(() => expect(getExerciseEquivalents).toHaveBeenCalledTimes(2));
    expect(drawer.querySelector('#drawerTitle')).toHaveTextContent('Outro exercício');
    expect(within(drawer).queryByText('Variação em máquina')).toBeNull();
  });

  it('navigates the drawer to an equivalent from GET records on click', async () => {
    getExerciseEquivalents.mockResolvedValue([variant]);
    mockCatalog([baseExercise]);
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    await within(drawer).findByText('Variação em máquina');
    fireEvent.click(within(drawer).getByText('Variação em máquina'));
    expect(drawer.querySelector('#drawerTitle')).toHaveTextContent('Variação em máquina');
    expect(getExerciseEquivalents).toHaveBeenLastCalledWith(8);
  });
});
