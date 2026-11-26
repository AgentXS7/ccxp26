import type React from 'react';
import { CalendarPlus, ExternalLink, Lock, MapPin, Star, X } from 'lucide-react';
import { formatBRL, handleImgError } from '../../lib/utils';
import type { AttractionMeta, PlaceLikeEntry } from '../../types';
import { AnimeHeartIcon } from '../ui/AnimeDecor';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface AttractionDrawerProps {
  attraction: AttractionMeta | null;
  onClose: () => void;
  placeLikes: PlaceLikeEntry[];
  voterName: string;
  avatarPhoto?: string;
  userProfiles: Record<string, string>;
  peoplePerCar: number;
  canEdit: boolean;
  onTogglePlaceLike: (e: React.MouseEvent, attractionId: string) => void;
  onAddToPersonalRoute: (attractionId: string) => void;
}

export function AttractionDrawer({
  attraction,
  onClose,
  placeLikes,
  voterName,
  avatarPhoto,
  userProfiles,
  peoplePerCar,
  canEdit,
  onTogglePlaceLike,
  onAddToPersonalRoute,
}: AttractionDrawerProps) {
  const normalizedMe = voterName.trim().toLowerCase();
  const getPhoto = (name: string) => {
    const k = name.trim().toLowerCase();
    return k === normalizedMe && avatarPhoto ? avatarPhoto : userProfiles[k];
  };

  const likesForModal = attraction
    ? placeLikes.filter((l) => l.attractionId === attraction.id)
    : [];
  const isLikedModal =
    attraction && normalizedMe
      ? likesForModal.some((l) => l.voterName.trim().toLowerCase() === normalizedMe)
      : false;

  return (
    <HoyoDialog
      open={Boolean(attraction)}
      onClose={onClose}
      ariaLabelledBy="attractionDialogTitle"
    >
      {attraction && (
        <div className="p-6 space-y-4">
          <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-[#0C0F1D] border border-[#8596D6]/20">
            <img
              src={attraction.imageUrl}
              alt={attraction.name}
              onError={handleImgError}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-3 right-3 text-white bg-[#0C0F1D]/82 hover:bg-[#14192D] backdrop-blur-md p-2 rounded-xl border border-[#8596D6]/35"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5B869]">
                {attraction.region} • {attraction.category}
              </span>
              <h3
                id="attractionDialogTitle"
                className="text-xl font-extrabold text-white mt-0.5"
              >
                {attraction.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={(e) => onTogglePlaceLike(e, attraction.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-extrabold transition ${
                isLikedModal
                  ? 'bg-[#EC6B6B] border-[#FFA8A8] text-white'
                  : 'hoyo-card-inner text-[#EEF1FA] hover:border-[#EC6B6B]/55'
              }`}
            >
              <AnimeHeartIcon filled={isLikedModal} className="w-4 h-4" />
              <span>{likesForModal.length}</span>
            </button>
          </div>

          {likesForModal.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 text-[#F49797] font-bold">
                <AnimeHeartIcon className="w-3.5 h-3.5" /> Favoritado por:
              </span>
              {likesForModal.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-1 bg-[#EC6B6B]/18 text-[#FFD0D0] border border-[#EC6B6B]/30 px-2.5 py-0.5 rounded-full font-semibold"
                >
                  <UserAvatar
                    photo={getPhoto(l.voterName)}
                    name={l.voterName}
                    sizeClass="w-4 h-4"
                    textClass="text-[9px]"
                  />
                  <span>{l.voterName}</span>
                </span>
              ))}
            </div>
          )}

          {attraction.rating && (
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-[#E5B869]/15 text-[#F6D794] border border-[#E5B869]/35 font-bold px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-[#E5B869] text-[#E5B869]" />
                {attraction.rating.toFixed(1)} no Google
              </span>
              <span className="text-[#9BA3C2]">
                ({attraction.reviewsCount?.toLocaleString('pt-BR')} avaliações)
              </span>
            </div>
          )}

          <div className="space-y-2.5 text-xs">
            <div className="rounded-2xl hoyo-card-inner p-3.5 space-y-1">
              <span className="text-[#9BA3C2] font-semibold block">
                Horário de Funcionamento
              </span>
              <p className="text-white font-medium">{attraction.hours}</p>
              {attraction.closedDays !== 'Não fecha' && (
                <p className="text-[#F7A3A3] font-bold mt-1">
                  Atenção: {attraction.closedDays}
                </p>
              )}
            </div>

            <div className="rounded-2xl hoyo-card-inner p-3.5 space-y-1">
              <span className="text-[#9BA3C2] font-semibold block">Endereço</span>
              <p className="text-white">{attraction.address}</p>
            </div>

            {attraction.distanceKm > 0 && (
              <div className="rounded-2xl hoyo-card-inner p-3.5 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[#9BA3C2] block">Distância Base</span>
                  <strong className="text-white text-sm">{attraction.distanceKm} km</strong>
                </div>
                <div>
                  <span className="text-[#9BA3C2] block">Uber (÷ {peoplePerCar}p)</span>
                  <strong className="text-[#8AE5DB] text-sm">
                    {formatBRL(attraction.uberAvg / Math.max(1, peoplePerCar))}
                  </strong>
                </div>
                <div>
                  <span className="text-[#9BA3C2] block">Carro Cheio</span>
                  <strong className="text-[#CBD2EC] text-sm">
                    {formatBRL(attraction.uberAvg)}
                  </strong>
                </div>
              </div>
            )}

            <div className="rounded-2xl hoyo-accent-pill border p-3.5 space-y-1">
              <span className="text-[#E5B869] font-bold block">Observações & Dicas</span>
              <p className="text-[#EEF1FA] leading-relaxed">{attraction.notes}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 pb-4 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddToPersonalRoute(attraction.id);
              }}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 hoyo-accent-pill border font-extrabold text-xs py-3 px-3 rounded-xl transition hover:border-[#E5B869]/60"
            >
              {canEdit ? (
                <CalendarPlus className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>+ Meu Roteiro</span>
            </button>

            <a
              href={attraction.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 hoyo-accent-btn font-bold text-xs py-3 px-4 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> Google Maps
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {attraction.instagram && (
              <a
                href={`https://instagram.com/${attraction.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#212847] hover:bg-[#2B3359] text-[#EEF1FA] font-bold text-xs py-3 px-4 rounded-xl transition"
              >
                {attraction.instagram}
              </a>
            )}
          </div>
        </div>
      )}
    </HoyoDialog>
  );
}
