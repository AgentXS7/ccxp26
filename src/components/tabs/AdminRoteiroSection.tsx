import type React from 'react';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Compass,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  compareStopsChronologically,
  findSameAttractionStops,
  findTimeConflicts,
  inferShiftFromTimeLabel,
  validateAndNormalizeTimeInput,
} from '../../lib/scheduleUtils';
import { handleImgError } from '../../lib/utils';
import type {
  AttractionMeta,
  ItineraryDay,
  ItineraryStop,
  ShiftType,
} from '../../types';
import { useConfirm } from '../ui/ConfirmProvider';

export interface NewStopFormState {
  dayDate: string;
  shift: ShiftType;
  timeLabel: string;
  title: string;
  subtitle: string;
  details: string;
  attractionId: string;
}

interface AdminRoteiroSectionProps {
  days: ItineraryDay[];
  attractions: AttractionMeta[];
  stops: ItineraryStop[];
  setStops: React.Dispatch<React.SetStateAction<ItineraryStop[]>>;
  isAdminAuthenticated: boolean;
  newStopForm: NewStopFormState;
  setNewStopForm: React.Dispatch<React.SetStateAction<NewStopFormState>>;
  onAddStop: (e: React.FormEvent) => void;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const SHIFTS: ShiftType[] = ['Manhã e Almoço', 'Tarde', 'Noite e Madrugada'];

export function AdminRoteiroSection({
  days,
  attractions,
  stops,
  setStops,
  isAdminAuthenticated,
  newStopForm,
  setNewStopForm,
  onAddStop,
  showToast,
}: AdminRoteiroSectionProps) {
  const confirm = useConfirm();
  const [placeQuery, setPlaceQuery] = useState('');

  const activeAttractions = useMemo(
    () => attractions.filter((a) => !a.excludedReason),
    [attractions]
  );

  const filteredAttractions = useMemo(() => {
    const q = placeQuery.trim().toLowerCase();
    if (!q) return activeAttractions;
    return activeAttractions.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [activeAttractions, placeQuery]);

  const selectedAttr = useMemo(
    () =>
      newStopForm.attractionId
        ? attractions.find((a) => a.id === newStopForm.attractionId) || null
        : null,
    [attractions, newStopForm.attractionId]
  );

  const timeValidation = useMemo(
    () => validateAndNormalizeTimeInput(newStopForm.timeLabel),
    [newStopForm.timeLabel]
  );

  const stopsOnSelectedDay = useMemo(
    () => stops.filter((s) => s.dayDate === newStopForm.dayDate),
    [stops, newStopForm.dayDate]
  );

  const sameAttractionWarnings = useMemo(() => {
    if (!selectedAttr && newStopForm.title.trim().length < 4) return [];
    return findSameAttractionStops(
      newStopForm.attractionId,
      newStopForm.title.trim() || selectedAttr?.name || '',
      stops
    );
  }, [selectedAttr, newStopForm.attractionId, newStopForm.title, stops]);

  const timeConflictWarnings = useMemo(
    () =>
      timeValidation.valid
        ? findTimeConflicts(
            timeValidation.normalizedLabel,
            newStopForm.shift,
            stopsOnSelectedDay
          )
        : [],
    [timeValidation, newStopForm.shift, stopsOnSelectedDay]
  );

  const hasWarnings =
    sameAttractionWarnings.length > 0 || timeConflictWarnings.length > 0;

  const sortedStops = useMemo(
    () =>
      [...stops].sort(
        (a, b) =>
          a.dayDate.localeCompare(b.dayDate) || compareStopsChronologically(a, b)
      ),
    [stops]
  );

  const formatDayShort = (date: string) => {
    const found = days.find((d) => d.date === date);
    return found ? `${found.shortLabel} (${found.weekday})` : date;
  };

  const handleToggleSelectAttraction = (attr: AttractionMeta) => {
    if (newStopForm.attractionId === attr.id) {
      setNewStopForm((prev) => ({
        ...prev,
        attractionId: '',
      }));
      return;
    }

    setNewStopForm((prev) => ({
      ...prev,
      attractionId: attr.id,
      title: attr.name,
      subtitle: `${attr.category} • ${attr.region}`,
      details: attr.notes || '',
    }));
  };

  return (
    <div className="rounded-3xl hoyo-card p-5 space-y-5">
      {isAdminAuthenticated && (
        <>
          <div>
            <h3 className="text-base font-bold text-white">
              Adicionar Nova Parada ao Roteiro Oficial
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Escolha um lugar do Explorar para puxar foto, ficha e dicas automaticamente — ou preencha manualmente abaixo.
            </p>
          </div>

          <form onSubmit={onAddStop} className="space-y-3.5">
            {/* Seletor rápido de lugar do Explorar */}
            <div className="rounded-2xl hoyo-card-inner p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#E5B869] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Puxar do Explorar (opcional • {activeAttractions.length} lugares)
                </span>
                {selectedAttr && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewStopForm((prev) => ({ ...prev, attractionId: '' }))
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9BA3C2] hover:text-white"
                  >
                    <X className="w-3 h-3" /> Desvincular lugar
                  </button>
                )}
              </div>

              {selectedAttr && (
                <div className="rounded-xl bg-[#47C5B8]/12 border border-[#47C5B8]/35 px-3 py-2 flex items-center justify-between gap-2 text-xs text-[#8AE5DB]">
                  <span className="truncate">
                    Vinculado ao Explorar: <strong className="text-white">{selectedAttr.name}</strong> (foto e Ficha automáticas)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewStopForm((prev) => ({ ...prev, attractionId: '' }))
                    }
                    aria-label="Desvincular lugar do Explorar"
                    className="p-1 rounded-lg hover:bg-[#47C5B8]/20 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8F97B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  placeholder="Buscar no Explorar (nome, bairro ou categoria)..."
                  className="w-full bg-[#14192D] border border-[#8596D6]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {filteredAttractions.length === 0 ? (
                  <p className="text-xs text-[#9BA3C2] text-center py-3">
                    Nenhum lugar encontrado com esse termo.
                  </p>
                ) : (
                  filteredAttractions.map((attr) => {
                    const isSelected = newStopForm.attractionId === attr.id;
                    return (
                      <button
                        key={attr.id}
                        type="button"
                        onClick={() => handleToggleSelectAttraction(attr)}
                        className={`w-full text-left rounded-xl p-2 border flex items-center gap-2.5 transition ${
                          isSelected
                            ? 'bg-[#20274A] border-[#E5B869] shadow'
                            : 'bg-[#14192D]/80 border-[#8596D6]/15 hover:border-[#8596D6]/45'
                        }`}
                      >
                        <img
                          src={attr.imageUrl}
                          alt={attr.name}
                          onError={handleImgError}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#0C0F1D]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">
                            {attr.name}
                          </p>
                          <p className="text-[10px] text-[#9BA3C2] truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-[#E5B869]" />
                            {attr.category} • {attr.region}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#E5B869] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Dia, Turno e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={newStopForm.dayDate}
                onChange={(e) =>
                  setNewStopForm({ ...newStopForm, dayDate: e.target.value })
                }
                className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
              >
                {days.map((d) => (
                  <option key={d.date} value={d.date} className="bg-[#14192D]">
                    {d.shortLabel} ({d.weekday}) — {d.title}
                  </option>
                ))}
              </select>

              <select
                value={newStopForm.shift}
                onChange={(e) =>
                  setNewStopForm({
                    ...newStopForm,
                    shift: e.target.value as ShiftType,
                  })
                }
                className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s} className="bg-[#14192D]">
                    {s}
                  </option>
                ))}
              </select>

              <div>
                <input
                  type="text"
                  value={newStopForm.timeLabel}
                  onChange={(e) => {
                    const val = e.target.value;
                    const inferred = inferShiftFromTimeLabel(val);
                    setNewStopForm((prev) => ({
                      ...prev,
                      timeLabel: val,
                      shift: inferred || prev.shift,
                    }));
                  }}
                  placeholder="Horário (ex: 16, 16h00 – 18h00)"
                  className={`w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none ${
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
                  newStopForm.timeLabel.trim() &&
                  timeValidation.hasExplicitTime &&
                  timeValidation.normalizedLabel !== newStopForm.timeLabel.trim() && (
                    <p className="text-[10px] text-[#8AE5DB] mt-1">
                      Será salvo como <strong>{timeValidation.normalizedLabel}</strong>
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={newStopForm.title}
                onChange={(e) =>
                  setNewStopForm({ ...newStopForm, title: e.target.value })
                }
                placeholder="Título da parada (ex: Café na Liberdade) *"
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
              />
              <input
                type="text"
                value={newStopForm.subtitle}
                onChange={(e) =>
                  setNewStopForm({ ...newStopForm, subtitle: e.target.value })
                }
                placeholder="Subtítulo opcional (bairro, categoria...)"
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>

            <textarea
              rows={2}
              value={newStopForm.details}
              onChange={(e) =>
                setNewStopForm({ ...newStopForm, details: e.target.value })
              }
              placeholder="Observações e dicas para o grupo..."
              className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
            />

            {sameAttractionWarnings.length > 0 && (
              <div className="rounded-2xl bg-[#E5B869]/12 border border-[#E5B869]/45 p-3 text-xs text-[#FCE7BE] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#F6D794]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Esta atração já está no roteiro oficial!
                </p>
                <ul className="space-y-0.5 text-[11px] text-[#FCE7BE]/90 pl-5 list-disc">
                  {sameAttractionWarnings.map((match) => (
                    <li key={match.id}>
                      <strong>{formatDayShort(match.dayDate)}</strong>
                      {match.dayDate === newStopForm.dayDate ? ' (este mesmo dia)' : ''} •{' '}
                      {match.timeLabel} — {match.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {timeConflictWarnings.length > 0 && (
              <div className="rounded-2xl bg-[#EC6B6B]/14 border border-[#EC6B6B]/45 p-3 text-xs text-[#FFD0D0] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#FFB4B4]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Horário conflitante em {formatDayShort(newStopForm.dayDate)}!
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
              disabled={!newStopForm.title.trim() || !timeValidation.valid}
              className={`font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed transition ${
                hasWarnings
                  ? 'bg-[#E5B869] hover:bg-[#f0c77c] text-[#14192D]'
                  : 'hoyo-accent-btn'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {hasWarnings ? 'Adicionar mesmo assim' : 'Adicionar ao Roteiro'}
              </span>
            </button>
          </form>
        </>
      )}

      <div
        className={
          isAdminAuthenticated
            ? 'pt-4 border-t border-[#8596D6]/15 space-y-2'
            : 'space-y-2'
        }
      >
        <p className="text-xs font-bold text-[#9BA3C2]">
          Paradas cadastradas no cronograma ({sortedStops.length})
        </p>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {sortedStops.map((s) => {
            const linked = s.attractionId
              ? attractions.find((a) => a.id === s.attractionId)
              : undefined;
            return (
              <div
                key={s.id}
                className="rounded-xl hoyo-card-inner px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {linked && (
                    <img
                      src={linked.imageUrl}
                      alt=""
                      onError={handleImgError}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 bg-[#0C0F1D]"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[#8CA0FF] font-bold">
                      {s.dayDate.slice(8, 10)}/12 • {s.timeLabel} •{' '}
                    </span>
                    <span className="text-white font-semibold">{s.title}</span>
                  </div>
                </div>
                {isAdminAuthenticated && (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Remover parada oficial?',
                        message: `Remover "${s.title}" do roteiro oficial do grupo?`,
                        confirmLabel: 'Remover parada',
                        tone: 'danger',
                      });
                      if (ok) {
                        setStops((prev) => prev.filter((item) => item.id !== s.id));
                        showToast('Parada removida do roteiro.');
                      }
                    }}
                    className="text-[#F49797] hover:text-white shrink-0 p-1.5 rounded-lg hover:bg-[#EC6B6B]/15 transition"
                    title="Remover parada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
