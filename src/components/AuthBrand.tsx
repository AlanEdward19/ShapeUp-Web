import type { CSSProperties, ReactElement } from 'react';
import Logo from './Logo/Logo';

export default function AuthBrand(): ReactElement {
  const logoStyle = { '--logo-wordmark': 'currentColor' } as CSSProperties;

  return (
    <a href="/" className="st-auth-brand" aria-label="ShapeUp — Home">
      <Logo variant="lockup" width="172" height="40" style={logoStyle} />
    </a>
  );
}
