import paths from '../../assets/logoPaths.json';
import { useTheme } from '../../ThemeContext';

export default function Logo({ className = '', variant = 'mark', monochrome = false, style, ...props }) {
  const context = useTheme();
  const dark = (context?.theme || document.documentElement.dataset.theme || 'dark') === 'dark';
  const paint = name => monochrome ? 'currentColor' : `var(--logo-${name})`;
  const mark = <><path fill={paint('accent')} fillRule="evenodd" d={paths.accent} /><path fill={paint('primary')} fillRule="evenodd" d={paths.symbol} /></>;
  const wordmark = <path fill={paint('wordmark')} fillRule="evenodd" d={paths.wordmark} />;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={variant === 'lockup' ? '0 0 1510 380' : variant === 'stacked' ? '80 80 1120 1110' : '110 80 1030 800'} preserveAspectRatio="xMidYMid meet" className={className} role="img" aria-label="ShapeUp" style={{ '--logo-primary': dark ? '#e06c43' : '#c84c2b', '--logo-accent': dark ? '#f3dfaa' : '#544237', '--logo-wordmark': dark ? '#f3eae5' : '#211a17', display: 'block', flexShrink: 0, ...style }} {...props}>
    {variant === 'lockup' ? <><g transform="translate(-50 -36) scale(.46)">{mark}</g><g transform="translate(490 -680) scale(.85)">{wordmark}</g></> : <>{mark}{variant === 'stacked' && wordmark}</>}
  </svg>;
}
