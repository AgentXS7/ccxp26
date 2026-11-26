import { useMemo, useState } from 'react';
import { Lock, MapPin, Search, Trash2 } from 'lucide-react';
import { handleImgError } from '../../lib/utils';
import type { AttractionMeta } from '../../types';

interface AdminLugaresSectionProps {
  attractions: AttractionMeta[];
  isAdminAuthenticated: boolean;
  onDeletePlaceAsAdmin: (attr: AttractionMeta) => void;
}

export function AdminLugaresSection({
  attractions,
  isAdminAuthenticated,
  onDeletePlaceAsAdmin,
}: AdminLugaresSectionProps) {
  const [query, setQuery] = useState('');

  const activeAttractions = useMemo(
    () => attractions.filter((a) => !a.excludedReason),
    [attractions]
  );

  const filteredAttractions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeAttractions;
    return activeAttractions.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.addedBy && a.addedBy.toLowerCase().includes(q))
    );
  }, [activeAttractions, query]);

  return (
    <div className="rounded-3xl hoyo-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E5B869]" />
            Gerenciar Lugares do Explorar ({activeAttractions.length})
          </h3>
          <p className="text-xs text-[#9BA3C2]">
            Apenas o organizador (PIN) pode excluir lugares do Explorar para todo o grupo.
          </p>
        </div>
      </div>

      {!isAdminAuthenticated && (
        <div className="rounded-2xl hoyo-card-inner p-3.5 text-xs text-[#9BA3C2] flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#E5B869] shrink-0" />
          <span>
            Digite o PIN do organizador no topo desta aba para liberar a exclusão de lugares.
          </span>
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-[#8F97B8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar lugar por nome, bairro, categoria ou quem adicionou..."
          className="w-full hoyo-card-inner rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
        />
      </div>

      <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
        {filteredAttractions.length === 0 ? (
          <p className="text-xs text-[#9BA3C2] text-center py-6">
            Nenhum lugar encontrado com esse filtro.
          </p>
        ) : (
          filteredAttractions.map((attr) => (
            <div
              key={attr.id}
              className="rounded-xl hoyo-card-inner px-3.5 py-2.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={attr.imageUrl}
                  alt={attr.name}
                  onError={handleImgError}
                  className="w-11 h-11 rounded-lg object-cover shrink-0 bg-[#0C0F1D]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">
                    {attr.name}
                  </p>
                  <p className="text-[11px] text-[#9BA3C2] truncate">
                    {attr.category} • {attr.region}
                  </p>
                  {attr.addedBy && (
                    <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#47C5B8]/15 text-[#8AE5DB] border border-[#47C5B8]/30">
                      Adicionado por {attr.addedBy}
                    </span>
                  )}
                </div>
              </div>

              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Excluir "${attr.name}" do Explorar para todo o grupo?`
                      )
                    ) {
                      onDeletePlaceAsAdmin(attr);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#EC6B6B]/18 border border-[#EC6B6B]/45 text-[#FFD0D0] hover:bg-[#EC6B6B]/30 transition shrink-0"
                  title="Excluir lugar do Explorar (Admin)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
