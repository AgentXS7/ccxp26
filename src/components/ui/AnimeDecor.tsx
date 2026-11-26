import type React from 'react';

/**
 * Ornamentos sutis nos cantos de cards principais (estilo HoYoLAB / RPG Quest Frame)
 */
export function CornerOrnaments({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
    >
      {/* Canto superior esquerdo */}
      <svg
        viewBox="0 0 28 28"
        className="absolute top-2 left-2 w-5 h-5 text-[#E5B869]/45"
        fill="none"
      >
        <path d="M2 14V4a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      </svg>
      {/* Canto superior direito */}
      <svg
        viewBox="0 0 28 28"
        className="absolute top-2 right-2 w-5 h-5 text-[#E5B869]/45"
        fill="none"
      >
        <path d="M14 2h10a2 2 0 0 1 2 2v10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="23" cy="5" r="1.5" fill="currentColor" />
      </svg>
      {/* Canto inferior esquerdo */}
      <svg
        viewBox="0 0 28 28"
        className="absolute bottom-2 left-2 w-4 h-4 text-[#8596D6]/30"
        fill="none"
      >
        <path d="M2 14v10a2 2 0 0 0 2 2h10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {/* Canto inferior direito */}
      <svg
        viewBox="0 0 28 28"
        className="absolute bottom-2 right-2 w-4 h-4 text-[#8596D6]/30"
        fill="none"
      >
        <path d="M26 14v10a2 2 0 0 1-2 2H14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * Estrela de 4 pontas estilo Astral / Waypoint
 */
export function StarSparkleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5c.6 5.2 5.3 9.9 10.5 10.5-5.2.6-9.9 5.3-10.5 10.5-.6-5.2-5.3-9.9-10.5-10.5C6.7 11.4 11.4 6.7 12 1.5Z" />
    </svg>
  );
}

/**
 * Cristal de Waypoint / Teleporte estilizado (decorativo anime/RPG)
 */
export function WaypointCrystalIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 3L24 14L16 29L8 14L16 3Z"
        fill="url(#waypointGrad)"
        stroke="#E5B869"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M16 3V29" stroke="#FFF6D6" strokeOpacity="0.45" strokeWidth="1" />
      <path d="M8 14H24" stroke="#FFF6D6" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="16" cy="14" r="2.2" fill="#FFF6D6" />
      <defs>
        <linearGradient id="waypointGrad" x1="8" y1="3" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8CA0FF" />
          <stop offset="0.55" stopColor="#657EF8" />
          <stop offset="1" stopColor="#47C5B8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Divisor de seção estilo RPG / Diário de Aventuras (── ✦ LABEL ✦ ──)
 */
export function QuestDivider({
  label,
  rightSlot,
}: {
  label: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <StarSparkleIcon className="w-3.5 h-3.5 text-[#E5B869]" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#CBD2EC]">
          {label}
        </span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[#E5B869]/40 via-[#8596D6]/20 to-transparent" />
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

/**
 * Emblema decorativo Pixel / Arcade / Anime para o Hero & Passaporte
 */
export function ArcadeTicketEmblem({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect
        x="4"
        y="10"
        width="40"
        height="28"
        rx="8"
        fill="#151C38"
        stroke="#E5B869"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      {/* D-pad pixel */}
      <path d="M13 20h4v3h3v4h-3v3h-4v-3h-3v-4h3v-3Z" fill="#8CA0FF" />
      {/* Botões A / B */}
      <circle cx="33" cy="22" r="2.3" fill="#EC6B6B" />
      <circle cx="38" cy="26" r="2.3" fill="#47C5B8" />
      {/* Sparkle */}
      <path
        d="M25 14l.9 2.6L28.5 18l-2.6.9L25 21.5l-.9-2.6L21.5 18l2.6-.9L25 14Z"
        fill="#E5B869"
      />
    </svg>
  );
}

/**
 * Coração estilizado anime/HoYoLAB (substitui ❤️ nativo)
 */
export function AnimeHeartIcon({
  className = 'w-4 h-4',
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 20.6s-7.4-4.7-9.2-8.9C1.4 8.5 3.4 4.8 7 4.5c2-.2 3.8.9 5 2.5 1.2-1.6 3-2.7 5-2.5 3.6.3 5.6 4 4.2 7.2-1.8 4.2-9.2 8.9-9.2 8.9Z"
        fill={filled ? 'url(#animeHeartGrad)' : 'rgba(236,107,107,0.16)'}
        stroke={filled ? '#FFB5C5' : '#F49797'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {filled && (
        <path
          d="M7.2 7.8c-.9.4-1.6 1.3-1.7 2.3"
          stroke="#FFF2F5"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
      <defs>
        <linearGradient id="animeHeartGrad" x1="4" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A9C" />
          <stop offset="0.55" stopColor="#EC5578" />
          <stop offset="1" stopColor="#C93B62" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Like minimalista HoYoLAB (selo dourado arredondado com check)
 */
export function AnimeLikeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      aria-hidden="true"
    >
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="6.5"
        fill="url(#hoyoLikeBg)"
        stroke="#F6D794"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 12.6 10.6 15.6 16.7 8.8"
        stroke="#FFF9E6"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="hoyoLikeBg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E5B869" />
          <stop offset="1" stopColor="#B8822F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Dislike minimalista HoYoLAB (selo índigo/prata suave com X arredondado)
 */
export function AnimeDislikeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      aria-hidden="true"
    >
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="6.5"
        fill="url(#hoyoDislikeBg)"
        stroke="#A4B0DE"
        strokeWidth="1.5"
      />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#EEF1FA"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="hoyoDislikeBg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A5582" />
          <stop offset="1" stopColor="#2B3254" />
        </linearGradient>
      </defs>
    </svg>
  );
}
