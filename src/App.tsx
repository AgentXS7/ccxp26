import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { INITIAL_ATTRACTIONS } from './data/attractions';
import { INITIAL_BUDGET_ITEMS } from './data/budget';
import { INITIAL_CHECKLIST } from './data/checklist';
import { HERO_IMAGES, INITIAL_CONFIG } from './data/config';
import { INITIAL_DAYS } from './data/days';
import { INITIAL_STOPS } from './data/stops';
import { INITIAL_TRANSPORT_LEGS } from './data/transport';

import { usePersistedState } from './hooks/usePersistedState';
import { usePwa } from './hooks/usePwa';
import { useSupabaseSync } from './hooks/useSupabaseSync';

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

import { AddPlaceModal } from './components/modals/AddPlaceModal';
import { AttractionDrawer } from './components/modals/AttractionDrawer';
import { InstallModal } from './components/modals/InstallModal';
import { ShareModal } from './components/modals/ShareModal';
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
  ItineraryDay,
  ItineraryStop,
  PersonalBudgetState,
  PlaceLikeEntry,
  RsvpEntry,
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
      supabaseUrl: envSb.url || INITIAL_CONFIG.supabaseUrl,
      supabaseAnonKey: envSb.key || INITIAL_CONFIG.supabaseAnonKey,
    };
  });

  // Garante que URL (?sb=...) ou variáveis de ambiente prevaleçam ao abrir link compartilhado
  useEffect(() => {
    const envSb = readInitialSupabaseConfig();
    if (envSb.url && envSb.key) {
      setConfig((prev) =>
        prev.supabaseUrl === envSb.url && prev.supabaseAnonKey === envSb.key
          ? prev
          : { ...prev, supabaseUrl: envSb.url, supabaseAnonKey: envSb.key }
      );
    }
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
  const [transportLegs] = usePersistedState<TransportLeg[]>(
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

  // Área Administrativa
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSectionKey>('reservas');
  const [showSql, setShowSql] = useState(false);

  // Sincronização em nuvem (Supabase)
  const {
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
  } = useSupabaseSync({
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
  });

  const deviceToken = useMemo(() => getOrCreateDeviceToken(), []);

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
  const [voterNameInput, setVoterNameInput] = useState('');

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
        cloudFetch(`stop_votes?id=eq.${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
        })
          .then(() => {
            setSyncStatus('synced');
            setSyncErrorDetail('');
          })
          .catch((err) => {
            setSyncStatus('error');
            setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao remover voto');
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
        .catch((err) => {
          setSyncStatus('error');
          setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao salvar voto');
          showToast('Voto salvo só no celular — verifique a conexão Supabase no Admin.', 'info');
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
        cloudFetch(`place_likes?id=eq.${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
        })
          .then(() => {
            setSyncStatus('synced');
            setSyncErrorDetail('');
          })
          .catch((err) => {
            setSyncStatus('error');
            setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao remover curtida');
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
        .catch((err) => {
          setSyncStatus('error');
          setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao salvar curtida');
          showToast('Curtida salva só no celular — verifique a conexão Supabase no Admin.', 'info');
        });
    }
  };

  const handleVoteClick = (
    e: React.MouseEvent,
    stopId: string,
    choice: 'yes' | 'no'
  ) => {
    e.stopPropagation();
    if (!voterName.trim()) {
      setVoterNameInput('');
      setVoterPromptModal({
        open: true,
        pendingStopId: stopId,
        pendingChoice: choice,
        pendingLikeAttractionId: null,
      });
      return;
    }
    applyStopVote(stopId, choice, voterName);
  };

  const handleTogglePlaceLike = (e: React.MouseEvent, attractionId: string) => {
    e.stopPropagation();
    if (!voterName.trim()) {
      setVoterNameInput('');
      setVoterPromptModal({
        open: true,
        pendingStopId: null,
        pendingChoice: null,
        pendingLikeAttractionId: attractionId,
      });
      return;
    }
    applyPlaceLike(attractionId, voterName);
  };

  const handleConfirmVoterName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = voterNameInput.trim();
    if (!clean) return;
    setVoterName(clean);
    if (voterPromptModal.pendingStopId && voterPromptModal.pendingChoice) {
      applyStopVote(voterPromptModal.pendingStopId, voterPromptModal.pendingChoice, clean);
    }
    if (voterPromptModal.pendingLikeAttractionId) {
      applyPlaceLike(voterPromptModal.pendingLikeAttractionId, clean);
    }
    setVoterPromptModal({
      open: false,
      pendingStopId: null,
      pendingChoice: null,
      pendingLikeAttractionId: null,
    });
    showToast(`Identificado como ${clean}!`);
  };

  const openVoterModal = () => {
    setVoterNameInput(voterName);
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

  const financialSummary = useMemo(() => {
    let paidTotal = 0;

    const transportTotal = transportLegs.reduce((acc, leg) => {
      const isIncluded =
        personalBudget.transportOverrides[leg.id] !== undefined
          ? personalBudget.transportOverrides[leg.id]
          : leg.included;
      if (!isIncluded) return acc;
      const unitFare = useSurgePricing ? leg.uberSurge : leg.uberAvg;
      const legCost = (unitFare * leg.tripsCount) / Math.max(1, peoplePerCar);
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

  const dayStops = useMemo(() => {
    return stops.filter((s) => {
      if (s.dayDate !== currentDay.date) return false;
      if (shiftFilter !== 'Todos' && s.shift !== shiftFilter) return false;
      return true;
    });
  }, [stops, currentDay.date, shiftFilter]);

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
  });

  const handleCreateCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
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
      addedBy: voterName.trim() || 'Grupo',
    };

    setAttractions((prev) => [created, ...prev]);

    if (hasSupabase) {
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
        .catch((err) => {
          setSyncStatus('error');
          setSyncErrorDetail(err instanceof Error ? err.message : 'Erro ao salvar lugar');
        });
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
    });
    setAddPlaceModalOpen(false);
    showToast(`"${cleanName}" adicionado ao Explorar!`);
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
  });

  const [newBudgetForm, setNewBudgetForm] = useState({
    category: 'Alimentação' as BudgetCategory,
    name: '',
    subtitle: '',
    amount: '',
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
    if (!newStopForm.title.trim()) return;
    const created: ItineraryStop = {
      id: 'stop_custom_' + Date.now().toString(36),
      dayDate: newStopForm.dayDate,
      shift: newStopForm.shift,
      timeLabel: newStopForm.timeLabel.trim() || 'Horário flexível',
      title: newStopForm.title.trim(),
      subtitle: newStopForm.subtitle.trim() || undefined,
      tags: ['Adicionado'],
      details: newStopForm.details.trim() || 'Atividade adicionada ao roteiro.',
    };
    setStops((prev) => [...prev, created]);
    setNewStopForm({ ...newStopForm, timeLabel: '', title: '', subtitle: '', details: '' });
    showToast('Nova parada adicionada ao roteiro!');
  };

  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen text-[#EEF1FA] pb-28 md:pb-12 selection:bg-[#657EF8] selection:text-white">
      <Toast toast={toast} />
      {userPrefs.showStickers !== false && <FloatingStickerLayer />}
      {userPrefs.showMascot !== false && (
        <MascotCorner
          activeTab={activeTab}
          voterName={voterName}
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
        onSyncClick={() => {
          if (hasSupabase) {
            syncFromCloud(false);
            showToast('Sincronizando com a nuvem...');
          } else {
            setActiveTab('admin');
            setAdminSection('supabase');
          }
        }}
        voterName={voterName}
        avatarBadge={userPrefs.avatarBadge}
        avatarPhoto={userPrefs.avatarPhoto}
        onOpenVoterModal={openVoterModal}
        onOpenThemeModal={() => setThemeModalOpen(true)}
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
              onClick={() => {
                setActiveTab('admin');
                setAdminSection('supabase');
              }}
              className="font-bold underline text-white"
            >
              Corrigir no Admin →
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-3.5 sm:px-4 pt-4 sm:pt-5 space-y-6">
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
            voterName={voterName}
            avatarBadge={userPrefs.avatarBadge}
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
            attractions={attractions}
            stopVotes={stopVotes}
            voterName={voterName}
            avatarBadge={userPrefs.avatarBadge}
            avatarPhoto={userPrefs.avatarPhoto}
            compactCards={userPrefs.compactCards}
            onOpenVoterModal={openVoterModal}
            onVoteClick={handleVoteClick}
            onSelectAttraction={setSelectedAttraction}
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
            voterName={voterName}
            avatarBadge={userPrefs.avatarBadge}
            avatarPhoto={userPrefs.avatarPhoto}
            peoplePerCar={peoplePerCar}
            compactCards={userPrefs.compactCards}
            onOpenAddPlace={() => setAddPlaceModalOpen(true)}
            onTogglePlaceLike={handleTogglePlaceLike}
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
            setPersonalBudget={setPersonalBudget}
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
            checklist={checklist}
            setChecklist={setChecklist}
            stopVotes={stopVotes}
            placeLikes={placeLikes}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            pinInput={pinInput}
            setPinInput={setPinInput}
            pinError={pinError}
            setPinError={setPinError}
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            showSql={showSql}
            setShowSql={setShowSql}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            syncErrorDetail={syncErrorDetail}
            newStopForm={newStopForm}
            setNewStopForm={setNewStopForm}
            newBudgetForm={newBudgetForm}
            setNewBudgetForm={setNewBudgetForm}
            onAdminLogin={handleAdminLogin}
            onAddStop={handleAddStop}
            onAddBudgetItem={handleAddBudgetItem}
            onPushAllLocalToCloud={pushAllLocalToCloud}
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
        onSubmit={handleCreateCustomPlace}
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
        voterNameInput={voterNameInput}
        setVoterNameInput={setVoterNameInput}
        avatarBadge={userPrefs.avatarBadge}
        setAvatarBadge={(badge) =>
          setUserPrefs((prev) => ({ ...prev, avatarBadge: badge }))
        }
        avatarPhoto={userPrefs.avatarPhoto}
        setAvatarPhoto={(photo) =>
          setUserPrefs((prev) => ({ ...prev, avatarPhoto: photo }))
        }
        onSubmit={handleConfirmVoterName}
      />

      <ThemePersonalizeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        prefs={userPrefs}
        setPrefs={setUserPrefs}
        voterName={voterName}
        onOpenVoterModal={openVoterModal}
      />

      <AttractionDrawer
        attraction={selectedAttraction}
        onClose={() => setSelectedAttraction(null)}
        placeLikes={placeLikes}
        voterName={voterName}
        peoplePerCar={peoplePerCar}
        onTogglePlaceLike={handleTogglePlaceLike}
      />
    </div>
  );
}
