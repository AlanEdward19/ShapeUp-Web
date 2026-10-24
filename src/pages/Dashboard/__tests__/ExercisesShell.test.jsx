import { render, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../shell-assets/styles/exercises.css?inline', () => ({ default: '' }));
vi.mock('../../../contexts/AuthContext', () => ({useAuth:()=>({currentUser:{uid:'test'},signOut:vi.fn()})}));
vi.mock('../../../contexts/UserProfileContext', () => ({useUserProfile:()=>({name:'Test',initials:'T',photo:''})}));
vi.mock('../../../hooks/useExercises', () => ({useExercises: vi.fn()}));
vi.mock('../../../hooks/api/useTrainingApi', () => ({ useTrainingApi: vi.fn() }));
vi.mock('../../../hooks/api/useAuthorizationApi', () => ({ useAuthorizationApi: () => ({ getMe: vi.fn().mockResolvedValue({ id: 5 }) }) }));
vi.mock('../../../utils/exerciseEquivalents', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    mapExerciseEquivalents: vi.fn((...args) => actual.mapExerciseEquivalents(...args)),
  };
});
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { useExercises } from '../../../hooks/useExercises';
import { useTrainingApi } from '../../../hooks/api/useTrainingApi';
import { mapExerciseEquivalents } from '../../../utils/exerciseEquivalents';
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
    <LanguageProvider>
      <MemoryRouter>
        <Exercises />
      </MemoryRouter>
    </LanguageProvider>,
  );
  const root = container.querySelector('[data-shell]').shadowRoot;
  return { container, root, drawer: root.getElementById('exerciseDrawer') };
}

let getExerciseEquivalents;
let getExerciseById;

beforeEach(() => {
  getExerciseEquivalents = vi.fn().mockResolvedValue([]);
  getExerciseById = vi.fn().mockResolvedValue(null);
  useTrainingApi.mockReturnValue({ getExerciseEquivalents, getExerciseById });
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
    expect(drawer.querySelector('#drawerSynergist')).toHaveTextContent('-');
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

  it('shows not-found notice and keeps drawer title when getExerciseById misses', async () => {
    vi.mocked(mapExerciseEquivalents).mockImplementationOnce(() => ({
      equivalents: [{ exerciseId: 99 }],
      records: [],
    }));
    getExerciseEquivalents.mockResolvedValue([{ id: 99 }]);
    getExerciseById.mockRejectedValue(new Error('404'));
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    await within(drawer).findByText('EX-99');
    fireEvent.click(within(drawer).getByText('EX-99'));
    await vi.waitFor(() => {
      expect(root.getElementById('toastMessage')).toHaveTextContent(
        'Exercício não encontrado na lista atual',
      );
    });
    expect(drawer.querySelector('#drawerTitle')).toHaveTextContent('Exercício real');
  });

  it('shows agonist and synergist when multiple muscle details are present', () => {
    mockCatalog([
      {
        ...baseExercise,
        muscleDetails: [
          { muscleGroup: 1, muscleNamePt: 'Peitoral', activationPercent: 80 },
          { muscleGroup: 2, muscleNamePt: 'Tríceps', activationPercent: 55 },
        ],
      },
    ]);
    const { root, drawer } = renderShell();
    fireEvent.click(root.querySelector('.exercise-item'));
    expect(drawer.querySelector('#drawerAgonist')).toHaveTextContent('Peitoral');
    expect(drawer.querySelector('#drawerSynergist')).toHaveTextContent('Tríceps');
    expect(drawer).toHaveTextContent('80%');
    expect(drawer).toHaveTextContent('55%');
    const bars = [...drawer.querySelectorAll('[data-activation-bar]')];
    expect(bars).toHaveLength(2);
    expect(bars[0].style.width).toBe('80%');
    expect(bars[1].style.width).toBe('55%');
  });

  it('lists every muscle label on the catalog row', () => {
    mockCatalog([{ ...baseExercise, muscles: ['Peitoral', 'Tríceps'], muscleDetails: [] }]);
    const { root } = renderShell();
    const row = root.querySelector('.exercise-item');
    expect(row).toHaveTextContent('Peitoral, Tríceps');
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

describe('ExercisesShell library cart', () => {
  const second = { ...variant, id: 9, name: 'Remada curvada' };
  const Probe = () => <output data-testid="training-page">{JSON.stringify(useLocation().state)}</output>;
  const seen = (getByTestId) => JSON.parse(getByTestId('training-page').textContent);

  const renderCart = () => {
    localStorage.setItem('shapeup_language', 'pt-BR');
    localStorage.setItem('shapeup_role', 'independent');
    mockCatalog([baseExercise, second]);
    useTrainingApi.mockReturnValue({
      getExerciseEquivalents,
      getExerciseById,
      getWorkoutPlansByUser: vi.fn().mockResolvedValue({ items: [{ planId: 31, id: 31, name: 'Upper A', createdByUserId: 5 }, { planId: 32, name: 'Do treinador', createdByUserId: 99 }], nextCursor: null }),
      getWorkoutTemplates: vi.fn().mockResolvedValue([]),
    });
    const { container, getByTestId } = render(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/dashboard/exercises']}>
          <Routes>
            <Route path="/dashboard/exercises" element={<Exercises />} />
            <Route path="/dashboard/training" element={<Probe />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );
    return { root: container.querySelector('[data-shell]').shadowRoot, getByTestId };
  };

  it('ticks exercises into a selection bar without opening the details', () => {
    const { root } = renderCart();
    const [first, other] = root.querySelectorAll('.ex-check');
    fireEvent.click(first);
    fireEvent.click(other);
    expect(first).toHaveAttribute('aria-checked', 'true');
    expect(root.querySelector('[data-testid="exercise-cart-bar"]')).toHaveTextContent('2');
    expect(root.getElementById('exerciseDrawer')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(first);
    expect(root.querySelector('[data-testid="exercise-cart-bar"]')).toHaveTextContent('1');
  });

  it('creates a new workout carrying every ticked exercise', () => {
    const { root, getByTestId } = renderCart();
    root.querySelectorAll('.ex-check').forEach((box) => fireEvent.click(box));
    fireEvent.click(root.querySelector('[data-testid="exercise-cart-use"]'));
    fireEvent.click(root.querySelector('[data-testid="cart-create"]'));
    const seenState = seen(getByTestId);
    expect(seenState.create).toBe(true);
    expect(seenState.exercises.map((exercise) => exercise.id).sort()).toEqual([7, 9]);
  });

  it('lets the user pick one of their own workouts to receive the exercises', async () => {
    const { root, getByTestId } = renderCart();
    fireEvent.click(root.querySelector('.ex-check'));
    fireEvent.click(root.querySelector('[data-testid="exercise-cart-use"]'));
    fireEvent.click(root.querySelector('[data-testid="cart-edit"]'));
    const upperA = await waitFor(() => {
      const node = root.querySelector('[data-testid="cart-plan-31"]');
      expect(node).toBeTruthy();
      return node;
    });
    expect(root.querySelector('[data-testid="cart-plan-32"]')).toBeNull();
    fireEvent.click(upperA);
    const seenState = seen(getByTestId);
    expect(seenState.addTo).toBe(31);
    expect(seenState.exercises).toHaveLength(1);
  });
});
