import type { ReactElement } from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'card' | 'list' | 'table';

type SkeletonProps = {
  variant?: SkeletonVariant;
  rows?: number;
  className?: string;
};

const lineCount = (rows?: number, fallback = 3) =>
  Math.max(1, rows ?? fallback);

export default function Skeleton({
  variant = 'text',
  rows,
  className = '',
}: SkeletonProps): ReactElement {
  const pulse = 'su-skeleton su-skeleton-pulse';
  const rootClass = [className].filter(Boolean).join(' ');

  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading"
        data-testid="skeleton"
        data-variant={variant}
        className={rootClass}
      >
        <div className={`${pulse} su-skeleton-card`} />
      </div>
    );
  }

  if (variant === 'list') {
    const count = lineCount(rows, 4);
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading"
        data-testid="skeleton"
        data-variant={variant}
        className={rootClass}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`${pulse} su-skeleton-list-item`} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    const count = lineCount(rows, 5);
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading"
        data-testid="skeleton"
        data-variant={variant}
        className={rootClass}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="su-skeleton-table-row">
            <div className={`${pulse} su-skeleton-table-cell`} />
            <div className={`${pulse} su-skeleton-table-cell`} />
            <div className={`${pulse} su-skeleton-table-cell`} />
          </div>
        ))}
      </div>
    );
  }

  const count = lineCount(rows, 3);
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      data-testid="skeleton"
      data-variant={variant}
      className={rootClass}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${pulse} su-skeleton-text-line`} />
      ))}
    </div>
  );
}
