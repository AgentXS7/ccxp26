import type React from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Star,
  Train,
} from 'lucide-react';
import { handleImgError } from '../../lib/utils';
import { CornerOrnaments, StarSparkleIcon } from '../ui/AnimeDecor';
import { OnigiriSticker, StickerForCategory } from '../ui/GameStickers';
import type {
  AttractionMeta,
  DayBadgeType,
  ItineraryDay,
  ItineraryStop,
  ShiftType,
  StopVoteEntry,
  TripConfig,
} from '../../types';

interface ItineraryTabProps {
  config: TripConfig;
  days: ItineraryDay[];
  currentDay: ItineraryDay;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  shiftFilter: 'Todos' | ShiftType;
  setShiftFilter: (shift: 'Todos' | ShiftType) => void;
  dayStops: ItineraryStop[];
  attractions: AttractionMeta[];
  stopVotes: StopVoteEntry[];
  voterName: string;
  avatarBadge: string;
  compactCards: boolean;
  onOpenVoterModal: () => void;
  onVoteClick: (e: React.MouseEvent, stopId: string, choice: 'yes' | 'no') => void;
  onSelectAttraction: (attr: AttractionMeta) => void;
}

function getDayBadgeStyle(badge: DayBadgeType) {
  switch (badge) {
    case 'Dia Livre':
      return 'bg-[#E5B869]/15 text-[#F6D794] border-[#E5B869]/35';
    case 'CCXP26':
      return 'hoyo-accent-pill border';
    case 'Chegada':
      return 'bg-[#9F7AEA]/18 text-[#D6BCFA] border-[#9F7AEA]/35';
    default:
      return 'bg-[#47C5B8]/15 text-[#8AE5DB] border-[#47C5B8]/35';
  }
}

export function ItineraryTab({
  config,
  days,
  currentDay,
  setSelectedDate,
  shiftFilter,
  setShiftFilter,
  dayStops,
  attractions,
  stopVotes,
  voterName,
  avatarBadge,
  compactCards,
  onOpenVoterModal,
  onVoteClick,
  onSelectAttraction,
}: ItineraryTabProps) {
  const normalizedMe = voterName.trim().toLowerCase();
  return (
    <div className="space-y-5">
      {/* Barra de Identificação para Votação nas Atrações */}
      <div className="rounded-2xl hoyo-card hoyo-shimmer-top px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#212847] border border-[#E5B869]/35 flex items-center justify-center text-base shrink-0">
            {voterName.trim() ? avatarBadge : '🗳️'}
          </span>
          {voterName.trim() ? (
            <p className="text-xs text-[#CBD2EC]">
              Votando nas atrações como{' '}
              <strong className="text-[#8AE5DB] font-extrabold">
                {avatarBadge} {voterName}
              </strong>
            </p>
          ) : (
            <p className="text-xs text-[#CBD2EC]">
              Clique em <strong className="text-[#8AE5DB]">👍 Sim</strong> ou{' '}
              <strong className="text-[#F7A3A3]">👎 Não</strong> em qualquer atração para votar com seu nome
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenVoterModal}
          className="text-xs font-bold text-[#CAD4FF] hover:text-white hoyo-accent-pill border px-3 py-1.5 rounded-xl transition"
        >
          {voterName.trim() ? 'Trocar nome' : 'Definir meu nome'}
        </button>
      </div>

      {/* Seletor Horizontal de Dias */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day, idx) => {
          const isSelected = day.date === currentDay.date;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-left transition min-w-[96px] ${
                isSelected
                  ? 'hoyo-accent-btn border-[#E5B869]/60 shadow-lg'
                  : 'hoyo-card text-[#CBD2EC] hover:border-[#E5B869]/35'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`block text-[11px] font-bold uppercase ${
                    isSelected ? 'text-white/90' : 'text-[#8F97B8]'
                  }`}
                >
                  {day.weekday}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    isSelected ? 'text-[#FFE29A]' : 'text-[#E5B869]/70'
                  }`}
                >
                  D{idx + 1}
                </span>
              </div>
              <span className="block text-sm font-extrabold mt-0.5">{day.shortLabel}</span>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isSelected
                    ? 'bg-black/25 text-white'
                    : day.badge === 'Dia Livre'
                    ? 'bg-[#E5B869]/15 text-[#F6D794]'
                    : day.badge === 'CCXP26'
                    ? 'bg-[#657EF8]/18 text-[#B8C5FF]'
                    : 'bg-[#1F2644] text-[#9BA3C2]'
                }`}
              >
                {day.badge === 'Roteiro em Grupo' ? 'Grupo' : day.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cabeçalho do Dia Selecionado */}
      <div className="relative overflow-hidden rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top p-5 space-y-3">
        <CornerOrnaments />
        <StickerForCategory
          category={currentDay.badge === 'CCXP26' ? 'CCXP26' : currentDay.badge === 'Dia Livre' ? 'Restaurante' : currentDay.badge === 'Chegada' ? 'Aeroporto' : 'Passeio'}
          className="pointer-events-none absolute -bottom-3 -right-3 w-20 h-20 opacity-20 rotate-12"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#222A4A] text-white px-2.5 py-1 rounded-lg border border-[#8596D6]/20">
              <StarSparkleIcon className="w-3 h-3 text-[#E5B869]" />
              {currentDay.shortLabel} ({currentDay.weekday})
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getDayBadgeStyle(
                currentDay.badge
              )}`}
            >
              {currentDay.badge}
            </span>
          </div>
          <span className="text-xs text-[#9BA3C2] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#E5B869]" />
            {currentDay.regionFocus}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentDay.title}</h2>
        <p className="text-xs sm:text-sm text-[#CBD2EC] leading-relaxed">{currentDay.summary}</p>

        {/* Alerta Inteligente do Dia (quando houver) */}
        {currentDay.smartAlert && (
          <div
            className={`rounded-2xl p-3.5 border flex items-start gap-3 ${
              currentDay.smartAlert.type === 'warning'
                ? 'bg-[#E5B869]/10 border-[#E5B869]/35 text-[#FCE6B4]'
                : currentDay.smartAlert.type === 'timeline'
                ? 'bg-[#657EF8]/12 border-[#657EF8]/35 text-[#D2DCFF]'
                : 'bg-[#1D2442]/80 border-[#8596D6]/25 text-[#CBD2EC]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#E5B869]" />
            <div className="text-xs space-y-1">
              <p className="font-bold">{currentDay.smartAlert.title}</p>
              <p className="opacity-90 leading-relaxed">
                {currentDay.date === '2026-12-03'
                  ? config.arrivalWindowNote
                  : currentDay.smartAlert.message}
              </p>
            </div>
          </div>
        )}

        {/* Filtro por Turno */}
        <div className="pt-2 flex flex-wrap gap-1.5">
          {(['Todos', 'Manhã e Almoço', 'Tarde', 'Noite e Madrugada'] as const).map((shift) => (
            <button
              key={shift}
              type="button"
              onClick={() => setShiftFilter(shift)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                shiftFilter === shift
                  ? 'bg-[#EEF1FA] text-[#0C0F1D]'
                  : 'hoyo-card-inner text-[#9BA3C2] hover:text-white'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      {/* Cards das Paradas do Dia */}
      <div className="space-y-3">
        {dayStops.length === 0 ? (
          <div className="rounded-2xl hoyo-card p-6 text-center text-sm text-[#9BA3C2] space-y-2">
            <OnigiriSticker className="w-12 h-12 mx-auto animate-sticker-float" />
            <p>Nenhuma atividade específica neste turno. Aproveite o tempo livre!</p>
          </div>
        ) : (
          dayStops.map((stop) => {
            const linkedAttr = stop.attractionId
              ? attractions.find((a) => a.id === stop.attractionId)
              : undefined;

            const votesForStop = stopVotes.filter((v) => v.stopId === stop.id);
            const yesVotes = votesForStop.filter((v) => v.choice === 'yes');
            const noVotes = votesForStop.filter((v) => v.choice === 'no');
            const totalVotes = votesForStop.length;
            const yesPct = totalVotes > 0 ? Math.round((yesVotes.length / totalVotes) * 100) : 0;
            const noPct = totalVotes > 0 ? Math.round((noVotes.length / totalVotes) * 100) : 0;
            const myVote = voterName.trim()
              ? votesForStop.find(
                  (v) => v.voterName.trim().toLowerCase() === voterName.trim().toLowerCase()
                )
              : undefined;

            return (
              <div key={stop.id} className="space-y-2">
                <div
                  onClick={() => linkedAttr && onSelectAttraction(linkedAttr)}
                  className={`rounded-2xl hoyo-card overflow-hidden transition ${
                    linkedAttr
                      ? 'cursor-pointer hover:border-[#E5B869]/50'
                      : ''
                  } ${stop.isMandatory ? 'border-[#E5B869]/30' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {linkedAttr && !compactCards && (
                      <div className="sm:w-44 h-36 sm:h-auto shrink-0 relative bg-[#0C0F1D]">
                        <img
                          src={linkedAttr.imageUrl}
                          alt={linkedAttr.name}
                          onError={handleImgError}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F1D]/75 via-transparent to-transparent sm:hidden" />
                      </div>
                    )}

                    <div className={`${compactCards ? 'p-3.5' : 'p-4 sm:p-5'} flex-1 min-w-0`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider hoyo-accent-pill border px-2.5 py-0.5 rounded-md">
                            {stop.shift}
                          </span>
                          <span className="text-xs font-bold text-[#CBD2EC] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#E5B869]" />
                            {stop.timeLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {stop.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tag.includes('Obrigatório') || tag.includes('Reserva')
                                  ? 'bg-[#E5B869]/15 text-[#F6D794] border border-[#E5B869]/35'
                                  : tag.includes('Grátis') || tag.includes('Mais barato')
                                  ? 'bg-[#47C5B8]/15 text-[#8AE5DB] border border-[#47C5B8]/35'
                                  : 'bg-[#212847] text-[#CBD2EC]'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {stop.title}
                          </h3>
                          {stop.subtitle && (
                            <p className="text-xs font-medium text-[#A3B4FF] mt-0.5">
                              {stop.subtitle}
                            </p>
                          )}
                        </div>

                        {linkedAttr && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#CBD2EC] bg-[#212847] px-2.5 py-1.5 rounded-xl border border-[#8596D6]/20">
                            Ficha <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#CBD2EC] mt-2.5 leading-relaxed">
                        {stop.details}
                      </p>

                      {stop.transitTip && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#8AE5DB] bg-[#47C5B8]/10 border border-[#47C5B8]/25 px-3 py-2 rounded-xl">
                          <Train className="w-4 h-4 shrink-0 text-[#47C5B8]" />
                          <span>{stop.transitTip}</span>
                        </div>
                      )}

                      {/* Enquete Estilo WhatsApp (👍 Sim / 👎 Não) */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3.5 rounded-2xl hoyo-card-inner p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#9BA3C2]">
                          <span className="font-semibold">Você topa essa parada?</span>
                          <span>
                            {totalVotes === 0
                              ? 'Nenhum voto ainda'
                              : `${totalVotes} ${totalVotes === 1 ? 'voto' : 'votos'}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => onVoteClick(e, stop.id, 'yes')}
                            className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition min-h-[42px] ${
                              myVote?.choice === 'yes'
                                ? 'border-[#47C5B8] bg-[#47C5B8]/18 text-[#BFF4ED]'
                                : 'border-[#8596D6]/20 bg-[#171C33]/90 text-[#E5E9F8] hover:border-[#47C5B8]/50'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-[#47C5B8]/18 transition-all duration-300"
                              style={{ width: `${yesPct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <span className="text-sm">👍</span> Sim
                              </span>
                              <span>{yesVotes.length}</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => onVoteClick(e, stop.id, 'no')}
                            className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition min-h-[42px] ${
                              myVote?.choice === 'no'
                                ? 'border-[#EC6B6B] bg-[#EC6B6B]/18 text-[#FFD0D0]'
                                : 'border-[#8596D6]/20 bg-[#171C33]/90 text-[#E5E9F8] hover:border-[#EC6B6B]/50'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-[#EC6B6B]/18 transition-all duration-300"
                              style={{ width: `${noPct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <span className="text-sm">👎</span> Não
                              </span>
                              <span>{noVotes.length}</span>
                            </div>
                          </button>
                        </div>

                        {totalVotes > 0 && (
                          <div className="pt-1 space-y-1 text-[11px]">
                            {yesVotes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[#47C5B8] font-bold">👍</span>
                                {yesVotes.map((v) => {
                                  const isMe =
                                    Boolean(normalizedMe) &&
                                    v.voterName.trim().toLowerCase() === normalizedMe;
                                  const badge = isMe ? avatarBadge : v.avatarBadge;
                                  return (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 bg-[#47C5B8]/15 text-[#BFF4ED] border border-[#47C5B8]/25 px-2 py-0.5 rounded-full font-medium"
                                    >
                                      {badge && <span aria-hidden="true">{badge}</span>}
                                      <span>{v.voterName}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {noVotes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[#EC6B6B] font-bold">👎</span>
                                {noVotes.map((v) => {
                                  const isMe =
                                    Boolean(normalizedMe) &&
                                    v.voterName.trim().toLowerCase() === normalizedMe;
                                  const badge = isMe ? avatarBadge : v.avatarBadge;
                                  return (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 bg-[#EC6B6B]/15 text-[#FFD0D0] border border-[#EC6B6B]/25 px-2 py-0.5 rounded-full font-medium"
                                    >
                                      {badge && <span aria-hidden="true">{badge}</span>}
                                      <span>{v.voterName}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {linkedAttr && (
                        <div className="mt-3 pt-3 border-t border-[#8596D6]/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9BA3C2]">
                          <span className="truncate max-w-md">{linkedAttr.address}</span>
                          <div className="flex items-center gap-3">
                            {linkedAttr.rating && (
                              <span className="inline-flex items-center gap-1 text-[#F6D794] font-semibold">
                                <Star className="w-3.5 h-3.5 fill-[#E5B869] text-[#E5B869]" />
                                {linkedAttr.rating.toFixed(1)}
                              </span>
                            )}
                            <span className="text-[#8CA0FF] font-semibold">
                              Ver horários & Maps →
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {stop.walkToNext && (
                  <div className="flex items-center gap-2 pl-4 text-xs text-[#8AE5DB]">
                    <Navigation className="w-3.5 h-3.5 text-[#47C5B8] shrink-0" />
                    <span>{stop.walkToNext}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
