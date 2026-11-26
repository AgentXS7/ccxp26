import type React from 'react';
import { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import {
  buildUnsplashSearchUrl,
  CURATED_UNSPLASH_BY_CATEGORY,
  searchInternetPhotos,
  type PhotoSuggestion,
} from '../../lib/imageSearch';
import { handleImgError } from '../../lib/utils';
import type { AttractionMeta, ItineraryDay, ShiftType } from '../../types';
import { HoyoDialog } from '../ui/HoyoDialog';

interface NewPlaceFormState {
  name: string;
  region: string;
  category: AttractionMeta['category'];
  hours: string;
  address: string;
  notes: string;
  imageUrl: string;
  inOfficialRoute: boolean;
  addToPersonalRoute: boolean;
  targetDayDate: string;
  targetShift: ShiftType;
}

interface AddPlaceModalProps {
  open: boolean;
  onClose: () => void;
  form: NewPlaceFormState;
  setForm: React.Dispatch<React.SetStateAction<NewPlaceFormState>>;
  regionsList: string[];
  categoriesList: string[];
  days: ItineraryDay[];
  onSubmit: (e: React.FormEvent) => void;
}

const SHIFTS: ShiftType[] = ['Manhã e Almoço', 'Tarde', 'Noite e Madrugada'];

export function AddPlaceModal({
  open,
  onClose,
  form,
  setForm,
  regionsList,
  categoriesList,
  days,
  onSubmit,
}: AddPlaceModalProps) {
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [webPhotos, setWebPhotos] = useState<PhotoSuggestion[]>([]);
  const [photoSearchMsg, setPhotoSearchMsg] = useState('');

  const curatedPhotos =
    CURATED_UNSPLASH_BY_CATEGORY[form.category] ||
    CURATED_UNSPLASH_BY_CATEGORY.Passeio;

  const handleSearchWebPhotos = async () => {
    const query = (form.name.trim() || `${form.category} São Paulo`).trim();
    setSearchingPhotos(true);
    setPhotoSearchMsg('');
    try {
      const results = await searchInternetPhotos(query);
      setWebPhotos(results);
      if (results.length === 0) {
        setPhotoSearchMsg('Nenhuma foto direta encontrada para esse termo. Use as sugestões abaixo ou o link do Unsplash!');
      }
    } catch {
      setPhotoSearchMsg('Não foi possível buscar agora. Escolha uma das sugestões Unsplash abaixo!');
    } finally {
      setSearchingPhotos(false);
    }
  };

  return (
    <HoyoDialog open={open} onClose={onClose} ariaLabelledBy="addPlaceDialogTitle">
      <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 id="addPlaceDialogTitle" className="text-lg font-extrabold text-white">
              Adicionar Novo Lugar
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Sugira um local no Explorar (com foto da internet) e, se quiser, já jogue no seu roteiro!
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

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
              Nome do Local *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Z Deli Sandwich Shop, Pinacoteca, Bar da Dona Onça..."
              className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#657EF8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                Região / Bairro
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              >
                {regionsList
                  .filter((r) => r !== 'Todas')
                  .map((reg) => (
                    <option key={reg} value={reg} className="bg-[#14192D]">
                      {reg}
                    </option>
                  ))}
                <option value="14. Sugestões Extras do Grupo" className="bg-[#14192D]">
                  14. Sugestões Extras do Grupo
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as AttractionMeta['category'],
                  })
                }
                className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              >
                {categoriesList
                  .filter((c) => c !== 'Todas')
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-[#14192D]">
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                Endereço ou Referência
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ex: Pinheiros / Perto do Metrô..."
                className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                Horário (opcional)
              </label>
              <input
                type="text"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="Ex: Ter a Dom 12h às 23h"
                className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
              Por que vale a pena ir? / Dicas
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Hambúrguer premiado, ótimo para o dia livre..."
              className="w-full hoyo-card-inner rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
            />
          </div>

          {/* Seletor de Foto da Internet (Wikimedia + Unsplash) */}
          <div className="rounded-2xl hoyo-card-inner p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#CBD2EC] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E5B869]" />
                Foto do Local (Internet)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSearchWebPhotos}
                  disabled={searchingPhotos}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl hoyo-accent-pill border hover:border-[#E5B869]/60 transition disabled:opacity-60"
                >
                  {searchingPhotos ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  <span>{searchingPhotos ? 'Buscando...' : 'Buscar foto online'}</span>
                </button>

                <a
                  href={buildUnsplashSearchUrl(form.name || form.category)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#171C33] border border-[#8596D6]/25 text-[#9BA3C2] hover:text-white transition"
                >
                  <span>Unsplash</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {photoSearchMsg && (
              <p className="text-[11px] text-[#F6D794]">{photoSearchMsg}</p>
            )}

            {webPhotos.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8AE5DB]">
                  Resultados da internet (toque para escolher):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {webPhotos.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: p.url })}
                      className={`relative h-14 rounded-lg overflow-hidden border transition ${
                        form.imageUrl === p.url
                          ? 'border-[#E5B869] ring-2 ring-[#E5B869]/40'
                          : 'border-[#8596D6]/25 hover:border-[#E5B869]/50'
                      }`}
                    >
                      <img
                        src={p.thumbUrl}
                        alt={p.label}
                        onError={handleImgError}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9BA3C2]">
                Sugestões Unsplash ({form.category}):
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {curatedPhotos.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: p.url })}
                    className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border transition ${
                      form.imageUrl === p.url
                        ? 'border-[#E5B869] ring-2 ring-[#E5B869]/40'
                        : 'border-[#8596D6]/25 hover:border-[#E5B869]/50'
                    }`}
                  >
                    <img
                      src={p.thumbUrl}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white font-semibold px-1 py-0.5 truncate">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Ou cole o link https://... de qualquer imagem"
                className="flex-1 min-w-0 bg-[#14192D] border border-[#8596D6]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  onError={handleImgError}
                  className="w-10 h-9 rounded-lg object-cover border border-[#E5B869]/40 shrink-0"
                />
              )}
            </div>
          </div>

          {/* Opção de já adicionar ao Meu Roteiro */}
          <div className="rounded-2xl hoyo-card-inner p-3 space-y-2.5">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="text-xs font-bold text-white">
                Também adicionar ao meu Roteiro Pessoal
              </span>
              <input
                type="checkbox"
                checked={form.addToPersonalRoute}
                onChange={(e) =>
                  setForm({ ...form, addToPersonalRoute: e.target.checked })
                }
                className="w-4 h-4 rounded shrink-0"
              />
            </label>

            {form.addToPersonalRoute && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <select
                  value={form.targetDayDate}
                  onChange={(e) => setForm({ ...form, targetDayDate: e.target.value })}
                  className="bg-[#14192D] border border-[#8596D6]/20 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {days.map((d) => (
                    <option key={d.date} value={d.date} className="bg-[#14192D]">
                      {d.shortLabel} ({d.weekday}) — {d.badge}
                    </option>
                  ))}
                </select>
                <select
                  value={form.targetShift}
                  onChange={(e) =>
                    setForm({ ...form, targetShift: e.target.value as ShiftType })
                  }
                  className="bg-[#14192D] border border-[#8596D6]/20 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s} className="bg-[#14192D]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full hoyo-accent-btn font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg"
          >
            Salvar Lugar no Explorar
          </button>
        </form>
      </div>
    </HoyoDialog>
  );
}
