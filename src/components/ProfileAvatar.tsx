import type { CSSProperties, ReactElement } from 'react';

export function profileInitial(name: string | undefined | null): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

type ProfileAvatarProps = {
  name?: string | null;
  photo?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export default function ProfileAvatar({
  name,
  photo,
  size = 32,
  className = '',
  style,
}: ProfileAvatarProps): ReactElement {
  const dimension = { width: size, height: size };
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={className}
        style={{ ...dimension, objectFit: 'cover', borderRadius: '50%', ...style }}
      />
    );
  }
  return (
    <span
      className={className}
      aria-hidden
      style={{
        ...dimension,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        background: 'var(--bg-surface-high)',
        color: 'var(--link-color)',
        fontWeight: 600,
        fontSize: Math.max(12, Math.round(size * 0.4)),
        ...style,
      }}
    >
      {profileInitial(name)}
    </span>
  );
}
