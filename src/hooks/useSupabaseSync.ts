import { useCallback, useEffect, useState } from 'react';
import { sbFetch } from '../lib/supabase';
import { packDeviceTokenWithBadge, unpackDeviceToken } from '../lib/utils';
import type {
  AttractionMeta,
  BudgetItem,
  ChecklistItem,
  ItineraryStop,
  PlaceLikeEntry,
  StopVoteEntry,
  TripConfig,
} from '../types';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface UseSupabaseSyncParams {
  config: TripConfig;
  setConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
  attractions: AttractionMeta[];
  setAttractions: React.Dispatch<React.SetStateAction<AttractionMeta[]>>;
  stops: ItineraryStop[];
  setStops: React.Dispatch<React.SetStateAction<ItineraryStop[]>>;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  stopVotes: StopVoteEntry[];
  setStopVotes: React.Dispatch<React.SetStateAction<StopVoteEntry[]>>;
  placeLikes: PlaceLikeEntry[];
  setPlaceLikes: React.Dispatch<React.SetStateAction<PlaceLikeEntry[]>>;
  isAdminAuthenticated: boolean;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export function useSupabaseSync({
  config,
  setConfig,
  attractions,
  setAttractions,
  stops,
  setStops,
  budgetItems,
  setBudgetItems,
  checklist,
  setChecklist,
  stopVotes,
  setStopVotes,
  placeLikes,
  setPlaceLikes,
  isAdminAuthenticated,
  showToast,
}: UseSupabaseSyncParams) {
  const cleanSbUrl = config.supabaseUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
  const cleanSbKey = config.supabaseAnonKey.trim();
  const hasSupabase = Boolean(cleanSbUrl && cleanSbKey);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    hasSupabase ? 'syncing' : 'local'
  );
  const [syncErrorDetail, setSyncErrorDetail] = useState<string>('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const cloudFetch = useCallback(
    (path: string, options: RequestInit = {}) =>
      sbFetch(cleanSbUrl, cleanSbKey, path, options),
    [cleanSbUrl, cleanSbKey]
  );

  const syncFromCloud = useCallback(
    async (silent = true) => {
      if (!hasSupabase) {
        setSyncStatus('local');
        setSyncErrorDetail('');
        return;
      }
      if (!silent) setSyncStatus('syncing');
      try {
        const [votesRows, likesRows, placesRows, sharedRows] = await Promise.all([
          cloudFetch('stop_votes?select=*'),
          cloudFetch('place_likes?select=*'),
          cloudFetch('custom_places?select=*'),
          cloudFetch('trip_shared_state?id=eq.sp2026_main&select=*'),
        ]);

        if (Array.isArray(votesRows)) {
          const mappedVotes: StopVoteEntry[] = votesRows.map(
            (r: {
              id: string;
              stop_id: string;
              voter_name: string;
              choice: 'yes' | 'no';
              device_token?: string;
              updated_at?: string;
            }) => {
              const unpacked = unpackDeviceToken(r.device_token);
              return {
                id: r.id,
                stopId: r.stop_id,
                voterName: r.voter_name,
                avatarBadge: unpacked.avatarBadge,
                choice: r.choice,
                deviceToken: unpacked.deviceToken,
                updatedAt: r.updated_at || new Date().toISOString(),
              };
            }
          );
          const deduped = new Map<string, StopVoteEntry>();
          mappedVotes.forEach((v) => {
            const k = `${v.stopId}::${v.voterName.trim().toLowerCase()}`;
            const prev = deduped.get(k);
            if (!prev || v.updatedAt >= prev.updatedAt) {
              deduped.set(k, v);
            }
          });
          setStopVotes(Array.from(deduped.values()));
        }

        if (Array.isArray(likesRows)) {
          const mappedLikes: PlaceLikeEntry[] = likesRows.map(
            (r: {
              id: string;
              attraction_id: string;
              voter_name: string;
              device_token?: string;
              created_at?: string;
            }) => {
              const unpacked = unpackDeviceToken(r.device_token);
              return {
                id: r.id,
                attractionId: r.attraction_id,
                voterName: r.voter_name,
                avatarBadge: unpacked.avatarBadge,
                deviceToken: unpacked.deviceToken,
                createdAt: r.created_at || new Date().toISOString(),
              };
            }
          );
          const dedupedLikes = new Map<string, PlaceLikeEntry>();
          mappedLikes.forEach((l) => {
            const k = `${l.attractionId}::${l.voterName.trim().toLowerCase()}`;
            dedupedLikes.set(k, l);
          });
          setPlaceLikes(Array.from(dedupedLikes.values()));
        }

        if (Array.isArray(placesRows) && placesRows.length > 0) {
          const cloudCustom: AttractionMeta[] = placesRows
            .map((r: { payload?: AttractionMeta }) => r.payload)
            .filter((p): p is AttractionMeta => Boolean(p && p.id && p.name));

          if (cloudCustom.length > 0) {
            setAttractions((prev) => {
              const byId = new Map(prev.map((a) => [a.id, a]));
              cloudCustom.forEach((item) => byId.set(item.id, item));
              return Array.from(byId.values());
            });
          }
        }

        if (Array.isArray(sharedRows) && sharedRows.length > 0) {
          const shared = sharedRows[0] as {
            airbnb_total_cost?: number | null;
            arrival_window_note?: string | null;
            checklist?: ChecklistItem[];
            budget_items?: BudgetItem[];
            custom_stops?: ItineraryStop[];
          };

          if (Array.isArray(shared.checklist) && shared.checklist.length > 0) {
            setChecklist(shared.checklist);
          }
          if (Array.isArray(shared.budget_items) && shared.budget_items.length > 0) {
            setBudgetItems(shared.budget_items);
          }
          if (Array.isArray(shared.custom_stops) && shared.custom_stops.length > 0) {
            setStops(shared.custom_stops);
          }
          setConfig((prev) => ({
            ...prev,
            airbnbTotalCost:
              shared.airbnb_total_cost !== undefined
                ? shared.airbnb_total_cost === null
                  ? null
                  : Number(shared.airbnb_total_cost)
                : prev.airbnbTotalCost,
            arrivalWindowNote:
              typeof shared.arrival_window_note === 'string' &&
              shared.arrival_window_note.trim()
                ? shared.arrival_window_note
                : prev.arrivalWindowNote,
          }));
        }

        setSyncStatus('synced');
        setSyncErrorDetail('');
        setLastSyncedAt(
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        setSyncStatus('error');
        setSyncErrorDetail(err instanceof Error ? err.message : 'Falha de rede');
      }
    },
    [
      hasSupabase,
      cloudFetch,
      setStopVotes,
      setPlaceLikes,
      setAttractions,
      setChecklist,
      setBudgetItems,
      setStops,
      setConfig,
    ]
  );

  // Sincronização automática ao abrir, ao focar e a cada 8 segundos
  useEffect(() => {
    if (!hasSupabase) {
      setSyncStatus('local');
      return;
    }
    syncFromCloud(false);
    const interval = setInterval(() => {
      syncFromCloud(true);
    }, 8000);
    const onFocus = () => syncFromCloud(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [hasSupabase, syncFromCloud]);

  const pushSharedStateToCloud = useCallback(async () => {
    if (!hasSupabase) return;
    try {
      await cloudFetch('trip_shared_state?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: 'sp2026_main',
          airbnb_total_cost: config.airbnbTotalCost,
          arrival_window_note: config.arrivalWindowNote,
          checklist,
          budget_items: budgetItems,
          custom_stops: stops,
          updated_at: new Date().toISOString(),
        }),
      });
      setSyncStatus('synced');
      setSyncErrorDetail('');
      setLastSyncedAt(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err) {
      setSyncStatus('error');
      setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }, [
    hasSupabase,
    cloudFetch,
    config.airbnbTotalCost,
    config.arrivalWindowNote,
    checklist,
    budgetItems,
    stops,
  ]);

  // Envia automaticamente alterações do organizador para o Supabase
  useEffect(() => {
    if (!isAdminAuthenticated || !hasSupabase) return;
    const timer = setTimeout(() => {
      pushSharedStateToCloud();
    }, 650);
    return () => clearTimeout(timer);
  }, [isAdminAuthenticated, hasSupabase, pushSharedStateToCloud]);

  const pushAllLocalToCloud = async () => {
    if (!hasSupabase) {
      showToast('Preencha SUPABASE_URL e SUPABASE_ANON_KEY primeiro.', 'info');
      return;
    }
    setSyncStatus('syncing');
    try {
      if (stopVotes.length > 0) {
        await cloudFetch('stop_votes?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(
            stopVotes.map((v) => ({
              id: v.id,
              stop_id: v.stopId,
              voter_name: v.voterName,
              choice: v.choice,
              device_token: packDeviceTokenWithBadge(v.deviceToken, v.avatarBadge),
              updated_at: v.updatedAt,
            }))
          ),
        });
      }

      if (placeLikes.length > 0) {
        await cloudFetch('place_likes?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(
            placeLikes.map((l) => ({
              id: l.id,
              attraction_id: l.attractionId,
              voter_name: l.voterName,
              device_token: packDeviceTokenWithBadge(l.deviceToken, l.avatarBadge),
              created_at: l.createdAt,
            }))
          ),
        });
      }

      const customOnly = attractions.filter((a) => a.id.startsWith('place_custom_'));
      if (customOnly.length > 0) {
        await cloudFetch('custom_places?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(
            customOnly.map((p) => ({
              id: p.id,
              payload: p,
              created_at: new Date().toISOString(),
            }))
          ),
        });
      }

      await pushSharedStateToCloud();
      await syncFromCloud(true);
      showToast(
        'Conectado! Agora use o botão "Copiar Link" ou "WhatsApp" para mandar ao grupo.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setSyncStatus('error');
      setSyncErrorDetail(msg);
      showToast(`Erro no Supabase: ${msg}`, 'info');
    }
  };

  return {
    cleanSbUrl,
    cleanSbKey,
    hasSupabase,
    syncStatus,
    setSyncStatus,
    syncErrorDetail,
    setSyncErrorDetail,
    lastSyncedAt,
    cloudFetch,
    syncFromCloud,
    pushAllLocalToCloud,
  };
}
