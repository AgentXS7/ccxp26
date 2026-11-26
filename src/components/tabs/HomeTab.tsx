import {
  Calendar,
  ChevronRight,
  Compass,
  Download,
  Palette,
  Train,
} from 'lucide-react';
import { HERO_IMAGES } from '../../data/config';
import { formatBRL } from '../../lib/utils';
import type { TabKey, TripConfig } from '../../types';
import {
  ArcadeTicketEmblem,
  CornerOrnaments,
  QuestDivider,
  StarSparkleIcon,
  WaypointCrystalIcon,
} from '../ui/AnimeDecor';
import { HeroStickerCluster, RoadCarStrip } from '../ui/FunLayer';
import { CoinSticker, ControllerSticker, OnigiriSticker, RamenSticker } from '../ui/GameStickers';

const HIGHLIGHT_STICKERS = [ControllerSticker, OnigiriSticker, CoinSticker, RamenSticker];

interface HomeTabProps {
  config: TripConfig;
  daysUntilTrip: number;
  isStandaloneApp: boolean;
  appIconUrl: string;
  onInstallClick: () => void;
  grandTotal: number;
  totalPendingItems: number;
  peoplePerCar: number;
  placeLikesCount: number;
  stopVotesCount: number;
  uniqueVotersCount: number;
  voterName: string;
  avatarBadge: string;
  setActiveTab: (tab: TabKey) => void;
  onJumpToDay: (date: string) => void;
  onOpenThemeModal: () => void;
}

const HIGHLIGHTS = [
  {
    day: '05 e 06/12',
    questTag: 'MAIN QUEST',
    title: 'CCXP26',
    desc: 'Abertura sábado + Artists’ Valley domingo',
    date: '2026-12-05',
  },
  {
    day: '07/12 Seg',
    questTag: 'EXPLORAÇÃO',
    title: 'Combo Bichos',
    desc: 'Zoológico, Jardim Botânico & Aquário',
    date: '2026-12-07',
  },
  {
    day: '07 e 08/12',
    questTag: 'EVENTO VIP',
    title: 'Cinema JK',
    desc: 'Sessão IMAX with Laser + Sala VIP',
    date: '2026-12-07',
  },
  {
    day: '09/12 Qua',
    questTag: 'CO-OP NIGHT',
    title: 'Coreano + Bario',
    desc: 'Cho Sun Gal Bi & Bario Bar Santo Amaro',
    date: '2026-12-09',
  },
];

export function HomeTab({
  config,
  daysUntilTrip,
  isStandaloneApp,
  appIconUrl,
  onInstallClick,
  grandTotal,
  totalPendingItems,
  peoplePerCar,
  placeLikesCount,
  stopVotesCount,
  uniqueVotersCount,
  voterName,
  avatarBadge,
  setActiveTab,
  onJumpToDay,
  onOpenThemeModal,
}: HomeTabProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero Banner estilo Diário de Expedição HoYoLAB */}
      <section className="relative overflow-hidden rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top">
        <CornerOrnaments className="z-10" />
        <div className="relative h-64 sm:h-80 w-full">
          <img
            src={HERO_IMAGES.paulista}
            alt="Avenida Paulista, São Paulo"
            className="w-full h-full object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F1D] via-[#0C0F1D]/65 to-transparent" />
          <HeroStickerCluster />

          <div className="absolute z-[2] top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#0C0F1D]/80 backdrop-blur-md border border-[#8596D6]/30 text-[#CAD4FF] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-[#E5B869]" />
              {config.dateRange}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#121933]/88 backdrop-blur-md border border-[#E5B869]/45 text-[#F6D794] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <WaypointCrystalIcon className="w-4 h-4 animate-twinkle" />
              {daysUntilTrip > 0 ? `Faltam ${daysUntilTrip} dias` : 'Chegou a hora!'}
            </span>
          </div>

          <div className="absolute z-[2] bottom-5 left-5 right-5 pr-14 sm:pr-44 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] uppercase tracking-widest text-[#E5B869] font-extrabold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {config.destination} • Diário Oficial do Grupo
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md hoyo-accent-pill border">
                <StarSparkleIcon className="w-2.5 h-2.5 text-[#E5B869]" />
                Co-op Quest
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {config.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#CBD2EC] max-w-2xl leading-relaxed">
              CCXP26, Zoológico + Botânico + Aquário, Cinépolis JK (IMAX & Sala VIP),
              MASP, Roda Rico no pôr do sol, Liberdade, Bom Retiro, Bario Bar e Churrasco Coreano.
            </p>
          </div>
        </div>

        {/* Estradinha com o carrinho do grupo passando pelas paradas */}
        <RoadCarStrip label="Carrinho do grupo percorrendo as paradas da viagem" />

        {/* Faixa da Base + Galeria rápida */}
        <div className="p-4 sm:p-5 bg-[#14192D]/95 border-t border-[#8596D6]/15 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl hoyo-accent-pill border flex items-center justify-center shrink-0 mt-0.5">
              <Train className="w-5 h-5 text-[#E5B869]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5B869]">
                  Ponto Base da Viagem
                </span>
                <span className="text-[11px] bg-[#1F2644] text-[#D7DDF5] border border-[#8596D6]/20 px-2 py-0.5 rounded-md">
                  Check-in 04/12 às 15h
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">{config.baseAddress}</p>
              <p className="text-xs text-[#9BA3C2] mt-0.5">{config.baseTransit}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <img
              src={HERO_IMAGES.ibirapuera}
              alt="Parque Ibirapuera"
              className="h-16 w-full object-cover rounded-xl border border-[#8596D6]/20"
            />
            <img
              src={HERO_IMAGES.skyline}
              alt="Horizonte de São Paulo"
              className="h-16 w-full object-cover rounded-xl border border-[#8596D6]/20"
            />
          </div>
        </div>
      </section>

      {/* Personalização rápida no celular + Instalar App */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!isStandaloneApp && (
          <button
            type="button"
            onClick={onInstallClick}
            className="text-left rounded-2xl bg-gradient-to-r from-[#1A2242] via-[#151B33] to-[#1D264B] border border-[#E5B869]/35 hover:border-[#E5B869]/65 p-3.5 sm:p-4 flex items-center justify-between gap-3 transition shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              {appIconUrl ? (
                <img
                  src={appIconUrl}
                  alt="Ícone SP 2026"
                  className="w-11 h-11 rounded-2xl border border-[#E5B869]/35 shadow-md shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl hoyo-accent-btn flex items-center justify-center text-white font-black text-xs shrink-0">
                  SP26
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                  Instalar App na Tela Inicial
                </p>
                <p className="text-[11px] text-[#B4BCE0] truncate">
                  iPhone e Android em tela cheia, offline no metrô.
                </p>
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1.5 hoyo-accent-btn text-xs font-bold px-3 py-2 rounded-xl">
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenThemeModal}
          className={`relative text-left rounded-2xl hoyo-card hoyo-shimmer-top hover:border-[#E5B869]/55 p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
            isStandaloneApp ? 'sm:col-span-2' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-[#1F2747] border border-[#E5B869]/45 flex items-center justify-center text-xl shrink-0 shadow-inner">
              {avatarBadge}
              <StarSparkleIcon className="w-3 h-3 text-[#E5B869] absolute -top-1 -right-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {voterName.trim()
                    ? `Passaporte de ${voterName}`
                    : 'Personalizar no Celular'}
                </p>
                <span className="hidden sm:inline-flex text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E5B869]/15 text-[#F6D794] border border-[#E5B869]/30">
                  Player Card
                </span>
              </div>
              <p className="text-[11px] text-[#9BA3C2] truncate">
                Cor do tema, densidade compacta e seu ícone nos votos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ArcadeTicketEmblem className="hidden sm:block w-8 h-8 opacity-85" />
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E5B869] bg-[#E5B869]/10 border border-[#E5B869]/30 px-3 py-2 rounded-xl">
              <Palette className="w-3.5 h-3.5" />
              <span>Tema</span>
            </span>
          </div>
        </button>
      </section>

      {/* Cards de Resumo Rápido (Custo Estimado + Enquete & Favoritos) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('custos')}
          className="cursor-pointer group rounded-3xl hoyo-card hover:border-[#657EF8]/55 p-5 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9BA3C2]">
              Custo Estimado / Pessoa
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8CA0FF] group-hover:translate-x-0.5 transition">
              Ver rateio <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {formatBRL(grandTotal)}
            </span>
            <span className="text-xs text-[#9BA3C2]">
              (Uber ÷ {peoplePerCar}p)
            </span>
          </div>
          <p className="text-xs text-[#9BA3C2] mt-2 leading-relaxed">
            Soma os valores documentados nas planilhas + hospedagem preenchida.{' '}
            <span className="text-[#E5B869] font-medium">
              {totalPendingItems} itens ainda marcados como “A confirmar”.
            </span>
          </p>
        </div>

        <div
          onClick={() => setActiveTab('explorar')}
          className="cursor-pointer group rounded-3xl hoyo-card hover:border-[#EC6B6B]/55 p-5 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9BA3C2]">
              Favoritos & Enquete do Grupo
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F49797] group-hover:translate-x-0.5 transition">
              Explorar locais <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">
              {placeLikesCount} ❤️
            </span>
            <span className="text-sm text-[#47C5B8] font-semibold">
              • {stopVotesCount} votos no roteiro
              {uniqueVotersCount > 0 ? ` (${uniqueVotersCount} pessoas)` : ''}
            </span>
          </div>
          <p className="text-xs text-[#9BA3C2] mt-2 leading-relaxed">
            Dê <strong className="text-[#F7A3A3]">❤️ like</strong> nos lugares preferidos na aba Explorar, adicione novas ideias ou vote com{' '}
            <strong className="text-[#7EE0D5]">👍 / 👎</strong> no roteiro.
          </p>
        </div>
      </section>

      {/* Destaques da Viagem */}
      <section className="space-y-3">
        <QuestDivider
          label="Destaques do Roteiro Oficial"
          rightSlot={
            <button
              type="button"
              onClick={() => setActiveTab('roteiro')}
              className="text-xs font-semibold text-[#8CA0FF] hover:text-white transition"
            >
              Ver cronograma completo →
            </button>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HIGHLIGHTS.map((card, idx) => {
            const Sticker = HIGHLIGHT_STICKERS[idx % HIGHLIGHT_STICKERS.length];
            return (
            <button
              key={card.title}
              type="button"
              onClick={() => onJumpToDay(card.date)}
              className="relative overflow-hidden text-left p-4 rounded-2xl hoyo-card hoyo-shimmer-top hover:border-[#E5B869]/50 transition space-y-1.5 group"
            >
              <Sticker className="absolute -bottom-2 -right-2 w-12 h-12 opacity-80 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-300" />
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-[#E5B869] block">
                  {card.day}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8CA0FF]/85">
                  {card.questTag}
                </span>
              </div>
              <p className="text-sm font-bold text-white group-hover:text-[#CAD4FF] transition">
                {card.title}
              </p>
              <p className="text-xs text-[#9BA3C2] leading-snug pr-8">{card.desc}</p>
            </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
