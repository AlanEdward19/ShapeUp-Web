import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfileAvatar, { profileInitial } from '../ProfileAvatar';

describe('ProfileAvatar', () => {
  it('shows first letter when there is no photo', () => {
    render(<ProfileAvatar name="Ana" photo="" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows question mark when name is empty', () => {
    expect(profileInitial('')).toBe('?');
    render(<ProfileAvatar name="" photo="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders image when photo url exists', () => {
    render(<ProfileAvatar name="Ana" photo="https://example.com/a.jpg" />);
    const img = document.querySelector('img');
    expect(img).toBeTruthy();
    expect(img).toHaveAttribute('src', 'https://example.com/a.jpg');
  });
});
