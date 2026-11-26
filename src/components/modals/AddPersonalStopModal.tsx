import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Plus, Search, Sparkles, X } from 'lucide-react';
import { handleImgError } from '../../lib/utils';
import type { AttractionMeta, ItineraryDay, ItineraryStop, ShiftType } from '../../types';
import { HoyoDialog } from '../ui/HoyoDialog';

interface AddPersonalStopModalProps {
  open: boolean;
  onClose: () => void;
  days: ItineraryDay[];
  defaultDate: string;
  attractions: AttractionMeta[];
  preselectedAttractionId?: string | null;
  onAddStop: (stop: ItineraryStop) => void;
  onOpenNewPlaceModal: (targetDate: string, targetShift: ShiftType) => void;
}

const SHIFTS: ShiftType[] = ['Manhã e Almoço', 'Tarde', 'Noite e Madrugada'];

export function AddPersonalStopModal({
  open,
  onClose,
  days,
  defaultDate,
  attractions,
  preselectedAttractionId,
  onAddStop,
  onOpenNewPlaceModal,
}: AddPersonalStopModalProps) {
  const [selectedDay, setSelectedDay] = useState(defaultDate);
  const [shift, setShift] = useState<ShiftType>('Tarde');
  const [query, setQuery] = useState('');
  const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
  const [timeLabel, setTimeLabel] = useState('');
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedDay(defaultDate);
    setSelectedAttrId(preselectedAttractionId || null);
    setQuery('');
    setTimeLabel('');
    setCustomNote('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttr) return;

    const created: ItineraryStop = {
      id: 'stop_personal_' + Date.now().toString(36),
      dayDate: selectedDay,
      shift,
      timeLabel: timeLabel.trim() || 'Horário flexível',
      title: selectedAttr.name,
      subtitle: `${selectedAttr.category} • ${selectedAttr.region}`,
      attractionId: selectedAttr.id,
      tags: ['Meu roteiro'],
      details:
        customNote.trim() ||
        selectedAttr.notes ||
        'Parada adicionada ao seu roteiro pessoal a partir do Explorar.',
      isPersonal: true,
    };

    onAddStop(created);
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

          {/* Busca no Explorar */}
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

          {/* Horário e nota pessoal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#CBD2EC] mb-1">
                Horário (opcional)
              </label>
              <input
                type="text"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                placeholder="Ex: 15h30"
                className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
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

          <button
            type="submit"
            disabled={!selectedAttr}
            className="w-full hoyo-accent-btn disabled:opacity-45 disabled:cursor-not-allowed font-extrabold text-xs py-3.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao meu roteiro</span>
          </button>
        </form>
      </div>
    </HoyoDialog>
  );
}
