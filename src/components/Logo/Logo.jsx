import iconUrl from '../../assets/app-icon.png';

/**
 * @param {{ className?: string, style?: import('react').CSSProperties, width?: number | string, height?: number | string, variant?: string, monochrome?: boolean }} props
 */
export default function Logo({ className = '', style, width, height, variant: _variant = 'mark', monochrome: _monochrome = false, ...props }) {
  const size = height ?? width;
  return (
    <img
      src={iconUrl}
      alt="ShapeUp"
      className={className}
      width={size}
      height={size}
      style={{
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
        ...(size ? { width: size, height: size } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
