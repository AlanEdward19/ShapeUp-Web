import iconUrl from '../../assets/app-icon.png';

export default function Logo({ className = '', style, width, height, variant: _variant, monochrome: _monochrome, ...props }) {
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
