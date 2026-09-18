import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Skeleton from '../Skeleton';

const skeletonCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../Skeleton.css'),
  'utf8',
);

describe('Skeleton', () => {
  it('exposes status semantics and default text variant', () => {
    render(<Skeleton />);
    const root = screen.getByTestId('skeleton');
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-variant', 'text');
  });

  it('renders card variant', () => {
    render(<Skeleton variant="card" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-variant', 'card');
  });

  it('renders list variant with configurable rows', () => {
    const { container } = render(<Skeleton variant="list" rows={2} />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-variant', 'list');
    expect(container.querySelectorAll('.su-skeleton-list-item')).toHaveLength(2);
  });

  it('renders table variant', () => {
    render(<Skeleton variant="table" rows={3} />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-variant', 'table');
  });

  it('applies custom className for generic sizing', () => {
    render(<Skeleton variant="text" className="w-48" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('w-48');
  });

  it('disables pulse animation under prefers-reduced-motion', () => {
    expect(skeletonCss).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(skeletonCss).toMatch(/\.su-skeleton-pulse[\s\S]*animation:\s*none/);
  });
});
