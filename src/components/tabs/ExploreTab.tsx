import type React from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { formatBRL, handleImgError } from '../../lib/utils';
import { AnimeHeartIcon, CornerOrnaments, StarSparkleIcon } from '../ui/AnimeDecor';
import { PixelGhostSticker } from '../ui/GameStickers';
import { UserAvatar } from '../ui/UserAvatar';
import type { AttractionMeta, PlaceLikeEntry } from '../../types';

interface ExploreTabProps {
  exploreQuery: string;
  setExploreQuery: (q: string) => void;
  exploreRegion: string;
  setExploreRegion: (r: string) => void;
  exploreCategory: string;
  setExploreCategory: (c: string) => void;
  exploreOnlyExtras: boolean;
  setExploreOnlyExtras: React.Dispatch<React.SetStateAction<boolean>>;
  exploreOnlyLiked: boolean;
  setExploreOnlyLiked: React.Dispatch<React.SetStateAction<boolean>>;
  regionsList: string[];
  categoriesList: string[];
  filteredAttractions: AttractionMeta[];
  excludedAttractions: AttractionMeta[];
  placeLikes: PlaceLikeEntry[];
  voterName: string;
  avatarBadge: string;
  avatarPhoto?: string;
  peoplePerCar: number;
  compactCards: boolean;
  onOpenAddPlace: () => void;
  onTogglePlaceLike: (e: React.MouseEvent, attractionId: string) => void;
  onSelectAttraction: (attr: AttractionMeta) => void;
}

export function ExploreTab({
  exploreQuery,
  setExploreQuery,
  exploreRegion,
  setExploreRegion,
  exploreCategory,
  setExploreCategory,
  exploreOnlyExtras,
  setExploreOnlyExtras,
  exploreOnlyLiked,
  setExploreOnlyLiked,
  regionsList,
  categoriesList,
  filteredAttractions,
  excludedAttractions,
  placeLikes,
  voterName,
  avatarBadge,
  avatarPhoto,
  peoplePerCar,
  compactCards,
  onOpenAddPlace,
  onTogglePlaceLike,
  onSelectAttraction,
}: ExploreTabProps) {
  const normalizedMe = voterName.trim().toLowerCase();
  return (
    <div className="space-y-5">
      {/* Cabeçalho & Filtros */}
      <div className="relative rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top p-5 space-y-4">
        <CornerOrnaments />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <StarSparkleIcon className="w-4 h-4 text-[#E5B869]" />
              Explorar Locais & Favoritos do Grupo
            </h2>
            <p className="text-xs text-[#9BA3C2] mt-0.5">
              Dê{' '}
              <strong className="inline-flex items-center gap-1 text-[#F7A3A3]">
                <AnimeHeartIcon className="w-3.5 h-3.5" /> coração
              </strong>{' '}
              nos seus lugares preferidos (aparece quem curtiu!) ou adicione novos locais para o grupo ver.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddPlace}
              className="inline-flex items-center gap-1.5 hoyo-accent-btn text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4" /> Adicionar Lugar
            </button>

            <button
              type="button"
              onClick={() => setExploreOnlyLiked((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                exploreOnlyLiked
                  ? 'bg-[#EC6B6B]/20 border-[#EC6B6B]/55 text-[#FFD0D0]'
                  : 'hoyo-card-inner text-[#CBD2EC] hover:border-[#EC6B6B]/40'
              }`}
            >
              <AnimeHeartIcon
                filled={exploreOnlyLiked}
                className="w-3.5 h-3.5"
              />
              Favoritos ({new Set(placeLikes.map((l) => l.attractionId)).size})
            </button>

            <button
              type="button"
              onClick={() => setExploreOnlyExtras((v) => !v)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                exploreOnlyExtras
                  ? 'bg-[#E5B869]/20 border-[#E5B869]/45 text-[#F6D794]'
                  : 'hoyo-card-inner text-[#CBD2EC] hover:border-[#E5B869]/35'
              }`}
            >
              {exploreOnlyExtras ? 'Só Extras' : 'Extras / Dia Livre'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#8F97B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={exploreQuery}
              onChange={(e) => setExploreQuery(e.target.value)}
              placeholder="Buscar por nome, bairro, comida, museu..."
              className="w-full hoyo-card-inner rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
            />
          </div>

          <select
            value={exploreRegion}
            onChange={(e) => setExploreRegion(e.target.value)}
            className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
          >
            {regionsList.map((reg) => (
              <option key={reg} value={reg} className="bg-[#14192D]">
                {reg === 'Todas' ? 'Todas as Regiões' : reg}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setExploreCategory(cat)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                exploreCategory === cat
                  ? 'hoyo-accent-btn'
                  : 'hoyo-card-inner text-[#9BA3C2] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Atrações */}
      {filteredAttractions.length === 0 ? (
        <div className="rounded-2xl hoyo-card p-8 text-center space-y-2">
          <PixelGhostSticker className="w-12 h-12 mx-auto animate-sticker-float" />
          <p className="text-sm font-semibold text-[#CBD2EC]">
            Nenhum local encontrado com esses filtros. Até o fantasminha procurou!
          </p>
          <button
            type="button"
            onClick={() => {
              setExploreQuery('');
              setExploreRegion('Todas');
              setExploreCategory('Todas');
              setExploreOnlyExtras(false);
              setExploreOnlyLiked(false);
            }}
            className="text-xs font-bold text-[#8CA0FF] hover:text-white"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAttractions.map((attr) => {
            const likesForPlace = placeLikes.filter((l) => l.attractionId === attr.id);
            const isLikedByMe = voterName.trim()
              ? likesForPlace.some(
                  (l) => l.voterName.trim().toLowerCase() === voterName.trim().toLowerCase()
                )
              : false;

            return (
              <div
                key={attr.id}
                onClick={() => onSelectAttraction(attr)}
                className="cursor-pointer rounded-2xl hoyo-card hover:border-[#E5B869]/50 overflow-hidden transition flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`relative ${compactCards ? 'h-28' : 'h-40'} w-full bg-[#0C0F1D]`}
                  >
                    <img
                      src={attr.imageUrl}
                      alt={attr.name}
                      onError={handleImgError}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14192D] via-[#0C0F1D]/25 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold bg-[#0C0F1D]/82 backdrop-blur-md text-[#EEF1FA] px-2.5 py-1 rounded-full border border-[#8596D6]/30 truncate">
                        {attr.region}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                            attr.inOfficialRoute
                              ? 'bg-[#0E2424]/88 text-[#8AE5DB] border border-[#47C5B8]/40'
                              : 'bg-[#261D0D]/88 text-[#F6D794] border border-[#E5B869]/45'
                          }`}
                        >
                          {attr.inOfficialRoute ? 'No Roteiro' : 'Extra / Livre'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => onTogglePlaceLike(e, attr.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-extrabold transition active:scale-95 ${
                            isLikedByMe
                              ? 'bg-[#EC6B6B] border-[#FFA8A8] text-white shadow-lg'
                              : 'bg-[#0C0F1D]/85 border-[#8596D6]/35 text-[#EEF1FA] hover:border-[#EC6B6B]/60'
                          }`}
                          title="Curtir lugar preferido"
                        >
                          <AnimeHeartIcon
                            filled={isLikedByMe}
                            className="w-4 h-4"
                          />
                          <span>{likesForPlace.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pb-2">
                    <h3 className="text-base font-bold text-white">{attr.name}</h3>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      <span className="bg-[#212847] text-[#CBD2EC] px-2 py-0.5 rounded-md">
                        {attr.category}
                      </span>
                      {attr.addedBy && (
                        <span className="hoyo-accent-pill px-2 py-0.5 rounded-md font-medium">
                          Sugestão de {attr.addedBy}
                        </span>
                      )}
                      {attr.rating && (
                        <span className="inline-flex items-center gap-1 text-[#F6D794] font-semibold">
                          <Star className="w-3.5 h-3.5 fill-[#E5B869] text-[#E5B869]" />
                          {attr.rating.toFixed(1)} ({attr.reviewsCount?.toLocaleString('pt-BR')})
                        </span>
                      )}
                      {attr.closedDays !== 'Não fecha' && (
                        <span className="text-[#F7A3A3] font-medium">• {attr.closedDays}</span>
                      )}
                    </div>

                    <p className="text-xs text-[#CBD2EC] mt-2.5 line-clamp-2 leading-relaxed">
                      {attr.notes}
                    </p>

                    {likesForPlace.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[11px]">
                        <AnimeHeartIcon className="w-3.5 h-3.5" />
                        {likesForPlace.map((like) => {
                          const isMe =
                            Boolean(normalizedMe) &&
                            like.voterName.trim().toLowerCase() === normalizedMe;
                          const badge = isMe ? avatarBadge : like.avatarBadge;
                          const photo = isMe ? avatarPhoto : undefined;
                          return (
                            <span
                              key={like.id}
                              className="inline-flex items-center gap-1 bg-[#EC6B6B]/15 text-[#FFD0D0] border border-[#EC6B6B]/25 px-2 py-0.5 rounded-full font-medium"
                            >
                              {(photo || badge) && (
                                <UserAvatar
                                  photo={photo}
                                  badge={badge || ''}
                                  sizeClass="w-4 h-4"
                                  textClass="text-[11px]"
                                />
                              )}
                              <span>{like.voterName}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-[#8596D6]/15 flex items-center justify-between text-xs text-[#9BA3C2]">
                  <span>
                    {attr.distanceKm > 0
                      ? `${attr.distanceKm} km da base • Uber ~${formatBRL(
                          attr.uberAvg / Math.max(1, peoplePerCar)
                        )}/p`
                      : 'São Paulo • Clique para detalhes'}
                  </span>
                  <span className="text-[#8CA0FF] font-semibold">Ficha →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transparência: Locais Excluídos do Roteiro */}
      {excludedAttractions.length > 0 && (
        <div className="rounded-3xl hoyo-card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BA3C2]">
            Locais Fora do Roteiro Oficial (Motivo Documentado)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {excludedAttractions.map((ex) => (
              <div
                key={ex.id}
                className="rounded-2xl hoyo-card-inner p-3.5 space-y-1"
              >
                <p className="text-xs font-bold text-[#EEF1FA]">{ex.name}</p>
                <p className="text-xs text-[#9BA3C2] leading-relaxed">{ex.excludedReason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
