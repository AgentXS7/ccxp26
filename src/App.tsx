import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { INITIAL_ATTRACTIONS } from './data/attractions';
import { INITIAL_BUDGET_ITEMS } from './data/budget';
import { INITIAL_CHECKLIST } from './data/checklist';
import { HERO_IMAGES, INITIAL_CONFIG } from './data/config';
import { INITIAL_DAYS } from './data/days';
import { findMemberByNameOrId, generateTransferCode, getMemberName } from './data/members';
import { INITIAL_STOPS } from './data/stops';
import { INITIAL_TRANSPORT_LEGS } from './data/transport';

import { usePersistedState } from './hooks/usePersistedState';
import { usePwa } from './hooks/usePwa';
import { useSupabaseSync } from './hooks/useSupabaseSync';

import {
  compareStopsChronologically,
  validateAndNormalizeTimeInput,
} from './lib/scheduleUtils';
import { buildShareableUrl, isLocalOrPreviewUrl } from './lib/sharing';
import { STORAGE_KEYS } from './lib/storage';
import { readInitialSupabaseConfig } from './lib/supabase';
import {
  copyTextFallback,
  getOrCreateDeviceToken,
  getSaoPauloTodayIso,
  packDeviceTokenWithBadge,
  slugifyName,
} from './lib/utils';

import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { Toast } from './components/layout/Toast';
import { FloatingStickerLayer, MascotCorner } from './components/ui/FunLayer';

import { AddPersonalStopModal } from './components/modals/AddPersonalStopModal';
import { AddPlaceModal } from './components/modals/AddPlaceModal';
import { AttractionDrawer } from './components/modals/AttractionDrawer';
import { InstallModal } from './components/modals/InstallModal';
import { ShareModal } from './components/modals/ShareModal';
import { StopInvitesModal } from './components/modals/StopInvitesModal';
import { ThemePersonalizeModal } from './components/modals/ThemePersonalizeModal';
import { VoterNameModal } from './components/modals/VoterNameModal';

import { AdminTab, type AdminSectionKey } from './components/tabs/AdminTab';
import { CostsTab } from './components/tabs/CostsTab';
import { ExploreTab } from './components/tabs/ExploreTab';
import { HomeTab } from './components/tabs/HomeTab';
import { ItineraryTab } from './components/tabs/ItineraryTab';

import type {
  AttractionMeta,
  BudgetCategory,
  BudgetItem,
  ChecklistItem,
  GroupMemberId,
  ItineraryDay,
  ItineraryStop,
  MemberCloudProfile,
  OfflineQueueOp,
  PersonalBudgetState,
  PersonalItineraryState,
  PlaceLikeEntry,
  RsvpEntry,
  SharedStopInvite,
  ShiftType,
  StopVoteEntry,
  TabKey,
  TransportLeg,
  TripConfig,
  UserPreferences,
} from './types';

const CATEGORIES_LIST = [
  'Todas',
  'Restaurante',
  'Bar e noite',
  'Parque e lazer',
  'Museu e cultura',
  'Shopping',
  'Cinema',
  'Passeio',
  'Doces e café',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');

  // Toast customizado
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3400);
  };

  // Preferências pessoais no celular (Tema HoYoLAB, ícone, layout compacto)
  const [userPrefs, setUserPrefs] = usePersistedState<UserPreferences>(
    STORAGE_KEYS.USER_PREFS,
    { themePreset: 'hoyolab', compactCards: false, avatarBadge: '🧭' }
  );
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (userPrefs.themePreset === 'hoyolab') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = userPrefs.themePreset;
    }
  }, [userPrefs.themePreset]);

  // PWA (iOS + Android)
  const {
    appIconUrl,
    deferredInstallPrompt,
    installModalOpen,
    setInstallModalOpen,
    isStandaloneApp,
    handleInstallAppClick,
    triggerDeferredPrompt,
  } = usePwa(showToast);

  // Estados persistidos
  const [config, setConfig] = usePersistedState<TripConfig>(STORAGE_KEYS.CONFIG, () => {
    const envSb = readInitialSupabaseConfig();
    return {
      ...INITIAL_CONFIG,
      supabaseUrl: envSb.url,
      supabaseAnonKey: envSb.key,
    };
  });

  // Garante que a conexão com o Supabase venha exclusivamente das variáveis de ambiente do projeto
  useEffect(() => {
    const envSb = readInitialSupabaseConfig();
    setConfig((prev) =>
      prev.supabaseUrl === envSb.url && prev.supabaseAnonKey === envSb.key
        ? prev
        : { ...prev, supabaseUrl: envSb.url, supabaseAnonKey: envSb.key }
    );
  }, [setConfig]);

  const [days] = usePersistedState<ItineraryDay[]>(STORAGE_KEYS.DAYS, INITIAL_DAYS);
  const [attractions, setAttractions] = usePersistedState<AttractionMeta[]>(
    STORAGE_KEYS.ATTRACTIONS,
    INITIAL_ATTRACTIONS
  );
  const [stops, setStops] = usePersistedState<ItineraryStop[]>(
    STORAGE_KEYS.STOPS,
    INITIAL_STOPS
  );
  const [budgetItems, setBudgetItems] = usePersistedState<BudgetItem[]>(
    STORAGE_KEYS.BUDGET,
    INITIAL_BUDGET_ITEMS
  );
  const [transportLegs, setTransportLegs] = usePersistedState<TransportLeg[]>(
    STORAGE_KEYS.TRANSPORT,
    INITIAL_TRANSPORT_LEGS
  );
  const [checklist, setChecklist] = usePersistedState<ChecklistItem[]>(
    STORAGE_KEYS.CHECKLIST,
    INITIAL_CHECKLIST
  );
  const [rsvps] = usePersistedState<RsvpEntry[]>(STORAGE_KEYS.RSVPS, []);
  const [voterName, setVoterName] = usePersistedState<string>(
    STORAGE_KEYS.VOTER_NAME,
    '',
    true
  );
  const [stopVotes, setStopVotes] = usePersistedState<StopVoteEntry[]>(
    STORAGE_KEYS.STOP_VOTES,
    []
  );
  const [placeLikes, setPlaceLikes] = usePersistedState<PlaceLikeEntry[]>(
    STORAGE_KEYS.PLACE_LIKES,
    []
  );
  const [userProfiles, setUserProfiles] = usePersistedState<Record<string, string>>(
    STORAGE_KEYS.USER_PROFILES,
    {}
  );
  const [memberProfiles, setMemberProfiles] = usePersistedState<
    Partial<Record<GroupMemberId, MemberCloudProfile>>
  >(STORAGE_KEYS.MEMBER_PROFILES, {});
  const [offlineQueue, setOfflineQueue] = usePersistedState<OfflineQueueOp[]>(
    STORAGE_KEYS.OFFLINE_QUEUE,
    []
  );
  const [removedPlaceIds, setRemovedPlaceIds] = usePersistedState<string[]>(
    STORAGE_KEYS.REMOVED_PLACES,
    []
  );
  const [personalItinerary, setPersonalItinerary] = usePersistedState<PersonalItineraryState>(
    STORAGE_KEYS.PERSONAL_ITINERARY,
    { hiddenStopIds: [], addedStops: [] }
  );
  const [stopInvites, setStopInvites] = usePersistedState<SharedStopInvite[]>(
    STORAGE_KEYS.STOP_INVITES,
    []
  );
  const [invitesModalOpen, setInvitesModalOpen] = useState(false);

  const deviceToken = useMemo(() => getOrCreateDeviceToken(), []);

  // Identifica o membro oficial (Max, Allan, Dino, Leandro) apenas se o aparelho estiver autorizado
  const activeMemberSpec = useMemo(
    () => findMemberByNameOrId(voterName),
    [voterName]
  );

  const activeMemberId: GroupMemberId | null = useMemo(() => {
    if (!activeMemberSpec) return null;
    const cloud = memberProfiles[activeMemberSpec.id];
    if (cloud && !cloud.trustedDevices.includes(deviceToken)) {
      return null;
    }
    return activeMemberSpec.id;
  }, [activeMemberSpec, memberProfiles, deviceToken]);

  const effectiveVoterName = activeMemberId ? getMemberName(activeMemberId) : '';

  // Área Administrativa
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSectionKey>('reservas');

  const isHydratingFromCloudRef = useRef(false);
  const lastSyncedMemberTimestampRef = useRef<string>('');

  const hydrateMemberLocalState = useCallback(
    (profile: MemberCloudProfile) => {
      isHydratingFromCloudRef.current = true;
      lastSyncedMemberTimestampRef.current = profile.updatedAt;
      setUserPrefs((prev) => ({
        ...prev,
        avatarPhoto: profile.avatarPhoto || undefined,
        themePreset: profile.themePreset || prev.themePreset,
      }));
      if (profile.personalBudget) {
        setPersonalBudget(profile.personalBudget);
      }
      if (profile.personalItinerary) {
        setPersonalItinerary(profile.personalItinerary);
      }
      window.setTimeout(() => {
        isHydratingFromCloudRef.current = false;
      }, 100);
    },
    [setUserPrefs, setPersonalItinerary]
  );

  const handleRemoteActiveMemberSync = useCallback(
    (remoteProfile: MemberCloudProfile) => {
      if (
        lastSyncedMemberTimestampRef.current &&
        remoteProfile.updatedAt <= lastSyncedMemberTimestampRef.current
      ) {
        return;
      }
      hydrateMemberLocalState(remoteProfile);
    },
    [hydrateMemberLocalState]
  );

  // Sincronização em nuvem (Supabase) + Fila Offline
  const {
    cleanSbUrl,
    cleanSbKey,
    hasSupabase,
    syncStatus,
    setSyncStatus,
    syncErrorDetail,
    setSyncErrorDetail,
    lastSyncedAt,
    pendingQueueCount,
    cloudFetch,
    syncFromCloud,
    enqueueOfflineOp,
    upsertMemberProfile,
    unlockMemberDevicesAsAdmin,
    upsertStopInvite,
    deleteStopInvite,
    deletePlaceAsAdmin,
  } = useSupabaseSync({
    config,
    setConfig,
    attractions,
    setAttractions,
    stops,
    setStops,
    budgetItems,
    setBudgetItems,
    transportLegs,
    setTransportLegs,
    checklist,
    setChecklist,
    stopVotes,
    setStopVotes,
    placeLikes,
    setPlaceLikes,
    setUserProfiles,
    memberProfiles,
    setMemberProfiles,
    setStopInvites,
    offlineQueue,
    setOfflineQueue,
    removedPlaceIds,
    setRemovedPlaceIds,
    activeMemberId,
    deviceToken,
    voterName: effectiveVoterName,
    avatarPhoto: userPrefs.avatarPhoto,
    onRemoteActiveMemberSync: handleRemoteActiveMemberSync,
    isAdminAuthenticated,
    showToast,
  });

  const isTrustedMember = useMemo(() => {
    if (!activeMemberId) return false;
    const cloud = memberProfiles[activeMemberId];
    if (hasSupabase) {
      return Boolean(cloud && cloud.trustedDevices.includes(deviceToken));
    }
    return true;
  }, [activeMemberId, memberProfiles, deviceToken, hasSupabase]);

  const canEdit = isTrustedMember || isAdminAuthenticated;

  useEffect(() => {
    if (!activeMemberSpec) return;
    const cloud = memberProfiles[activeMemberSpec.id];
    if (cloud && !cloud.trustedDevices.includes(deviceToken)) {
      setVoterName('');
      showToast(
        `Acesso de ${activeMemberSpec.name} neste aparelho foi desconectado.`,
        'info'
      );
    }
  }, [activeMemberSpec, memberProfiles, deviceToken, setVoterName]);

  const daysUntilTrip = useMemo(() => {
    const tripStart = new Date('2026-12-03T00:00:00-03:00').getTime();
    const diff = Math.ceil((tripStart - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, []);

  // Votação & Curtidas
  const [voterPromptModal, setVoterPromptModal] = useState<{
    open: boolean;
    pendingStopId: string | null;
    pendingChoice: 'yes' | 'no' | null;
    pendingLikeAttractionId: string | null;
  }>({
    open: false,
    pendingStopId: null,
    pendingChoice: null,
    pendingLikeAttractionId: null,
  });

  const applyStopVote = (stopId: string, choice: 'yes' | 'no', personName: string) => {
    const cleanName = personName.trim();
    if (!cleanName) return;

    const existing = stopVotes.find(
      (v) =>
        v.stopId === stopId &&
        v.voterName.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (existing && existing.choice === choice) {
      setStopVotes((prev) => prev.filter((v) => v.id !== existing.id));
      if (hasSupabase) {
        const offlineOp: OfflineQueueOp = {
          key: `vote:${stopId}:${slugifyName(cleanName)}`,
          type: 'vote_delete',
          payload: { id: existing.id },
          createdAt: new Date().toISOString(),
        };
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          enqueueOfflineOp(offlineOp);
          setSyncStatus('local');
          showToast('Voto removido no celular — será sincronizado quando voltar a internet.', 'info');
          return;
        }
        cloudFetch(`stop_votes?id=eq.${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
        })
          .then(() => {
            setSyncStatus('synced');
            setSyncErrorDetail('');
          })
          .catch(() => {
            enqueueOfflineOp(offlineOp);
            setSyncStatus('local');
            showToast('Sem sinal agora — alteração salva na fila para enviar depois.', 'info');
          });
      }
      return;
    }

    const nextEntry: StopVoteEntry = {
      id: existing ? existing.id : `vote_${stopId}_${slugifyName(cleanName)}`,
      stopId,
      voterName: cleanName,
      avatarBadge: userPrefs.avatarBadge,
      choice,
      deviceToken,
      updatedAt: new Date().toISOString(),
    };

    setStopVotes((prev) => {
      if (existing) {
        return prev.map((v) => (v.id === existing.id ? nextEntry : v));
      }
      return [...prev, nextEntry];
    });

    if (hasSupabase) {
      const offlineOp: OfflineQueueOp = {
        key: `vote:${stopId}:${slugifyName(cleanName)}`,
        type: 'vote_upsert',
        payload: nextEntry,
        createdAt: nextEntry.updatedAt,
      };
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueueOfflineOp(offlineOp);
        setSyncStatus('local');
        showToast('Voto salvo no metrô/offline! Será enviado quando voltar o sinal.', 'info');
        return;
      }
      cloudFetch('stop_votes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: nextEntry.id,
          stop_id: nextEntry.stopId,
          voter_name: nextEntry.voterName,
          choice: nextEntry.choice,
          device_token: packDeviceTokenWithBadge(nextEntry.deviceToken, userPrefs.avatarBadge),
          updated_at: nextEntry.updatedAt,
        }),
      })
        .then(() => {
          setSyncStatus('synced');
          setSyncErrorDetail('');
        })
        .catch(() => {
          enqueueOfflineOp(offlineOp);
          setSyncStatus('local');
          showToast('Sem sinal agora — voto salvo na fila e será enviado automático!', 'info');
        });
    }
  };

  const applyPlaceLike = (attractionId: string, personName: string) => {
    const cleanName = personName.trim();
    if (!cleanName) return;

    const existing = placeLikes.find(
      (l) =>
        l.attractionId === attractionId &&
        l.voterName.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      setPlaceLikes((prev) => prev.filter((l) => l.id !== existing.id));
      if (hasSupabase) {
        const offlineOp: OfflineQueueOp = {
          key: `like:${attractionId}:${slugifyName(cleanName)}`,
          type: 'like_delete',
          payload: { id: existing.id },
          createdAt: new Date().toISOString(),
        };
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          enqueueOfflineOp(offlineOp);
          setSyncStatus('local');
          showToast('Curtida removida offline — sincroniza assim que voltar o sinal.', 'info');
          return;
        }
        cloudFetch(`place_likes?id=eq.${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
        })
          .then(() => {
            setSyncStatus('synced');
            setSyncErrorDetail('');
          })
          .catch(() => {
            enqueueOfflineOp(offlineOp);
            setSyncStatus('local');
          });
      }
      return;
    }

    const nextLike: PlaceLikeEntry = {
      id: `like_${attractionId}_${slugifyName(cleanName)}`,
      attractionId,
      voterName: cleanName,
      avatarBadge: userPrefs.avatarBadge,
      deviceToken,
      createdAt: new Date().toISOString(),
    };

    setPlaceLikes((prev) => [...prev, nextLike]);

    if (hasSupabase) {
      const offlineOp: OfflineQueueOp = {
        key: `like:${attractionId}:${slugifyName(cleanName)}`,
        type: 'like_upsert',
        payload: nextLike,
        createdAt: nextLike.createdAt,
      };
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueueOfflineOp(offlineOp);
        setSyncStatus('local');
        showToast('Favorito salvo offline! Será enviado quando voltar a internet.', 'info');
        return;
      }
      cloudFetch('place_likes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: nextLike.id,
          attraction_id: nextLike.attractionId,
          voter_name: nextLike.voterName,
          device_token: packDeviceTokenWithBadge(nextLike.deviceToken, userPrefs.avatarBadge),
          created_at: nextLike.createdAt,
        }),
      })
        .then(() => {
          setSyncStatus('synced');
          setSyncErrorDetail('');
        })
        .catch(() => {
          enqueueOfflineOp(offlineOp);
          setSyncStatus('local');
          showToast('Sem sinal agora — favorito salvo na fila para enviar depois!', 'info');
        });
    }
  };

  const handleVoteClick = (
    e: React.MouseEvent,
    stopId: string,
    choice: 'yes' | 'no'
  ) => {
    e.stopPropagation();
    if (!isTrustedMember || !effectiveVoterName) {
      setVoterPromptModal({
        open: true,
        pendingStopId: stopId,
        pendingChoice: choice,
        pendingLikeAttractionId: null,
      });
      return;
    }
    applyStopVote(stopId, choice, effectiveVoterName);
  };

  const handleTogglePlaceLike = (e: React.MouseEvent, attractionId: string) => {
    e.stopPropagation();
    if (!isTrustedMember || !effectiveVoterName) {
      setVoterPromptModal({
        open: true,
        pendingStopId: null,
        pendingChoice: null,
        pendingLikeAttractionId: attractionId,
      });
      return;
    }
    applyPlaceLike(attractionId, effectiveVoterName);
  };

  const completePendingInteraction = (memberName: string) => {
    if (voterPromptModal.pendingStopId && voterPromptModal.pendingChoice) {
      applyStopVote(
        voterPromptModal.pendingStopId,
        voterPromptModal.pendingChoice,
        memberName
      );
    }
    if (voterPromptModal.pendingLikeAttractionId) {
      applyPlaceLike(voterPromptModal.pendingLikeAttractionId, memberName);
    }
    setVoterPromptModal({
      open: false,
      pendingStopId: null,
      pendingChoice: null,
      pendingLikeAttractionId: null,
    });
  };

  const handleSelectFreeMember = (memberId: GroupMemberId) => {
    const memberName = getMemberName(memberId);
    const existing = memberProfiles[memberId];
    const now = new Date().toISOString();

    const nextProfile: MemberCloudProfile = existing
      ? {
          ...existing,
          trustedDevices: Array.from(new Set([...existing.trustedDevices, deviceToken])),
          transferCode: existing.transferCode || generateTransferCode(),
          updatedAt: now,
        }
      : {
          kind: 'member_profile',
          memberId,
          name: memberName,
          trustedDevices: [deviceToken],
          transferCode: generateTransferCode(),
          avatarPhoto: userPrefs.avatarPhoto || null,
          personalBudget,
          personalItinerary,
          themePreset: userPrefs.themePreset,
          updatedAt: now,
        };

    if (existing) {
      hydrateMemberLocalState(nextProfile);
    } else {
      lastSyncedMemberTimestampRef.current = now;
    }

    setVoterName(memberName);
    upsertMemberProfile(nextProfile);
    completePendingInteraction(memberName);
    showToast(`Perfil de ${memberName} travado neste celular! Código: ${nextProfile.transferCode}`);
  };

  const handleAuthorizeMemberWithCode = (
    memberId: GroupMemberId,
    code: string
  ): boolean => {
    const existing = memberProfiles[memberId];
    if (!existing || existing.transferCode !== code.trim()) {
      return false;
    }
    const memberName = getMemberName(memberId);
    const now = new Date().toISOString();
    const updated: MemberCloudProfile = {
      ...existing,
      trustedDevices: Array.from(new Set([...existing.trustedDevices, deviceToken])),
      updatedAt: now,
    };

    hydrateMemberLocalState(updated);
    setVoterName(memberName);
    upsertMemberProfile(updated);
    completePendingInteraction(memberName);
    showToast(`Bem-vindo de volta, ${memberName}! Seus dados foram carregados.`);
    return true;
  };

  const handleUpdateMemberAvatarPhoto = (photo: string | undefined) => {
    setUserPrefs((prev) => ({ ...prev, avatarPhoto: photo }));
    if (!activeMemberId) return;
    const existing = memberProfiles[activeMemberId];
    const now = new Date().toISOString();
    lastSyncedMemberTimestampRef.current = now;
    const nextProfile: MemberCloudProfile = {
      kind: 'member_profile',
      memberId: activeMemberId,
      name: getMemberName(activeMemberId),
      trustedDevices: existing?.trustedDevices?.length
        ? Array.from(new Set([...existing.trustedDevices, deviceToken]))
        : [deviceToken],
      transferCode: existing?.transferCode || generateTransferCode(),
      avatarPhoto: photo || null,
      personalBudget,
      personalItinerary,
      themePreset: userPrefs.themePreset,
      updatedAt: now,
    };
    upsertMemberProfile(nextProfile);
  };

  const handleLeaveDevice = () => {
    if (activeMemberId) {
      const existing = memberProfiles[activeMemberId];
      if (existing) {
        const updated: MemberCloudProfile = {
          ...existing,
          trustedDevices: existing.trustedDevices.filter((t) => t !== deviceToken),
          updatedAt: new Date().toISOString(),
        };
        upsertMemberProfile(updated);
      }
    }
    setVoterName('');
    showToast('Perfil desconectado deste aparelho.', 'info');
  };

  const openVoterModal = () => {
    setVoterPromptModal({
      open: true,
      pendingStopId: null,
      pendingChoice: null,
      pendingLikeAttractionId: null,
    });
  };

  const uniqueVoters = useMemo(() => {
    const names = new Set<string>();
    stopVotes.forEach((v) => names.add(v.voterName.trim()));
    placeLikes.forEach((l) => names.add(l.voterName.trim()));
    return Array.from(names);
  }, [stopVotes, placeLikes]);

  const confirmedFriends = useMemo(
    () => rsvps.filter((r) => r.status === 'going'),
    [rsvps]
  );

  // Simulador Financeiro + Controle Pessoal (salvo só no aparelho, imune ao sync do grupo)
  const [peoplePerCar, setPeoplePerCar] = useState<number>(4);
  const [useSurgePricing, setUseSurgePricing] = useState<boolean>(false);
  const [personalBudget, setPersonalBudget] = usePersistedState<PersonalBudgetState>(
    STORAGE_KEYS.PERSONAL_BUDGET,
    {
      includedOverrides: {},
      transportOverrides: {},
      amountOverrides: {},
      paidMap: {},
      extraItems: [],
    }
  );

  const requireTrustedMember = (actionLabel = 'fazer alterações') => {
    if (canEdit) return true;
    showToast(
      `Entre com um perfil autorizado do grupo (ou Admin) para ${actionLabel}.`,
      'info'
    );
    openVoterModal();
    return false;
  };

  const handleGuardedPersonalBudgetChange: React.Dispatch<
    React.SetStateAction<PersonalBudgetState>
  > = (updater) => {
    if (!requireTrustedMember('editar seus custos')) return;
    setPersonalBudget(updater);
  };

  const financialSummary = useMemo(() => {
    let paidTotal = 0;

    const transportTotal = transportLegs.reduce((acc, leg) => {
      const isIncluded =
        personalBudget.transportOverrides[leg.id] !== undefined
          ? personalBudget.transportOverrides[leg.id]
          : leg.included;
      if (!isIncluded) return acc;
      const hasOverride = personalBudget.amountOverrides[leg.id] !== undefined;
      const unitFare = useSurgePricing ? leg.uberSurge : leg.uberAvg;
      const defaultCost = (unitFare * leg.tripsCount) / Math.max(1, peoplePerCar);
      const legCost = hasOverride ? personalBudget.amountOverrides[leg.id] : defaultCost;
      if (personalBudget.paidMap[leg.id]) paidTotal += legCost;
      return acc + legCost;
    }, 0);

    const byCategory: Record<BudgetCategory, { documentedTotal: number; pendingCount: number }> = {
      Transporte: { documentedTotal: transportTotal, pendingCount: 0 },
      Alimentação: { documentedTotal: 0, pendingCount: 0 },
      Ingressos: { documentedTotal: 0, pendingCount: 0 },
      Hospedagem: { documentedTotal: 0, pendingCount: 0 },
      Passeios: { documentedTotal: 0, pendingCount: 0 },
    };

    budgetItems.forEach((item) => {
      const isIncluded =
        personalBudget.includedOverrides[item.id] !== undefined
          ? personalBudget.includedOverrides[item.id]
          : item.included;
      if (!isIncluded) return;

      const effectiveAmount =
        personalBudget.amountOverrides[item.id] !== undefined
          ? personalBudget.amountOverrides[item.id]
          : item.amountPerPerson;

      if (effectiveAmount === null) {
        byCategory[item.category].pendingCount += 1;
      } else {
        byCategory[item.category].documentedTotal += effectiveAmount;
        if (personalBudget.paidMap[item.id]) paidTotal += effectiveAmount;
      }
    });

    const airbnbOverride = personalBudget.amountOverrides['airbnb-base'];
    const airbnbIncluded =
      personalBudget.includedOverrides['airbnb-base'] !== undefined
        ? personalBudget.includedOverrides['airbnb-base']
        : true;
    if (airbnbIncluded) {
      if (airbnbOverride !== undefined) {
        byCategory.Hospedagem.documentedTotal += airbnbOverride;
        if (personalBudget.paidMap['airbnb-base']) paidTotal += airbnbOverride;
      } else if (config.airbnbTotalCost !== null && config.airbnbTotalCost > 0) {
        const divisor = Math.max(1, confirmedFriends.length);
        const share = config.airbnbTotalCost / divisor;
        byCategory.Hospedagem.documentedTotal += share;
        if (personalBudget.paidMap['airbnb-base']) paidTotal += share;
      } else {
        byCategory.Hospedagem.pendingCount += 1;
      }
    }

    let shoppingExtrasTotal = 0;
    let allExtrasTotal = 0;
    personalBudget.extraItems.forEach((extra) => {
      if (!extra.included) return;
      allExtrasTotal += extra.amount;
      if (extra.paid) paidTotal += extra.amount;
      if (extra.category === 'Compras & Extras') {
        shoppingExtrasTotal += extra.amount;
      } else {
        byCategory[extra.category].documentedTotal += extra.amount;
      }
    });

    const grandTotal =
      byCategory.Transporte.documentedTotal +
      byCategory.Alimentação.documentedTotal +
      byCategory.Ingressos.documentedTotal +
      byCategory.Hospedagem.documentedTotal +
      byCategory.Passeios.documentedTotal +
      shoppingExtrasTotal;

    const totalPendingItems =
      byCategory.Alimentação.pendingCount +
      byCategory.Ingressos.pendingCount +
      byCategory.Hospedagem.pendingCount +
      byCategory.Passeios.pendingCount;

    return {
      byCategory,
      shoppingExtrasTotal,
      allExtrasTotal,
      paidTotal,
      grandTotal,
      totalPendingItems,
    };
  }, [
    transportLegs,
    useSurgePricing,
    peoplePerCar,
    budgetItems,
    config.airbnbTotalCost,
    confirmedFriends.length,
    personalBudget,
  ]);

  // Sincronização automática dos dados pessoais do membro travado (foto, custos, roteiro pessoal e tema)
  const memberSyncSnapshot = useMemo(
    () =>
      JSON.stringify({
        avatarPhoto: userPrefs.avatarPhoto || null,
        themePreset: userPrefs.themePreset,
        personalBudget,
        personalItinerary,
      }),
    [userPrefs.avatarPhoto, userPrefs.themePreset, personalBudget, personalItinerary]
  );

  const lastPushedSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (!isTrustedMember || !activeMemberId || !hasSupabase || isHydratingFromCloudRef.current) return;
    const existing = memberProfiles[activeMemberId];
    // Se acabou de hidratar da nuvem, apenas registra o snapshot sem reenviar
    if (
      existing &&
      lastSyncedMemberTimestampRef.current === existing.updatedAt &&
      lastPushedSnapshotRef.current === ''
    ) {
      lastPushedSnapshotRef.current = memberSyncSnapshot;
      return;
    }
    if (existing && lastPushedSnapshotRef.current === memberSyncSnapshot) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isHydratingFromCloudRef.current) return;
      const currentCloud = memberProfiles[activeMemberId];
      const now = new Date().toISOString();
      lastSyncedMemberTimestampRef.current = now;
      lastPushedSnapshotRef.current = memberSyncSnapshot;
      const nextProfile: MemberCloudProfile = {
        kind: 'member_profile',
        memberId: activeMemberId,
        name: getMemberName(activeMemberId),
        trustedDevices: currentCloud?.trustedDevices?.length
          ? Array.from(new Set([...currentCloud.trustedDevices, deviceToken]))
          : [deviceToken],
        transferCode: currentCloud?.transferCode || generateTransferCode(),
        avatarPhoto: userPrefs.avatarPhoto || null,
        personalBudget,
        personalItinerary,
        themePreset: userPrefs.themePreset,
        updatedAt: now,
      };
      upsertMemberProfile(nextProfile);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [
    isTrustedMember,
    activeMemberId,
    hasSupabase,
    memberSyncSnapshot,
    memberProfiles,
    deviceToken,
    userPrefs.avatarPhoto,
    userPrefs.themePreset,
    personalBudget,
    personalItinerary,
    upsertMemberProfile,
  ]);

  // Compartilhamento
  const [shareModalData, setShareModalData] = useState({
    open: false,
    url: '',
    inviteText: '',
    isPreviewUrl: false,
  });

  const buildInviteText = (url: string) =>
    `*${config.title}*\n` +
    `📅 ${config.dateRange}\n` +
    `📍 Base: ${config.baseAddress}\n\n` +
    `Confira o roteiro dia a dia, vote nas atrações (👍/👎), curta seus lugares favoritos (❤️) e veja os custos divididos por ${peoplePerCar} no Uber:\n${url}`;

  const handleCopyOnlyLink = async () => {
    const url = buildShareableUrl({ hasSupabase, cleanSbUrl, cleanSbKey });
    const inviteText = buildInviteText(url);
    const isPreviewUrl = isLocalOrPreviewUrl(url);

    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      copied = copyTextFallback(url);
    }

    if (copied && !isPreviewUrl) {
      showToast('Link copiado! Agora é só colar no WhatsApp do grupo.');
    } else {
      setShareModalData({ open: true, url, inviteText, isPreviewUrl });
    }
  };

  const handleShareWhatsApp = async () => {
    const url = buildShareableUrl({ hasSupabase, cleanSbUrl, cleanSbKey });
    const text = buildInviteText(url);
    const isPreviewUrl = isLocalOrPreviewUrl(url);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextFallback(text);
      }
    } catch {
      copyTextFallback(text);
    }

    if (isPreviewUrl) {
      setShareModalData({ open: true, url, inviteText: text, isPreviewUrl });
      return;
    }

    showToast('Convite copiado! Abrindo WhatsApp...');
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Roteiro (se já estivermos durante a viagem, abre direto no dia de hoje)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = getSaoPauloTodayIso();
    return INITIAL_DAYS.some((d) => d.date === today) ? today : '2026-12-05';
  });
  const [shiftFilter, setShiftFilter] = useState<'Todos' | ShiftType>('Todos');
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionMeta | null>(null);

  const currentDay = useMemo(
    () => days.find((d) => d.date === selectedDate) || days[0],
    [days, selectedDate]
  );

  const pendingInvitesForMe = useMemo(() => {
    if (!activeMemberId) return [];
    return stopInvites.filter(
      (inv) =>
        inv.invitedMemberIds.includes(activeMemberId) &&
        (inv.responses[activeMemberId] ?? 'pending') === 'pending'
    );
  }, [stopInvites, activeMemberId]);

  const handleOpenInvites = () => {
    if (!activeMemberId) {
      showToast('Selecione seu perfil do grupo para ver seus convites.', 'info');
      openVoterModal();
      return;
    }
    setInvitesModalOpen(true);
  };

  const pendingSentInvitesByMe = useMemo(() => {
    if (!activeMemberId) return [];
    return stopInvites.filter(
      (inv) =>
        inv.createdById === activeMemberId &&
        inv.invitedMemberIds.some(
          (id) => (inv.responses[id] ?? 'pending') === 'pending'
        )
    );
  }, [stopInvites, activeMemberId]);

  const myActiveSharedStops = useMemo(() => {
    if (!activeMemberId) return [];
    return stopInvites
      .filter(
        (inv) =>
          inv.createdById === activeMemberId ||
          inv.responses[activeMemberId] === 'accepted'
      )
      .map((inv) => inv.stop);
  }, [stopInvites, activeMemberId]);

  const allActiveStops = useMemo(() => {
    const hiddenSet = new Set(personalItinerary.hiddenStopIds);
    const official = stops.filter((s) => !hiddenSet.has(s.id));
    const shared = myActiveSharedStops.filter((s) => !hiddenSet.has(s.id));
    return [...official, ...shared, ...personalItinerary.addedStops];
  }, [stops, myActiveSharedStops, personalItinerary]);

  const allDayStops = useMemo(() => {
    return allActiveStops
      .filter((s) => s.dayDate === currentDay.date)
      .sort(compareStopsChronologically);
  }, [allActiveStops, currentDay.date]);

  const dayStops = useMemo(() => {
    if (shiftFilter === 'Todos') return allDayStops;
    return allDayStops.filter((s) => s.shift === shiftFilter);
  }, [allDayStops, shiftFilter]);

  const hiddenOfficialStops = useMemo(() => {
    const hiddenSet = new Set(personalItinerary.hiddenStopIds);
    return [...stops, ...myActiveSharedStops]
      .filter((s) => s.dayDate === currentDay.date && hiddenSet.has(s.id))
      .sort(compareStopsChronologically);
  }, [stops, myActiveSharedStops, personalItinerary.hiddenStopIds, currentDay.date]);

  const [personalStopModal, setPersonalStopModal] = useState<{
    open: boolean;
    attractionId: string | null;
  }>({ open: false, attractionId: null });

  const handleAddPersonalStop = (
    newStop: ItineraryStop,
    invitedMemberIds: GroupMemberId[] = []
  ) => {
    if (!requireTrustedMember('adicionar ao roteiro')) return;

    if (invitedMemberIds.length > 0 && activeMemberId) {
      const inviteId = 'inv_' + Date.now().toString(36);
      const now = new Date().toISOString();
      const sharedStop: ItineraryStop = {
        ...newStop,
        id: 'stop_shared_' + inviteId,
        isPersonal: false,
        sharedInviteId: inviteId,
        sharedByName: effectiveVoterName || getMemberName(activeMemberId),
      };
      const invite: SharedStopInvite = {
        id: inviteId,
        kind: 'stop_invite',
        createdById: activeMemberId,
        createdByName: effectiveVoterName || getMemberName(activeMemberId),
        createdAt: now,
        updatedAt: now,
        stop: sharedStop,
        invitedMemberIds,
        responses: {},
      };
      upsertStopInvite(invite);
      setSelectedDate(sharedStop.dayDate);
      setActiveTab('roteiro');
      const invitedNames = invitedMemberIds
        .map((id) => getMemberName(id))
        .join(', ');
      showToast(
        `"${sharedStop.title}" adicionado e convite enviado para ${invitedNames}!`
      );
      return;
    }

    setPersonalItinerary((prev) => ({
      ...prev,
      addedStops: [...prev.addedStops, newStop],
    }));
    setSelectedDate(newStop.dayDate);
    setActiveTab('roteiro');
    showToast(`"${newStop.title}" adicionado ao seu roteiro!`);
  };

  const handleRespondStopInvite = (
    inviteId: string,
    response: 'accepted' | 'declined'
  ) => {
    if (!requireTrustedMember('responder convites') || !activeMemberId) return;
    const target = stopInvites.find((i) => i.id === inviteId);
    if (!target) return;

    const updated: SharedStopInvite = {
      ...target,
      responses: {
        ...target.responses,
        [activeMemberId]: response,
      },
      updatedAt: new Date().toISOString(),
    };
    upsertStopInvite(updated);

    if (response === 'accepted') {
      setSelectedDate(target.stop.dayDate);
      setActiveTab('roteiro');
      showToast(`"${target.stop.title}" adicionado ao seu roteiro!`);
    } else {
      showToast(`Convite "${target.stop.title}" recusado.`, 'info');
    }
  };

  const handleCancelOrLeaveSharedStop = (inviteId: string) => {
    if (!requireTrustedMember('atualizar rolê compartilhado') || !activeMemberId) return;
    const target = stopInvites.find((i) => i.id === inviteId);
    if (!target) return;

    if (target.createdById === activeMemberId) {
      deleteStopInvite(inviteId);
      showToast(`Convite "${target.stop.title}" cancelado para todos.`, 'info');
      return;
    }

    const updated: SharedStopInvite = {
      ...target,
      responses: {
        ...target.responses,
        [activeMemberId]: 'declined',
      },
      updatedAt: new Date().toISOString(),
    };
    upsertStopInvite(updated);
    showToast(`Você saiu de "${target.stop.title}".`, 'info');
  };

  const handleHideOfficialStop = (stopId: string) => {
    if (!requireTrustedMember('ocultar paradas')) return;
    setPersonalItinerary((prev) => ({
      ...prev,
      hiddenStopIds: Array.from(new Set([...prev.hiddenStopIds, stopId])),
    }));
    showToast('Parada ocultada só no seu roteiro.', 'info');
  };

  const handleRemovePersonalStop = (stopId: string) => {
    if (!requireTrustedMember('remover paradas')) return;
    setPersonalItinerary((prev) => ({
      ...prev,
      addedStops: prev.addedStops.filter((s) => s.id !== stopId),
    }));
    showToast('Parada removida do seu roteiro.', 'info');
  };

  const handleRestoreSingleOfficialStop = (stopId: string) => {
    if (!requireTrustedMember('restaurar paradas')) return;
    setPersonalItinerary((prev) => ({
      ...prev,
      hiddenStopIds: prev.hiddenStopIds.filter((id) => id !== stopId),
    }));
    showToast('Parada restaurada no seu roteiro!');
  };

  const handleRestoreOfficialStops = () => {
    if (!requireTrustedMember('restaurar paradas')) return;
    const idsOfDay = new Set(
      [...stops, ...myActiveSharedStops]
        .filter((s) => s.dayDate === currentDay.date)
        .map((s) => s.id)
    );
    setPersonalItinerary((prev) => ({
      ...prev,
      hiddenStopIds: prev.hiddenStopIds.filter((id) => !idsOfDay.has(id)),
    }));
    showToast('Paradas do grupo restauradas neste dia!');
  };

  const handleDeletePlaceAsAdmin = async (attr: AttractionMeta) => {
    if (!isAdminAuthenticated) return;
    await deletePlaceAsAdmin(attr);
    showToast(`"${attr.name}" removido do Explorar.`, 'info');
  };

  // Explorar
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreRegion, setExploreRegion] = useState('Todas');
  const [exploreCategory, setExploreCategory] = useState('Todas');
  const [exploreOnlyExtras, setExploreOnlyExtras] = useState(false);
  const [exploreOnlyLiked, setExploreOnlyLiked] = useState(false);
  const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);
  const [newPlaceForm, setNewPlaceForm] = useState({
    name: '',
    region: '1. Vila Mariana / Ibirapuera / Moema',
    category: 'Restaurante' as AttractionMeta['category'],
    hours: '',
    address: '',
    notes: '',
    imageUrl: '',
    inOfficialRoute: false,
    addToPersonalRoute: false,
    targetDayDate: '2026-12-04',
    targetShift: 'Tarde' as ShiftType,
  });

  const handleCreateCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireTrustedMember('adicionar um lugar')) return;
    if (!newPlaceForm.name.trim()) return;
    const cleanName = newPlaceForm.name.trim();
    const created: AttractionMeta = {
      id: 'place_custom_' + Date.now().toString(36),
      name: cleanName,
      region: newPlaceForm.region,
      category: newPlaceForm.category,
      period: 'Dia / Noite',
      address: newPlaceForm.address.trim() || 'São Paulo - SP',
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cleanName + ' ' + (newPlaceForm.address.trim() || 'São Paulo')
      )}`,
      hours: newPlaceForm.hours.trim() || 'Consultar horários antes de ir',
      closedDays: 'Não fecha',
      rating: null,
      reviewsCount: null,
      distanceKm: 0,
      driveMinutes: 0,
      uberAvg: 0,
      uberSurge: 0,
      imageUrl: newPlaceForm.imageUrl.trim() || HERO_IMAGES.paulista,
      notes:
        newPlaceForm.notes.trim() ||
        'Sugestão adicionada pelo grupo diretamente pelo site.',
      inOfficialRoute: newPlaceForm.inOfficialRoute,
      addedBy: effectiveVoterName || 'Grupo',
    };

    setAttractions((prev) => [created, ...prev]);

    if (hasSupabase) {
      const offlineOp: OfflineQueueOp = {
        key: `place:${created.id}`,
        type: 'place_upsert',
        payload: created,
        createdAt: new Date().toISOString(),
      };
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueueOfflineOp(offlineOp);
        setSyncStatus('local');
      } else {
        cloudFetch('custom_places?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            id: created.id,
            payload: created,
            created_at: new Date().toISOString(),
          }),
        })
          .then(() => {
            setSyncStatus('synced');
            setSyncErrorDetail('');
          })
          .catch(() => {
            enqueueOfflineOp(offlineOp);
            setSyncStatus('local');
          });
      }
    }

    if (newPlaceForm.addToPersonalRoute) {
      const personalStop: ItineraryStop = {
        id: 'stop_personal_' + Date.now().toString(36),
        dayDate: newPlaceForm.targetDayDate || currentDay.date,
        shift: newPlaceForm.targetShift,
        timeLabel: created.hours || 'Horário flexível',
        title: created.name,
        subtitle: `${created.category} • ${created.region}`,
        attractionId: created.id,
        tags: ['Meu roteiro'],
        details: created.notes,
        isPersonal: true,
      };
      setPersonalItinerary((prev) => ({
        ...prev,
        addedStops: [...prev.addedStops, personalStop],
      }));
    }

    setNewPlaceForm({
      name: '',
      region: '1. Vila Mariana / Ibirapuera / Moema',
      category: 'Restaurante',
      hours: '',
      address: '',
      notes: '',
      imageUrl: '',
      inOfficialRoute: false,
      addToPersonalRoute: false,
      targetDayDate: currentDay.date,
      targetShift: 'Tarde',
    });
    setAddPlaceModalOpen(false);
    showToast(
      newPlaceForm.addToPersonalRoute
        ? `"${cleanName}" salvo no Explorar e no seu Roteiro!`
        : `"${cleanName}" adicionado ao Explorar!`
    );
  };

  const regionsList = useMemo(() => {
    const unique = Array.from(new Set(attractions.map((a) => a.region)));
    return ['Todas', ...unique];
  }, [attractions]);

  const filteredAttractions = useMemo(() => {
    return attractions.filter((attr) => {
      if (attr.excludedReason) return false;
      if (exploreOnlyExtras && attr.inOfficialRoute) return false;
      if (exploreOnlyLiked && !placeLikes.some((l) => l.attractionId === attr.id)) return false;
      if (exploreRegion !== 'Todas' && attr.region !== exploreRegion) return false;
      if (exploreCategory !== 'Todas' && attr.category !== exploreCategory) return false;
      if (exploreQuery.trim()) {
        const q = exploreQuery.toLowerCase();
        const matchName = attr.name.toLowerCase().includes(q);
        const matchNotes = attr.notes.toLowerCase().includes(q);
        const matchRegion = attr.region.toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchRegion) return false;
      }
      return true;
    });
  }, [
    attractions,
    exploreQuery,
    exploreRegion,
    exploreCategory,
    exploreOnlyExtras,
    exploreOnlyLiked,
    placeLikes,
  ]);

  const excludedAttractions = useMemo(
    () => attractions.filter((a) => Boolean(a.excludedReason)),
    [attractions]
  );

  // Forms do Admin
  const [newStopForm, setNewStopForm] = useState({
    dayDate: '2026-12-05',
    shift: 'Tarde' as ShiftType,
    timeLabel: '',
    title: '',
    subtitle: '',
    details: '',
    attractionId: '',
  });

  const [newBudgetForm, setNewBudgetForm] = useState({
    category: 'Alimentação' as BudgetCategory,
    name: '',
    subtitle: '',
    amount: '',
  });

  const [newTransportForm, setNewTransportForm] = useState({
    dayLabel: '',
    route: '',
    tripsCount: '2',
    uberAvg: '',
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === config.adminPin) {
      setIsAdminAuthenticated(true);
      setPinError(false);
      setPinInput('');
      showToast('Área Administrativa desbloqueada.');
    } else {
      setPinError(true);
    }
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminAuthenticated) return;
    if (!newStopForm.title.trim()) return;
    const timeValidation = validateAndNormalizeTimeInput(newStopForm.timeLabel);
    if (!timeValidation.valid) return;

    const linkedAttr = newStopForm.attractionId
      ? attractions.find((a) => a.id === newStopForm.attractionId)
      : undefined;

    const created: ItineraryStop = {
      id: 'stop_custom_' + Date.now().toString(36),
      dayDate: newStopForm.dayDate,
      shift: newStopForm.shift,
      timeLabel: timeValidation.normalizedLabel,
      title: newStopForm.title.trim(),
      subtitle: newStopForm.subtitle.trim() || undefined,
      attractionId: linkedAttr?.id || undefined,
      tags: linkedAttr ? [linkedAttr.category] : ['Adicionado'],
      details:
        newStopForm.details.trim() ||
        linkedAttr?.notes ||
        'Atividade adicionada ao roteiro.',
    };
    setStops((prev) => [...prev, created]);
    setNewStopForm({
      ...newStopForm,
      timeLabel: '',
      title: '',
      subtitle: '',
      details: '',
      attractionId: '',
    });
    showToast('Nova parada adicionada ao roteiro!');
  };

  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminAuthenticated) return;
    if (!newBudgetForm.name.trim()) return;
    const parsed =
      newBudgetForm.amount.trim() === ''
        ? null
        : Number(newBudgetForm.amount.replace(',', '.'));
    const created: BudgetItem = {
      id: 'bud_custom_' + Date.now().toString(36),
      category: newBudgetForm.category,
      name: newBudgetForm.name.trim(),
      subtitle: newBudgetForm.subtitle.trim() || 'Item adicionado pelo organizador',
      amountPerPerson: parsed !== null && !Number.isNaN(parsed) ? parsed : null,
      included: true,
      sourceNote: 'Adicionado na Área Administrativa.',
    };
    setBudgetItems((prev) => [...prev, created]);
    setNewBudgetForm({ category: 'Alimentação', name: '', subtitle: '', amount: '' });
    showToast('Item adicionado ao orçamento!');
  };

  const handleAddTransportLeg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminAuthenticated) return;
    const cleanRoute = newTransportForm.route.trim();
    const parsedAvg = Number(newTransportForm.uberAvg.trim().replace(',', '.'));
    const parsedTrips = Math.max(1, Number(newTransportForm.tripsCount) || 1);
    if (!cleanRoute || Number.isNaN(parsedAvg) || parsedAvg < 0) return;

    const created: TransportLeg = {
      id: 'leg_custom_' + Date.now().toString(36),
      dayLabel: newTransportForm.dayLabel.trim() || 'Deslocamento extra',
      route: cleanRoute,
      uberAvg: parsedAvg,
      uberSurge: Number((parsedAvg * 1.5).toFixed(2)),
      tripsCount: parsedTrips,
      included: true,
    };
    setTransportLegs((prev) => [...prev, created]);
    setNewTransportForm({ dayLabel: '', route: '', tripsCount: '2', uberAvg: '' });
    showToast('Novo trecho Uber adicionado à base do grupo!');
  };

  return (
    <div className="min-h-screen overflow-x-clip text-[#EEF1FA] pb-28 md:pb-12 selection:bg-[#657EF8] selection:text-white">
      <Toast toast={toast} />
      {userPrefs.showStickers !== false && <FloatingStickerLayer />}
      {userPrefs.showMascot !== false && (
        <MascotCorner
          activeTab={activeTab}
          voterName={effectiveVoterName}
          pendingInvites={pendingInvitesForMe}
          days={days}
          onOpenInvites={handleOpenInvites}
          onHide={() => {
            setUserPrefs((p) => ({ ...p, showMascot: false }));
            showToast('Mascote escondido. Dá pra trazer de volta no 🎨 Tema!', 'info');
          }}
        />
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStandaloneApp={isStandaloneApp}
        onInstallClick={handleInstallAppClick}
        hasSupabase={hasSupabase}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        syncErrorDetail={syncErrorDetail}
        pendingQueueCount={pendingQueueCount}
        onSyncClick={() => {
          if (hasSupabase) {
            syncFromCloud(false);
            showToast('Sincronizando com a nuvem...');
          } else {
            showToast('Conexão com a nuvem é configurada via ambiente do projeto.', 'info');
          }
        }}
        voterName={effectiveVoterName}
        avatarPhoto={userPrefs.avatarPhoto}
        onOpenVoterModal={openVoterModal}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        pendingInvitesCount={pendingInvitesForMe.length}
        onOpenInvites={handleOpenInvites}
        onCopyLink={handleCopyOnlyLink}
        onShareWhatsApp={handleShareWhatsApp}
      />

      {syncStatus === 'error' && (
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="rounded-2xl bg-[#EC6B6B]/14 border border-[#EC6B6B]/45 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#FFD0D0]">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EC6B6B] shrink-0" />
              <span>
                <strong>Sincronização pausada:</strong>{' '}
                {syncErrorDetail || 'Verifique o SQL e as chaves do Supabase.'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => syncFromCloud(false)}
              className="font-bold underline text-white"
            >
              Tentar reconectar
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-5 space-y-6 min-w-0">
        {activeTab === 'inicio' && (
          <HomeTab
            config={config}
            days={days}
            attractions={attractions}
            daysUntilTrip={daysUntilTrip}
            isStandaloneApp={isStandaloneApp}
            appIconUrl={appIconUrl}
            onInstallClick={handleInstallAppClick}
            grandTotal={financialSummary.grandTotal}
            totalPendingItems={financialSummary.totalPendingItems}
            peoplePerCar={peoplePerCar}
            placeLikesCount={placeLikes.length}
            stopVotesCount={stopVotes.length}
            uniqueVotersCount={uniqueVoters.length}
            voterName={effectiveVoterName}
            avatarPhoto={userPrefs.avatarPhoto}
            setActiveTab={setActiveTab}
            onJumpToDay={(date) => {
              setSelectedDate(date);
              setActiveTab('roteiro');
            }}
            onOpenThemeModal={() => setThemeModalOpen(true)}
          />
        )}

        {activeTab === 'roteiro' && (
          <ItineraryTab
            config={config}
            days={days}
            currentDay={currentDay}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            shiftFilter={shiftFilter}
            setShiftFilter={setShiftFilter}
            dayStops={dayStops}
            allDayStops={allDayStops}
            attractions={attractions}
            stopVotes={stopVotes}
            voterName={effectiveVoterName}
            avatarPhoto={userPrefs.avatarPhoto}
            userProfiles={userProfiles}
            compactCards={userPrefs.compactCards}
            canEdit={canEdit}
            hiddenOfficialStops={hiddenOfficialStops}
            stopInvites={stopInvites}
            pendingInvitesCount={pendingInvitesForMe.length}
            activeMemberId={activeMemberId}
            onOpenVoterModal={openVoterModal}
            onVoteClick={handleVoteClick}
            onSelectAttraction={setSelectedAttraction}
            onOpenAddPersonalStop={() => {
              if (!requireTrustedMember('adicionar ao roteiro')) return;
              setPersonalStopModal({ open: true, attractionId: null });
            }}
            onOpenInvites={handleOpenInvites}
            onCancelOrLeaveSharedStop={handleCancelOrLeaveSharedStop}
            onHideOfficialStop={handleHideOfficialStop}
            onRemovePersonalStop={handleRemovePersonalStop}
            onRestoreSingleOfficialStop={handleRestoreSingleOfficialStop}
            onRestoreOfficialStops={handleRestoreOfficialStops}
          />
        )}

        {activeTab === 'explorar' && (
          <ExploreTab
            exploreQuery={exploreQuery}
            setExploreQuery={setExploreQuery}
            exploreRegion={exploreRegion}
            setExploreRegion={setExploreRegion}
            exploreCategory={exploreCategory}
            setExploreCategory={setExploreCategory}
            exploreOnlyExtras={exploreOnlyExtras}
            setExploreOnlyExtras={setExploreOnlyExtras}
            exploreOnlyLiked={exploreOnlyLiked}
            setExploreOnlyLiked={setExploreOnlyLiked}
            regionsList={regionsList}
            categoriesList={CATEGORIES_LIST}
            filteredAttractions={filteredAttractions}
            excludedAttractions={excludedAttractions}
            placeLikes={placeLikes}
            voterName={effectiveVoterName}
            avatarPhoto={userPrefs.avatarPhoto}
            userProfiles={userProfiles}
            peoplePerCar={peoplePerCar}
            compactCards={userPrefs.compactCards}
            canEdit={canEdit}
            onOpenAddPlace={() => {
              if (!requireTrustedMember('adicionar um lugar')) return;
              setNewPlaceForm((prev) => ({
                ...prev,
                targetDayDate: currentDay.date,
              }));
              setAddPlaceModalOpen(true);
            }}
            onTogglePlaceLike={handleTogglePlaceLike}
            onAddToPersonalRoute={(attrId) => {
              if (!requireTrustedMember('adicionar ao roteiro')) return;
              setPersonalStopModal({ open: true, attractionId: attrId });
            }}
            onSelectAttraction={setSelectedAttraction}
          />
        )}

        {activeTab === 'custos' && (
          <CostsTab
            config={config}
            confirmedFriendsCount={confirmedFriends.length}
            peoplePerCar={peoplePerCar}
            setPeoplePerCar={setPeoplePerCar}
            useSurgePricing={useSurgePricing}
            setUseSurgePricing={setUseSurgePricing}
            financialSummary={financialSummary}
            transportLegs={transportLegs}
            budgetItems={budgetItems}
            personalBudget={personalBudget}
            setPersonalBudget={handleGuardedPersonalBudgetChange}
            canEdit={canEdit}
            onRequireAuth={() => {
              requireTrustedMember('editar seus custos');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            config={config}
            setConfig={setConfig}
            days={days}
            attractions={attractions}
            stops={stops}
            setStops={setStops}
            budgetItems={budgetItems}
            setBudgetItems={setBudgetItems}
            transportLegs={transportLegs}
            setTransportLegs={setTransportLegs}
            checklist={checklist}
            setChecklist={setChecklist}
            stopVotes={stopVotes}
            placeLikes={placeLikes}
            userProfiles={userProfiles}
            memberProfiles={memberProfiles}
            voterName={effectiveVoterName}
            avatarPhoto={userPrefs.avatarPhoto}
            isAdminAuthenticated={isAdminAuthenticated}
            onUnlockMemberDevices={unlockMemberDevicesAsAdmin}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            pinInput={pinInput}
            setPinInput={setPinInput}
            pinError={pinError}
            setPinError={setPinError}
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            newStopForm={newStopForm}
            setNewStopForm={setNewStopForm}
            newBudgetForm={newBudgetForm}
            setNewBudgetForm={setNewBudgetForm}
            newTransportForm={newTransportForm}
            setNewTransportForm={setNewTransportForm}
            onAdminLogin={handleAdminLogin}
            onAddStop={handleAddStop}
            onAddBudgetItem={handleAddBudgetItem}
            onAddTransportLeg={handleAddTransportLeg}
            onDeletePlaceAsAdmin={handleDeletePlaceAsAdmin}
            onSyncNow={() => {
              syncFromCloud(false);
              showToast('Buscando atualizações do grupo...');
            }}
            showToast={showToast}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <ShareModal
        open={shareModalData.open}
        url={shareModalData.url}
        inviteText={shareModalData.inviteText}
        isPreviewUrl={shareModalData.isPreviewUrl}
        onClose={() => setShareModalData((prev) => ({ ...prev, open: false }))}
        showToast={showToast}
      />

      <InstallModal
        open={installModalOpen}
        appIconUrl={appIconUrl}
        deferredInstallPrompt={deferredInstallPrompt}
        onTriggerPrompt={triggerDeferredPrompt}
        onClose={() => setInstallModalOpen(false)}
      />

      <AddPlaceModal
        open={addPlaceModalOpen}
        onClose={() => setAddPlaceModalOpen(false)}
        form={newPlaceForm}
        setForm={setNewPlaceForm}
        regionsList={regionsList}
        categoriesList={CATEGORIES_LIST}
        days={days}
        onSubmit={handleCreateCustomPlace}
      />

      <AddPersonalStopModal
        open={personalStopModal.open}
        onClose={() => setPersonalStopModal({ open: false, attractionId: null })}
        days={days}
        defaultDate={currentDay.date}
        attractions={attractions}
        allActiveStops={allActiveStops}
        activeMemberId={activeMemberId}
        memberProfiles={memberProfiles}
        userProfiles={userProfiles}
        preselectedAttractionId={personalStopModal.attractionId}
        onAddStop={handleAddPersonalStop}
        onOpenNewPlaceModal={(targetDate, targetShift) => {
          if (!requireTrustedMember('adicionar um lugar')) return;
          setNewPlaceForm((prev) => ({
            ...prev,
            addToPersonalRoute: true,
            targetDayDate: targetDate,
            targetShift,
          }));
          setAddPlaceModalOpen(true);
        }}
      />

      <StopInvitesModal
        open={invitesModalOpen}
        onClose={() => setInvitesModalOpen(false)}
        days={days}
        attractions={attractions}
        activeMemberId={activeMemberId}
        receivedInvites={pendingInvitesForMe}
        sentInvites={pendingSentInvitesByMe}
        allActiveStops={allActiveStops}
        userProfiles={userProfiles}
        onRespondInvite={handleRespondStopInvite}
        onCancelInvite={handleCancelOrLeaveSharedStop}
        onJumpToDay={(date) => {
          setSelectedDate(date);
          setActiveTab('roteiro');
        }}
      />

      <VoterNameModal
        open={voterPromptModal.open}
        onClose={() =>
          setVoterPromptModal({
            open: false,
            pendingStopId: null,
            pendingChoice: null,
            pendingLikeAttractionId: null,
          })
        }
        activeMemberId={activeMemberId}
        activeMemberName={effectiveVoterName}
        deviceToken={deviceToken}
        memberProfiles={memberProfiles}
        avatarPhoto={userPrefs.avatarPhoto}
        onSelectFreeMember={handleSelectFreeMember}
        onAuthorizeMemberWithCode={handleAuthorizeMemberWithCode}
        onUpdateAvatarPhoto={handleUpdateMemberAvatarPhoto}
        onLeaveDevice={handleLeaveDevice}
      />

      <ThemePersonalizeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        prefs={userPrefs}
        setPrefs={setUserPrefs}
        voterName={effectiveVoterName}
        onOpenVoterModal={openVoterModal}
      />

      <AttractionDrawer
        attraction={selectedAttraction}
        onClose={() => setSelectedAttraction(null)}
        placeLikes={placeLikes}
        voterName={effectiveVoterName}
        avatarPhoto={userPrefs.avatarPhoto}
        userProfiles={userProfiles}
        peoplePerCar={peoplePerCar}
        canEdit={canEdit}
        onTogglePlaceLike={handleTogglePlaceLike}
        onAddToPersonalRoute={(attrId) => {
          if (!requireTrustedMember('adicionar ao roteiro')) return;
          setPersonalStopModal({ open: true, attractionId: attrId });
        }}
      />
    </div>
  );
}
