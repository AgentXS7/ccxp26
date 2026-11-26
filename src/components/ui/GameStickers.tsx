import { useId } from 'react';

/**
 * Adesivos SVG desenhados à mão (offline, leves) com tema gamer / anime / viagem.
 * Todos têm contorno branco "die-cut" para parecer sticker colado no app.
 */

type StickerProps = { className?: string; title?: string };

const OUTLINE = '#F5F2FF';

export function ControllerSticker({ className = 'w-12 h-12' }: StickerProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M18 18h28c8 0 13 6 14 15l1 9c.6 6-6 9-10 4l-5-6H18l-5 6c-4 5-10.6 2-10-4l1-9c1-9 6-15 14-15Z"
        fill={OUTLINE}
      />
      <path
        d="M19 21h26c6.5 0 10.5 5 11.3 12.5l.9 8.2c.3 3-3 4.4-5 2l-5.6-6.7H17.4l-5.6 6.7c-2 2.4-5.3 1-5-2l.9-8.2C8.5 26 12.5 21 19 21Z"
        fill="#657EF8"
      />
      <path d="M17 27h4v4h4v4h-4v4h-4v-4h-4v-4h4v-4Z" fill="#F5F2FF" />
      <circle cx="45" cy="29" r="2.6" fill="#EC6B6B" />
      <circle cx="50" cy="34" r="2.6" fill="#47C5B8" />
      <circle cx="40" cy="34" r="2.6" fill="#E5B869" />
      <circle cx="45" cy="39" r="2.6" fill="#B39CFF" />
      <rect x="28" y="27" width="8" height="2.4" rx="1.2" fill="#C9D3FF" />
    </svg>
  );
}

export function RamenSticker({ className = 'w-12 h-12' }: StickerProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Vapor */}
      <path
        d="M24 6c-3 4 3 6 0 10M32 4c-3 4 3 6 0 10M40 6c-3 4 3 6 0 10"
        stroke={OUTLINE}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Hashi */}
      <path d="M38 8l18 18" stroke={OUTLINE} strokeWidth="6" strokeLinecap="round" />
      <path d="M38 8l18 18" stroke="#C48A4A" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 6l14 22" stroke={OUTLINE} strokeWidth="6" strokeLinecap="round" />
      <path d="M44 6l14 22" stroke="#D9A160" strokeWidth="3" strokeLinecap="round" />
      {/* Tigela */}
      <path d="M5 28h54c0 16-11 28-27 28S5 44 5 28Z" fill={OUTLINE} />
      <path d="M8 30h48c-1 13-10.5 23-24 23S9 43 8 30Z" fill="#EC6B6B" />
      <path d="M12 38h40" stroke="#FFD0D0" strokeWidth="2" strokeDasharray="3 3" />
      {/* Caldo e coberturas */}
      <ellipse cx="32" cy="29" rx="25" ry="5" fill="#F6C977" />
      <path
        d="M14 29c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0 5 2 6 0"
        stroke="#FFF1C9"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="22" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="22" cy="28" r="2" fill="#F2A93B" />
      <rect x="36" y="25" width="9" height="6" rx="1.5" fill="#E9A07A" />
      <path d="M30 26l3 4" stroke="#3E8E5A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="28.5" r="2.2" fill="#F5F2FF" />
      <path d="M45 28.5a1.2 1.2 0 1 0 2 0" stroke="#EC6B6B" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

export function SpaceshipSticker({ className = 'w-12 h-10' }: StickerProps) {
  return (
    <svg viewBox="0 0 76 48" className={className} aria-hidden="true">
      {/* Chama suave do propulsor */}
      <path d="M4 24c5-5 11-5 14-3v6c-3 2-9 2-14-3Z" fill="#47C5B8" opacity="0.9" />
      <path d="M9 24c3-2.5 6-2.5 8-1.5v3c-2 1-5 1-8-1.5Z" fill="#FFF3C4" />
      {/* Contorno branco die-cut da nave */}
      <path
        d="M15 16l7-7h12l7 6h10c9 0 18 4.5 21 9-3 4.5-12 9-21 9H41l-7 6H22l-7-7c-2-2-2-14 0-16Z"
        fill={OUTLINE}
      />
      {/* Asas */}
      <path d="M23 11h10l6 6H21l2-6Z" fill="#47C5B8" />
      <path d="M23 37h10l6-6H21l2 6Z" fill="#47C5B8" />
      {/* Corpo principal */}
      <path
        d="M18 18h33c7.5 0 14.5 3 17.5 6-3 3-10 6-17.5 6H18c-1.5-2-1.5-10 0-12Z"
        fill="#657EF8"
      />
      {/* Faixa dourada */}
      <path d="M20 24h43" stroke="#E5B869" strokeWidth="2.2" strokeLinecap="round" />
      {/* Janela / cabine */}
      <ellipse cx="47" cy="24" rx="6.5" ry="4" fill="#BFD7FF" stroke="#14192D" strokeWidth="1.4" />
      <ellipse cx="48.5" cy="22.8" rx="2.5" ry="1.2" fill="#FFFFFF" />
      {/* Estrelinha na cauda */}
      <path
        d="M27 21l.8 2 2.2.3-1.6 1.4.4 2.1-1.8-1-1.8 1 .4-2.1-1.6-1.4 2.2-.3.8-2Z"
        fill="#FFF3C4"
      />
    </svg>
  );
}

export function CarSticker({ className = 'w-12 h-12' }: StickerProps) {
  return (
    <svg viewBox="0 0 72 48" className={className} aria-hidden="true">
      <path
        d="M10 22l6-10c1.5-2.5 4-4 7-4h22c3 0 5.5 1.5 7.3 3.8L60 22c5 .5 9 4 9 9v5c0 2.8-2.2 5-5 5H8c-2.8 0-5-2.2-5-5v-6c0-4.5 3-7.6 7-8Z"
        fill={OUTLINE}
      />
      <path
        d="M12 24l6.2-10.2c1-1.7 2.8-2.8 4.8-2.8h22c2 0 3.8.9 5 2.5L58 24c4 .3 8 3 8 7v4c0 1.4-1 2.5-2.4 2.5H8.4C7 37.5 6 36.4 6 35v-5c0-3.4 2.6-6 6-6Z"
        fill="#E5B869"
      />
      <path d="M20 23l4.5-8.5h9V23H20ZM37 14.5h8l5.5 8.5H37v-8.5Z" fill="#BFD7FF" />
      <path d="M22 21l3-5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6" y="28" width="5" height="3" rx="1.5" fill="#FFF6D6" />
      <rect x="61" y="28" width="5" height="3" rx="1.5" fill="#EC6B6B" />
      <rect x="30" y="4" width="12" height="5" rx="2" fill="#14192D" stroke={OUTLINE} strokeWidth="1.5" />
      <text x="36" y="8.2" textAnchor="middle" fontSize="4" fontWeight="800" fill="#E5B869">
        SP
      </text>
      <circle cx="20" cy="38" r="7" fill={OUTLINE} />
      <circle cx="20" cy="38" r="5" fill="#1C223B" />
      <circle cx="20" cy="38" r="2" fill="#9BA3C2" />
      <circle cx="52" cy="38" r="7" fill={OUTLINE} />
      <circle cx="52" cy="38" r="5" fill="#1C223B" />
      <circle cx="52" cy="38" r="2" fill="#9BA3C2" />
    </svg>
  );
}

export function PixelHeartSticker({ className = 'w-10 h-10' }: StickerProps) {
  const px = [
    '.XX...XX.',
    'XRRX.XRRX',
    'XRWRXRRRX',
    'XRRRRRRRX',
    '.XRRRRRX.',
    '..XRRRX..',
    '...XRX...',
    '....X....',
  ];
  const colors: Record<string, string> = { X: OUTLINE, R: '#EC6B6B', W: '#FFFFFF' };
  return (
    <svg viewBox="0 0 9 8" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {px.flatMap((row, y) =>
        row.split('').map((c, x) =>
          c === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} />
          )
        )
      )}
    </svg>
  );
}

export function PixelGhostSticker({ className = 'w-10 h-10' }: StickerProps) {
  const px = [
    '...XXXX...',
    '.XXPPPPXX.',
    'XPPPPPPPPX',
    'XPWWPPWWPX',
    'XPWBPPWBPX',
    'XPPPPPPPPX',
    'XPPPPPPPPX',
    'XPPXPPXPPX',
    'XPX.XX.XPX',
    '.X......X.',
  ];
  const colors: Record<string, string> = {
    X: OUTLINE,
    P: '#B39CFF',
    W: '#FFFFFF',
    B: '#1C223B',
  };
  return (
    <svg viewBox="0 0 10 10" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {px.flatMap((row, y) =>
        row.split('').map((c, x) =>
          c === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} />
          )
        )
      )}
    </svg>
  );
}

export function CoinSticker({ className = 'w-10 h-10' }: StickerProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill={OUTLINE} />
      <circle cx="20" cy="20" r="15" fill={`url(#${id})`} />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#B9812E" strokeWidth="1.5" />
      <path d="M20 12l2.2 5 5.3.4-4 3.5 1.2 5.2L20 23.4l-4.7 2.7 1.2-5.2-4-3.5 5.3-.4L20 12Z" fill="#FFF3C4" />
      <defs>
        <linearGradient id={id} x1="6" y1="6" x2="34" y2="34">
          <stop stopColor="#FFE29A" />
          <stop offset="1" stopColor="#E5A93B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OnigiriSticker({ className = 'w-11 h-11' }: StickerProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 3c4 0 7 3 9.5 7.5l10 18c3.5 6.5-.5 15-9 15h-21c-8.5 0-12.5-8.5-9-15l10-18C17 6 20 3 24 3Z" fill={OUTLINE} />
      <path d="M24 6c3 0 5.3 2.5 7.4 6.2l9.7 17.3c2.6 4.8-.3 11.5-6.6 11.5H13.5c-6.3 0-9.2-6.7-6.6-11.5l9.7-17.3C18.7 8.5 21 6 24 6Z" fill="#FFFFFF" />
      <rect x="13" y="29" width="22" height="12" rx="2" fill="#1F3A2E" />
      <circle cx="19" cy="22" r="1.5" fill="#1C223B" />
      <circle cx="29" cy="22" r="1.5" fill="#1C223B" />
      <path d="M22 25.5c1.2 1.2 2.8 1.2 4 0" stroke="#1C223B" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <ellipse cx="15.5" cy="25" rx="2" ry="1.2" fill="#FFB5C5" />
      <ellipse cx="32.5" cy="25" rx="2" ry="1.2" fill="#FFB5C5" />
    </svg>
  );
}

export function BobaSticker({ className = 'w-10 h-10' }: StickerProps) {
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden="true">
      <path d="M24 1l-3 14" stroke={OUTLINE} strokeWidth="6" strokeLinecap="round" />
      <path d="M24 2l-3 13" stroke="#EC6B6B" strokeWidth="3" strokeLinecap="round" />
      <path d="M4 14h32l-4 38c-.3 2.3-2.2 4-4.5 4h-15C10.2 56 8.3 54.3 8 52L4 14Z" fill={OUTLINE} />
      <path d="M7 17h26l-3.6 34c-.2 1.4-1.4 2.5-2.8 2.5H13.4c-1.4 0-2.6-1.1-2.8-2.5L7 17Z" fill="#E9C9A6" />
      <path d="M7.4 21h25.2" stroke="#B39CFF" strokeWidth="3" />
      {[
        [14, 46],
        [20, 48],
        [26, 46],
        [17, 42],
        [23, 42],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.3" fill="#3B2A22" />
      ))}
      <circle cx="16" cy="31" r="1.3" fill="#1C223B" />
      <circle cx="24" cy="31" r="1.3" fill="#1C223B" />
      <path d="M18.5 34c.9.8 2.1.8 3 0" stroke="#1C223B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MetroSticker({ className = 'w-12 h-12' }: StickerProps) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <rect x="8" y="4" width="40" height="42" rx="11" fill={OUTLINE} />
      <rect x="11" y="7" width="34" height="36" rx="9" fill="#2F5BD3" />
      <rect x="15" y="12" width="26" height="12" rx="3" fill="#BFD7FF" />
      <rect x="11" y="28" width="34" height="3" fill="#E5B869" />
      <circle cx="18" cy="36" r="2.6" fill="#FFF6D6" />
      <circle cx="38" cy="36" r="2.6" fill="#FFF6D6" />
      <path d="M16 46l-5 7M40 46l5 7" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 46l-5 7M40 46l5 7" stroke="#9BA3C2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleSticker({ className = 'w-8 h-8' }: StickerProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 1c.9 7 6.1 12.2 13.5 13.6-7.4 1.4-12.6 6.6-13.5 13.6-.9-7-6.1-12.2-13.5-13.6C9.9 13.2 15.1 8 16 1Z"
        fill={OUTLINE}
      />
      <path
        d="M16 5c.8 5.5 4.6 9.2 9.8 10.2-5.2 1-9 4.7-9.8 10.2-.8-5.5-4.6-9.2-9.8-10.2C11.4 14.2 15.2 10.5 16 5Z"
        fill="#E5B869"
      />
    </svg>
  );
}

export function DiceSticker({ className = 'w-10 h-10' }: StickerProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="3" y="3" width="34" height="34" rx="9" fill={OUTLINE} />
      <rect x="6" y="6" width="28" height="28" rx="7" fill="#47C5B8" />
      {[
        [13, 13],
        [27, 13],
        [20, 20],
        [13, 27],
        [27, 27],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

/** Mapeia um tipo de dia/categoria para um sticker divertido */
export function StickerForCategory({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  switch (category) {
    case 'Restaurante':
      return <RamenSticker className={className} />;
    case 'Doces e café':
      return <BobaSticker className={className} />;
    case 'Evento':
    case 'CCXP26':
      return <ControllerSticker className={className} />;
    case 'Bar e noite':
      return <PixelGhostSticker className={className} />;
    case 'Parque e lazer':
    case 'Passeio':
      return <OnigiriSticker className={className} />;
    case 'Cinema':
    case 'Museu e cultura':
      return <SparkleSticker className={className} />;
    case 'Shopping':
      return <CoinSticker className={className} />;
    case 'Aeroporto':
    case 'Hospedagem':
      return <CarSticker className={className} />;
    default:
      return <PixelHeartSticker className={className} />;
  }
}
