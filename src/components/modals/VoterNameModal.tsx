import type React from 'react';
import { X } from 'lucide-react';
import { AVATAR_BADGES } from '../../lib/theme';
import { HoyoDialog } from '../ui/HoyoDialog';

interface VoterNameModalProps {
  open: boolean;
  onClose: () => void;
  voterNameInput: string;
  setVoterNameInput: (v: string) => void;
  avatarBadge: string;
  setAvatarBadge: (badge: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VoterNameModal({
  open,
  onClose,
  voterNameInput,
  setVoterNameInput,
  avatarBadge,
  setAvatarBadge,
  onSubmit,
}: VoterNameModalProps) {
  return (
    <HoyoDialog
      open={open}
      onClose={onClose}
      ariaLabelledBy="voterDialogTitle"
      maxWidthClass="sm:max-w-sm"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3
            id="voterDialogTitle"
            className="text-base font-extrabold text-white flex items-center gap-2"
          >
            <span>{avatarBadge}</span> Quem está interagindo?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#9BA3C2] leading-relaxed">
          Digite seu nome ou apelido uma única vez para que seus votos ({' '}
          <strong className="text-[#8AE5DB]">👍</strong> /{' '}
          <strong className="text-[#F7A3A3]">👎</strong> ) e lugares favoritos ({' '}
          <strong className="text-[#F7A3A3]">❤️</strong> ) fiquem identificados para todo o grupo.
        </p>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <span className="block text-[11px] font-bold text-[#CBD2EC] mb-1.5">
              Escolha seu ícone no app:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_BADGES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarBadge(emoji)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition ${
                    avatarBadge === emoji
                      ? 'hoyo-accent-pill border-[#E5B869] scale-105'
                      : 'hoyo-card-inner hover:border-[#8596D6]/40'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            autoFocus
            value={voterNameInput}
            onChange={(e) => setVoterNameInput(e.target.value)}
            placeholder="Ex: Lucas, Rafa, Mari..."
            className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#657EF8]"
          />

          <button
            type="submit"
            className="w-full hoyo-accent-btn font-extrabold text-xs py-3.5 rounded-xl transition"
          >
            Salvar nome e continuar
          </button>
        </form>
      </div>
    </HoyoDialog>
  );
}
