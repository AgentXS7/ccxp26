import type React from 'react';
import { useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import { compressAvatarImage } from '../../lib/utils';
import { AnimeDislikeIcon, AnimeHeartIcon, AnimeLikeIcon } from '../ui/AnimeDecor';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface VoterNameModalProps {
  open: boolean;
  onClose: () => void;
  voterNameInput: string;
  setVoterNameInput: (v: string) => void;
  avatarPhoto?: string;
  setAvatarPhoto: (photo: string | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VoterNameModal({
  open,
  onClose,
  voterNameInput,
  setVoterNameInput,
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
      const compressed = await compressAvatarImage(file, 96, 0.72);
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
      <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3
            id="voterDialogTitle"
            className="text-base font-extrabold text-white flex items-center gap-2"
          >
            <UserAvatar
              photo={avatarPhoto}
              name={voterNameInput}
              sizeClass="w-7 h-7"
              textClass="text-xs"
            />
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
          <AnimeHeartIcon className="w-3.5 h-3.5" />). A foto é opcional e aparece para todo o grupo!
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Foto de Perfil Opcional */}
          <div className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                photo={avatarPhoto}
                name={voterNameInput}
                sizeClass="w-12 h-12"
                textClass="text-lg"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Foto de perfil</p>
                <p className="text-[11px] text-[#9BA3C2]">
                  {avatarPhoto ? 'Visível para todo o grupo' : 'Opcional (senão usa sua inicial)'}
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
                  title="Remover foto"
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

          {/* Nome Obrigatório */}
          <div>
            <label
              htmlFor="voterNameInput"
              className="block text-[11px] font-bold text-[#CBD2EC] mb-1.5"
            >
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
