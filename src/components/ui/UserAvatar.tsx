interface UserAvatarProps {
  photo?: string;
  badge: string;
  sizeClass?: string;
  textClass?: string;
  className?: string;
}

/**
 * Exibe a foto de perfil opcional (bem compacta, redonda) ou cai para o ícone emoji escolhido.
 */
export function UserAvatar({
  photo,
  badge,
  sizeClass = 'w-5 h-5',
  textClass = 'text-sm',
  className = '',
}: UserAvatarProps) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-white/20 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 leading-none ${textClass} ${className}`}
    >
      {badge}
    </span>
  );
}
