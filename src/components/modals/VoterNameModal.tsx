import type React from 'react';
import { useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import { AVATAR_BADGES } from '../../lib/theme';
import { compressAvatarImage } from '../../lib/utils';
import { AnimeDislikeIcon, AnimeHeartIcon, AnimeLikeIcon } from '../ui/AnimeDecor';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface VoterNameModalProps {
  open: boolean;
  onClose: () => void;
  voterNameInput: string;
  setVoterNameInput: (v: string) => void;
  avatarBadge: string;
  setAvatarBadge: (badge: string) => void;
  avatarPhoto?: string;
  setAvatarPhoto: (photo: string | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VoterNameModal({
  open,
  onClose,
  voterNameInput,
  setVoterNameInput,
  avatarBadge,
  setAvatarBadge,
  avatarPhoto,
  setAvatarPhoto,
  onSubmit,
}: VoterNameModalProps) {
  const [photoError, setPhotoError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    try {
      const compressed = await compressAvatarImage(file, 128);
      setAvatarPhoto(compressed);
    } catch {
      setPhotoError('Não deu para carregar essa imagem. Tente outra foto.');
    }
  };

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
            <UserAvatar photo={avatarPhoto} badge={avatarBadge} sizeClass="w-6 h-6" textClass="text-lg" />
            <span>Seu Perfil no App</span>
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
          Só precisa do seu <strong className="text-white">nome</strong> para votar (
          <AnimeLikeIcon className="w-3.5 h-3.5" /> / <AnimeDislikeIcon className="w-3.5 h-3.5" />) e curtir lugares (
          <AnimeHeartIcon className="w-3.5 h-3.5" />). A foto de perfil é opcional!
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Foto de Perfil Opcional */}
          <div className="rounded-2xl hoyo-card-inner p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#1F2747] border border-[#E5B869]/45 flex items-center justify-center overflow-hidden shrink-0">
                <UserAvatar
                  photo={avatarPhoto}
                  badge={avatarBadge}
                  sizeClass="w-12 h-12"
                  textClass="text-2xl"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Foto de perfil</p>
                <p className="text-[11px] text-[#9BA3C2]">
                  {avatarPhoto ? 'Usando sua foto' : 'Opcional (ou use um ícone)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold hoyo-accent-pill border px-2.5 py-1.5 rounded-xl hover:border-[#E5B869]/60 transition">
                <Camera className="w-3.5 h-3.5" />
                <span>{avatarPhoto ? 'Trocar' : 'Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {avatarPhoto && (
                <button
                  type="button"
                  onClick={() => setAvatarPhoto(undefined)}
                  title="Remover foto e voltar para o ícone"
                  aria-label="Remover foto"
                  className="p-1.5 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFB5B5] hover:bg-[#EC6B6B]/25 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {photoError && (
            <p className="text-[11px] text-[#FFB5B5] font-medium">{photoError}</p>
          )}

          {/* Ícone (fallback ou preferência) */}
          <div>
            <span className="block text-[11px] font-bold text-[#CBD2EC] mb-1.5">
              Ícone nos votos (aparece para todo o grupo):
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

          {/* Nome Obrigatório */}
          <div>
            <label htmlFor="voterNameInput" className="block text-[11px] font-bold text-[#CBD2EC] mb-1.5">
              Seu nome ou apelido <span className="text-[#EC6B6B]">*</span>
            </label>
            <input
              id="voterNameInput"
              type="text"
              required
              autoFocus
              value={voterNameInput}
              onChange={(e) => setVoterNameInput(e.target.value)}
              placeholder="Ex: Max, Lucas, Rafa..."
              className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#657EF8]"
            />
          </div>

          <button
            type="submit"
            className="w-full hoyo-accent-btn font-extrabold text-xs py-3.5 rounded-xl transition"
          >
            Salvar perfil
          </button>
        </form>
      </div>
    </HoyoDialog>
  );
}
