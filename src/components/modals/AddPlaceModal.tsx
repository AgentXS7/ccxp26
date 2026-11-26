import type React from 'react';
import { X } from 'lucide-react';
import type { AttractionMeta } from '../../types';
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
}

interface AddPlaceModalProps {
  open: boolean;
  onClose: () => void;
  form: NewPlaceFormState;
  setForm: React.Dispatch<React.SetStateAction<NewPlaceFormState>>;
  regionsList: string[];
  categoriesList: string[];
  onSubmit: (e: React.FormEvent) => void;
}

export function AddPlaceModal({
  open,
  onClose,
  form,
  setForm,
  regionsList,
  categoriesList,
  onSubmit,
}: AddPlaceModalProps) {
  return (
    <HoyoDialog open={open} onClose={onClose} ariaLabelledBy="addPlaceDialogTitle">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 id="addPlaceDialogTitle" className="text-lg font-extrabold text-white">
              Adicionar Novo Lugar
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Qualquer pessoa do grupo pode sugerir restaurantes, bares ou passeios aqui.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1.5 rounded-xl bg-[#212847]"
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

          <div>
            <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
              Link de Foto (opcional)
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://... (se vazio, usa foto padrão de SP)"
              className="w-full hoyo-card-inner rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#657EF8]"
            />
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
