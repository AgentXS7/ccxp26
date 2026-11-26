import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck2,
  Check,
  Clock,
  Inbox,
  Mail,
  MapPin,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { GROUP_MEMBERS } from '../../data/members';
import { findSameAttractionStops, findTimeConflicts } from '../../lib/scheduleUtils';
import { handleImgError } from '../../lib/utils';
import type {
  AttractionMeta,
  GroupMemberId,
  ItineraryDay,
  ItineraryStop,
  SharedStopInvite,
} from '../../types';
import { useConfirm } from '../ui/ConfirmProvider';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface StopInvitesModalProps {
  open: boolean;
  onClose: () => void;
  days: ItineraryDay[];
  attractions: AttractionMeta[];
  activeMemberId: GroupMemberId | null;
  receivedInvites: SharedStopInvite[];
  sentInvites: SharedStopInvite[];
  allActiveStops: ItineraryStop[];
  userProfiles: Record<string, string>;
  onRespondInvite: (inviteId: string, response: 'accepted' | 'declined') => void;
  onCancelInvite: (inviteId: string) => void;
  onJumpToDay: (date: string) => void;
}

export function StopInvitesModal({
  open,
  onClose,
  days,
  attractions,
  activeMemberId,
  receivedInvites,
  sentInvites,
  allActiveStops,
  userProfiles,
  onRespondInvite,
  onCancelInvite,
  onJumpToDay,
}: StopInvitesModalProps) {
  const confirm = useConfirm();
  const pendingReceived = activeMemberId
    ? receivedInvites.filter(
        (inv) => (inv.responses[activeMemberId] ?? 'pending') === 'pending'
      )
    : [];

  const pendingSent = sentInvites.filter((inv) =>
    inv.invitedMemberIds.some((id) => (inv.responses[id] ?? 'pending') === 'pending')
  );

  const [activeView, setActiveView] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (!open) return;
    if (pendingReceived.length > 0 || pendingSent.length === 0) {
      setActiveView('received');
    } else {
      setActiveView('sent');
    }
  }, [open, pendingReceived.length, pendingSent.length]);

  const formatDayShort = (date: string) => {
    const found = days.find((d) => d.date === date);
    return found ? `${found.shortLabel} (${found.weekday})` : date;
  };

  const getPhoto = (name: string) => userProfiles[name.trim().toLowerCase()];

  const renderParticipantChips = (invite: SharedStopInvite) => (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#47C5B8]/15 border border-[#47C5B8]/35 text-[#8AE5DB] font-bold">
        ✓ {invite.createdByName}
      </span>
      {invite.invitedMemberIds.map((mId) => {
        const member = GROUP_MEMBERS.find((m) => m.id === mId);
        const status = invite.responses[mId] ?? 'pending';
        const label = member ? member.name : mId;
        return (
          <span
            key={mId}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${
              status === 'accepted'
                ? 'bg-[#47C5B8]/15 border-[#47C5B8]/35 text-[#8AE5DB]'
                : status === 'declined'
                ? 'bg-[#EC6B6B]/15 border-[#EC6B6B]/30 text-[#FFB4B4]'
                : 'bg-[#171C33] border-[#8596D6]/25 text-[#9BA3C2]'
            }`}
          >
            {status === 'accepted'
              ? `✓ ${label}`
              : status === 'declined'
              ? `✕ ${label}`
              : `⏳ ${label}`}
          </span>
        );
      })}
    </div>
  );

  return (
    <HoyoDialog open={open} onClose={onClose} ariaLabelledBy="stopInvitesModalTitle">
      <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              id="stopInvitesModalTitle"
              className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2"
            >
              <Mail className="w-5 h-5 text-[#E5B869]" />
              <span>Convites de Roteiro</span>
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Apenas convites com ações pendentes aparecem aqui. Quando respondidos, os rolês aceitos já ficam definidos direto no Roteiro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1.5 rounded-xl bg-[#212847] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas: Roteiros recebidos / Roteiros enviados */}
        <div className="grid grid-cols-2 gap-1.5 hoyo-card-inner p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('received')}
            className={`text-xs font-bold py-2 px-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 transition ${
              activeView === 'received'
                ? 'hoyo-accent-btn shadow'
                : 'text-[#9BA3C2] hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Roteiros recebidos ({pendingReceived.length})</span>
            {pendingReceived.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#EC6B6B] text-white text-[10px] font-black leading-none">
                {pendingReceived.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('sent')}
            className={`text-xs font-bold py-2 px-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 transition ${
              activeView === 'sent'
                ? 'hoyo-accent-btn shadow'
                : 'text-[#9BA3C2] hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Roteiros enviados ({pendingSent.length})</span>
          </button>
        </div>

        {activeView === 'received' ? (
          <div className="space-y-3">
            {pendingReceived.length === 0 ? (
              <div className="rounded-2xl hoyo-card-inner p-5 text-xs text-[#9BA3C2] text-center space-y-1.5">
                <CalendarCheck2 className="w-7 h-7 text-[#8CA0FF] mx-auto opacity-80" />
                <p>Tudo em dia! Nenhum convite pendente para você responder.</p>
                <p className="text-[11px] opacity-80">
                  Os rolês que você aceitou ficam salvos direto na aba Roteiro (e os recusados somem automaticamente).
                </p>
              </div>
            ) : (
              pendingReceived.map((invite) => {
                      const linkedAttr = invite.stop.attractionId
                        ? attractions.find((a) => a.id === invite.stop.attractionId)
                        : undefined;

                      const myStopsOnDay = allActiveStops.filter(
                        (s) => s.dayDate === invite.stop.dayDate && s.id !== invite.stop.id
                      );

                      const samePlaceMatches = findSameAttractionStops(
                        invite.stop.attractionId || '',
                        invite.stop.title,
                        allActiveStops.filter((s) => s.id !== invite.stop.id)
                      );

                      const timeConflicts = findTimeConflicts(
                        invite.stop.timeLabel,
                        invite.stop.shift,
                        myStopsOnDay
                      );

                      const hasWarnings =
                        samePlaceMatches.length > 0 || timeConflicts.length > 0;

                      return (
                        <div
                          key={invite.id}
                          className={`rounded-2xl hoyo-card-inner p-4 space-y-3 border ${
                            hasWarnings ? 'border-[#E5B869]/45' : 'border-[#47C5B8]/35'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <UserAvatar
                                photo={getPhoto(invite.createdByName)}
                                name={invite.createdByName}
                                sizeClass="w-7 h-7"
                                textClass="text-xs"
                              />
                              <span className="text-xs text-[#CBD2EC] truncate">
                                <strong className="text-white">
                                  {invite.createdByName}
                                </strong>{' '}
                                te convidou
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-bold">
                              <span className="px-2 py-0.5 rounded-lg hoyo-accent-pill border">
                                {formatDayShort(invite.stop.dayDate)}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-[#212847] text-[#CBD2EC] inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#E5B869]" />
                                {invite.stop.timeLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            {linkedAttr && (
                              <img
                                src={linkedAttr.imageUrl}
                                alt={linkedAttr.name}
                                onError={handleImgError}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#0C0F1D]"
                              />
                            )}
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h4 className="text-sm font-extrabold text-white leading-snug">
                                {invite.stop.title}
                              </h4>
                              {invite.stop.subtitle && (
                                <p className="text-[11px] text-[#A3B4FF] flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0 text-[#E5B869]" />
                                  <span className="truncate">{invite.stop.subtitle}</span>
                                </p>
                              )}
                              {invite.stop.details && (
                                <p className="text-xs text-[#CBD2EC] leading-relaxed pt-0.5 line-clamp-3">
                                  {invite.stop.details}
                                </p>
                              )}
                            </div>
                          </div>

                          {renderParticipantChips(invite)}

                          {samePlaceMatches.length > 0 && (
                            <div className="rounded-xl bg-[#E5B869]/12 border border-[#E5B869]/40 p-2.5 text-[11px] text-[#FCE7BE] space-y-1">
                              <p className="font-bold flex items-center gap-1 text-[#F6D794]">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                Você já tem esse passeio no roteiro:
                              </p>
                              <ul className="pl-4 list-disc space-y-0.5">
                                {samePlaceMatches.map((m) => (
                                  <li key={m.id}>
                                    <strong>{formatDayShort(m.dayDate)}</strong> •{' '}
                                    {m.timeLabel} — {m.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {timeConflicts.length > 0 && (
                            <div className="rounded-xl bg-[#EC6B6B]/14 border border-[#EC6B6B]/45 p-2.5 text-[11px] text-[#FFD0D0] space-y-1">
                              <p className="font-bold flex items-center gap-1 text-[#FFB4B4]">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                Conflito de horário no seu dia{' '}
                                {formatDayShort(invite.stop.dayDate)}:
                              </p>
                              <ul className="pl-4 list-disc space-y-0.5">
                                {timeConflicts.map((c) => (
                                  <li key={c.id}>
                                    <strong>{c.timeLabel}</strong> — {c.title}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-[10px] text-[#FFB4B4]/90">
                                Se aceitar, você poderá ocultar a outra parada pelo olhinho depois.
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => onRespondInvite(invite.id, 'accepted')}
                              className={`flex-1 min-w-[130px] font-extrabold text-xs py-2.5 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 transition ${
                                hasWarnings
                                  ? 'bg-[#E5B869] hover:bg-[#f0c77c] text-[#14192D]'
                                  : 'hoyo-accent-btn'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {hasWarnings ? 'Aceitar mesmo assim' : 'Aceitar'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onRespondInvite(invite.id, 'declined')}
                              className="text-xs font-bold px-3 py-2.5 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFD0D0] hover:bg-[#EC6B6B]/25 transition"
                            >
                              Recusar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onJumpToDay(invite.stop.dayDate);
                                onClose();
                              }}
                              className="text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#212847] border border-[#8596D6]/25 text-[#CAD4FF] hover:text-white transition"
                            >
                              Ver dia
                            </button>
                          </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingSent.length === 0 ? (
              <div className="rounded-2xl hoyo-card-inner p-5 text-xs text-[#9BA3C2] text-center space-y-1.5">
                <Send className="w-7 h-7 text-[#8CA0FF] mx-auto opacity-80" />
                <p>Nenhum convite aguardando resposta no momento.</p>
                <p className="text-[11px] opacity-80">
                  Assim que todos os convidados respondem, o rolê sai desta caixa e fica definido no Roteiro de quem aceitou.
                </p>
              </div>
            ) : (
              pendingSent.map((invite) => {
                const linkedAttr = invite.stop.attractionId
                  ? attractions.find((a) => a.id === invite.stop.attractionId)
                  : undefined;
                return (
                  <div
                    key={invite.id}
                    className="rounded-2xl hoyo-card-inner p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {linkedAttr && (
                          <img
                            src={linkedAttr.imageUrl}
                            alt={linkedAttr.name}
                            onError={handleImgError}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 bg-[#0C0F1D]"
                          />
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-[11px] font-bold text-[#8CA0FF]">
                            {formatDayShort(invite.stop.dayDate)} • {invite.stop.timeLabel}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {invite.stop.title}
                          </p>
                          {invite.stop.subtitle && (
                            <p className="text-[11px] text-[#9BA3C2] truncate">
                              {invite.stop.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onJumpToDay(invite.stop.dayDate);
                            onClose();
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#212847] text-[#CAD4FF] hover:text-white"
                        >
                          Ver dia
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Cancelar convite?',
                              message: `Cancelar e remover "${invite.stop.title}" para todos os convidados?`,
                              confirmLabel: 'Cancelar convite',
                              tone: 'danger',
                            });
                            if (ok) {
                              onCancelInvite(invite.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#EC6B6B]/15 border border-[#EC6B6B]/30 text-[#FFD0D0] hover:bg-[#EC6B6B]/25 shrink-0"
                          title="Cancelar convite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {renderParticipantChips(invite)}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </HoyoDialog>
  );
}
