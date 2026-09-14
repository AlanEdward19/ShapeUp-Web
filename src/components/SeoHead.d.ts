import type { ReactElement } from 'react';

declare function SeoHead(props: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): ReactElement;

export default SeoHead;
