import Logo from '../components/Logo/Logo';
export default function AuthBrand() {
  return <a href="/" className="st-auth-brand" aria-label="ShapeUp — Home"><Logo variant="lockup" width="172" height="40" style={{ '--logo-wordmark': 'currentColor' }} /></a>;
}
