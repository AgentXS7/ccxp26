import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_ATTRACTIONS } from '../data/attractions';
import { sbFetch } from '../lib/supabase';
import { packDeviceTokenWithBadge, slugifyName, unpackDeviceToken } from '../lib/utils';
import type {
  AttractionMeta,
  BudgetItem,
  ChecklistItem,
  GroupMemberId,
  ItineraryStop,
  MemberCloudProfile,
  OfflineQueueOp,
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
  setUserProfiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  memberProfiles: Partial<Record<GroupMemberId, MemberCloudProfile>>;
  setMemberProfiles: React.Dispatch<
    React.SetStateAction<Partial<Record<GroupMemberId, MemberCloudProfile>>>
  >;
  offlineQueue: OfflineQueueOp[];
  setOfflineQueue: React.Dispatch<React.SetStateAction<OfflineQueueOp[]>>;
  removedPlaceIds: string[];
  setRemovedPlaceIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeMemberId: GroupMemberId | null;
  deviceToken: string;
  voterName: string;
  avatarPhoto?: string;
  onRemoteActiveMemberSync?: (profile: MemberCloudProfile) => void;
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
  setUserProfiles,
  memberProfiles,
  setMemberProfiles,
  offlineQueue,
  setOfflineQueue,
  removedPlaceIds,
  setRemovedPlaceIds,
  activeMemberId,
  deviceToken,
  voterName,
  avatarPhoto,
  onRemoteActiveMemberSync,
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

  const offlineQueueRef = useRef(offlineQueue);
  offlineQueueRef.current = offlineQueue;

  const activeMemberIdRef = useRef(activeMemberId);
  activeMemberIdRef.current = activeMemberId;

  const onRemoteActiveMemberSyncRef = useRef(onRemoteActiveMemberSync);
  onRemoteActiveMemberSyncRef.current = onRemoteActiveMemberSync;

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const cloudFetch = useCallback(
    (path: string, options: RequestInit = {}) =>
      sbFetch(cleanSbUrl, cleanSbKey, path, options),
    [cleanSbUrl, cleanSbKey]
  );

  const enqueueOfflineOp = useCallback(
    (op: OfflineQueueOp) => {
      setOfflineQueue((prev) => {
        const filtered = prev.filter((item) => item.key !== op.key);
        return [...filtered, op];
      });
    },
    [setOfflineQueue]
  );

  const executeSingleOp = useCallback(
    async (op: OfflineQueueOp) => {
      switch (op.type) {
        case 'vote_upsert': {
          const v = op.payload;
          await cloudFetch('stop_votes?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
              id: v.id,
              stop_id: v.stopId,
              voter_name: v.voterName,
              choice: v.choice,
              device_token: packDeviceTokenWithBadge(v.deviceToken, v.avatarBadge),
              updated_at: v.updatedAt,
            }),
          });
          return;
        }
        case 'vote_delete': {
          await cloudFetch(`stop_votes?id=eq.${encodeURIComponent(op.payload.id)}`, {
            method: 'DELETE',
          });
          return;
        }
        case 'like_upsert': {
          const l = op.payload;
          await cloudFetch('place_likes?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
              id: l.id,
              attraction_id: l.attractionId,
              voter_name: l.voterName,
              device_token: packDeviceTokenWithBadge(l.deviceToken, l.avatarBadge),
              created_at: l.createdAt,
            }),
          });
          return;
        }
        case 'like_delete': {
          await cloudFetch(`place_likes?id=eq.${encodeURIComponent(op.payload.id)}`, {
            method: 'DELETE',
          });
          return;
        }
        case 'place_upsert': {
          const p = op.payload;
          await cloudFetch('custom_places?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
              id: p.id,
              payload: p,
              created_at: new Date().toISOString(),
            }),
          });
          return;
        }
        case 'member_upsert': {
          const m = op.payload;
          await cloudFetch('custom_places?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
              id: `sys_member_${m.memberId}`,
              payload: m,
              created_at: new Date().toISOString(),
            }),
          });
          return;
        }
      }
    },
    [cloudFetch]
  );

  const flushOfflineQueue = useCallback(async (): Promise<boolean> => {
    const snapshot = [...offlineQueueRef.current];
    if (!hasSupabase || snapshot.length === 0) return true;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return false;
    }

    const succeededKeys = new Set<string>();
    let allOk = true;

    for (const op of snapshot) {
      try {
        await executeSingleOp(op);
        succeededKeys.add(op.key);
      } catch {
        allOk = false;
        break;
      }
    }

    if (succeededKeys.size > 0) {
      setOfflineQueue((prev) => prev.filter((item) => !succeededKeys.has(item.key)));
      if (allOk) {
        showToastRef.current('Alterações feitas offline foram sincronizadas!');
      }
    }

    return allOk;
  }, [hasSupabase, executeSingleOp, setOfflineQueue]);

  const syncFromCloud = useCallback(
    async (silent = true) => {
      if (!hasSupabase) {
        setSyncStatus('local');
        setSyncErrorDetail('');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setSyncStatus('local');
        return;
      }
      if (!silent) setSyncStatus('syncing');

      try {
        // 1. Sempre envia a fila offline ANTES de baixar da nuvem para nunca perder votos/gastos do metrô
        if (offlineQueueRef.current.length > 0) {
          const flushed = await flushOfflineQueue();
          if (!flushed) {
            setSyncStatus('local');
            return;
          }
        }

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

        if (Array.isArray(placesRows)) {
          let nextRemovedIds: string[] = [];
          const cloudProfiles: Record<string, string | null> = {};
          const cloudMembers: Partial<Record<GroupMemberId, MemberCloudProfile>> = {};
          const cloudCustom: AttractionMeta[] = [];

          placesRows.forEach((r: { id?: string; payload?: Record<string, unknown> }) => {
            const id = String(r.id || '');
            const payload = r.payload;
            if (!payload) return;

            if (id === 'sys_removed_places' && payload.kind === 'removed_places') {
              if (Array.isArray(payload.ids)) {
                nextRemovedIds = payload.ids.map(String);
              }
              return;
            }

            if (id.startsWith('sys_member_') && payload.kind === 'member_profile') {
              const mp = payload as unknown as MemberCloudProfile;
              if (mp.memberId) {
                cloudMembers[mp.memberId] = mp;
                const nameKey = mp.name.trim().toLowerCase();
                cloudProfiles[nameKey] = mp.avatarPhoto || null;
              }
              return;
            }

            if (id.startsWith('sys_profile_') && payload.kind === 'user_profile') {
              const pName =
                typeof payload.voterName === 'string'
                  ? payload.voterName.trim().toLowerCase()
                  : '';
              if (pName && cloudProfiles[pName] === undefined) {
                cloudProfiles[pName] =
                  typeof payload.avatarPhoto === 'string' && payload.avatarPhoto
                    ? payload.avatarPhoto
                    : null;
              }
              return;
            }

            if (!id.startsWith('sys_')) {
              const attr = payload as unknown as AttractionMeta;
              if (attr && attr.id && attr.name) {
                cloudCustom.push(attr);
              }
            }
          });

          setRemovedPlaceIds(nextRemovedIds);
          const removedSet = new Set(nextRemovedIds);

          if (Object.keys(cloudMembers).length > 0) {
            setMemberProfiles((prev) => ({ ...prev, ...cloudMembers }));
            const currentId = activeMemberIdRef.current;
            if (currentId && cloudMembers[currentId]) {
              const remoteProfile = cloudMembers[currentId]!;
              if (remoteProfile.trustedDevices.includes(deviceToken)) {
                onRemoteActiveMemberSyncRef.current?.(remoteProfile);
              }
            }
          }

          if (Object.keys(cloudProfiles).length > 0) {
            setUserProfiles((prev) => {
              const next = { ...prev };
              Object.entries(cloudProfiles).forEach(([k, val]) => {
                if (val) next[k] = val;
                else delete next[k];
              });
              return next;
            });
          }

          setAttractions(() => {
            const baseList = INITIAL_ATTRACTIONS.filter((a) => !removedSet.has(a.id));
            const byId = new Map<string, AttractionMeta>();
            cloudCustom
              .filter((c) => !removedSet.has(c.id))
              .forEach((item) => byId.set(item.id, item));
            baseList.forEach((item) => {
              if (!byId.has(item.id)) byId.set(item.id, item);
            });
            return Array.from(byId.values());
          });
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
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          setSyncStatus('local');
        } else {
          setSyncStatus('error');
          setSyncErrorDetail(err instanceof Error ? err.message : 'Falha de rede');
        }
      }
    },
    [
      hasSupabase,
      cloudFetch,
      flushOfflineQueue,
      deviceToken,
      setStopVotes,
      setPlaceLikes,
      setAttractions,
      setChecklist,
      setBudgetItems,
      setStops,
      setConfig,
      setUserProfiles,
      setMemberProfiles,
      setRemovedPlaceIds,
    ]
  );

  const upsertMemberProfile = useCallback(
    async (profile: MemberCloudProfile) => {
      setMemberProfiles((prev) => ({ ...prev, [profile.memberId]: profile }));
      setUserProfiles((prev) => {
        const next = { ...prev };
        const key = profile.name.trim().toLowerCase();
        if (profile.avatarPhoto) next[key] = profile.avatarPhoto;
        else delete next[key];
        return next;
      });

      if (!hasSupabase) return;

      const queueOp: OfflineQueueOp = {
        key: `member:${profile.memberId}`,
        type: 'member_upsert',
        payload: profile,
        createdAt: new Date().toISOString(),
      };

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueueOfflineOp(queueOp);
        setSyncStatus('local');
        return;
      }

      try {
        await executeSingleOp(queueOp);
        setSyncStatus('synced');
        setSyncErrorDetail('');
      } catch {
        enqueueOfflineOp(queueOp);
        setSyncStatus('local');
      }
    },
    [hasSupabase, executeSingleOp, enqueueOfflineOp, setMemberProfiles, setUserProfiles]
  );

  const unlockMemberDevicesAsAdmin = useCallback(
    async (memberId: GroupMemberId) => {
      const existing = memberProfiles[memberId];
      if (!existing) return;
      const updated: MemberCloudProfile = {
        ...existing,
        trustedDevices: [],
        updatedAt: new Date().toISOString(),
      };
      await upsertMemberProfile(updated);
      showToastRef.current(
        `Aparelho de ${existing.name} liberado! Dados, foto e gastos foram preservados.`
      );
    },
    [memberProfiles, upsertMemberProfile]
  );

  const syncUserProfileToCloud = useCallback(
    async (personName: string, photo?: string) => {
      const cleanName = personName.trim();
      if (!cleanName) return;
      const key = cleanName.toLowerCase();

      setUserProfiles((prev) => {
        const next = { ...prev };
        if (photo) next[key] = photo;
        else delete next[key];
        return next;
      });

      if (!hasSupabase) return;
      try {
        await cloudFetch('custom_places?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            id: `sys_profile_${slugifyName(cleanName)}`,
            payload: {
              kind: 'user_profile',
              voterName: cleanName,
              avatarPhoto: photo || null,
              updatedAt: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          }),
        });
      } catch {
        // Falha silenciosa
      }
    },
    [hasSupabase, cloudFetch, setUserProfiles]
  );

  const deletePlaceAsAdmin = useCallback(
    async (attr: AttractionMeta) => {
      setAttractions((prev) => prev.filter((a) => a.id !== attr.id));

      if (attr.id.startsWith('place_custom_')) {
        if (hasSupabase) {
          try {
            await cloudFetch(`custom_places?id=eq.${encodeURIComponent(attr.id)}`, {
              method: 'DELETE',
            });
            setSyncStatus('synced');
            setSyncErrorDetail('');
          } catch (err) {
            setSyncStatus('error');
            setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao remover lugar');
          }
        }
        return;
      }

      const nextRemoved = Array.from(new Set([...removedPlaceIds, attr.id]));
      setRemovedPlaceIds(nextRemoved);
      if (hasSupabase) {
        try {
          await cloudFetch('custom_places?on_conflict=id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: JSON.stringify({
              id: 'sys_removed_places',
              payload: {
                kind: 'removed_places',
                ids: nextRemoved,
                updatedAt: new Date().toISOString(),
              },
              created_at: new Date().toISOString(),
            }),
          });
          setSyncStatus('synced');
          setSyncErrorDetail('');
        } catch (err) {
          setSyncStatus('error');
          setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao remover lugar');
        }
      }
    },
    [hasSupabase, cloudFetch, removedPlaceIds, setAttractions, setRemovedPlaceIds]
  );

  // Sincronização automática ao abrir, ao focar, ao voltar sinal ('online') e a cada 8 segundos
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
    const onOnline = () => syncFromCloud(false);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
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
      await flushOfflineQueue();

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
      if (voterName.trim() && avatarPhoto) {
        await syncUserProfileToCloud(voterName, avatarPhoto);
      }
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
    pendingQueueCount: offlineQueue.length,
    cloudFetch,
    syncFromCloud,
    pushAllLocalToCloud,
    enqueueOfflineOp,
    upsertMemberProfile,
    unlockMemberDevicesAsAdmin,
    syncUserProfileToCloud,
    deletePlaceAsAdmin,
  };
}
