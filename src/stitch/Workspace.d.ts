import type { ReactNode } from 'react';

declare const Workspace: (props: {
  name: string;
  bind?: (
    node: Element,
    props: Record<string, unknown>,
    children?: ReactNode,
    render?: unknown,
  ) => unknown;
  onClick?: (event: unknown) => void;
  after?: ReactNode;
  css?: string;
}) => ReactNode;

export default Workspace;
