import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Palette,
  Train,
} from 'lucide-react';
import { HERO_IMAGES } from '../../data/config';
import { formatBRL, getSaoPauloTodayIso, handleImgError } from '../../lib/utils';
import type { AttractionMeta, ItineraryDay, TabKey, TripConfig } from '../../types';
import {
  AnimeDislikeIcon,
  AnimeHeartIcon,
  AnimeLikeIcon,
  ArcadeTicketEmblem,
  CornerOrnaments,
  QuestDivider,
  StarSparkleIcon,
  WaypointCrystalIcon,
} from '../ui/AnimeDecor';
import { HeroStickerCluster, RoadCarStrip, type HeroMascotId } from '../ui/FunLayer';
import {
  BobaSticker,
  CarSticker,
  CoinSticker,
  ControllerSticker,
  MetroSticker,
  OnigiriSticker,
  PixelGhostSticker,
  RamenSticker,
} from '../ui/GameStickers';
import { UserAvatar } from '../ui/UserAvatar';

interface HomeTabProps {
  config: TripConfig;
  days: ItineraryDay[];
  attractions: AttractionMeta[];
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
  avatarPhoto?: string;
  setActiveTab: (tab: TabKey) => void;
  onJumpToDay: (date: string) => void;
  onOpenThemeModal: () => void;
}

interface DayVisualTheme {
  attractionId?: string;
  fallbackImage: string;
  mascotId: HeroMascotId;
  questTag: string;
  shortTitle: string;
  shortDesc: string;
  Sticker: typeof ControllerSticker;
}

const DAY_VISUALS: Record<string, DayVisualTheme> = {
  '2026-12-03': {
    attractionId: 'aeroporto-gru',
    fallbackImage: HERO_IMAGES.skyline,
    mascotId: 'chegada',
    questTag: 'DIA 1 • CHEGADA',
    shortTitle: 'Chegada GRU',
    shortDesc: 'Pouso às 23h50 + apoio 24h na Paulista',
    Sticker: CarSticker,
  },
  '2026-12-04': {
    attractionId: 'airbnb-vila-mariana',
    fallbackImage: HERO_IMAGES.ibirapuera,
    mascotId: 'checkin',
    questTag: 'DIA 2 • CHECK-IN',
    shortTitle: 'Base Vila Mariana',
    shortDesc: 'Dia livre + Check-in Airbnb às 15h',
    Sticker: MetroSticker,
  },
  '2026-12-05': {
    attractionId: 'ccxp26',
    fallbackImage: HERO_IMAGES.paulista,
    mascotId: 'gamer',
    questTag: 'MAIN QUEST',
    shortTitle: 'CCXP26 — Dia 1',
    shortDesc: 'Abertura sábado + Pizzaria & Paulista',
    Sticker: ControllerSticker,
  },
  '2026-12-06': {
    attractionId: 'feira-liberdade',
    fallbackImage: HERO_IMAGES.ibirapuera,
    mascotId: 'lamen',
    questTag: 'LIBERDADE + CCXP',
    shortTitle: 'Feira + CCXP Dia 2',
    shortDesc: 'Liberdade, Ibira, CCXP26 e Santo Mar',
    Sticker: BobaSticker,
  },
  '2026-12-07': {
    attractionId: 'zoologico-sp',
    fallbackImage: HERO_IMAGES.ibirapuera,
    mascotId: 'bichos',
    questTag: 'EXPLORAÇÃO',
    shortTitle: 'Combo Bichos + IMAX',
    shortDesc: 'Zoológico, Botânico, Aquário & Cinépolis JK',
    Sticker: OnigiriSticker,
  },
  '2026-12-08': {
    attractionId: 'roda-rico',
    fallbackImage: HERO_IMAGES.paulista,
    mascotId: 'masp',
    questTag: 'EVENTO VIP',
    shortTitle: 'MASP + Roda Rico',
    shortDesc: 'MASP grátis, pôr do sol e Sala VIP JK',
    Sticker: CoinSticker,
  },
  '2026-12-09': {
    attractionId: 'cho-sun-gal-bi',
    fallbackImage: HERO_IMAGES.paulista,
    mascotId: 'bario',
    questTag: 'CO-OP NIGHT',
    shortTitle: 'Coreano + Bario',
    shortDesc: 'Liberdade, Bom Retiro, Cho Sun & Bario Bar',
    Sticker: RamenSticker,
  },
  '2026-12-10': {
    attractionId: 'farol-santander',
    fallbackImage: HERO_IMAGES.skyline,
    mascotId: 'retorno',
    questTag: 'RETORNO',
    shortTitle: 'Dia Livre & Volta',
    shortDesc: 'Compras finais, malas e retorno via GRU',
    Sticker: PixelGhostSticker,
  },
};

interface HeroSlide {
  key: string;
  date?: string;
  eyebrow: string;
  questTag: string;
  title: string;
  description: string;
  imageUrl: string;
  mascotId: HeroMascotId;
  pillLabel: string;
}

export function HomeTab({
  config,
  days,
  attractions,
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
  avatarPhoto,
  setActiveTab,
  onJumpToDay,
  onOpenThemeModal,
}: HomeTabProps) {
  // Slides do Hero: Visão Geral + cada dia do roteiro com foto, texto e mascote próprios
  const heroSlides = useMemo<HeroSlide[]>(() => {
    const byId = new Map(attractions.map((a) => [a.id, a]));
    const overview: HeroSlide = {
      key: 'overview',
      eyebrow: `${config.destination} • Diário Oficial do Grupo`,
      questTag: 'Co-op Quest',
      title: config.title,
      description:
        'CCXP26, Zoológico + Botânico + Aquário, Cinépolis JK (IMAX & Sala VIP), MASP, Roda Rico no pôr do sol, Liberdade, Bom Retiro, Bario Bar e Churrasco Coreano.',
      imageUrl: HERO_IMAGES.paulista,
      mascotId: 'maga',
      pillLabel: 'Geral',
    };

    const daySlides: HeroSlide[] = days.map((day, idx) => {
      const visual = DAY_VISUALS[day.date];
      const linkedAttr = visual?.attractionId ? byId.get(visual.attractionId) : undefined;
      return {
        key: day.date,
        date: day.date,
        eyebrow: `${day.shortLabel} (${day.weekday}) • ${day.regionFocus}`,
        questTag: visual?.questTag || `Dia ${idx + 1}`,
        title: day.title,
        description: day.summary,
        imageUrl: linkedAttr?.imageUrl || visual?.fallbackImage || HERO_IMAGES.paulista,
        mascotId: visual?.mascotId || (idx % 3 === 0 ? 'maga' : idx % 3 === 1 ? 'gamer' : 'lamen'),
        pillLabel: day.shortLabel,
      };
    });

    return [overview, ...daySlides];
  }, [attractions, config.destination, config.title, days]);

  // Data atual no fuso de São Paulo (atualiza automaticamente ao virar o dia)
  const [todayIso, setTodayIso] = useState<string>(() => getSaoPauloTodayIso());

  useEffect(() => {
    const syncDate = () => {
      const current = getSaoPauloTodayIso();
      setTodayIso((prev) => (prev === current ? prev : current));
    };
    const interval = window.setInterval(syncDate, 60_000);
    window.addEventListener('focus', syncDate);
    document.addEventListener('visibilitychange', syncDate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncDate);
      document.removeEventListener('visibilitychange', syncDate);
    };
  }, []);

  // Índice do slide correspondente ao dia real da viagem (03/12 .. 10/12), se já estivermos na viagem
  const todaySlideIndex = useMemo(
    () => heroSlides.findIndex((s) => s.date === todayIso),
    [heroSlides, todayIso]
  );
  const isDuringTrip = todaySlideIndex !== -1;

  const [slideIndex, setSlideIndex] = useState<number>(() => {
    const initialToday = getSaoPauloTodayIso();
    const idx = days.findIndex((d) => d.date === initialToday);
    return idx !== -1 ? idx + 1 : 0;
  });
  const [heroPaused, setHeroPaused] = useState(false);

  // Quando chega um novo dia real da viagem (03/12 -> 04/12 -> ...), trava automaticamente naquele dia
  useEffect(() => {
    if (isDuringTrip) {
      setSlideIndex(todaySlideIndex);
    }
  }, [isDuringTrip, todaySlideIndex]);

  const safeSlideIndex = slideIndex % heroSlides.length;
  const activeSlide = heroSlides[safeSlideIndex] || heroSlides[0];
  const isViewingTodaySlide = isDuringTrip && safeSlideIndex === todaySlideIndex;

  // Antes da viagem: rotaciona automaticamente junto com o carrinho; durante a viagem: fica fixo no dia real!
  useEffect(() => {
    if (isDuringTrip || heroPaused || heroSlides.length <= 1) return;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isDuringTrip, heroPaused, heroSlides.length]);

  const goPrevSlide = () =>
    setSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goNextSlide = () => setSlideIndex((prev) => (prev + 1) % heroSlides.length);

  // Swipe touch no banner
  const heroTouchStartX = useRef<number | null>(null);
  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchStartX.current = e.touches[0]?.clientX ?? null;
    setHeroPaused(true);
  };
  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    const startX = heroTouchStartX.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    heroTouchStartX.current = null;
    if (startX !== null && endX !== null) {
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goNextSlide();
        else goPrevSlide();
      }
    }
    setHeroPaused(false);
  };

  // Carrossel arrastável de Destaques do Roteiro Oficial (touch + mouse drag)
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });
  const [isDraggingCarousel, setIsDraggingCarousel] = useState(false);

  const handleCarouselMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasDragged: false,
    };
    setIsDraggingCarousel(true);
  };

  const handleCarouselMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown) return;
    const el = carouselRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 6) {
      dragState.current.hasDragged = true;
    }
    e.preventDefault();
    el.scrollLeft = dragState.current.scrollLeft - walk * 1.15;
  };

  const endCarouselDrag = () => {
    dragState.current.isDown = false;
    setIsDraggingCarousel(false);
  };

  const scrollCarouselBy = (delta: number) => {
    carouselRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero Banner dinâmico por dia — mantendo todos os elementos HoYoLAB + mascote do dia */}
      <section
        className="relative overflow-hidden rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <CornerOrnaments className="z-10" />
        <div
          className="relative h-72 sm:h-80 w-full select-none"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          {/* Imagem de fundo que muda conforme o dia do roteiro */}
          <img
            key={activeSlide.key}
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            onError={handleImgError}
            className="w-full h-full object-cover object-center opacity-55 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F1D] via-[#0C0F1D]/68 to-[#0C0F1D]/20" />
          <HeroStickerCluster mascotId={activeSlide.mascotId} />

          {/* Barra superior do banner (data + contagem regressiva) */}
          <div className="absolute z-[2] top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#0C0F1D]/80 backdrop-blur-md border border-[#8596D6]/30 text-[#CAD4FF] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-[#E5B869]" />
              {config.dateRange}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#121933]/88 backdrop-blur-md border border-[#E5B869]/45 text-[#F6D794] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <WaypointCrystalIcon className="w-4 h-4 animate-twinkle" />
              {isDuringTrip
                ? `Hoje: ${heroSlides[todaySlideIndex]?.pillLabel}`
                : daysUntilTrip > 0
                ? `Faltam ${daysUntilTrip} dias`
                : 'Chegou a hora!'}
            </span>
          </div>

          {/* Conteúdo textual que acompanha o slide / dia */}
          <div className="absolute z-[2] bottom-11 sm:bottom-11 left-5 right-5 pr-20 sm:pr-48 space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] uppercase tracking-widest text-[#E5B869] font-extrabold flex items-center gap-1.5 line-clamp-1">
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeSlide.eyebrow}</span>
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md hoyo-accent-pill border shrink-0">
                <StarSparkleIcon className="w-2.5 h-2.5 text-[#E5B869]" />
                {activeSlide.questTag}
              </span>
            </div>
            <h1
              key={`title-${activeSlide.key}`}
              className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-2 animate-fade-in"
            >
              {activeSlide.title}
            </h1>
            <p
              key={`desc-${activeSlide.key}`}
              className="text-xs sm:text-sm text-[#CBD2EC] max-w-2xl leading-relaxed line-clamp-2 animate-fade-in"
            >
              {activeSlide.description}
            </p>
          </div>

          {/* Controles discretos do banner (trocar dia + atalho "Ver dia") */}
          <div className="absolute z-[3] bottom-3 left-5 right-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {heroSlides.map((slide, idx) => {
                const isCurrent = idx === safeSlideIndex;
                return (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`Ver banner: ${slide.pillLabel}`}
                    title={slide.title}
                    className={`h-2 rounded-full transition-all shrink-0 ${
                      isCurrent
                        ? 'w-6 bg-[#E5B869] shadow-[0_0_8px_rgba(229,184,105,0.65)]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                );
              })}
              <span className="text-[10px] font-bold text-[#B4BCE0] ml-1 shrink-0">
                {activeSlide.pillLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isDuringTrip && !isViewingTodaySlide && (
                <button
                  type="button"
                  onClick={() => setSlideIndex(todaySlideIndex)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#47C5B8]/20 border border-[#47C5B8]/50 text-[#BFF4ED] hover:bg-[#47C5B8]/30 transition"
                >
                  Hoje
                </button>
              )}
              {activeSlide.date && (
                <button
                  type="button"
                  onClick={() => onJumpToDay(activeSlide.date!)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0C0F1D]/82 border border-[#E5B869]/40 text-[#F6D794] hover:border-[#E5B869] transition"
                >
                  Abrir dia →
                </button>
              )}
              <button
                type="button"
                onClick={goPrevSlide}
                aria-label="Dia anterior no banner"
                className="w-7 h-7 rounded-full bg-[#0C0F1D]/80 border border-[#8596D6]/30 text-[#EEF1FA] hover:border-[#E5B869]/60 flex items-center justify-center transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goNextSlide}
                aria-label="Próximo dia no banner"
                className="w-7 h-7 rounded-full bg-[#0C0F1D]/80 border border-[#8596D6]/30 text-[#EEF1FA] hover:border-[#E5B869]/60 flex items-center justify-center transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
            <div className="relative w-11 h-11 rounded-2xl bg-[#1F2747] border border-[#E5B869]/45 flex items-center justify-center shrink-0 shadow-inner">
              <UserAvatar
                photo={avatarPhoto}
                badge={avatarBadge}
                sizeClass="w-9 h-9"
                textClass="text-xl"
              />
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
            <span className="inline-flex items-center gap-2 text-3xl font-extrabold text-white">
              <span>{placeLikesCount}</span>
              <AnimeHeartIcon className="w-7 h-7 drop-shadow-[0_2px_10px_rgba(236,85,120,0.45)]" />
            </span>
            <span className="text-sm text-[#47C5B8] font-semibold">
              • {stopVotesCount} votos no roteiro
              {uniqueVotersCount > 0 ? ` (${uniqueVotersCount} pessoas)` : ''}
            </span>
          </div>
          <p className="text-xs text-[#9BA3C2] mt-2 leading-relaxed">
            Dê{' '}
            <strong className="inline-flex items-center gap-1 text-[#F7A3A3]">
              <AnimeHeartIcon className="w-3.5 h-3.5" />
              <span>like</span>
            </strong>{' '}
            nos lugares preferidos na aba Explorar, adicione novas ideias ou vote com{' '}
            <strong className="inline-flex items-center gap-1 text-[#7EE0D5]">
              <AnimeLikeIcon className="w-3.5 h-3.5" />
              <span>/</span>
              <AnimeDislikeIcon className="w-3.5 h-3.5" />
            </strong>{' '}
            no roteiro.
          </p>
        </div>
      </section>

      {/* Destaques da Viagem — Carrossel arrastável para o lado */}
      <section className="space-y-3">
        <QuestDivider
          label="Destaques do Roteiro Oficial"
          rightSlot={
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarouselBy(-260)}
                  aria-label="Rolar destaques para a esquerda"
                  className="w-7 h-7 rounded-lg bg-[#171C33] border border-[#8596D6]/25 text-[#CBD2EC] hover:text-white hover:border-[#E5B869]/50 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarouselBy(260)}
                  aria-label="Rolar destaques para a direita"
                  className="w-7 h-7 rounded-lg bg-[#171C33] border border-[#8596D6]/25 text-[#CBD2EC] hover:text-white hover:border-[#E5B869]/50 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('roteiro')}
                className="text-xs font-semibold text-[#8CA0FF] hover:text-white transition"
              >
                Ver cronograma completo →
              </button>
            </div>
          }
        />

        <div
          ref={carouselRef}
          onMouseDown={handleCarouselMouseDown}
          onMouseMove={handleCarouselMouseMove}
          onMouseUp={endCarouselDrag}
          onMouseLeave={endCarouselDrag}
          className={`flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory select-none ${
            isDraggingCarousel ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {days.map((day, idx) => {
            const visual = DAY_VISUALS[day.date];
            const Sticker = visual?.Sticker || ControllerSticker;
            const title = visual?.shortTitle || day.title;
            const desc = visual?.shortDesc || day.summary;
            const questTag = visual?.questTag || `DIA ${idx + 1}`;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  if (dragState.current.hasDragged) {
                    dragState.current.hasDragged = false;
                    return;
                  }
                  onJumpToDay(day.date);
                }}
                className="relative overflow-hidden shrink-0 snap-start w-[220px] sm:w-[235px] text-left p-4 rounded-2xl hoyo-card hoyo-shimmer-top hover:border-[#E5B869]/50 transition space-y-1.5 group"
              >
                <Sticker className="absolute -bottom-2 -right-2 w-12 h-12 opacity-80 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-[#E5B869] block">
                    {day.shortLabel} {day.weekday}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8CA0FF]/85 truncate">
                    {questTag}
                  </span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[#CAD4FF] transition truncate pr-2">
                  {title}
                </p>
                <p className="text-xs text-[#9BA3C2] leading-snug pr-8 line-clamp-2">
                  {desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
