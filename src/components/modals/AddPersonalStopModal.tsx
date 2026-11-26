import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Compass,
  MapPin,
  PencilLine,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { GROUP_MEMBERS } from '../../data/members';
import {
  findSameAttractionStops,
  findTimeConflicts,
  inferShiftFromTimeLabel,
  validateAndNormalizeTimeInput,
} from '../../lib/scheduleUtils';
import { handleImgError } from '../../lib/utils';
import type {
  AttractionMeta,
  GroupMemberId,
  ItineraryDay,
  ItineraryStop,
  MemberCloudProfile,
  ShiftType,
} from '../../types';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface AddPersonalStopModalProps {
  open: boolean;
  onClose: () => void;
  days: ItineraryDay[];
  defaultDate: string;
  attractions: AttractionMeta[];
  allActiveStops: ItineraryStop[];
  activeMemberId: GroupMemberId | null;
  memberProfiles: Partial<Record<GroupMemberId, MemberCloudProfile>>;
  userProfiles: Record<string, string>;
  preselectedAttractionId?: string | null;
  onAddStop: (stop: ItineraryStop, invitedMemberIds: GroupMemberId[]) => void;
  onOpenNewPlaceModal: (targetDate: string, targetShift: ShiftType) => void;
}

const SHIFTS: ShiftType[] = ['Manhã e Almoço', 'Tarde', 'Noite e Madrugada'];

export function AddPersonalStopModal({
  open,
  onClose,
  days,
  defaultDate,
  attractions,
  allActiveStops,
  activeMemberId,
  memberProfiles,
  userProfiles,
  preselectedAttractionId,
  onAddStop,
  onOpenNewPlaceModal,
}: AddPersonalStopModalProps) {
  const [mode, setMode] = useState<'explore' | 'manual'>('explore');
  const [selectedDay, setSelectedDay] = useState(defaultDate);
  const [shift, setShift] = useState<ShiftType>('Tarde');
  const [query, setQuery] = useState('');
  const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubtitle, setManualSubtitle] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [invitedMemberIds, setInvitedMemberIds] = useState<GroupMemberId[]>([]);

  useEffect(() => {
    if (!open) return;
    setMode('explore');
    setSelectedDay(defaultDate);
    setSelectedAttrId(preselectedAttractionId || null);
    setQuery('');
    setManualTitle('');
    setManualSubtitle('');
    setTimeLabel('');
    setCustomNote('');
    setInvitedMemberIds([]);
  }, [open, defaultDate, preselectedAttractionId]);

  const availableAttractions = useMemo(() => {
    const active = attractions.filter((a) => !a.excludedReason);
    if (!query.trim()) return active;
    const q = query.trim().toLowerCase();
    return active.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [attractions, query]);

  const selectedAttr = useMemo(
    () => attractions.find((a) => a.id === selectedAttrId) || null,
    [attractions, selectedAttrId]
  );

  const stopsOnSelectedDay = useMemo(
    () => allActiveStops.filter((s) => s.dayDate === selectedDay),
    [allActiveStops, selectedDay]
  );

  const sameAttractionWarnings = useMemo(() => {
    if (mode === 'explore') {
      if (!selectedAttr) return [];
      return findSameAttractionStops(selectedAttr.id, selectedAttr.name, allActiveStops);
    }
    if (manualTitle.trim().length < 4) return [];
    return findSameAttractionStops('', manualTitle.trim(), allActiveStops);
  }, [mode, selectedAttr, manualTitle, allActiveStops]);

  const timeValidation = useMemo(
    () => validateAndNormalizeTimeInput(timeLabel),
    [timeLabel]
  );

  const timeConflictWarnings = useMemo(
    () =>
      timeValidation.valid
        ? findTimeConflicts(timeValidation.normalizedLabel, shift, stopsOnSelectedDay)
        : [],
    [timeValidation, shift, stopsOnSelectedDay]
  );

  const hasWarnings =
    sameAttractionWarnings.length > 0 || timeConflictWarnings.length > 0;

  const otherMembers = useMemo(
    () =>
      activeMemberId
        ? GROUP_MEMBERS.filter((m) => m.id !== activeMemberId)
        : [],
    [activeMemberId]
  );

  const getMemberPhoto = (memberId: GroupMemberId, name: string) =>
    memberProfiles[memberId]?.avatarPhoto ||
    userProfiles[name.trim().toLowerCase()] ||
    undefined;

  const toggleInviteMember = (memberId: GroupMemberId) => {
    setInvitedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formatDayShort = (date: string) => {
    const found = days.find((d) => d.date === date);
    return found ? `${found.shortLabel} (${found.weekday})` : date;
  };

  const canSubmit =
    timeValidation.valid &&
    (mode === 'explore' ? Boolean(selectedAttr) : Boolean(manualTitle.trim()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const isShared = invitedMemberIds.length > 0;
    const created: ItineraryStop =
      mode === 'explore'
        ? {
            id: 'stop_personal_' + Date.now().toString(36),
            dayDate: selectedDay,
            shift,
            timeLabel: timeValidation.normalizedLabel,
            title: selectedAttr!.name,
            subtitle: `${selectedAttr!.category} • ${selectedAttr!.region}`,
            attractionId: selectedAttr!.id,
            tags: [isShared ? 'Rolê compartilhado' : 'Meu roteiro'],
            details:
              customNote.trim() ||
              selectedAttr!.notes ||
              'Parada adicionada ao seu roteiro a partir do Explorar.',
            isPersonal: !isShared,
          }
        : {
            id: 'stop_personal_' + Date.now().toString(36),
            dayDate: selectedDay,
            shift,
            timeLabel: timeValidation.normalizedLabel,
            title: manualTitle.trim(),
            subtitle: manualSubtitle.trim() || undefined,
            tags: [isShared ? 'Rolê compartilhado' : 'Meu roteiro'],
            details:
              customNote.trim() || 'Parada criada diretamente no roteiro.',
            isPersonal: !isShared,
          };

    onAddStop(created, invitedMemberIds);
    onClose();
  };

  return (
    <HoyoDialog open={open} onClose={onClose} ariaLabelledBy="personalStopTitle">
      <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              id="personalStopTitle"
              className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#E5B869]" />
              Adicionar Parada ao Meu Roteiro
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Escolha um lugar do Explorar para montar o seu dia livre sem alterar o roteiro oficial do grupo.
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Modo: Do Explorar ou Manual */}
          <div className="grid grid-cols-2 gap-1.5 hoyo-card-inner p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('explore')}
              className={`text-xs font-bold py-2 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 transition ${
                mode === 'explore'
                  ? 'hoyo-accent-btn shadow'
                  : 'text-[#9BA3C2] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Do Explorar</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`text-xs font-bold py-2 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 transition ${
                mode === 'manual'
                  ? 'hoyo-accent-btn shadow'
                  : 'text-[#9BA3C2] hover:text-white'
              }`}
            >
              <PencilLine className="w-3.5 h-3.5" />
              <span>Criar manualmente</span>
            </button>
          </div>

          {/* Dia & Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                Dia da viagem
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              >
                {days.map((d) => (
                  <option key={d.date} value={d.date} className="bg-[#14192D]">
                    {d.shortLabel} ({d.weekday}) — {d.badge}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                Turno
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s} className="bg-[#14192D]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mode === 'explore' ? (
            /* Busca no Explorar */
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-bold text-[#CBD2EC]">
                  Escolha um lugar do Explorar *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewPlaceModal(selectedDay, shift);
                  }}
                  className="text-[11px] font-bold text-[#8CA0FF] hover:text-white transition"
                >
                  + Criar lugar novo no Explorar
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8F97B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar restaurante, parque, loja, bar..."
                  className="w-full hoyo-card-inner rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {availableAttractions.length === 0 ? (
                  <p className="text-xs text-[#9BA3C2] text-center py-4">
                    Nenhum lugar encontrado. Clique em “+ Criar lugar novo no Explorar” acima!
                  </p>
                ) : (
                  availableAttractions.map((attr) => {
                    const isSelected = attr.id === selectedAttrId;
                    return (
                      <button
                        key={attr.id}
                        type="button"
                        onClick={() => setSelectedAttrId(attr.id)}
                        className={`w-full text-left rounded-xl p-2 border flex items-center gap-2.5 transition ${
                          isSelected
                            ? 'bg-[#20274A] border-[#E5B869] shadow'
                            : 'hoyo-card-inner hover:border-[#8596D6]/45'
                        }`}
                      >
                        <img
                          src={attr.imageUrl}
                          alt=""
                          onError={handleImgError}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#0C0F1D]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{attr.name}</p>
                          <p className="text-[10px] text-[#9BA3C2] truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-[#E5B869]" />
                            {attr.category} • {attr.region}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#E5B869] shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Criação manual */
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                  Nome do rolê / parada *
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ex: Café na Paulista, Compras na 25 de Março..."
                  className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                  Local / Subtítulo (opcional)
                </label>
                <input
                  type="text"
                  value={manualSubtitle}
                  onChange={(e) => setManualSubtitle(e.target.value)}
                  placeholder="Ex: Av. Paulista • Encontro depois do almoço"
                  className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
                />
              </div>
            </div>
          )}

          {/* Horário e nota pessoal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                Horário (opcional)
              </label>
              <input
                type="text"
                value={timeLabel}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeLabel(val);
                  const inferred = inferShiftFromTimeLabel(val);
                  if (inferred) setShift(inferred);
                }}
                placeholder="Ex: 13, 15h30 ou 13h–15h"
                className={`w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                  !timeValidation.valid
                    ? 'border-[#EC6B6B] focus:border-[#EC6B6B]'
                    : 'focus:border-[#657EF8]'
                }`}
              />
              {!timeValidation.valid ? (
                <p className="text-[10px] text-[#FFB4B4] mt-1 font-medium">
                  {timeValidation.error}
                </p>
              ) : (
                timeLabel.trim() &&
                timeValidation.hasExplicitTime &&
                timeValidation.normalizedLabel !== timeLabel.trim() && (
                  <p className="text-[10px] text-[#8AE5DB] mt-1">
                    Será salvo como <strong>{timeValidation.normalizedLabel}</strong>
                  </p>
                )
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                Lembrete pessoal (opcional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ex: Passar antes do cinema..."
                className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
            </div>
          </div>

          {/* Convidar amigos do grupo (opcional) */}
          {otherMembers.length > 0 && (
            <div className="rounded-2xl hoyo-card-inner p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#CBD2EC] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8AE5DB]" />
                  Convidar amigos do grupo (opcional)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setInvitedMemberIds(
                      invitedMemberIds.length === otherMembers.length
                        ? []
                        : otherMembers.map((m) => m.id)
                    )
                  }
                  className="text-[10px] font-bold text-[#8CA0FF] hover:text-white"
                >
                  {invitedMemberIds.length === otherMembers.length
                    ? 'Limpar'
                    : 'Selecionar todos'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {otherMembers.map((member) => {
                  const selected = invitedMemberIds.includes(member.id);
                  const hasDevice = Boolean(
                    memberProfiles[member.id]?.trustedDevices?.length
                  );
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleInviteMember(member.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition ${
                        selected
                          ? 'bg-[#47C5B8]/18 border-[#47C5B8] text-[#BFF4ED]'
                          : 'bg-[#14192D] border-[#8596D6]/20 text-[#CBD2EC] hover:border-[#8596D6]/45'
                      }`}
                    >
                      <UserAvatar
                        photo={getMemberPhoto(member.id, member.name)}
                        name={member.name}
                        sizeClass="w-5 h-5"
                        textClass="text-[10px]"
                      />
                      <span>{member.name}</span>
                      {hasDevice && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#47C5B8]"
                          title="Aparelho conectado"
                        />
                      )}
                      {selected && <Check className="w-3.5 h-3.5 text-[#47C5B8]" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-[#9BA3C2]">
                {invitedMemberIds.length > 0
                  ? 'Eles vão receber um aviso do mascote para aceitar (com checagem de conflitos no roteiro deles)!'
                  : 'Sem selecionar ninguém, fica salvo só no seu roteiro pessoal.'}
              </p>
            </div>
          )}

          {sameAttractionWarnings.length > 0 && (
            <div className="rounded-2xl bg-[#E5B869]/12 border border-[#E5B869]/45 p-3 text-xs text-[#FCE7BE] space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#F6D794]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Esta atração já está no roteiro!
              </p>
              <ul className="space-y-0.5 text-[11px] text-[#FCE7BE]/90 pl-5 list-disc">
                {sameAttractionWarnings.map((match) => (
                  <li key={match.id}>
                    <strong>{formatDayShort(match.dayDate)}</strong>
                    {match.dayDate === selectedDay ? ' (este mesmo dia)' : ''} •{' '}
                    {match.timeLabel} — {match.title}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#F6D794]/90 pt-0.5">
                Tem certeza que quer adicionar mesmo assim?
              </p>
            </div>
          )}

          {timeConflictWarnings.length > 0 && (
            <div className="rounded-2xl bg-[#EC6B6B]/14 border border-[#EC6B6B]/45 p-3 text-xs text-[#FFD0D0] space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#FFB4B4]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Horário conflitante em {formatDayShort(selectedDay)}!
              </p>
              <ul className="space-y-0.5 text-[11px] text-[#FFD0D0]/90 pl-5 list-disc">
                {timeConflictWarnings.map((conflict) => (
                  <li key={conflict.id}>
                    <strong>{conflict.timeLabel}</strong> — {conflict.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full disabled:opacity-45 disabled:cursor-not-allowed font-extrabold text-xs py-3.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition shadow-lg ${
              hasWarnings
                ? 'bg-[#E5B869] hover:bg-[#f0c77c] text-[#14192D]'
                : 'hoyo-accent-btn'
            }`}
          >
            {invitedMemberIds.length > 0 ? (
              <Send className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>
              {invitedMemberIds.length > 0
                ? hasWarnings
                  ? `Criar e convidar (${invitedMemberIds.length}) mesmo assim`
                  : `Criar e convidar (${invitedMemberIds.length})`
                : hasWarnings
                ? 'Adicionar mesmo assim'
                : 'Adicionar ao meu roteiro'}
            </span>
          </button>
        </form>
      </div>
    </HoyoDialog>
  );
}
