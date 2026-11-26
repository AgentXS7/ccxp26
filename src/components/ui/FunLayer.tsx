import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { TabKey } from '../../types';
import {
  BobaSticker,
  CarSticker,
  CoinSticker,
  ControllerSticker,
  DiceSticker,
  MetroSticker,
  OnigiriSticker,
  PixelGhostSticker,
  PixelHeartSticker,
  RamenSticker,
  SpaceshipSticker,
  SparkleSticker,
} from './GameStickers';

/* -------------------------------------------------------------------------- */
/*  Camada de adesivos flutuando no fundo (atrás do conteúdo)                 */
/* -------------------------------------------------------------------------- */

const FLOATING = [
  { C: ControllerSticker, cls: 'top-[14%] left-[3%] w-14 h-14 -rotate-12', delay: '0s', desktopOnly: false },
  { C: RamenSticker, cls: 'top-[38%] right-[2.5%] w-14 h-14 rotate-12', delay: '1.2s', desktopOnly: false },
  { C: PixelHeartSticker, cls: 'top-[62%] left-[4%] w-9 h-9 rotate-6', delay: '2.1s', desktopOnly: false },
  { C: CarSticker, cls: 'bottom-[12%] right-[5%] w-16 h-12 -rotate-6', delay: '0.6s', desktopOnly: true },
  { C: SparkleSticker, cls: 'top-[24%] right-[9%] w-7 h-7', delay: '1.8s', desktopOnly: true },
  { C: PixelGhostSticker, cls: 'top-[80%] left-[10%] w-10 h-10 -rotate-6', delay: '2.6s', desktopOnly: true },
  { C: OnigiriSticker, cls: 'top-[50%] left-[1.5%] w-11 h-11 rotate-12', delay: '3.1s', desktopOnly: true },
  { C: BobaSticker, cls: 'top-[70%] right-[2%] w-9 h-12 rotate-6', delay: '0.9s', desktopOnly: true },
  { C: CoinSticker, cls: 'top-[8%] right-[22%] w-8 h-8', delay: '2.4s', desktopOnly: true },
  { C: DiceSticker, cls: 'bottom-[6%] left-[22%] w-9 h-9 rotate-12', delay: '1.5s', desktopOnly: true },
  { C: MetroSticker, cls: 'top-[30%] left-[8%] w-11 h-11 -rotate-6', delay: '3.4s', desktopOnly: true },
];

export function FloatingStickerLayer() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {FLOATING.map(({ C, cls, delay, desktopOnly }, i) => (
        <div
          key={i}
          className={`absolute opacity-[0.16] md:opacity-[0.22] animate-sticker-float ${cls} ${
            desktopOnly ? 'hidden xl:block' : ''
          }`}
          style={{ animationDelay: delay }}
        >
          <C className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Estrada com carrinho andando (rodapé do hero)                             */
/* -------------------------------------------------------------------------- */

export function RoadCarStrip({ label }: { label?: string }) {
  return (
    <div className="relative h-9 overflow-hidden bg-[#10142A] border-t border-[#8596D6]/15">
      {/* Faixa da pista */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] road-dashes opacity-60" />
      {/* Paradas no caminho */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {['🏠', '🎮', '🦁', '🎬', '🍜', '✈️'].map((s) => (
          <span key={s} className="text-[13px] drop-shadow" aria-hidden="true">
            {s}
          </span>
        ))}
      </div>
      {/* Nave espacial astral deslizando bem devagar */}
      <div className="absolute top-1/2 -translate-y-1/2 animate-car-drive" aria-hidden="true">
        <SpaceshipSticker className="w-12 h-8 drop-shadow-lg" />
      </div>
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mascote no cantinho com balão de dicas                                    */
/* -------------------------------------------------------------------------- */

type MascotId = 'maga' | 'gamer' | 'lamen';

const MASCOTS: Record<
  MascotId,
  { name: string; role: string; img: string; Fallback: typeof ControllerSticker }
> = {
  maga: {
    name: 'Lumi',
    role: 'Maga guia da expedição',
    img: '/mascots/maga.png',
    Fallback: SparkleSticker,
  },
  gamer: {
    name: 'Kenji',
    role: 'Tesoureiro gamer do grupo',
    img: '/mascots/gamer.png',
    Fallback: ControllerSticker,
  },
  lamen: {
    name: 'Mochi',
    role: 'Caçadora oficial de comida',
    img: '/mascots/lamen.png',
    Fallback: RamenSticker,
  },
};

const TAB_MASCOT: Record<TabKey, MascotId> = {
  inicio: 'maga',
  roteiro: 'maga',
  explorar: 'lamen',
  custos: 'gamer',
  admin: 'gamer',
};

const TIPS: Record<TabKey, string[]> = {
  inicio: [
    'Bem-vindo à expedição SP 2026! Instala o app na tela inicial pra abrir até sem internet no metrô. ✨',
    'Toca no 🎨 lá em cima pra escolher sua cor e seu ícone de viajante!',
    'Mil anos estudando magia e ainda me perco na Paulista… ainda bem que tem o roteiro. 🗺️',
  ],
  roteiro: [
    'Vota 👍 ou 👎 em cada parada — o grupo decide junto!',
    'Na CCXP, chegar cedo = mais brindes. Confia na maga. 🎁',
    'Dica de expedição: Bilhete Único carregado poupa fila na catraca. 🚇',
  ],
  explorar: [
    'Dá ❤️ nos lugares que você quer muito ir! Eu já curti todos os de lámen. 🍜',
    'Viu um lugar legal? Toca em “Adicionar Lugar” e mostra pro grupo!',
    'Liberdade à noite = lámen + boba + fotos. Missão aceita? 🧋',
  ],
  custos: [
    'Rachar o Uber em 4 é o combo mais eficiente de XP por real gasto. 🚗',
    'Itens “A confirmar” ainda não entram na conta — fica de olho!',
    'Economizou no transporte? Gasta em gacha… digo, em brinde da CCXP. 🎮',
  ],
  admin: [
    'Área do organizador! O PIN protege as edições do roteiro. 🛡️',
    'Conectou o Supabase? O status “Nuvem” fica verde lá em cima. ☁️',
  ],
};

interface MascotCornerProps {
  activeTab: TabKey;
  voterName: string;
  onHide: () => void;
}

export function MascotCorner({ activeTab, voterName, onHide }: MascotCornerProps) {
  const mascotId = TAB_MASCOT[activeTab];
  const mascot = MASCOTS[mascotId];
  const tips = TIPS[activeTab];

  const [open, setOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  // Ao trocar de aba, mostra um balãozinho rápido com a nova dica
  useEffect(() => {
    setTipIndex(0);
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 5200);
    return () => clearTimeout(t);
  }, [activeTab]);

  const greeting = useMemo(
    () => (voterName.trim() ? `Ei, ${voterName.trim()}!` : 'Ei, viajante!'),
    [voterName]
  );

  const Fallback = mascot.Fallback;

  return (
    <div
      className="fixed right-3 sm:right-5 z-30 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] md:bottom-6 flex items-end gap-2 pointer-events-none"
    >
      {open && (
        <div
          role="status"
          className="pointer-events-auto relative max-w-[230px] sm:max-w-[260px] rounded-2xl rounded-br-md hoyo-card border-[#E5B869]/45 px-3.5 py-3 shadow-2xl animate-fade-in mb-6"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar balão"
            className="absolute top-1.5 right-1.5 text-[#9BA3C2] hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#E5B869] pr-4">
            {mascot.name} • {mascot.role}
          </p>
          <p className="text-xs text-[#EEF1FA] mt-1 leading-relaxed">
            <strong className="text-[#8AE5DB]">{greeting}</strong> {tips[tipIndex % tips.length]}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setTipIndex((i) => i + 1)}
              className="text-[11px] font-bold text-[#8CA0FF] hover:text-white"
            >
              Outra dica →
            </button>
            <button
              type="button"
              onClick={onHide}
              className="text-[10px] text-[#8F97B8] hover:text-[#FFB5B5]"
            >
              Esconder mascote
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (open) setTipIndex((i) => i + 1);
          setOpen(true);
        }}
        aria-label={`Falar com ${mascot.name}, mascote do app`}
        className="pointer-events-auto relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 animate-mascot-bob active:scale-95 transition"
      >
        {!imgFailed[mascotId] ? (
          <img
            key={mascotId}
            src={mascot.img}
            alt=""
            onError={() => setImgFailed((p) => ({ ...p, [mascotId]: true }))}
            className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)]"
            draggable={false}
          />
        ) : (
          <span className="w-full h-full rounded-full mascot-frame flex items-center justify-center">
            <span className="w-full h-full rounded-full bg-[#1C223B] flex items-center justify-center">
              <Fallback className="w-9 h-9" />
            </span>
          </span>
        )}
        {!open && (
          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#E5B869] text-[#0C0F1D] text-[11px] font-black flex items-center justify-center border-2 border-[#0C0F1D] animate-twinkle">
            !
          </span>
        )}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mini galeria de "party" — usada no hero                                   */
/* -------------------------------------------------------------------------- */

export type HeroMascotId =
  | 'maga'
  | 'chegada'
  | 'checkin'
  | 'gamer'
  | 'lamen'
  | 'bichos'
  | 'masp'
  | 'bario'
  | 'retorno';

const HERO_MASCOT_IMG: Record<HeroMascotId, string> = {
  maga: '/mascots/maga.png',
  chegada: '/mascots/chegada.png',
  checkin: '/mascots/checkin.png',
  gamer: '/mascots/gamer.png',
  lamen: '/mascots/lamen.png',
  bichos: '/mascots/bichos.png',
  masp: '/mascots/masp.png',
  bario: '/mascots/bario.png',
  retorno: '/mascots/retorno.png',
};

export function HeroStickerCluster({ mascotId = 'maga' }: { mascotId?: HeroMascotId }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      {/* Mascote do dia espiando no hero */}
      <img
        key={mascotId}
        src={HERO_MASCOT_IMG[mascotId]}
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute right-1 top-12 w-24 h-24 sm:top-auto sm:bottom-3 sm:right-4 sm:w-44 sm:h-44 object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.7)] rotate-3 animate-fade-in"
        draggable={false}
      />
      <div className="absolute top-14 right-24 sm:top-14 sm:right-48 rotate-12 animate-sticker-float">
        <ControllerSticker className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-xl" />
      </div>
      <div
        className="hidden sm:block absolute top-32 right-52 -rotate-12 animate-sticker-float"
        style={{ animationDelay: '1.1s' }}
      >
        <RamenSticker className="w-14 h-14 drop-shadow-xl" />
      </div>
      <div
        className="hidden sm:block absolute top-20 right-6 rotate-6 animate-sticker-float"
        style={{ animationDelay: '2s' }}
      >
        <PixelHeartSticker className="w-8 h-8 drop-shadow-xl" />
      </div>
      <div
        className="hidden md:block absolute top-16 right-[19rem] -rotate-6 animate-sticker-float"
        style={{ animationDelay: '0.5s' }}
      >
        <BobaSticker className="w-9 h-12 drop-shadow-xl" />
      </div>
    </div>
  );
}
