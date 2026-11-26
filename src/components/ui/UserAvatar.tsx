import { User } from 'lucide-react';

interface UserAvatarProps {
  photo?: string;
  name?: string;
  badge?: string;
  sizeClass?: string;
  textClass?: string;
  className?: string;
}

const AVATAR_GRADIENTS = [
  'from-[#657EF8] to-[#3B4FB8]',
  'from-[#E5B869] to-[#B07E28]',
  'from-[#47C5B8] to-[#24857C]',
  'from-[#EC6B6B] to-[#AD3B4D]',
  'from-[#A77BFF] to-[#6B42C4]',
  'from-[#F082B2] to-[#B5487A]',
];

function getInitialGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/**
 * Exibe a foto de perfil do usuário (ou inicial estilizada caso não tenha foto ainda).
 */
export function UserAvatar({
  photo,
  name = '',
  sizeClass = 'w-5 h-5',
  textClass = 'text-[10px]',
  className = '',
}: UserAvatarProps) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-white/25 ${className}`}
      />
    );
  }

  const clean = name.trim();
  if (clean) {
    const initial = clean.charAt(0).toUpperCase();
    return (
      <span
        aria-hidden="true"
        className={`${sizeClass} rounded-full bg-gradient-to-br ${getInitialGradient(
          clean.toLowerCase()
        )} text-white font-extrabold inline-flex items-center justify-center shrink-0 border border-white/20 leading-none ${textClass} ${className}`}
      >
        {initial}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} rounded-full bg-[#212847] text-[#9BA3C2] inline-flex items-center justify-center shrink-0 border border-[#8596D6]/30 ${className}`}
    >
      <User className="w-[62%] h-[62%]" />
    </span>
  );
}
