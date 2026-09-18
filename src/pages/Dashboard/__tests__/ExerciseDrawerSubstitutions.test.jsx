import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseDrawerSubstitutions } from '../markup/ExerciseDrawerSubstitutions';

const loaded = [
  { id: 1, name: 'Supino reto', muscles: ['Peitoral'], equipment: 'Barra' },
  { id: 2, name: 'Supino machine', muscles: ['Peitoral'], equipment: 'Máquina' },
];

describe('ExerciseDrawerSubstitutions', () => {
  it('renders name, equipment, similarity, chevron, and count for equivalents', () => {
    const { container, getByText } = render(
      <ExerciseDrawerSubstitutions
        exercises={loaded}
        equivalents={[
          { exerciseId: 2, matchLabel: '96% similaridade motora', note: 'Menos axial' },
        ]}
        onSelect={vi.fn()}
        onNotFound={vi.fn()}
      />,
    );
    expect(getByText('1 opções')).toBeTruthy();
    expect(container).toHaveTextContent('Supino machine');
    expect(container).toHaveTextContent('Máquina');
    expect(container).toHaveTextContent('96% similaridade motora');
    expect(
      [...container.querySelectorAll('.material-symbols-outlined')].map((el) => el.textContent),
    ).toContain('chevron_right');
  });

  it('renders the empty state when equivalents are absent or empty', () => {
    const copy = 'Nenhuma substituição cadastrada para este exercício.';
    const missing = render(
      <ExerciseDrawerSubstitutions exercises={loaded} onSelect={vi.fn()} onNotFound={vi.fn()} />,
    );
    expect(missing.container).toHaveTextContent(copy);
    expect(missing.container.querySelector('button')).toBeNull();
    missing.unmount();

    const empty = render(
      <ExerciseDrawerSubstitutions
        exercises={loaded}
        equivalents={[]}
        onSelect={vi.fn()}
        onNotFound={vi.fn()}
      />,
    );
    expect(empty.container).toHaveTextContent(copy);
  });

  it('calls onSelect when the equivalent exists in the loaded list', () => {
    const onSelect = vi.fn();
    const onNotFound = vi.fn();
    const { getByText } = render(
      <ExerciseDrawerSubstitutions
        exercises={loaded}
        equivalents={[{ exerciseId: 2 }]}
        onSelect={onSelect}
        onNotFound={onNotFound}
      />,
    );
    fireEvent.click(getByText('Supino machine'));
    expect(onSelect).toHaveBeenCalledWith(loaded[1]);
    expect(onNotFound).not.toHaveBeenCalled();
  });

  it('calls onNotFound when the equivalent id is missing from the loaded list', () => {
    const onSelect = vi.fn();
    const onNotFound = vi.fn();
    const { getByRole } = render(
      <ExerciseDrawerSubstitutions
        exercises={loaded}
        equivalents={[{ exerciseId: 99 }]}
        onSelect={onSelect}
        onNotFound={onNotFound}
      />,
    );
    fireEvent.click(getByRole('button'));
    expect(onNotFound).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
