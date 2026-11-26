import type React from 'react';
import { Check, Palette, Sparkles, X } from 'lucide-react';
import { AVATAR_BADGES, THEME_PRESETS } from '../../lib/theme';
import type { UserPreferences } from '../../types';
import { HoyoDialog } from '../ui/HoyoDialog';

interface ThemePersonalizeModalProps {
  open: boolean;
  onClose: () => void;
  prefs: UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>;
  voterName: string;
  onOpenVoterModal: () => void;
}

export function ThemePersonalizeModal({
  open,
  onClose,
  prefs,
  setPrefs,
  voterName,
  onOpenVoterModal,
}: ThemePersonalizeModalProps) {
  return (
    <HoyoDialog
      open={open}
      onClose={onClose}
      ariaLabelledBy="themeDialogTitle"
      maxWidthClass="sm:max-w-md"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3
              id="themeDialogTitle"
              className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2"
            >
              <Palette className="w-5 h-5 text-[#E5B869]" />
              Personalizar App no Celular
            </h3>
            <p className="text-xs text-[#9BA3C2]">
              Suas escolhas ficam salvas só no seu aparelho.
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

        {/* Perfil rápido */}
        <div className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#212847] border border-[#E5B869]/40 flex items-center justify-center text-lg shrink-0">
              {prefs.avatarBadge}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {voterName.trim() ? voterName : 'Nome ainda não definido'}
              </p>
              <p className="text-[11px] text-[#9BA3C2]">
                Identificação nos votos e favoritos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVoterModal();
            }}
            className="text-xs font-bold hoyo-accent-pill border px-3 py-1.5 rounded-xl shrink-0"
          >
            Editar nome
          </button>
        </div>

        {/* Ícone do Viajante */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#CBD2EC] block">Seu Ícone</span>
          <div className="flex flex-wrap gap-2">
            {AVATAR_BADGES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, avatarBadge: emoji }))}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition ${
                  prefs.avatarBadge === emoji
                    ? 'hoyo-accent-pill border-[#E5B869] scale-105'
                    : 'hoyo-card-inner hover:border-[#8596D6]/45'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Paleta estilo HoYoLAB */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#CBD2EC] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
            Cor de Destaque (Estilo HoYoLAB)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const selected = prefs.themePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, themePreset: preset.id }))}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                    selected
                      ? 'bg-[#20274A] border-[#E5B869]/70 shadow'
                      : 'hoyo-card-inner hover:border-[#8596D6]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-6 h-6 rounded-lg shrink-0 border border-white/25"
                      style={{ backgroundColor: preset.swatch }}
                    />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate">
                        {preset.label}
                      </span>
                      <span className="block text-[10px] text-[#9BA3C2] truncate">
                        {preset.subtitle}
                      </span>
                    </div>
                  </div>
                  {selected && <Check className="w-4 h-4 text-[#E5B869] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diversão: mascote e adesivos */}
        <div className="rounded-2xl hoyo-card-inner p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/mascots/maga.png"
              alt=""
              className="w-12 h-12 object-contain shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div>
              <span className="block text-xs font-bold text-white">Modo Diversão</span>
              <span className="block text-[11px] text-[#9BA3C2]">
                Mascotes Lumi, Kenji e Mochi com dicas + adesivos gamer flutuando.
              </span>
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-xs text-[#CBD2EC]">Mostrar mascote no cantinho</span>
            <input
              type="checkbox"
              checked={prefs.showMascot !== false}
              onChange={(e) => setPrefs((p) => ({ ...p, showMascot: e.target.checked }))}
              className="w-5 h-5 rounded shrink-0"
            />
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-xs text-[#CBD2EC]">Adesivos flutuando no fundo</span>
            <input
              type="checkbox"
              checked={prefs.showStickers !== false}
              onChange={(e) => setPrefs((p) => ({ ...p, showStickers: e.target.checked }))}
              className="w-5 h-5 rounded shrink-0"
            />
          </label>
        </div>

        {/* Densidade para leitura no celular */}
        <label className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <span className="block text-xs font-bold text-white">
              Modo Lista Compacta no Celular
            </span>
            <span className="block text-[11px] text-[#9BA3C2]">
              Oculta fotos dos cards no Roteiro e reduz altura no Explorar para ver mais itens de uma vez.
            </span>
          </div>
          <input
            type="checkbox"
            checked={prefs.compactCards}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, compactCards: e.target.checked }))
            }
            className="w-5 h-5 rounded shrink-0"
          />
        </label>

        <button
          type="button"
          onClick={onClose}
          className="w-full hoyo-accent-btn font-extrabold text-xs py-3 rounded-xl transition"
        >
          Pronto
        </button>
      </div>
    </HoyoDialog>
  );
}
