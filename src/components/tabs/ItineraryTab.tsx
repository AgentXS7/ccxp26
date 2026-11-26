import type React from 'react';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  Navigation,
  Plus,
  RotateCcw,
  Star,
  Train,
  Trash2,
  Users,
} from 'lucide-react';
import { GROUP_MEMBERS } from '../../data/members';
import { findTimeConflicts } from '../../lib/scheduleUtils';
import { handleImgError } from '../../lib/utils';
import type {
  AttractionMeta,
  DayBadgeType,
  GroupMemberId,
  ItineraryDay,
  ItineraryStop,
  SharedStopInvite,
  ShiftType,
  StopVoteEntry,
  TripConfig,
} from '../../types';
import {
  AnimeDislikeIcon,
  AnimeLikeIcon,
  CornerOrnaments,
  StarSparkleIcon,
} from '../ui/AnimeDecor';
import { useConfirm } from '../ui/ConfirmProvider';
import { OnigiriSticker, StickerForCategory } from '../ui/GameStickers';
import { UserAvatar } from '../ui/UserAvatar';

interface ItineraryTabProps {
  config: TripConfig;
  days: ItineraryDay[];
  currentDay: ItineraryDay;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  shiftFilter: 'Todos' | ShiftType;
  setShiftFilter: (shift: 'Todos' | ShiftType) => void;
  dayStops: ItineraryStop[];
  allDayStops: ItineraryStop[];
  attractions: AttractionMeta[];
  stopVotes: StopVoteEntry[];
  voterName: string;
  avatarPhoto?: string;
  userProfiles: Record<string, string>;
  compactCards: boolean;
  canEdit: boolean;
  hiddenOfficialStops: ItineraryStop[];
  stopInvites: SharedStopInvite[];
  pendingInvitesCount: number;
  activeMemberId: GroupMemberId | null;
  onOpenVoterModal: () => void;
  onVoteClick: (e: React.MouseEvent, stopId: string, choice: 'yes' | 'no') => void;
  onSelectAttraction: (attr: AttractionMeta) => void;
  onOpenAddPersonalStop: () => void;
  onOpenInvites: () => void;
  onCancelOrLeaveSharedStop: (inviteId: string) => void;
  onHideOfficialStop: (stopId: string) => void;
  onRemovePersonalStop: (stopId: string) => void;
  onRestoreSingleOfficialStop: (stopId: string) => void;
  onRestoreOfficialStops: () => void;
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
  allDayStops,
  attractions,
  stopVotes,
  voterName,
  avatarPhoto,
  userProfiles,
  compactCards,
  canEdit,
  hiddenOfficialStops,
  stopInvites,
  pendingInvitesCount,
  activeMemberId,
  onOpenVoterModal,
  onVoteClick,
  onSelectAttraction,
  onOpenAddPersonalStop,
  onOpenInvites,
  onCancelOrLeaveSharedStop,
  onHideOfficialStop,
  onRemovePersonalStop,
  onRestoreSingleOfficialStop,
  onRestoreOfficialStops,
}: ItineraryTabProps) {
  const confirm = useConfirm();
  const [showHiddenDrawer, setShowHiddenDrawer] = useState(false);

  useEffect(() => {
    setShowHiddenDrawer(false);
  }, [currentDay.date]);

  useEffect(() => {
    if (hiddenOfficialStops.length === 0) {
      setShowHiddenDrawer(false);
    }
  }, [hiddenOfficialStops.length]);

  const normalizedMe = voterName.trim().toLowerCase();
  const getPhoto = (name: string) => {
    const k = name.trim().toLowerCase();
    return k === normalizedMe && avatarPhoto ? avatarPhoto : userProfiles[k];
  };

  return (
    <div className="space-y-5">
      {/* Barra de Identificação para Votação nas Atrações */}
      <div className="rounded-2xl hoyo-card hoyo-shimmer-top px-3.5 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {voterName.trim() ? (
            <UserAvatar
              photo={avatarPhoto}
              name={voterName}
              sizeClass="w-8 h-8"
              textClass="text-xs"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-[#212847] border border-[#E5B869]/35 flex items-center justify-center text-base shrink-0">
              🗳️
            </span>
          )}
          {voterName.trim() ? (
            <p className="text-xs text-[#CBD2EC] truncate">
              Votando como{' '}
              <strong className="text-[#8AE5DB] font-extrabold">{voterName}</strong>
            </p>
          ) : (
            <p className="text-xs text-[#CBD2EC]">
              Clique em{' '}
              <strong className="inline-flex items-center gap-1 text-[#8AE5DB]">
                <AnimeLikeIcon className="w-3.5 h-3.5" /> Sim
              </strong>{' '}
              ou{' '}
              <strong className="inline-flex items-center gap-1 text-[#F7A3A3]">
                <AnimeDislikeIcon className="w-3.5 h-3.5" /> Não
              </strong>{' '}
              para votar com seu nome
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenVoterModal}
          className="text-xs font-bold text-[#CAD4FF] hover:text-white hoyo-accent-pill border px-3 py-1.5 rounded-xl transition shrink-0"
        >
          {voterName.trim() ? 'Editar perfil' : 'Definir perfil'}
        </button>
      </div>

      {/* Aviso de Convites Pendentes */}
      {pendingInvitesCount > 0 && (
        <div className="rounded-2xl bg-[#47C5B8]/14 border border-[#47C5B8]/45 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0 text-xs text-[#E8FFFC]">
            <BellRing className="w-4 h-4 text-[#8AE5DB] shrink-0 animate-pulse" />
            <span>
              Você tem{' '}
              <strong className="text-white">
                {pendingInvitesCount}{' '}
                {pendingInvitesCount === 1 ? 'convite de parada' : 'convites de paradas'}
              </strong>{' '}
              pendente{pendingInvitesCount > 1 ? 's' : ''} dos seus amigos!
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenInvites}
            className="text-xs font-extrabold hoyo-accent-btn px-3.5 py-1.5 rounded-xl shrink-0"
          >
            Ver e responder →
          </button>
        </div>
      )}

      {/* Seletor Horizontal de Dias */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day, idx) => {
          const isSelected = day.date === currentDay.date;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-left transition min-w-[92px] ${
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
      <div className="relative overflow-hidden rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top p-4 sm:p-5 space-y-3">
        <CornerOrnaments />
        <StickerForCategory
          category={
            currentDay.badge === 'CCXP26'
              ? 'CCXP26'
              : currentDay.badge === 'Dia Livre'
              ? 'Restaurante'
              : currentDay.badge === 'Chegada'
              ? 'Aeroporto'
              : 'Passeio'
          }
          className="pointer-events-none absolute -bottom-3 -right-3 w-20 h-20 opacity-20 rotate-12"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
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
            <MapPin className="w-3.5 h-3.5 text-[#E5B869] shrink-0" />
            <span>{currentDay.regionFocus}</span>
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-extrabold text-white">{currentDay.title}</h2>
        <p className="text-xs sm:text-sm text-[#CBD2EC] leading-relaxed">{currentDay.summary}</p>

        {/* Alerta Inteligente do Dia */}
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

        {/* Filtro por Turno + Ações do Meu Roteiro */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
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

          <div className="flex flex-wrap items-center gap-1.5">
            {hiddenOfficialStops.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHiddenDrawer((v) => !v)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition ${
                  showHiddenDrawer
                    ? 'bg-[#657EF8]/25 border-[#657EF8]/60 text-white'
                    : 'bg-[#1C223B] border-[#8596D6]/30 text-[#CAD4FF] hover:text-white'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>Ocultas ({hiddenOfficialStops.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddPersonalStop}
              className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-xl hoyo-accent-btn shadow transition"
            >
              {canEdit ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Adicionar ao meu dia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Painel recolhível de paradas ocultadas no meu roteiro */}
      {showHiddenDrawer && hiddenOfficialStops.length > 0 && (
        <div className="rounded-2xl hoyo-card p-3.5 sm:p-4 space-y-2.5 border-[#8596D6]/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#CBD2EC]">
              Paradas do grupo ocultas só no seu roteiro ({hiddenOfficialStops.length})
            </span>
            <button
              type="button"
              onClick={onRestoreOfficialStops}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#212847] border border-[#8596D6]/35 text-[#CAD4FF] hover:text-white transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar todas</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {hiddenOfficialStops.map((hStop) => (
              <div
                key={hStop.id}
                className="rounded-xl hoyo-card-inner px-3 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#8CA0FF] mr-2">
                    {hStop.timeLabel}
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {hStop.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRestoreSingleOfficialStop(hStop.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#47C5B8]/15 border border-[#47C5B8]/40 text-[#8AE5DB] hover:bg-[#47C5B8]/25 transition shrink-0"
                >
                  <Eye className="w-3 h-3" />
                  <span>Mostrar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards das Paradas do Dia */}
      <div className="space-y-3">
        {dayStops.length === 0 ? (
          <div className="rounded-2xl hoyo-card p-6 text-center text-sm text-[#9BA3C2] space-y-2">
            <OnigiriSticker className="w-12 h-12 mx-auto animate-sticker-float" />
            <p>Nenhuma atividade neste turno. Adicione lugares do Explorar ou aproveite o tempo livre!</p>
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
            const myVote = normalizedMe
              ? votesForStop.find((v) => v.voterName.trim().toLowerCase() === normalizedMe)
              : undefined;

            const sharedInvite = stop.sharedInviteId
              ? stopInvites.find((i) => i.id === stop.sharedInviteId)
              : undefined;

            const cardConflicts =
              stop.isPersonal || Boolean(sharedInvite)
                ? findTimeConflicts(
                    stop.timeLabel,
                    stop.shift,
                    allDayStops.filter((other) => other.id !== stop.id)
                  )
                : [];

            return (
              <div key={stop.id} className="space-y-2">
                <div
                  onClick={() => linkedAttr && onSelectAttraction(linkedAttr)}
                  className={`rounded-2xl hoyo-card overflow-hidden transition ${
                    linkedAttr ? 'cursor-pointer hover:border-[#E5B869]/50' : ''
                  } ${
                    cardConflicts.length > 0
                      ? 'border-[#EC6B6B]/55'
                      : sharedInvite
                      ? 'border-[#47C5B8]/45'
                      : stop.isPersonal
                      ? 'border-[#657EF8]/45'
                      : stop.isMandatory
                      ? 'border-[#E5B869]/30'
                      : ''
                  }`}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider hoyo-accent-pill border px-2.5 py-0.5 rounded-md">
                            {stop.shift}
                          </span>
                          <span className="text-xs font-bold text-[#CBD2EC] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#E5B869]" />
                            {stop.timeLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {sharedInvite ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#47C5B8]/18 text-[#8AE5DB] border border-[#47C5B8]/40">
                              <Users className="w-2.5 h-2.5" />
                              {sharedInvite.createdById === activeMemberId
                                ? 'Rolê compartilhado'
                                : `Convite de ${sharedInvite.createdByName}`}
                            </span>
                          ) : (
                            stop.isPersonal && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full hoyo-accent-pill border">
                                Meu roteiro
                              </span>
                            )
                          )}
                          {cardConflicts.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC6B6B]/18 text-[#FFB4B4] border border-[#EC6B6B]/45">
                              <AlertTriangle className="w-2.5 h-2.5" /> Conflito
                            </span>
                          )}
                          {stop.tags
                            .filter(
                              (t) =>
                                t !== 'Meu roteiro' &&
                                t !== 'Rolê compartilhado' &&
                                !t.toLowerCase().includes('obrigat')
                            )
                            .map((tag) => (
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

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {stop.title}
                          </h3>
                          {stop.subtitle && (
                            <p className="text-xs font-medium text-[#A3B4FF] mt-0.5">
                              {stop.subtitle}
                            </p>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canEdit &&
                            (stop.isPersonal ? (
                              <button
                                type="button"
                                onClick={() => onRemovePersonalStop(stop.id)}
                                title="Remover do meu roteiro"
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFD0D0] hover:bg-[#EC6B6B]/25 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Remover</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onHideOfficialStop(stop.id)}
                                title="Ocultar só do meu roteiro (não altera o grupo)"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded-xl bg-[#212847] border border-[#8596D6]/20 text-[#9BA3C2] hover:text-white transition"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ocultar</span>
                              </button>
                            ))}

                          {linkedAttr && (
                            <button
                              type="button"
                              onClick={() => onSelectAttraction(linkedAttr)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#CBD2EC] bg-[#212847] px-2.5 py-1.5 rounded-xl border border-[#8596D6]/20"
                            >
                              Ficha <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#CBD2EC] mt-2.5 leading-relaxed">
                        {stop.details}
                      </p>

                      {cardConflicts.length > 0 && (
                        <div className="mt-3 rounded-xl bg-[#EC6B6B]/12 border border-[#EC6B6B]/40 p-3 text-xs text-[#FFD0D0] space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-[#FFB4B4]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Horário conflitante neste dia:
                          </p>
                          <ul className="space-y-0.5 text-[11px] text-[#FFD0D0]/90 pl-5 list-disc">
                            {cardConflicts.map((c) => (
                              <li key={c.id}>
                                <strong>{c.timeLabel}</strong> — {c.title}
                              </li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-[#FFB4B4]/90 pt-0.5">
                            Dica: se não for à outra parada, clique no olhinho dela para ocultar do seu roteiro e liberar este horário.
                          </p>
                        </div>
                      )}

                      {stop.transitTip && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#8AE5DB] bg-[#47C5B8]/10 border border-[#47C5B8]/25 px-3 py-2 rounded-xl">
                          <Train className="w-4 h-4 shrink-0 text-[#47C5B8]" />
                          <span>{stop.transitTip}</span>
                        </div>
                      )}

                      {/* Participantes (rolê compartilhado) ou Enquete do Grupo (paradas oficiais) */}
                      {sharedInvite ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3.5 rounded-2xl hoyo-card-inner p-3 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <span className="font-semibold text-[#CBD2EC] flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#8AE5DB]" />
                              Quem vai nesse rolê:
                            </span>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const isCreator =
                                    sharedInvite.createdById === activeMemberId;
                                  const ok = await confirm({
                                    title: isCreator
                                      ? 'Cancelar convite?'
                                      : 'Sair do rolê?',
                                    message: isCreator
                                      ? `Cancelar e remover "${stop.title}" para todos os convidados?`
                                      : `Você deixará de participar de "${stop.title}".`,
                                    confirmLabel: isCreator
                                      ? 'Cancelar convite'
                                      : 'Sair do rolê',
                                    tone: 'danger',
                                  });
                                  if (ok) {
                                    onCancelOrLeaveSharedStop(sharedInvite.id);
                                  }
                                }}
                                className="text-[10px] font-bold text-[#F49797] hover:text-white"
                              >
                                {sharedInvite.createdById === activeMemberId
                                  ? 'Cancelar convite'
                                  : 'Sair do rolê'}
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#47C5B8]/15 border border-[#47C5B8]/35 text-[#BFF4ED] font-medium">
                              <UserAvatar
                                photo={getPhoto(sharedInvite.createdByName)}
                                name={sharedInvite.createdByName}
                                sizeClass="w-4 h-4"
                                textClass="text-[9px]"
                              />
                              <span>✓ {sharedInvite.createdByName}</span>
                            </span>
                            {sharedInvite.invitedMemberIds.map((mId) => {
                              const member = GROUP_MEMBERS.find((m) => m.id === mId);
                              const label = member ? member.name : mId;
                              const status = sharedInvite.responses[mId] ?? 'pending';
                              return (
                                <span
                                  key={mId}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium ${
                                    status === 'accepted'
                                      ? 'bg-[#47C5B8]/15 border-[#47C5B8]/35 text-[#BFF4ED]'
                                      : status === 'declined'
                                      ? 'bg-[#EC6B6B]/15 border-[#EC6B6B]/30 text-[#FFD0D0]'
                                      : 'bg-[#171C33] border-[#8596D6]/25 text-[#9BA3C2]'
                                  }`}
                                >
                                  <UserAvatar
                                    photo={getPhoto(label)}
                                    name={label}
                                    sizeClass="w-4 h-4"
                                    textClass="text-[9px]"
                                  />
                                  <span>
                                    {status === 'accepted'
                                      ? `✓ ${label}`
                                      : status === 'declined'
                                      ? `✕ ${label}`
                                      : `⏳ ${label}`}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        !stop.isPersonal && (
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
                                  <AnimeLikeIcon className="w-4 h-4" /> Sim
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
                                  <AnimeDislikeIcon className="w-4 h-4" /> Não
                                </span>
                                <span>{noVotes.length}</span>
                              </div>
                            </button>
                          </div>

                          {totalVotes > 0 && (
                            <div className="pt-1 space-y-1 text-[11px]">
                              {yesVotes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <AnimeLikeIcon className="w-3.5 h-3.5" />
                                  {yesVotes.map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 bg-[#47C5B8]/15 text-[#BFF4ED] border border-[#47C5B8]/25 px-2 py-0.5 rounded-full font-medium"
                                    >
                                      <UserAvatar
                                        photo={getPhoto(v.voterName)}
                                        name={v.voterName}
                                        sizeClass="w-4 h-4"
                                        textClass="text-[9px]"
                                      />
                                      <span>{v.voterName}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {noVotes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <AnimeDislikeIcon className="w-3.5 h-3.5" />
                                  {noVotes.map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 bg-[#EC6B6B]/15 text-[#FFD0D0] border border-[#EC6B6B]/25 px-2 py-0.5 rounded-full font-medium"
                                    >
                                      <UserAvatar
                                        photo={getPhoto(v.voterName)}
                                        name={v.voterName}
                                        sizeClass="w-4 h-4"
                                        textClass="text-[9px]"
                                      />
                                      <span>{v.voterName}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        )
                      )}

                      {linkedAttr && (
                        <div className="mt-3 pt-3 border-t border-[#8596D6]/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9BA3C2]">
                          <span className="truncate max-w-full sm:max-w-md">{linkedAttr.address}</span>
                          <div className="flex items-center gap-3">
                            {linkedAttr.rating && (
                              <span className="inline-flex items-center gap-1 text-[#F6D794] font-semibold">
                                <Star className="w-3.5 h-3.5 fill-[#E5B869] text-[#E5B869]" />
                                {linkedAttr.rating.toFixed(1)}
                              </span>
                            )}
                            <span className="text-[#8CA0FF] font-semibold">
                              Ver horários &amp; Maps →
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
