import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BodyMapFront from '../BodyMapFront';
import BodyMapBack from '../BodyMapBack';

const ratio = element => {
  const [, , width, height] = element.getAttribute('viewBox').split(' ').map(Number);
  return width / height;
};

describe('body map views', () => {
  it('share one aspect ratio so front and back render at the same size', () => {
    const front = render(<BodyMapFront hits={{}} maxHits={0} labels={{}} />).container.querySelector('svg');
    const back = render(<BodyMapBack hits={{}} maxHits={0} labels={{}} />).container.querySelector('svg');
    expect(ratio(front)).toBeCloseTo(ratio(back), 5);
  });
});
