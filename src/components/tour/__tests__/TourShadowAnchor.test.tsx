import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { TourAnchorProvider, useTourAnchor } from '../tourAnchorContext';
import TourShadowAnchor from '../TourShadowAnchor';

function SeedAnchors() {
  const { setAnchors } = useTourAnchor();
  useEffect(() => {
    setAnchors([
      { id: 'tour-anchor-0', selector: '[data-tour="client-header"]' },
      { id: 'tour-anchor-1', selector: '[data-tour="client-metrics"]' },
    ]);
  }, [setAnchors]);
  return <TourShadowAnchor />;
}

describe('TourShadowAnchor', () => {
  it('renders a separate overlay node per tour step', async () => {
    const header = document.createElement('div');
    header.setAttribute('data-tour', 'client-header');
    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => ({ top: 10, left: 10, width: 100, height: 40, bottom: 50, right: 110, x: 10, y: 10, toJSON: () => {} }),
    });
    const metrics = document.createElement('div');
    metrics.setAttribute('data-tour', 'client-metrics');
    Object.defineProperty(metrics, 'getBoundingClientRect', {
      value: () => ({ top: 80, left: 10, width: 200, height: 60, bottom: 140, right: 210, x: 10, y: 80, toJSON: () => {} }),
    });
    document.body.append(header, metrics);

    const { getAllByTestId } = render(
      <TourAnchorProvider>
        <SeedAnchors />
      </TourAnchorProvider>,
    );

    await waitFor(() => expect(getAllByTestId('tour-anchor')).toHaveLength(2));
    const nodes = getAllByTestId('tour-anchor');
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toHaveAttribute('id', 'tour-anchor-0');
    expect(nodes[1]).toHaveAttribute('id', 'tour-anchor-1');
    expect(nodes[0].style.top).toBe('10px');
    expect(nodes[1].style.top).toBe('80px');

    header.remove();
    metrics.remove();
  });
});
