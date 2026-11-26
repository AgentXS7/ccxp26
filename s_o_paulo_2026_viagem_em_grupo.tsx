import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Check,
  X,
  Share2,
  ChevronRight,
  AlertTriangle,
  Info,
  ExternalLink,
  Shield,
  Lock,
  Unlock,
  Edit3,
  Plus,
  Trash2,
  Search,
  Train,
  Car,
  Utensils,
  Ticket,
  Home,
  Compass,
  Star,
  Phone,
  Sparkles,
  CheckCircle2,
  Copy,
  Database,
  Navigation,
  Film,
  TreePine,
  ShoppingBag,
  Gamepad2,
  Coffee,
  Building2,
  RotateCcw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Heart,
  Cloud,
  CloudOff,
  RefreshCw,
  Smartphone,
  Download,
  Link2
} from 'lucide-react';

// ============================================================================
// 1. TIPAGENS & ESTRUTURAS DE DADOS
// ============================================================================

type TabKey = 'inicio' | 'roteiro' | 'explorar' | 'custos' | 'admin';
type ShiftType = 'Manhã e Almoço' | 'Tarde' | 'Noite e Madrugada';
type DayBadgeType = 'Chegada' | 'Dia Livre' | 'CCXP26' | 'Roteiro em Grupo';
type RsvpStatus = 'going' | 'not_going';
type ChecklistStatus = 'Pendente' | 'Comprado' | 'Reservado' | 'Confirmado';
type BudgetCategory = 'Transporte' | 'Alimentação' | 'Ingressos' | 'Hospedagem' | 'Passeios';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface AttractionMeta {
  id: string;
  name: string;
  region: string;
  category:
    | 'Restaurante'
    | 'Bar e noite'
    | 'Parque e lazer'
    | 'Museu e cultura'
    | 'Shopping'
    | 'Cinema'
    | 'Passeio'
    | 'Doces e café'
    | 'Hospedagem'
    | 'Evento'
    | 'Aeroporto';
  period: 'Dia' | 'Noite' | 'Madrugada' | 'Dia / Noite' | '24h';
  address: string;
  mapsUrl: string;
  hours: string;
  closedDays: string;
  rating: number | null;
  reviewsCount: number | null;
  distanceKm: number;
  driveMinutes: number;
  uberAvg: number;
  uberSurge: number;
  imageUrl: string;
  instagram?: string;
  phone?: string;
  notes: string;
  inOfficialRoute: boolean;
  excludedReason?: string;
  addedBy?: string;
}

interface ItineraryStop {
  id: string;
  dayDate: string; // '2026-12-03' .. '2026-12-10'
  shift: ShiftType;
  timeLabel: string;
  title: string;
  subtitle?: string;
  attractionId?: string;
  tags: string[];
  walkToNext?: string;
  transitTip?: string;
  details: string;
  isMandatory?: boolean;
}

interface ItineraryDay {
  date: string;
  shortLabel: string;
  weekday: string;
  title: string;
  badge: DayBadgeType;
  regionFocus: string;
  summary: string;
  smartAlert?: {
    type: 'warning' | 'info' | 'timeline';
    title: string;
    message: string;
  };
}

interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  subtitle: string;
  amountPerPerson: number | null; // null = "A confirmar" (não inventado)
  isOptional?: boolean;
  included: boolean;
  sourceNote: string;
}

interface TransportLeg {
  id: string;
  dayLabel: string;
  route: string;
  uberAvg: number;
  uberSurge: number;
  tripsCount: number; // ex.: 2 = ida e volta
  included: boolean;
  metroAlternative?: string;
}

interface ChecklistItem {
  id: string;
  priority: 'Alta' | 'Média' | 'Atenção';
  targetDate: string;
  place: string;
  action: string;
  channel: string;
  status: ChecklistStatus;
  notes: string;
}

interface StopVoteEntry {
  id: string;
  stopId: string;
  voterName: string;
  choice: 'yes' | 'no';
  deviceToken: string;
  updatedAt: string;
}

interface PlaceLikeEntry {
  id: string;
  attractionId: string;
  voterName: string;
  deviceToken: string;
  createdAt: string;
}

interface RsvpEntry {
  id: string;
  name: string;
  phone: string;
  status: RsvpStatus;
  periodNote: string;
  comment: string;
  deviceToken: string;
  createdAt: string;
}

interface TripConfig {
  title: string;
  destination: string;
  dateRange: string;
  baseAddress: string;
  baseTransit: string;
  arrivalWindowNote: string;
  airbnbTotalCost: number | null;
  adminPin: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// ============================================================================
// 2. DADOS REAIS EXTRAÍDOS DAS DUAS PLANILHAS (SEM INVENTAR VALORES)
// ============================================================================

const HERO_IMAGES = {
  paulista:
    'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1400&q=80',
  ibirapuera:
    'https://images.unsplash.com/photo-1578002573559-689b0abc4148?auto=format&fit=crop&w=1000&q=80',
  skyline:
    'https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=1000&q=80',
};

// Gera o ícone oficial 512x512 do App (SP 2026) em PNG Data URL para tela inicial iOS/Android
function generateAppIconDataUrl(): string {
  try {
    if (typeof document === 'undefined') return '';
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.55, '#1e3a8a');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const glow = ctx.createRadialGradient(256, 120, 20, 256, 160, 280);
    glow.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
    glow.addColorStop(1, 'rgba(96, 165, 250, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.fillRect(72, 330, 38, 120);
    ctx.fillRect(122, 295, 46, 155);
    ctx.fillRect(182, 345, 34, 105);
    ctx.fillRect(298, 310, 44, 140);
    ctx.fillRect(354, 280, 50, 170);
    ctx.fillRect(416, 335, 36, 115);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.beginPath();
    ctx.roundRect(156, 78, 200, 44, 22);
    ctx.fill();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03–10 DEZ', 256, 101);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 168px system-ui, -apple-system, sans-serif';
    ctx.fillText('SP', 256, 232);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '800 68px system-ui, -apple-system, sans-serif';
    ctx.fillText('2026', 256, 355);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

function readEnvVar(key: string): string {
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
      return process.env[key] as string;
    }
    const win =
      typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
    const runtimeEnv = win?.__ENV__ as Record<string, string> | undefined;
    if (runtimeEnv && typeof runtimeEnv[key] === 'string') {
      return runtimeEnv[key];
    }
  } catch {
    // Ignora
  }
  return '';
}

function decodeBase64Safe(str: string): string {
  try {
    return atob(str);
  } catch {
    return '';
  }
}

function encodeBase64Safe(str: string): string {
  try {
    return btoa(str);
  } catch {
    return '';
  }
}

function copyTextFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function readInitialSupabaseConfig(): { url: string; key: string } {
  let url = readEnvVar('VITE_SUPABASE_URL') || readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  let key = readEnvVar('VITE_SUPABASE_ANON_KEY') || readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  try {
    if (typeof window !== 'undefined' && window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const hashStr = window.location.hash.includes('?')
        ? window.location.hash.split('?')[1]
        : window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hashStr);

      // Suporta formato compacto (?sb=base64) ou explícito (?sb_url=...&sb_key=...)
      const packed = searchParams.get('sb') || hashParams.get('sb');
      if (packed) {
        const decoded = decodeBase64Safe(packed);
        const parsed = JSON.parse(decoded);
        if (parsed?.u && parsed?.k) {
          return { url: String(parsed.u).trim(), key: String(parsed.k).trim() };
        }
      }

      const qUrl = searchParams.get('sb_url') || hashParams.get('sb_url');
      const qKey = searchParams.get('sb_key') || hashParams.get('sb_key');
      if (qUrl && qKey) {
        url = qUrl.trim();
        key = qKey.trim();
      }
    }
  } catch {
    // Ignora
  }
  return { url, key };
}

const INITIAL_CONFIG: TripConfig = {
  title: 'São Paulo 2026 — Viagem em Grupo',
  destination: 'São Paulo, SP',
  dateRange: '03 a 10 de Dezembro de 2026',
  baseAddress: 'R. Domingos de Morais, 1164, ap. 405 — Vila Mariana',
  baseTransit: 'Ao lado das estações Vila Mariana e Ana Rosa (Linha 1-Azul do Metrô)',
  arrivalWindowNote:
    'Pouso em GRU às 23h50 do dia 03/12. Check-in oficial do Airbnb liberado em 04/12 às 15h — definir pernoite ou guarda-malas da 1ª noite aqui.',
  airbnbTotalCost: null,
  adminPin: '2026',
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
};

const INITIAL_DAYS: ItineraryDay[] = [
  {
    date: '2026-12-03',
    shortLabel: '03/12',
    weekday: 'Qui',
    title: 'Chegada em São Paulo (GRU)',
    badge: 'Chegada',
    regionFocus: 'Guarulhos → Vila Mariana / Paulista',
    summary: 'Desembarque no Aeroporto Internacional de Guarulhos (GRU) às 23h50 e deslocamento até São Paulo.',
    smartAlert: {
      type: 'warning',
      title: 'Janela logística: Pouso (23h50) vs. Check-in Airbnb (04/12 às 15h)',
      message:
        'Há um intervalo de ~15h entre o pouso em GRU e a entrada no apartamento da Vila Mariana. Caso fiquem perto da Av. Paulista na 1ª noite, Méqui 1000 e Padaria Bella Paulista funcionam 24h.',
    },
  },
  {
    date: '2026-12-04',
    shortLabel: '04/12',
    weekday: 'Sex',
    title: 'Dia Livre / Check-in Airbnb',
    badge: 'Dia Livre',
    regionFocus: 'Vila Mariana (Base Oficial)',
    summary:
      'Dia livre e flexível para o grupo descansar do voo, acomodar as malas ou fazer passeios leves por conta própria.',
    smartAlert: {
      type: 'info',
      title: 'Dia Livre para o Grupo',
      message:
        'Nenhuma atração obrigatória do grupo está travada hoje. Confira sugestões perto de casa (Vila Mariana, Moema e Ibirapuera) na aba Explorar.',
    },
  },
  {
    date: '2026-12-05',
    shortLabel: '05/12',
    weekday: 'Sáb',
    title: 'CCXP26 (Dia 1 — Abertura) + Noite na Paulista',
    badge: 'CCXP26',
    regionFocus: 'São Paulo Expo → Av. Paulista',
    summary:
      'Entrada cedo na abertura da CCXP26 para garantir os brindes mais disputados e agendamentos, seguida de jantar e madrugada na Av. Paulista.',
  },
  {
    date: '2026-12-06',
    shortLabel: '06/12',
    weekday: 'Dom',
    title: 'Feira da Liberdade + Ibira + CCXP26 (Dia 2) + Santo Mar',
    badge: 'CCXP26',
    regionFocus: 'Liberdade + Ibirapuera → CCXP26 → Tatuapé',
    summary:
      'Dupla obrigatória de fim de semana pela manhã, tarde no 2º dia de CCXP26 e rodízio de frutos do mar no Santo Mar à noite.',
  },
  {
    date: '2026-12-07',
    shortLabel: '07/12',
    weekday: 'Seg',
    title: 'Combo Bichos + Cinema 1 (IMAX) + Joakin’s',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Água Funda + Ipiranga → Vila Olímpia / Itaim',
    summary:
      'Zoológico, Jardim Botânico e Aquário aproveitando a tarifa reduzida de segunda-feira, seguidos de shopping, sessão IMAX with Laser e madrugada no Joakin’s.',
    smartAlert: {
      type: 'timeline',
      title: 'Semáforo de Horário — Combo Bichos (Fecham às 17h)',
      message:
        'Metas recomendadas: 09h00 Zoológico (última entrada 16h) → 11h45 Transfer interno para o Jardim Botânico → 13h45 Uber para o Aquário de SP (fecha 17h).',
    },
  },
  {
    date: '2026-12-08',
    shortLabel: '08/12',
    weekday: 'Ter',
    title: 'MASP + Mata Città + Roda Rico (Tardezinha) + Cinema 2 (VIP)',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Av. Paulista → Villa-Lobos → Pinheiros / JK Iguatemi',
    summary:
      'Manhã cultural gratuita no MASP e almoço no Mata Città, pôr do sol na Roda Rico no Villa-Lobos, Quiz&Show e sessão Sala VIP no Cinépolis JK.',
  },
  {
    date: '2026-12-09',
    shortLabel: '09/12',
    weekday: 'Qua',
    title: 'Lojinhas (Liberdade + Bom Retiro) + Churrasco Coreano + Bario Bar',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Liberdade → Bom Retiro → Cho Sun Gal Bi → Bario Bar Santo Amaro',
    summary:
      'Dia de explorar as galerias da Liberdade e o Bom Retiro, jantar cedo no Churrasco Coreano (Cho Sun Gal Bi) e fechar a noite na maior unidade do Bario Bar (Santo Amaro, 1.500 m²).',
    smartAlert: {
      type: 'warning',
      title: 'Horário do Bom Retiro à Tarde',
      message:
        'Os restaurantes coreanos tradicionais do Bom Retiro (Il Mi Jeong / Kyong Mi Jeong) fecham às 14h30 e só reabrem às 17h. Foque nas lojinhas coreanas e no Supermercado Otugui (soju/snacks) para guardar apetite para o rodízio no Cho Sun Gal Bi às 18h30.',
    },
  },
  {
    date: '2026-12-10',
    shortLabel: '10/12',
    weekday: 'Qui',
    title: 'Dia Livre / Retorno (Aeroporto GRU)',
    badge: 'Dia Livre',
    regionFocus: 'Vila Mariana → Aeroporto Guarulhos (GRU)',
    summary:
      'Dia livre para organizar malas, fazer compras finais ou passeios próximos antes do check-out e ida para o Aeroporto de Guarulhos.',
    smartAlert: {
      type: 'info',
      title: 'Dia Livre / Retorno',
      message:
        'Turno livre antes do embarque de volta. Calcule pelo menos 1h de deslocamento até GRU (30,4 km da Vila Mariana) considerando o trânsito de quinta-feira.',
    },
  },
];

const INITIAL_ATTRACTIONS: AttractionMeta[] = [
  // BASE / EVENTO / AEROPORTO
  {
    id: 'airbnb-vila-mariana',
    name: 'Hospedagem Airbnb — Vila Mariana',
    region: '0. Base (Vila Mariana)',
    category: 'Hospedagem',
    period: '24h',
    address: 'R. Domingos de Morais, 1164, ap. 405 - Vila Mariana, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+Domingos+de+Morais,+1164,+Vila+Mariana,+Sao+Paulo',
    hours: 'Check-in: 04/12 às 15h00 | Check-out: 10/12',
    closedDays: 'Não fecha',
    rating: null,
    reviewsCount: null,
    distanceKm: 0,
    driveMinutes: 0,
    uberAvg: 0,
    uberSurge: 0,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    notes: 'Base da viagem. Colada nas estações Vila Mariana e Ana Rosa (Linha 1-Azul do Metrô), facilitando acesso direto à Liberdade, Centro e Bom Retiro.',
    inOfficialRoute: true,
  },
  {
    id: 'ccxp26',
    name: 'CCXP26 — São Paulo Expo',
    region: '13. Jabaquara / Imigrantes',
    category: 'Evento',
    period: 'Dia',
    address: 'Rodovia dos Imigrantes, km 1,5 - Vila Água Funda, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sao+Paulo+Expo+Rodovia+dos+Imigrantes',
    hours: 'Sáb e Dom: 11h00 às 21h00 (abertura dos portões às 11h)',
    closedDays: 'Evento de 03 a 06/12/2026',
    rating: 4.7,
    reviewsCount: 48200,
    distanceKm: 7.4,
    driveMinutes: 17,
    uberAvg: 23.05,
    uberSurge: 34.58,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    instagram: '@ccxpoficial',
    notes: 'No Sábado (1ª vez), chegar às 10h na fila garante os brindes principais e agendamentos nos estandes. Na saída, use o transfer oficial até o metrô para fugir da tarifa dinâmica.',
    inOfficialRoute: true,
  },
  {
    id: 'aeroporto-gru',
    name: 'Aeroporto Internacional de Guarulhos (GRU)',
    region: '12. Guarulhos (Aeroporto)',
    category: 'Aeroporto',
    period: '24h',
    address: 'Rod. Hélio Smidt, s/nº - Cumbica, Guarulhos - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aeroporto+Internacional+de+Guarulhos',
    hours: '24 horas (Pouso 03/12 às 23h50)',
    closedDays: 'Não fecha',
    rating: 4.4,
    reviewsCount: 95000,
    distanceKm: 30.4,
    driveMinutes: 42,
    uberAvg: 68.2,
    uberSurge: 102.3,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
    notes: 'Ponto de chegada (03/12 às 23h50) e partida (10/12). Uber dividido em 4 pessoas sai ~R$ 17,05 por pessoa na tarifa média.',
    inOfficialRoute: true,
  },

  // REGIÃO 1: VILA MARIANA / IBIRAPUERA / MOEMA
  {
    id: 'parque-ibirapuera',
    name: 'Parque Ibirapuera (Portões 3 e 4)',
    region: '1. Vila Mariana / Ibirapuera / Moema',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'Av. Pedro Álvares Cabral - Vila Mariana, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parque+Ibirapuera+Portao+3+Sao+Paulo',
    hours: 'Todos os dias: 05h00 às 00h00',
    closedDays: 'Não fecha',
    rating: 4.8,
    reviewsCount: 162400,
    distanceKm: 2.3,
    driveMinutes: 8,
    uberAvg: 11.4,
    uberSurge: 17.1,
    imageUrl: 'https://images.unsplash.com/photo-1578002573559-689b0abc4148?auto=format&fit=crop&w=900&q=80',
    instagram: '@ibirapueraoficial',
    notes: 'A 2,3 km da hospedagem. Entrada gratuita. Ideal combinar com o Pavilhão Japonês no domingo de manhã antes da CCXP26.',
    inOfficialRoute: true,
  },
  {
    id: 'pavilhao-japones',
    name: 'Pavilhão Japonês (Parque Ibirapuera)',
    region: '1. Vila Mariana / Ibirapuera / Moema',
    category: 'Museu e cultura',
    period: 'Dia',
    address: 'Av. Pedro Álvares Cabral, s/n - Portão 10 - Parque Ibirapuera, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pavilhao+Japones+Parque+Ibirapuera',
    hours: 'Qui a Dom e feriados: 10h00 às 17h00',
    closedDays: 'Fecha Seg, Ter e Qua',
    rating: 4.7,
    reviewsCount: 8420,
    distanceKm: 2.5,
    driveMinutes: 9,
    uberAvg: 11.9,
    uberSurge: 17.85,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80',
    notes: 'Ingresso ~R$ 15,00 (meia ~R$ 7,50). Lago de carpas e arquitetura tradicional japonesa dentro do Ibirapuera. Só abre de quinta a domingo.',
    inOfficialRoute: true,
  },
  {
    id: 'canton-moema',
    name: 'Cantón Peruvian & Chinese Food (Moema)',
    region: '1. Vila Mariana / Ibirapuera / Moema',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'Av. Juriti, 587 - Moema, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Canton+Av+Juriti+587+Moema',
    hours: 'Seg–Sex: 12h–15h30 e 19h–23h | Sáb: 12h–0h | Dom: 12h–22h',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 2890,
    distanceKm: 3.4,
    driveMinutes: 11,
    uberAvg: 13.8,
    uberSurge: 20.7,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
    instagram: '@canton.br',
    notes: 'Culinária chifa (fusão peruana-chinesa) muito bem avaliada perto da Vila Mariana. Ótima pedida para a noite livre de sexta (04/12). Peça o pisco sour.',
    inOfficialRoute: false,
  },
  {
    id: 'roller-jam-moema',
    name: 'Roller Jam Moema',
    region: '1. Vila Mariana / Ibirapuera / Moema',
    category: 'Bar e noite',
    period: 'Noite',
    address: 'Alameda dos Nhambiquaras, 1980 - Moema, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Roller+Jam+Moema+Sao+Paulo',
    hours: 'Ter–Qui: 15h–22h | Sex–Sáb: 15h–23h | Dom: 14h–21h',
    closedDays: 'Fecha Segunda',
    rating: 4.5,
    reviewsCount: 4120,
    distanceKm: 4.8,
    driveMinutes: 14,
    uberAvg: 17.2,
    uberSurge: 25.8,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    instagram: '@rollerjamoficial',
    notes: 'Pista retrô de patinação com música e lanchonete perto de casa. Dica da pesquisa: se tiver patins próprios, leve para economizar no aluguel.',
    inOfficialRoute: false,
  },

  // REGIÃO 2: IPIRANGA / ÁGUA FUNDA
  {
    id: 'zoologico-sp',
    name: 'Zoológico de São Paulo',
    region: '2. Ipiranga / Água Funda',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'Av. Miguel Estéfano, 4241 - Água Funda, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zoologico+de+Sao+Paulo+Av+Miguel+Estefano+4241',
    hours: 'Seg a Sex: 09h00 às 17h00 (última entrada 16h) | Sáb e Dom: 08h30 às 17h00',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 89400,
    distanceKm: 8.6,
    driveMinutes: 19,
    uberAvg: 25.45,
    uberSurge: 38.18,
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=900&q=80',
    instagram: '@zoologicosp',
    notes: 'Compre online com pelo menos 1 dia de antecedência (R$ 99,90 antecipado vs R$ 119,90 na bilheteria). Mundo Dino opcional (+R$ 59,90). Há transfer interno para o Jardim Botânico.',
    inOfficialRoute: true,
  },
  {
    id: 'jardim-botanico-sp',
    name: 'Jardim Botânico de São Paulo',
    region: '2. Ipiranga / Água Funda',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'Av. Miguel Estéfano, 3031 - Vila Água Funda, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jardim+Botanico+de+Sao+Paulo',
    hours: 'Todos os dias: 09h00 às 17h00 (bilheteria até 16h)',
    closedDays: 'Não fecha',
    rating: 4.7,
    reviewsCount: 31200,
    distanceKm: 7.8,
    driveMinutes: 17,
    uberAvg: 23.6,
    uberSurge: 35.4,
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
    instagram: '@jardimbotanicosp',
    notes: 'Ao lado do Zoológico, conectado por transfer interno. Passarela suspensa na mata atlântica e estufas históricas. Há ingresso combo Zoo + Botânico.',
    inOfficialRoute: true,
  },
  {
    id: 'aquario-sp',
    name: 'Aquário de São Paulo',
    region: '2. Ipiranga / Água Funda',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'R. Huet Bacelar, 407 - Vila São José, Ipiranga, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aquario+de+Sao+Paulo+R+Huet+Bacelar+407',
    hours: 'Todos os dias: 09h00 às 17h00',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 54300,
    distanceKm: 4.6,
    driveMinutes: 13,
    uberAvg: 16.5,
    uberSurge: 24.75,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    instagram: '@aquariodesp',
    notes: 'Maior aquário da América Latina (ursos polares, tubarões, peixe-boi, cangurus). Segunda-feira costuma ter ingresso promocional mais barato que o valor cheio (~R$ 120).',
    inOfficialRoute: true,
  },
  {
    id: 'fillmore-ipiranga',
    name: 'Fillmore Ipiranga',
    region: '2. Ipiranga / Água Funda',
    category: 'Doces e café',
    period: 'Dia',
    address: 'R. Bom Pastor, 1791 - Ipiranga, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Fillmore+Ipiranga+R+Bom+Pastor+1791',
    hours: 'Todos os dias: 08h00 às 22h00',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 1940,
    distanceKm: 4.9,
    driveMinutes: 14,
    uberAvg: 17.3,
    uberSurge: 25.95,
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80',
    instagram: '@fillmoreipiranga',
    notes: 'Padaria/lanchonete estilo diner americano com panquecas, waffles e café da manhã reforçado a partir das 8h.',
    inOfficialRoute: true,
  },
  {
    id: 'museu-ipiranga',
    name: 'Museu do Ipiranga (Museu Paulista)',
    region: '2. Ipiranga / Água Funda',
    category: 'Museu e cultura',
    period: 'Dia',
    address: 'Parque da Independência - Ipiranga, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Museu+do+Ipiranga+Sao+Paulo',
    hours: 'Ter a Dom: 10h00 às 17h00 (última entrada 16h)',
    closedDays: 'Fecha Segunda',
    rating: 4.8,
    reviewsCount: 39609,
    distanceKm: 5.2,
    driveMinutes: 14,
    uberAvg: 17.9,
    uberSurge: 26.85,
    imageUrl: 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?auto=format&fit=crop&w=900&q=80',
    instagram: '@museudoipiranga',
    notes: 'Nota 4,8 com quase 40 mil avaliações! Fica a 968 m do Fillmore/Aquário. Excelente opção extra para os colegas no dia livre (se não for segunda-feira). Ingressos online.',
    inOfficialRoute: false,
  },
  {
    id: 'sushi-ishii',
    name: 'Sushi Ishii (Ipiranga)',
    region: '2. Ipiranga / Água Funda',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'R. Costa Aguiar, 1465 - Ipiranga, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sushi+Ishii+Ipiranga',
    hours: 'Ter–Sex: 11h30–15h e 18h30–23h30 | Sáb–Dom: 12h–23h30',
    closedDays: 'Fecha Segunda',
    rating: 4.5,
    reviewsCount: 3410,
    distanceKm: 4.7,
    driveMinutes: 13,
    uberAvg: 16.7,
    uberSurge: 25.05,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80',
    notes: 'Rodízio japonês tradicional bem perto da Vila Mariana. Ótima opção para a noite livre de sexta (04/12).',
    inOfficialRoute: false,
  },

  // REGIÃO 3: AV. PAULISTA / BELA VISTA / CONSOLAÇÃO
  {
    id: 'masp',
    name: 'MASP — Museu de Arte de São Paulo',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Museu e cultura',
    period: 'Dia / Noite',
    address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MASP+Av+Paulista+1578',
    hours: 'Ter: 10h–20h (entrada até 19h) | Qua–Dom: 10h–18h',
    closedDays: 'Fecha Segunda',
    rating: 4.8,
    reviewsCount: 98500,
    distanceKm: 4.4,
    driveMinutes: 13,
    uberAvg: 16.1,
    uberSurge: 24.15,
    imageUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=900&q=80',
    instagram: '@masp',
    notes: 'Às terças-feiras tem ENTRADA GRATUITA e horário estendido até 20h! Emita o ingresso online antecipado no site oficial para evitar fila na entrada.',
    inOfficialRoute: true,
  },
  {
    id: 'mata-citta',
    name: 'Mata Città (Cidade Matarazzo)',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'Alameda Rio Claro, 190 - Bela Vista (Cidade Matarazzo), São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mata+Citta+Cidade+Matarazzo+Sao+Paulo',
    hours: 'Ter–Sáb: 12h–18h e 19h–22h | Dom: 12h–18h',
    closedDays: 'Fecha Segunda',
    rating: 4.5,
    reviewsCount: 1680,
    distanceKm: 4.6,
    driveMinutes: 14,
    uberAvg: 16.6,
    uberSurge: 24.9,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    instagram: '@matacitta',
    notes: 'A 245 m a pé do MASP. Complexo gastronômico italiano dentro do histórico complexo Cidade Matarazzo. OBRIGATÓRIO RESERVAR pelo site (matacitta.com), senão a fila passa de 1h.',
    inOfficialRoute: true,
  },
  {
    id: 'tartarugas-ninja-pizzaria',
    name: 'Tartarugas Ninja Pizzaria',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Restaurante',
    period: 'Noite',
    address: 'Av. Paulista, 967 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av+Paulista+967+Sao+Paulo',
    hours: 'Todos os dias: 12h00 às 23h00',
    closedDays: 'Não fecha',
    rating: 4.4,
    reviewsCount: 2450,
    distanceKm: 4.1,
    driveMinutes: 12,
    uberAvg: 15.4,
    uberSurge: 23.1,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    notes: 'Pizzaria temática oficial na Av. Paulista, perfeita para o pós-CCXP26 no sábado (05/12). Fica a 824 m a pé do Méqui 1000.',
    inOfficialRoute: true,
  },
  {
    id: 'mequi-1000',
    name: 'Méqui 1000 (Av. Paulista)',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Restaurante',
    period: '24h',
    address: 'Av. Paulista, 1811 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mequi+1000+Av+Paulista+1811',
    hours: 'Aberto 24 horas',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 31800,
    distanceKm: 4.7,
    driveMinutes: 14,
    uberAvg: 16.8,
    uberSurge: 25.2,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    notes: 'Unidade temática icônica num casarão histórico da Paulista, com itens exclusivos no cardápio. Funciona 24h — salva na madrugada da chegada (03/12) e pós-CCXP.',
    inOfficialRoute: true,
  },
  {
    id: 'riviera-bar',
    name: 'Riviera Bar',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Bar e noite',
    period: '24h',
    address: 'Av. Paulista, 2584 - Consolação, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Riviera+Bar+Av+Paulista+2584',
    hours: 'Aberto 24 horas',
    closedDays: 'Não fecha',
    rating: 4.4,
    reviewsCount: 7920,
    distanceKm: 5.3,
    driveMinutes: 15,
    uberAvg: 18.1,
    uberSurge: 27.15,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
    instagram: '@rivierabarsp',
    notes: 'Bar clássico da esquina da Paulista com a Consolação, balcão vermelho icônico e drinks autorais. Aberto 24 horas.',
    inOfficialRoute: true,
  },
  {
    id: 'paris-6-classique',
    name: 'Paris 6 Classique',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Restaurante',
    period: '24h',
    address: 'R. Haddock Lobo, 1240 - Cerqueira César, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Paris+6+Classique+R+Haddock+Lobo+1240',
    hours: 'Aberto 24 horas',
    closedDays: 'Não fecha',
    rating: 4.3,
    reviewsCount: 22400,
    distanceKm: 5.6,
    driveMinutes: 16,
    uberAvg: 18.8,
    uberSurge: 28.2,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
    notes: 'Bistrô 24h famoso pelos pratos com nomes de artistas e o Grand Gateau. Dica da planilha: baixe/use o app do Paris 6 para pegar cupons de desconto.',
    inOfficialRoute: true,
  },
  {
    id: 'padaria-bella-paulista',
    name: 'Padaria Bella Paulista',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Doces e café',
    period: '24h',
    address: 'R. Haddock Lobo, 354 - Cerqueira César, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Padaria+Bella+Paulista+R+Haddock+Lobo+354',
    hours: 'Aberto 24 horas',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 38900,
    distanceKm: 5.2,
    driveMinutes: 15,
    uberAvg: 17.9,
    uberSurge: 26.85,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    notes: 'Uma das padarias 24h mais famosas de SP (lanches, doces, sopas e café da manhã completo de madrugada).',
    inOfficialRoute: true,
  },
  {
    id: 'itau-cultural',
    name: 'Itaú Cultural',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Museu e cultura',
    period: 'Dia / Noite',
    address: 'Av. Paulista, 149 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Itau+Cultural+Av+Paulista+149',
    hours: 'Ter a Sáb: 11h00 às 20h00 | Dom: 11h00 às 19h00',
    closedDays: 'Fecha Segunda',
    rating: 4.8,
    reviewsCount: 18200,
    distanceKm: 3.4,
    driveMinutes: 10,
    uberAvg: 13.9,
    uberSurge: 20.85,
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80',
    notes: 'Exposições interativas gratuitas no início da Av. Paulista (ao lado do Metrô Brigadeiro).',
    inOfficialRoute: true,
  },
  {
    id: 'shopping-cidade-sp',
    name: 'Shopping Cidade São Paulo',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Shopping',
    period: 'Dia / Noite',
    address: 'Av. Paulista, 1230 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shopping+Cidade+Sao+Paulo+Av+Paulista+1230',
    hours: 'Seg–Sáb: 10h00 às 22h00 | Dom: 14h00 às 20h00',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 41200,
    distanceKm: 4.2,
    driveMinutes: 12,
    uberAvg: 15.6,
    uberSurge: 23.4,
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=80',
    notes: 'No coração da Paulista, ótimo apoio entre o Itaú Cultural, MASP e Mata Città.',
    inOfficialRoute: true,
  },
  {
    id: 'cine-marquise',
    name: 'Cine Marquise (Conjunto Nacional)',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Cinema',
    period: 'Dia / Noite',
    address: 'Av. Paulista, 2073 - Consolação, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cine+Marquise+Conjunto+Nacional+Av+Paulista',
    hours: 'Todos os dias (conforme programação)',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 3100,
    distanceKm: 5.0,
    driveMinutes: 14,
    uberAvg: 17.5,
    uberSurge: 26.25,
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    notes: 'Cinema tradicional no Conjunto Nacional (Av. Paulista). No roteiro oficial priorizamos o Cinépolis JK Iguatemi pelas salas IMAX with Laser e VIP.',
    inOfficialRoute: false,
  },
  {
    id: 'mirante-sesc-paulista',
    name: 'Mirante do Sesc Avenida Paulista',
    region: '3. Av. Paulista / Bela Vista',
    category: 'Passeio',
    period: 'Dia / Noite',
    address: 'Av. Paulista, 119 - Bela Vista, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sesc+Avenida+Paulista+119',
    hours: 'Temporariamente fechado para obras',
    closedDays: 'Fechado (em reforma)',
    rating: 4.8,
    reviewsCount: 24100,
    distanceKm: 3.3,
    driveMinutes: 10,
    uberAvg: 13.7,
    uberSurge: 20.55,
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    notes: 'Substituído pelo terraço do Sesc 24 de Maio no dia 09/12.',
    inOfficialRoute: false,
    excludedReason: 'Fechado temporariamente para obras/reforma sem previsão de reabertura — substituído pelo Sesc 24 de Maio.',
  },

  // REGIÃO 4: LIBERDADE
  {
    id: 'feira-liberdade',
    name: 'Feira da Liberdade (Praça da Liberdade)',
    region: '4. Liberdade',
    category: 'Passeio',
    period: 'Dia',
    address: 'Praça da Liberdade - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Praca+da+Liberdade+Sao+Paulo',
    hours: 'Sáb e Dom: 09h00 às 18h00',
    closedDays: 'Não funciona Seg a Sex',
    rating: 4.6,
    reviewsCount: 52300,
    distanceKm: 4.5,
    driveMinutes: 13,
    uberAvg: 16.3,
    uberSurge: 24.45,
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80',
    notes: 'Só funciona aos sábados e domingos! Comida de rua asiática (takoyaki, guioza, tempurá) e artesanato. Chegar às 09h no domingo (06/12) evita multidões.',
    inOfficialRoute: true,
  },
  {
    id: 'museu-imigracao-japonesa',
    name: 'Museu Histórico da Imigração Japonesa',
    region: '4. Liberdade',
    category: 'Museu e cultura',
    period: 'Dia',
    address: 'R. São Joaquim, 381 - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Museu+Historico+da+Imigracao+Japonesa+Liberdade',
    hours: 'Ter a Dom: 10h00 às 16h00',
    closedDays: 'Fecha Segunda',
    rating: 4.7,
    reviewsCount: 5420,
    distanceKm: 4.1,
    driveMinutes: 12,
    uberAvg: 15.4,
    uberSurge: 23.1,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
    notes: 'Às quartas-feiras costuma ter entrada gratuita! Tem uma cafeteria agradável com vista no 9º andar do prédio.',
    inOfficialRoute: true,
  },
  {
    id: 'tanka-restaurante',
    name: 'Tanka Restaurante (Buffet Livre Asiático)',
    region: '4. Liberdade',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'Praça da Liberdade, 149 - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tanka+Restaurante+Praca+da+Liberdade+149',
    hours: 'Ter–Sex: 11h30–15h e 18h–22h | Sáb–Dom: 11h30–16h e 18h–22h',
    closedDays: 'Fecha Segunda',
    rating: 4.6,
    reviewsCount: 11800,
    distanceKm: 4.5,
    driveMinutes: 13,
    uberAvg: 16.3,
    uberSurge: 24.45,
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80',
    instagram: '@tankarestaurante',
    notes: 'Buffet asiático super completo em frente à saída do Metrô Japão-Liberdade (sushi, sashimi, teppan, dim sum, pratos quentes). Muito mais tranquilo na quarta-feira (09/12).',
    inOfficialRoute: true,
  },
  {
    id: 'nyko-lamen',
    name: 'Nyko Lamen',
    region: '4. Liberdade',
    category: 'Restaurante',
    period: 'Dia',
    address: 'R. Galvão Bueno, 425 (Galeria) - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nyko+Lamen+Liberdade+Sao+Paulo',
    hours: 'Seg e Qui a Dom: 12h00 às 17h00',
    closedDays: 'Fecha Terça e Quarta',
    rating: 4.8,
    reviewsCount: 1320,
    distanceKm: 4.4,
    driveMinutes: 13,
    uberAvg: 16.1,
    uberSurge: 24.15,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    notes: 'Box artesanal de lamen dentro de galeria na Liberdade (~R$ 50 por pessoa). Atenção: fecha terça e quarta, por isso entra no almoço rápido de domingo (06/12).',
    inOfficialRoute: true,
  },
  {
    id: 'thai-e-san',
    name: 'Thai E-San (Culinária Tailandesa)',
    region: '4. Liberdade',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'R. Barão de Iguape, 373 - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Thai+E-San+Liberdade+Sao+Paulo',
    hours: 'Ter a Dom: 11h30–15h e 18h–22h',
    closedDays: 'Fecha Segunda',
    rating: 4.7,
    reviewsCount: 2740,
    distanceKm: 4.6,
    driveMinutes: 13,
    uberAvg: 16.5,
    uberSurge: 24.75,
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=900&q=80',
    notes: 'Autêntica comida tailandesa na Liberdade (Pad Thai, curry, arroz de manga). Ótima alternativa ao Tanka na quarta-feira.',
    inOfficialRoute: true,
  },
  {
    id: 'currys-indiana',
    name: "Curry's Culinária Indiana",
    region: '4. Liberdade',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'R. Thomaz Gonzaga, 95 - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Currys+Culinaria+Indiana+Liberdade',
    hours: 'Ter a Dom: 11h30–15h e 18h–22h30',
    closedDays: 'Fecha Segunda',
    rating: 4.6,
    reviewsCount: 1890,
    distanceKm: 4.4,
    driveMinutes: 13,
    uberAvg: 16.1,
    uberSurge: 24.15,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    notes: 'Clássico indiano na Liberdade (também há unidade em Pinheiros). Opção para quarta-feira na Liberdade.',
    inOfficialRoute: true,
  },
  {
    id: 'kureiji-candy',
    name: 'Kureiji Candy',
    region: '4. Liberdade',
    category: 'Doces e café',
    period: 'Dia',
    address: 'R. Galvão Bueno - Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kureiji+Candy+Liberdade+Sao+Paulo',
    hours: 'Todos os dias: 10h00 às 19h00',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 840,
    distanceKm: 4.4,
    driveMinutes: 13,
    uberAvg: 16.1,
    uberSurge: 24.15,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80',
    notes: 'Famosa pelo doce viral de panda tremelicante e sobremesas asiáticas instagramáveis.',
    inOfficialRoute: true,
  },
  {
    id: 'lulu-candy',
    name: 'Lulu Candy',
    region: '4. Liberdade',
    category: 'Doces e café',
    period: 'Dia',
    address: 'Liberdade, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lulu+Candy+Liberdade+Sao+Paulo',
    hours: 'Todos os dias: 10h00 às 19h00',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 620,
    distanceKm: 4.4,
    driveMinutes: 13,
    uberAvg: 16.1,
    uberSurge: 24.15,
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80',
    notes: 'Loja de doces asiáticos, balas importadas e guloseimas temáticas na Liberdade.',
    inOfficialRoute: true,
  },

  // REGIÃO 5: CENTRO HISTÓRICO / VILA BUARQUE
  {
    id: 'farol-santander',
    name: 'Farol Santander',
    region: '5. Centro Histórico / Vila Buarque',
    category: 'Museu e cultura',
    period: 'Dia / Noite',
    address: 'R. João Brícola, 24 - Centro Histórico, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Farol+Santander+R+Joao+Bricola+24',
    hours: 'Ter a Dom: 09h00 às 20h00',
    closedDays: 'Fecha Segunda',
    rating: 4.7,
    reviewsCount: 28900,
    distanceKm: 5.7,
    driveMinutes: 16,
    uberAvg: 19.0,
    uberSurge: 28.5,
    imageUrl: 'https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=900&q=80',
    instagram: '@farolsantander',
    notes: 'Prédio histórico estilo Empire State com mirante 360º no topo, exposições imersivas e pista de skate no 21º andar. Acesso direto pela Estação São Bento (Linha 1-Azul).',
    inOfficialRoute: true,
  },
  {
    id: 'sesc-24-de-maio',
    name: 'Sesc 24 de Maio (Terraço / Mirante)',
    region: '5. Centro Histórico / Vila Buarque',
    category: 'Passeio',
    period: 'Dia / Noite',
    address: 'R. 24 de Maio, 109 - República, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sesc+24+de+Maio+109+Sao+Paulo',
    hours: 'Ter a Sáb: 09h00 às 21h00 | Dom e feriados: 09h00 às 18h00',
    closedDays: 'Fecha Segunda',
    rating: 4.8,
    reviewsCount: 31500,
    distanceKm: 5.9,
    driveMinutes: 16,
    uberAvg: 19.4,
    uberSurge: 29.1,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    notes: 'Fica a 625 m a pé do Farol Santander. Projeto de Paulo Mendes da Rocha com vista panorâmica do Centro e cafeteria no terraço.',
    inOfficialRoute: true,
  },
  {
    id: 'tokyo-sp',
    name: 'Tokyo (Prédio Japonês — Karaokê & Rooftop)',
    region: '5. Centro Histórico / Vila Buarque',
    category: 'Bar e noite',
    period: 'Noite / Madrugada',
    address: 'R. Major Sertório, 110 - Vila Buarque, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tokyo+R+Major+Sertorio+110+Sao+Paulo',
    hours: 'Ter–Qui: 17h–5h | Sex: 17h–6h | Sáb: 12h–6h | Dom: 12h–23h',
    closedDays: 'Fecha Segunda',
    rating: 4.4,
    reviewsCount: 9840,
    distanceKm: 6.2,
    driveMinutes: 17,
    uberAvg: 20.1,
    uberSurge: 30.15,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
    instagram: '@tokyo.sp',
    notes: 'Prédio de 9 andares com karaokê coletivo e privativo, restaurante e pista no rooftop. Chegando antes das 19h costuma ser grátis; após 19h entrada ~R$ 40.',
    inOfficialRoute: true,
  },
  {
    id: 'estadao-lanches',
    name: 'Bar e Lanches Estadão',
    region: '5. Centro Histórico / Vila Buarque',
    category: 'Restaurante',
    period: '24h',
    address: 'Viaduto Nove de Julho, 193 - Centro, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bar+e+Lanches+Estadao+Viaduto+9+de+Julho',
    hours: 'Aberto 24 horas',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 27600,
    distanceKm: 5.9,
    driveMinutes: 16,
    uberAvg: 19.4,
    uberSurge: 29.1,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
    notes: 'Patrimônio gastronômico 24h de SP, famoso pelo sanduíche de pernil com queijo. Fica a 439 m a pé do Tokyo.',
    inOfficialRoute: true,
  },
  {
    id: 'santa-efigenia',
    name: 'Rua Santa Efigênia (Eletrônicos & LED)',
    region: '5. Centro Histórico / Vila Buarque',
    category: 'Passeio',
    period: 'Dia',
    address: 'R. Santa Ifigênia - República, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Santa+Ifigenia+Sao+Paulo',
    hours: 'Seg a Sex: 09h00 às 18h00 | Sáb: 09h00 às 13h30',
    closedDays: 'Fecha Domingo',
    rating: 4.3,
    reviewsCount: 15400,
    distanceKm: 6.5,
    driveMinutes: 18,
    uberAvg: 20.8,
    uberSurge: 31.2,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    notes: 'Maior polo de eletrônicos, painéis de LED, áudio, cabos e drones do Brasil. Evitar domingo (fechado).',
    inOfficialRoute: false,
  },

  // REGIÃO 6: BOM RETIRO (BAIRRO COREANO)
  {
    id: 'bom-retiro-coreano',
    name: 'Bom Retiro — Lojinhas & Supermercado Otugui',
    region: '6. Bom Retiro (Bairro Coreano)',
    category: 'Passeio',
    period: 'Dia / Noite',
    address: 'R. Três Rios, 251 (Supermercado Otugui) - Bom Retiro, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Supermercado+Otugui+R+Tres+Rios+251+Bom+Retiro',
    hours: 'Lojas/Mercado: ~09h–18h | Restaurantes (Il Mi Jeong / Kyong Mi Jeong): 11h30–14h30 e 17h–20h30',
    closedDays: 'Domingo (maioria das lojas)',
    rating: 4.7,
    reviewsCount: 4320,
    distanceKm: 8.1,
    driveMinutes: 20,
    uberAvg: 24.3,
    uberSurge: 36.45,
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80',
    notes: 'Polo da cultura coreana em SP. Na tarde de quarta (09/12), foco nas lojinhas de k-beauty/moda/presentes e no Supermercado Otugui (soju, snacks e lamen). Acesso fácil pela Estação Luz/Tiradentes (Linha 1-Azul).',
    inOfficialRoute: true,
  },

  // REGIÃO 7: VILA OLÍMPIA / ITAIM BIBI / BROOKLIN
  {
    id: 'shopping-jk-iguatemi',
    name: 'Shopping JK Iguatemi & Cinépolis (IMAX + Sala VIP)',
    region: '7. Vila Olímpia / Itaim Bibi / Brooklin',
    category: 'Cinema',
    period: 'Dia / Noite',
    address: 'Av. Pres. Juscelino Kubitschek, 2041 - Vila Olímpia, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shopping+JK+Iguatemi+Sao+Paulo',
    hours: 'Shopping: 10h00 às 22h00 | Cinema: conforme sessões até madrugada',
    closedDays: 'Não fecha',
    rating: 4.7,
    reviewsCount: 44800,
    distanceKm: 6.0,
    driveMinutes: 16,
    uberAvg: 19.6,
    uberSurge: 29.4,
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    notes: 'Reúne as duas sessões de cinema do grupo: 1ª sala IMAX with Laser do Brasil (Sessão 1 na Seg 07/12) e Salas VIP com poltronas reclináveis e serviço de garçom (Sessão 2 na Ter 08/12).',
    inOfficialRoute: true,
  },
  {
    id: 'bob-esponja-burguer',
    name: 'Bob Esponja Burguer & Restaurante (Itaim Bibi)',
    region: '7. Vila Olímpia / Itaim Bibi / Brooklin',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'Av. Pres. Juscelino Kubitschek, 1726 - Itaim Bibi, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bob+Esponja+Burguer+Itaim+Bibi',
    hours: 'Todos os dias: 12h00 às 22h00',
    closedDays: 'Não fecha',
    rating: 4.4,
    reviewsCount: 6840,
    distanceKm: 5.8,
    driveMinutes: 15,
    uberAvg: 19.1,
    uberSurge: 28.65,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
    notes: 'Maior restaurante temático do Bob Esponja do mundo (3 andares estilo Siri Cascudo), a poucos passos do JK Iguatemi.',
    inOfficialRoute: true,
  },
  {
    id: 'joakins',
    name: "Joakin's Hamburgueria (Itaim Bibi)",
    region: '7. Vila Olímpia / Itaim Bibi / Brooklin',
    category: 'Restaurante',
    period: 'Noite / Madrugada',
    address: 'R. Joaquim Floriano, 163 - Itaim Bibi, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Joakins+Hamburgueria+Itaim+Bibi',
    hours: 'Seg–Qua: 12h–02h | Qui: 12h–04h | Sex–Sáb: 12h–05h | Dom: 12h–02h',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 14200,
    distanceKm: 5.5,
    driveMinutes: 15,
    uberAvg: 18.5,
    uberSurge: 27.75,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    notes: 'Clássica hamburgueria paulistana desde 1965, aberta até 02h na segunda-feira pós-IMAX no JK Iguatemi.',
    inOfficialRoute: true,
  },

  // REGIÃO 10: TATUAPÉ / SANTO AMARO (BARIO BAR MAIOR UNIDADE)
  {
    id: 'bario-bar',
    name: 'Bario Bar — Unidade Santo Amaro (Maior Unidade)',
    region: '10. Tatuapé & Santo Amaro',
    category: 'Bar e noite',
    period: 'Noite',
    address: 'Av. Washington Luiz, 1860 - Santo Amaro, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bario+Bar+Av+Washington+Luiz+1860+Santo+Amaro',
    hours: 'Seg: 17h–22h | Ter a Qui: 17h–00h | Sex: 17h–01h | Sáb: 12h–01h | Dom: 15h–22h',
    closedDays: 'Não fecha',
    rating: 4.7,
    reviewsCount: 5420,
    distanceKm: 8.5,
    driveMinutes: 18,
    uberAvg: 25.2,
    uberSurge: 37.8,
    imageUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=900&q=80',
    instagram: '@bariobar',
    notes: 'Maior bar arcade da América Latina (1.500 m² e mais de 100 jogos entre fliperamas, pinballs e simuladores). De segunda a quinta NÃO cobra entrada! Fica na Zona Sul, bem perto da Vila Mariana para voltar à meia-noite.',
    inOfficialRoute: true,
  },
  {
    id: 'cho-sun-gal-bi',
    name: 'Cho Sun Gal Bi (Churrasco Coreano na Mesa)',
    region: '10. Tatuapé & Santo Amaro',
    category: 'Restaurante',
    period: 'Noite',
    address: 'R. Emília Marengo, 320 / R. Serra de Japi, 1212 - Tatuapé, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cho+Sun+Gal+Bi+Tatuape+Sao+Paulo',
    hours: 'Ter a Qui: 12h–14h30 e 18h–22h | Sex–Sáb: até 23h | Dom: 12h–20h (cozinha fecha 30 min antes)',
    closedDays: 'Fecha Segunda',
    rating: 4.6,
    reviewsCount: 2490,
    distanceKm: 10.8,
    driveMinutes: 23,
    uberAvg: 30.2,
    uberSurge: 45.3,
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80',
    instagram: '@chosuntatuape',
    notes: 'Rodízio de churrasco coreano onde o próprio grupo grelha as carnes na chapa embutida na mesa + acompanhamentos típicos. Encaixado às 18h30 antes do Bario Bar Santo Amaro (cozinha encerra às 21h30). Confirmar reserva antes.',
    inOfficialRoute: true,
  },
  {
    id: 'santo-mar',
    name: 'Santo Mar (Rodízio de Frutos do Mar)',
    region: '10. Tatuapé & Santo Amaro',
    category: 'Restaurante',
    period: 'Dia / Noite',
    address: 'R. Serra de Bragança, 1599 - Tatuapé, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Santo+Mar+Tatuape+Sao+Paulo',
    hours: 'Ter–Sex: 12h–15h e 18h30–22h30 | Sáb–Dom: 12h–22h30',
    closedDays: 'Fecha Segunda',
    rating: 4.5,
    reviewsCount: 4120,
    distanceKm: 11.3,
    driveMinutes: 24,
    uberAvg: 31.3,
    uberSurge: 46.95,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80',
    instagram: '@santomartatuape',
    notes: 'Rodízio completo de frutos do mar no Tatuapé (camarão, lula, polvo, peixes, paella). Encaixado no Domingo (06/12) à noite pois fecha na segunda-feira.',
    inOfficialRoute: true,
  },
  {
    id: 'bom-boliche',
    name: 'Bom Boliche (Tatuapé)',
    region: '10. Tatuapé & Santo Amaro',
    category: 'Bar e noite',
    period: 'Noite',
    address: 'R. Emília Marengo, 320 - Tatuapé, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bom+Boliche+Tatuape+Sao+Paulo',
    hours: 'Ter–Qui: 16h–00h | Sex–Sáb: 16h–02h | Dom: 15h–23h',
    closedDays: 'Fecha Segunda',
    rating: 4.4,
    reviewsCount: 3890,
    distanceKm: 11.0,
    driveMinutes: 24,
    uberAvg: 30.6,
    uberSurge: 45.9,
    imageUrl: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=900&q=80',
    notes: 'Alternativa de boliche no Tatuapé para o grupo.',
    inOfficialRoute: true,
  },
  {
    id: 'pophaus-tatuape',
    name: 'PopHaus (Parque de Infláveis Gigantes)',
    region: '10. Tatuapé & Santo Amaro',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'R. Dr. Rubens Gomes Bueno, 288 / Tatuapé - São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=PopHaus+Tatuape+Sao+Paulo',
    hours: 'Qua–Qui: 13h–19h | Sex: 13h–20h | Sáb: 10h–20h | Dom: 10h–19h',
    closedDays: 'Fecha Segunda e Terça',
    rating: 4.9,
    reviewsCount: 6210,
    distanceKm: 10.5,
    driveMinutes: 23,
    uberAvg: 29.5,
    uberSurge: 44.25,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80',
    notes: 'Nota 4,9! Parque de infláveis gigantes com circuitos e área aquática no Tatuapé.',
    inOfficialRoute: false,
  },

  // REGIÃO 8: PINHEIROS / VILA MADALENA
  {
    id: 'quiz-and-show',
    name: 'Quiz&Show (Pinheiros)',
    region: '8. Pinheiros / Vila Madalena',
    category: 'Passeio',
    period: 'Dia / Noite',
    address: 'R. Fradique Coutinho, 1399 - Pinheiros, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Quiz+e+Show+Pinheiros+Sao+Paulo',
    hours: 'Todos os dias: 10h00 às 22h00 (sessões com hora marcada)',
    closedDays: 'Não fecha',
    rating: 4.9,
    reviewsCount: 1920,
    distanceKm: 8.2,
    driveMinutes: 20,
    uberAvg: 24.5,
    uberSurge: 36.75,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    instagram: '@quizandshow',
    notes: 'Experiência imersiva de programa de auditório / game show de TV com bancadas, botões e apresentador para grupos. EXIGE AGENDAMENTO PRÉVIO DE SESSÃO.',
    inOfficialRoute: true,
  },
  {
    id: 'beco-do-batman',
    name: 'Beco do Batman (Vila Madalena)',
    region: '8. Pinheiros / Vila Madalena',
    category: 'Passeio',
    period: 'Dia',
    address: 'R. Medeiros de Albuquerque, 82-154 - Vila Madalena, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Beco+do+Batman+Vila+Madalena',
    hours: '24 horas (melhor visitar durante o dia)',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 48700,
    distanceKm: 8.5,
    driveMinutes: 21,
    uberAvg: 25.2,
    uberSurge: 37.8,
    imageUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=900&q=80',
    notes: 'Galeria de arte urbana e grafite a céu aberto na Vila Madalena. Entrada gratuita. Boa pedida para os dias livres (04/12 ou 10/12).',
    inOfficialRoute: false,
  },
  {
    id: 'fantasmagoria-bar',
    name: 'Fantasmagória Bar (Temático de Terror)',
    region: '8. Pinheiros / Vila Madalena',
    category: 'Bar e noite',
    period: 'Noite',
    address: 'Pinheiros, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Fantasmagoria+Bar+Pinheiros+Sao+Paulo',
    hours: 'Qua–Sex: 18h–00h | Sáb: 16h–00h | Dom: 16h–22h',
    closedDays: 'Fecha Segunda e Terça',
    rating: 4.7,
    reviewsCount: 1180,
    distanceKm: 7.9,
    driveMinutes: 19,
    uberAvg: 23.9,
    uberSurge: 35.85,
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80',
    notes: 'Bar inspirado em clássicos do cinema de terror com drinks temáticos e cenografia.',
    inOfficialRoute: false,
  },

  // REGIÃO 9: ALTO DE PINHEIROS (VILLA-LOBOS)
  {
    id: 'parque-villa-lobos',
    name: 'Parque Villa-Lobos',
    region: '9. Alto de Pinheiros (Villa-Lobos)',
    category: 'Parque e lazer',
    period: 'Dia',
    address: 'Av. Prof. Fonseca Rodrigues, 2001 - Alto de Pinheiros, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parque+Villa+Lobos+Sao+Paulo',
    hours: 'Todos os dias: 05h30 às 19h00',
    closedDays: 'Não fecha',
    rating: 4.7,
    reviewsCount: 82300,
    distanceKm: 12.6,
    driveMinutes: 26,
    uberAvg: 34.15,
    uberSurge: 51.23,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    notes: 'Entrada gratuita. Área plana arborizada ao lado da Roda Rico e da Orla TotalPass.',
    inOfficialRoute: true,
  },
  {
    id: 'orla-totalpass',
    name: 'Orla TotalPass (Praia Urbana no Villa-Lobos)',
    region: '9. Alto de Pinheiros (Villa-Lobos)',
    category: 'Parque e lazer',
    period: 'Dia / Noite',
    address: 'Dentro do Parque Villa-Lobos - Alto de Pinheiros, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Orla+TotalPass+Parque+Villa+Lobos',
    hours: 'Todos os dias: 08h00 às 22h00',
    closedDays: 'Não fecha',
    rating: 4.5,
    reviewsCount: 1640,
    distanceKm: 12.7,
    driveMinutes: 26,
    uberAvg: 34.35,
    uberSurge: 51.53,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    notes: 'Faixa de areia, quadras de beach tennis e quiosques dentro do parque. Aluguel opcional de guarda-sol + 2 cadeiras (~R$ 25).',
    inOfficialRoute: true,
  },
  {
    id: 'roda-rico',
    name: 'Roda Rico (Maior Roda-Gigante da América Latina)',
    region: '9. Alto de Pinheiros (Villa-Lobos)',
    category: 'Passeio',
    period: 'Dia / Tardezinha',
    address: 'Av. Queiroz Filho, 1365 - Vila Hamburguesa (ao lado do Villa-Lobos), São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Roda+Rico+Sao+Paulo',
    hours: 'Ter a Sex: 12h00 às 19h30 | Sáb e Dom: 10h00 às 19h30',
    closedDays: 'Fecha Segunda',
    rating: 4.5,
    reviewsCount: 14900,
    distanceKm: 13.3,
    driveMinutes: 27,
    uberAvg: 35.8,
    uberSurge: 53.7,
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=900&q=80',
    instagram: '@rodaricooficial',
    notes: '91 metros de altura, cabines climatizadas com ar-condicionado e som Bluetooth para o grupo conectar a própria playlist! Encaixada na "tardezinha" (17h30–18h45) para pegar o pôr do sol com pouco sol.',
    inOfficialRoute: true,
  },
  {
    id: 'shopping-villa-lobos',
    name: 'Shopping Villa-Lobos',
    region: '9. Alto de Pinheiros (Villa-Lobos)',
    category: 'Shopping',
    period: 'Dia / Noite',
    address: 'Av. das Nações Unidas, 4777 - Alto de Pinheiros, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shopping+Villa+Lobos+Sao+Paulo',
    hours: 'Seg–Sáb: 10h00 às 22h00 | Dom: 14h00 às 20h00',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 33400,
    distanceKm: 12.1,
    driveMinutes: 25,
    uberAvg: 33.1,
    uberSurge: 49.65,
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
    notes: 'Ao lado do Parque Villa-Lobos e da Roda Rico.',
    inOfficialRoute: true,
  },

  // REGIÃO 11: BARRA FUNDA / RIBEIRÃO PIRES (EXCLUÍDO JUSTIFICADO)
  {
    id: 'atlanta-snooker-bar',
    name: 'Atlanta Snooker Bar (Barra Funda)',
    region: '11. Barra Funda / Outros',
    category: 'Bar e noite',
    period: 'Noite / Madrugada',
    address: 'R. Barra Funda, 1066 - Barra Funda, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Atlanta+Snooker+Bar+Barra+Funda',
    hours: 'Seg: 16h–2h30 | Ter–Qui: 16h–3h30 | Sex–Sáb: 16h–4h | Dom: 17h–2h30',
    closedDays: 'Não fecha',
    rating: 4.6,
    reviewsCount: 3420,
    distanceKm: 9.8,
    driveMinutes: 22,
    uberAvg: 28.0,
    uberSurge: 42.0,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    notes: 'Salão tradicional de sinuca e snooker sem couvert artístico nem taxa de 10%. Opção de madrugada pós-Tatuapé.',
    inOfficialRoute: true,
  },
  {
    id: 'torre-de-miroku',
    name: 'Torre de Miroku (Ribeirão Pires)',
    region: '11. Barra Funda / Outros',
    category: 'Passeio',
    period: 'Dia',
    address: 'Estrada do Taquaral, s/n - Ribeirão Pires - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Torre+de+Miroku+Ribeirao+Pires',
    hours: 'Sáb e Dom (somente barco agendado)',
    closedDays: 'Seg a Sex',
    rating: 4.7,
    reviewsCount: 4120,
    distanceKm: 34.9,
    driveMinutes: 46,
    uberAvg: 94.05,
    uberSurge: 141.08,
    imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=80',
    notes: 'Removida do roteiro oficial a pedido do grupo.',
    inOfficialRoute: false,
    excludedReason: 'Cancelada pelo grupo: fica a 34,9 km (Ribeirão Pires), exige deslocamento de barco com horário fixo e consumiria um turno inteiro.',
  },
];

const INITIAL_STOPS: ItineraryStop[] = [
  // 03/12 QUI
  {
    id: 'stop-03-1',
    dayDate: '2026-12-03',
    shift: 'Noite e Madrugada',
    timeLabel: '23h50',
    title: 'Chegada no Aeroporto Internacional de Guarulhos (GRU)',
    subtitle: 'Desembarque e deslocamento para São Paulo',
    attractionId: 'aeroporto-gru',
    tags: ['Chegada', 'GRU'],
    transitTip: 'Uber dividido em 4 pessoas sai ~R$ 17,05 por pessoa (tarifa média).',
    details:
      'Pouso previsto às 23h50 em Guarulhos. Atenção: o check-in oficial do Airbnb na Vila Mariana começa no dia 04/12 às 15h00. Caso o grupo fique próximo à Av. Paulista na primeira noite, o Méqui 1000 e a Padaria Bella Paulista funcionam 24 horas.',
  },
  {
    id: 'stop-03-2',
    dayDate: '2026-12-03',
    shift: 'Noite e Madrugada',
    timeLabel: 'Madrugada (Opcional)',
    title: 'Méqui 1000 ou Padaria Bella Paulista (24h)',
    subtitle: 'Apoio gastronômico 24h na região da Paulista',
    attractionId: 'mequi-1000',
    tags: ['24h', 'Opcional'],
    details:
      'Opções abertas 24 horas caso o grupo esteja pela Av. Paulista durante a madrugada de chegada.',
  },

  // 04/12 SEX — DIA LIVRE APENAS COM CHECK-IN AIRBNB
  {
    id: 'stop-04-1',
    dayDate: '2026-12-04',
    shift: 'Manhã e Almoço',
    timeLabel: 'Manhã Livre',
    title: 'Turno Livre — Descanso ou Passeios Próximos',
    subtitle: 'Sem programação obrigatória do grupo',
    tags: ['Dia Livre'],
    details:
      'Manhã livre para descanso pós-viagem ou passeios leves por conta própria (veja sugestões perto da Vila Mariana na aba Explorar).',
  },
  {
    id: 'stop-04-2',
    dayDate: '2026-12-04',
    shift: 'Tarde',
    timeLabel: 'A partir das 15h00',
    title: 'Check-in Oficial no Airbnb — Vila Mariana',
    subtitle: 'R. Domingos de Morais, 1164, ap. 405 — Vila Mariana',
    attractionId: 'airbnb-vila-mariana',
    tags: ['Base Oficial', 'Check-in'],
    transitTip: 'Colado nas estações Vila Mariana e Ana Rosa (Linha 1-Azul do Metrô).',
    details:
      'Liberação oficial do apartamento base do grupo na Vila Mariana a partir das 15h00. Tarde e noite livres para acomodação e descanso antes do fim de semana de CCXP26.',
    isMandatory: true,
  },

  // 05/12 SÁB — CCXP26 DIA 1 + PAULISTA
  {
    id: 'stop-05-1',
    dayDate: '2026-12-05',
    shift: 'Manhã e Almoço',
    timeLabel: '10h00 – 12h00',
    title: 'Fila de Abertura da CCXP26 — São Paulo Expo',
    subtitle: 'Portões abrem às 11h00 — Estratégia de 1ª vez',
    attractionId: 'ccxp26',
    tags: ['CCXP26', 'Obrigatório', 'Brindes'],
    transitTip: '7,4 km da Vila Mariana (~R$ 5,76 por pessoa no Uber ÷ 4).',
    details:
      'Chegar às 10h00 para pegar a abertura dos portões às 11h00 permite entrar na primeira leva e correr direto para os estandes principais (Prime Video, Warner, Netflix, Crunchyroll) antes que acabem os brindes e agendamentos do dia.',
    isMandatory: true,
  },
  {
    id: 'stop-05-2',
    dayDate: '2026-12-05',
    shift: 'Tarde',
    timeLabel: '12h00 – 19h30',
    title: 'CCXP26 — Painéis, Estandes e Artists’ Valley',
    subtitle: 'Almoço na praça de alimentação do evento',
    attractionId: 'ccxp26',
    tags: ['CCXP26'],
    transitTip: 'Na saída, pegue o transfer oficial da CCXP até o metrô para fugir da dinâmica de Uber na porta.',
    details:
      'Tarde dedicada às ativações dos estúdios, auditórios e compras no Artists’ Valley.',
    isMandatory: true,
  },
  {
    id: 'stop-05-3',
    dayDate: '2026-12-05',
    shift: 'Noite e Madrugada',
    timeLabel: '20h15 – 23h00',
    title: 'Tartarugas Ninja Pizzaria (Av. Paulista)',
    subtitle: 'Jantar temático pós-CCXP26 (Av. Paulista, 967)',
    attractionId: 'tartarugas-ninja-pizzaria',
    tags: ['Jantar', 'Fecha 23h'],
    walkToNext: '824 m a pé pela Av. Paulista até o Méqui 1000',
    details:
      'Pizzaria temática das Tartarugas Ninja na Av. Paulista. Funciona até as 23h00.',
  },
  {
    id: 'stop-05-4',
    dayDate: '2026-12-05',
    shift: 'Noite e Madrugada',
    timeLabel: '23h00 – Madrugada',
    title: 'Riviera Bar + Méqui 1000 ou Paris 6 Classique',
    subtitle: 'Drinks e madrugada 24h na Paulista / Jardins',
    attractionId: 'riviera-bar',
    tags: ['24h', 'Madrugada'],
    details:
      'Esticada noturna na Av. Paulista: Riviera Bar (24h), Méqui 1000 (24h) ou Paris 6 Classique (24h — use o app do Paris 6 para pegar desconto).',
  },

  // 06/12 DOM — FEIRA DA LIBERDADE + IBIRA + CCXP26 DIA 2 + SANTO MAR
  {
    id: 'stop-06-1',
    dayDate: '2026-12-06',
    shift: 'Manhã e Almoço',
    timeLabel: '09h00 – 11h00',
    title: 'Liberdade (Ida 1) — Feira da Liberdade + Doces + Nyko Lamen',
    subtitle: 'Feira só abre sáb/dom + Lulu Candy, Kureiji Candy e Nyko Lamen',
    attractionId: 'feira-liberdade',
    tags: ['Só Sáb/Dom', 'Metrô Linha Azul'],
    transitTip: 'Metrô Vila Mariana → Japão-Liberdade direto pela Linha 1-Azul (sem baldeação).',
    details:
      'Chegada cedo (09h00) na Feira da Liberdade antes de lotar, parada nas lojas de doces Lulu Candy e Kureiji Candy, e opção de almoço rápido no Nyko Lamen (abre às 12h; fecha terça e quarta).',
  },
  {
    id: 'stop-06-2',
    dayDate: '2026-12-06',
    shift: 'Manhã e Almoço',
    timeLabel: '10h30 – 12h45',
    title: 'Parque Ibirapuera + Pavilhão Japonês',
    subtitle: 'Dupla obrigatória de fim de semana perto de casa',
    attractionId: 'pavilhao-japones',
    tags: ['Fecha Seg–Qua', '~R$ 15'],
    details:
      'Passeio pelo Parque Ibirapuera (Portões 3/4) e visita ao Pavilhão Japonês (Portão 10, aberto 10h–17h, ~R$ 15). Como o Pavilhão fecha de segunda a quarta, domingo de manhã é o encaixe ideal antes da CCXP26.',
  },
  {
    id: 'stop-06-3',
    dayDate: '2026-12-06',
    shift: 'Tarde',
    timeLabel: '13h00 – 19h00',
    title: 'CCXP26 (Dia 2) — São Paulo Expo',
    subtitle: 'Entrada sem fila de abertura para compras e estandes finais',
    attractionId: 'ccxp26',
    tags: ['CCXP26', 'Obrigatório'],
    details:
      'Segundo dia de CCXP26 entrando às 13h00 sem fila na porta, focando em cosplays, compras e estandes que ficaram pendentes no sábado. Saída às 19h00 direto para o Tatuapé.',
    isMandatory: true,
  },
  {
    id: 'stop-06-4',
    dayDate: '2026-12-06',
    shift: 'Noite e Madrugada',
    timeLabel: '20h00 – 22h30',
    title: 'Santo Mar (Tatuapé) — Rodízio de Frutos do Mar',
    subtitle: 'Jantar Obrigatório 1 do grupo',
    attractionId: 'santo-mar',
    tags: ['Obrigatório', 'Fecha Segunda'],
    details:
      'Rodízio completo de frutos do mar no Tatuapé (aberto domingo até 22h30; fecha às segundas-feiras). Confirmar reserva para o grupo.',
    isMandatory: true,
  },
  {
    id: 'stop-06-5',
    dayDate: '2026-12-06',
    shift: 'Noite e Madrugada',
    timeLabel: 'Pós-jantar (Opcional)',
    title: 'Tokyo (Centro) + Bar e Lanches Estadão (24h)',
    subtitle: 'Karaokê/rooftop até 23h + sanduíche de pernil a 439 m a pé',
    attractionId: 'tokyo-sp',
    tags: ['Opcional', '24h'],
    walkToNext: '439 m a pé do Tokyo até o Bar e Lanches Estadão',
    details:
      'Para quem ainda tiver energia após o Santo Mar: passada no Tokyo (domingo aberto até 23h) e lanche da madrugada no Estadão (24h).',
  },

  // 07/12 SEG — COMBO BICHOS + CINEMA 1 IMAX + JOAKIN'S
  {
    id: 'stop-07-1',
    dayDate: '2026-12-07',
    shift: 'Manhã e Almoço',
    timeLabel: '08h00 (Opcional)',
    title: 'Fillmore Ipiranga — Café da Manhã / Brunch Americano',
    subtitle: 'Esquenta antes de abrir o Zoológico',
    attractionId: 'fillmore-ipiranga',
    tags: ['Café', 'Opcional'],
    details:
      'Café da manhã estilo diner americano (panquecas, ovos, waffles) a partir das 08h00 no Ipiranga.',
  },
  {
    id: 'stop-07-2',
    dayDate: '2026-12-07',
    shift: 'Manhã e Almoço',
    timeLabel: '09h00 – 13h30',
    title: 'Zoológico de São Paulo + Jardim Botânico',
    subtitle: 'Safári, Mundo Dino e transfer interno entre os dois parques',
    attractionId: 'zoologico-sp',
    tags: ['Obrigatório', 'Ingresso Antecipado'],
    transitTip: 'Transfer interno conecta o Zoológico diretamente ao Jardim Botânico (~11h45).',
    details:
      'Chegada na abertura às 09h00 para fazer o Safári e o Mundo Dino (+R$ 59,90 opcional). Compre online com pelo menos 1 dia de antecedência (R$ 99,90 vs R$ 119,90 na hora). Às 11h45, pegue o transfer interno para o Jardim Botânico (aberto até 17h).',
    isMandatory: true,
  },
  {
    id: 'stop-07-3',
    dayDate: '2026-12-07',
    shift: 'Tarde',
    timeLabel: '13h45 – 16h45',
    title: 'Aquário de São Paulo (Ipiranga)',
    subtitle: 'Ingresso promocional mais barato às segundas-feiras',
    attractionId: 'aquario-sp',
    tags: ['Obrigatório', 'Mais barato na Seg'],
    details:
      'Tarde no Aquário de São Paulo (aberto até 17h). Segunda-feira costuma ter valor de ingresso reduzido em relação ao preço cheio (~R$ 120).',
    isMandatory: true,
  },
  {
    id: 'stop-07-4',
    dayDate: '2026-12-07',
    shift: 'Noite e Madrugada',
    timeLabel: '17h15 – 19h45',
    title: 'Shopping Vila Olímpia → Shopping JK Iguatemi + Bob Esponja Burguer',
    subtitle: 'Terraço com sofás + jantar temático de 3 andares (fecha 22h)',
    attractionId: 'bob-esponja-burguer',
    tags: ['Jantar', 'Fecha 22h'],
    walkToNext: '492 m a pé do Shopping Vila Olímpia até o Shopping JK Iguatemi',
    details:
      'Passada no terraço do Shopping Vila Olímpia, caminhada de 492 m até o JK Iguatemi e jantar no Bob Esponja Burguer & Restaurante (3 andares estilo Siri Cascudo; fecha às 22h).',
  },
  {
    id: 'stop-07-5',
    dayDate: '2026-12-07',
    shift: 'Noite e Madrugada',
    timeLabel: '20h00 – 22h30',
    title: 'Cinépolis JK Iguatemi — Sessão IMAX with Laser',
    subtitle: '1ª sala IMAX with Laser do Brasil (tela gigante e som 12 canais)',
    attractionId: 'shopping-jk-iguatemi',
    tags: ['Cinema', 'IMAX with Laser', 'Reservar Assentos'],
    details:
      'Primeira sessão de cinema do grupo no JK Iguatemi, focada na experiência audiovisual máxima da sala IMAX with Laser. Comprar assentos antecipados no app.',
    isMandatory: false,
  },
  {
    id: 'stop-07-6',
    dayDate: '2026-12-07',
    shift: 'Noite e Madrugada',
    timeLabel: '22h30 – 01h30',
    title: "Joakin's Hamburgueria (Itaim Bibi)",
    subtitle: 'Clássico da madrugada aberto até 02h na segunda-feira',
    attractionId: 'joakins',
    tags: ['Madrugada', 'Até 02h'],
    details:
      "A 1,1 km do JK Iguatemi. Lanchonete icônica de SP aberta até as 02h00 mesmo na segunda-feira, com porções grandes e milkshakes para o grupo.",
  },

  // 08/12 TER — MASP + MATA CITTÀ + RODA RICO TARDEZINHA + CINEMA 2 VIP
  {
    id: 'stop-08-1',
    dayDate: '2026-12-08',
    shift: 'Manhã e Almoço',
    timeLabel: '10h00 – 12h30',
    title: 'Av. Paulista a Pé: Itaú Cultural + MASP (Grátis na Terça) + Shopping Cidade SP',
    subtitle: 'Terça-feira tem entrada gratuita no MASP e horário estendido até 20h',
    attractionId: 'masp',
    tags: ['Obrigatório', 'Grátis na Terça', 'Emitir Online'],
    walkToNext: '245 m a pé do MASP até o Mata Città (Cidade Matarazzo)',
    details:
      'Manhã caminhando pela Av. Paulista: Itaú Cultural (grátis, abre 11h), MASP (entrada gratuita às terças-feiras — emita o ingresso online antes para não pegar fila) e Shopping Cidade São Paulo.',
    isMandatory: true,
  },
  {
    id: 'stop-08-2',
    dayDate: '2026-12-08',
    shift: 'Manhã e Almoço',
    timeLabel: '12h30 – 14h30',
    title: 'Mata Città — Cidade Matarazzo',
    subtitle: 'Almoço gastronômico italiano (OBRIGATÓRIO RESERVAR)',
    attractionId: 'mata-citta',
    tags: ['Obrigatório', 'Reserva Obrigatória'],
    details:
      'A 245 m do MASP. Complexo gastronômico italiano dentro do histórico complexo Cidade Matarazzo (almoço 12h–18h). Faça reserva antecipada pelo site (matacitta.com), pois sem reserva a fila passa de 1 hora.',
    isMandatory: true,
  },
  {
    id: 'stop-08-3',
    dayDate: '2026-12-08',
    shift: 'Tarde',
    timeLabel: '15h00 – 17h30',
    title: 'Parque Villa-Lobos + Orla TotalPass + Shopping Villa-Lobos',
    subtitle: 'Parque, praia urbana opcional e apoio ao lado da roda-gigante',
    attractionId: 'parque-villa-lobos',
    tags: ['Parque', 'Praia Urbana'],
    walkToNext: 'Acesso direto a pé até a Roda Rico (ao lado do parque)',
    details:
      'Tarde no Parque Villa-Lobos, praia urbana Orla TotalPass (areia e beach tennis; aluguel opcional de guarda-sol + 2 cadeiras ~R$ 25) e Shopping Villa-Lobos.',
  },
  {
    id: 'stop-08-4',
    dayDate: '2026-12-08',
    shift: 'Tarde',
    timeLabel: '17h30 – 18h45',
    title: 'Roda Rico — Pôr do Sol ("Tardezinha")',
    subtitle: '91 m de altura, cabines com ar-condicionado e som Bluetooth',
    attractionId: 'roda-rico',
    tags: ['Obrigatório', 'Pôr do Sol', 'Fecha 19h30'],
    details:
      'Horário estratégico no fim da tarde ("tardezinha" com pouco sol) para ver o pôr do sol e as luzes da cidade acendendo nas cabines climatizadas com Bluetooth. Fecha às 19h30.',
    isMandatory: true,
  },
  {
    id: 'stop-08-5',
    dayDate: '2026-12-08',
    shift: 'Noite e Madrugada',
    timeLabel: '19h30 – 21h15',
    title: 'Quiz&Show (Pinheiros) + Esquenta no Beco da Vila Olímpia',
    subtitle: 'Game show de TV em times (agendar sessão) + chope self-service',
    attractionId: 'quiz-and-show',
    tags: ['Obrigatório', 'Agendar Sessão'],
    details:
      'Competição em times estilo programa de auditório de TV no Quiz&Show em Pinheiros (necessário agendar horário da sessão) e esquenta rápido no Beco da Vila Olímpia (até 23h).',
    isMandatory: true,
  },
  {
    id: 'stop-08-6',
    dayDate: '2026-12-08',
    shift: 'Noite e Madrugada',
    timeLabel: '21h30 – Madrugada',
    title: 'Cinépolis JK Iguatemi — Sala VIP',
    subtitle: 'Poltronas reclináveis com jantar gourmet servido no assento',
    attractionId: 'shopping-jk-iguatemi',
    tags: ['Cinema', 'Sala VIP', 'Reservar Assentos'],
    details:
      'Segunda sessão de cinema no JK Iguatemi, agora na Sala VIP com poltronas largas reclináveis e cardápio servido por garçom na poltrona. Madrugada opcional na Padaria Bella Paulista (24h).',
    isMandatory: false,
  },

  // 09/12 QUA — LOJINHAS (LIBERDADE + BOM RETIRO) + CHURRASCO COREANO + BARIO BAR SANTO AMARO
  {
    id: 'stop-09-1',
    dayDate: '2026-12-09',
    shift: 'Manhã e Almoço',
    timeLabel: '10h00 – 14h30',
    title: 'Liberdade (Ida 2 com Calma): Museu da Imigração + Lojinhas + Tanka',
    subtitle: 'Quarta costuma ter entrada grátis no museu e galerias muito mais vazias',
    attractionId: 'tanka-restaurante',
    tags: ['Metrô Linha Azul', 'Lojinhas', 'Grátis na Qua'],
    transitTip: 'Metrô Vila Mariana → Japão-Liberdade direto pela Linha 1-Azul.',
    details:
      'Visita ao Museu Histórico da Imigração Japonesa (10h–16h; quarta costuma ser grátis; café com vista no 9º andar), tempo livre para explorar as lojinhas e galerias da Liberdade sem aperto de fim de semana, e almoço no Tanka Restaurante (buffet livre asiático, 11h30–15h) ou Thai E-San / Curry’s.',
  },
  {
    id: 'stop-09-2',
    dayDate: '2026-12-09',
    shift: 'Tarde',
    timeLabel: '14h45 – 17h45',
    title: 'Centro (Farol Santander + Sesc 24 de Maio) & Bom Retiro (Lojinhas Coreanas)',
    subtitle: 'Mirante + skate park + lojinhas coreanas e Supermercado Otugui',
    attractionId: 'bom-retiro-coreano',
    tags: ['Metrô Linha Azul', 'Lojinhas Coreanas'],
    walkToNext: '625 m a pé entre Farol Santander e Sesc 24 de Maio',
    details:
      'Passada rápida pelo Farol Santander (mirante e skate park no 21º andar) e Sesc 24 de Maio, seguindo pela Linha 1-Azul até o Bom Retiro para rodar as lojinhas coreanas (k-beauty, moda, papelaria/presentes) e o Supermercado Otugui (R. Três Rios, 251 — soju e snacks).',
  },
  {
    id: 'stop-09-3',
    dayDate: '2026-12-09',
    shift: 'Noite e Madrugada',
    timeLabel: '18h30 – 20h30',
    title: 'Cho Sun Gal Bi — Churrasco Coreano Grelhado na Mesa',
    subtitle: 'Jantar primeiro (antes da cozinha fechar às 21h30)',
    attractionId: 'cho-sun-gal-bi',
    tags: ['Churrasco Coreano', 'Confirmar Reserva'],
    transitTip: 'Saindo do jantar às 20h30, vocês seguem direto para a maior unidade do Bario Bar (Santo Amaro).',
    details:
      'Começamos a noite jantando cedo no rodízio de churrasco coreano (18h–22h, cozinha encerra às 21h30), grelhando os cortes na chapa embutida na mesa com calma antes de ir para o bar.',
    isMandatory: true,
  },
  {
    id: 'stop-09-4',
    dayDate: '2026-12-09',
    shift: 'Noite e Madrugada',
    timeLabel: '21h00 – 00h00',
    title: 'Bario Bar — Unidade Santo Amaro (Maior Unidade • 1.500 m²)',
    subtitle: 'Mais de 100 fliperamas, pinballs e drinks até meia-noite (entrada grátis na quarta)',
    attractionId: 'bario-bar',
    tags: ['Maior Unidade', 'Fliperama', 'Até 00h'],
    transitTip: 'Fica na Zona Sul, a apenas 8,5 km (~18 min) da hospedagem na Vila Mariana para a volta.',
    details:
      'Pós-jantar na maior unidade do Bario Bar (Av. Washington Luiz, 1860 — Santo Amaro): 1.500 m² com mais de 100 games, pinballs, simuladores e drinks autorais até 00h00. De segunda a quinta não cobra entrada!',
    isMandatory: true,
  },
  {
    id: 'stop-09-5',
    dayDate: '2026-12-09',
    shift: 'Noite e Madrugada',
    timeLabel: 'Opcional Madrugada',
    title: 'Atlanta Snooker Bar (Barra Funda) ou Bom Boliche',
    subtitle: 'Esticada opcional pós-meia-noite',
    attractionId: 'atlanta-snooker-bar',
    tags: ['Opcional Madrugada'],
    details:
      'Para quem ainda quiser esticar após o fechamento do Bario Bar à meia-noite: sinuca no Atlanta Snooker Bar (até 03h30).',
  },

  // 10/12 QUI — DIA LIVRE / VOLTA GRU
  {
    id: 'stop-10-1',
    dayDate: '2026-12-10',
    shift: 'Manhã e Almoço',
    timeLabel: 'Manhã e Tarde Livres',
    title: 'Dia Livre — Malas, Compras Finais ou Passeios Próximos',
    subtitle: 'Sem programação obrigatória do grupo antes do embarque',
    tags: ['Dia Livre'],
    details:
      'Turno livre para organizar malas, descansar ou fazer compras finais (sugestões na aba Explorar).',
  },
  {
    id: 'stop-10-2',
    dayDate: '2026-12-10',
    shift: 'Noite e Madrugada',
    timeLabel: 'Retorno',
    title: 'Check-out Airbnb & Deslocamento para Aeroporto de Guarulhos (GRU)',
    subtitle: 'Voo de volta para casa',
    attractionId: 'aeroporto-gru',
    tags: ['Check-out', 'GRU'],
    transitTip: '30,4 km da Vila Mariana (~42 min sem trânsito; saiam com folga).',
    details:
      'Check-out do apartamento na Vila Mariana e deslocamento em grupo para o Aeroporto Internacional de Guarulhos (GRU) para o voo de retorno.',
    isMandatory: true,
  },
];

const INITIAL_TRANSPORT_LEGS: TransportLeg[] = [
  {
    id: 'leg-gru',
    dayLabel: '03/12 e 10/12',
    route: 'Aeroporto GRU ↔ Vila Mariana (Ida e Volta)',
    uberAvg: 68.2,
    uberSurge: 102.3,
    tripsCount: 2,
    included: true,
  },
  {
    id: 'leg-ccxp',
    dayLabel: '05/12 e 06/12',
    route: 'Vila Mariana ↔ CCXP26 São Paulo Expo (2 dias — 4 trechos)',
    uberAvg: 23.05,
    uberSurge: 34.58,
    tripsCount: 4,
    included: true,
    metroAlternative: 'Na volta, use o transfer oficial até o metrô para evitar tarifa dinâmica na porta.',
  },
  {
    id: 'leg-tatuape-dom',
    dayLabel: '06/12 (Dom)',
    route: 'CCXP26 → Santo Mar (Tatuapé) → Vila Mariana',
    uberAvg: 31.3,
    uberSurge: 46.95,
    tripsCount: 2,
    included: true,
  },
  {
    id: 'leg-bichos-jk',
    dayLabel: '07/12 (Seg)',
    route: 'Vila Mariana → Zoo → Aquário → JK Iguatemi → Vila Mariana',
    uberAvg: 21.1,
    uberSurge: 31.65,
    tripsCount: 4,
    included: true,
  },
  {
    id: 'leg-villalobos-jk',
    dayLabel: '08/12 (Ter)',
    route: 'Paulista → Villa-Lobos / Roda Rico → Pinheiros / JK → Vila Mariana',
    uberAvg: 29.8,
    uberSurge: 44.7,
    tripsCount: 3,
    included: true,
    metroAlternative: 'Ida da Vila Mariana até a Paulista pode ser feita de Metrô (Linha 1-Azul / 2-Verde).',
  },
  {
    id: 'leg-tatuape-qua',
    dayLabel: '09/12 (Qua)',
    route: 'Bom Retiro → Cho Sun Gal Bi → Bario Bar Santo Amaro → Vila Mariana',
    uberAvg: 28.5,
    uberSurge: 42.75,
    tripsCount: 3,
    included: true,
    metroAlternative: 'Manhã e tarde (Vila Mariana ↔ Liberdade ↔ São Bento ↔ Luz/Bom Retiro) são 100% na Linha 1-Azul do Metrô!',
  },
];

const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  // INGRESSOS
  {
    id: 'bud-zoo',
    category: 'Ingressos',
    name: 'Zoológico de São Paulo (Ingresso Antecipado)',
    subtitle: 'R$ 99,90 online (com 1+ dia de antecedência) vs R$ 119,90 na bilheteria',
    amountPerPerson: 99.9,
    included: true,
    sourceNote: 'Valor documentado na planilha (tarifa antecipada online).',
  },
  {
    id: 'bud-mundo-dino',
    category: 'Ingressos',
    name: 'Mundo Dino (Atração extra dentro do Zoológico)',
    subtitle: 'Opcional dentro do complexo do Zoo',
    amountPerPerson: 59.9,
    isOptional: true,
    included: false,
    sourceNote: 'Valor opcional documentado na planilha.',
  },
  {
    id: 'bud-aquario',
    category: 'Ingressos',
    name: 'Aquário de São Paulo (Segunda-feira)',
    subtitle: 'Valor cheio ~R$ 120,00 (segunda-feira costuma ter desconto promocional)',
    amountPerPerson: 120.0,
    included: true,
    sourceNote: 'Valor cheio documentado na planilha (sujeito a desconto de segunda-feira).',
  },
  {
    id: 'bud-ccxp',
    category: 'Ingressos',
    name: 'CCXP26 (Credencial Sábado + Domingo)',
    subtitle: 'A confirmar conforme lote adquirido por cada participante',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-cine-imax',
    category: 'Ingressos',
    name: 'Cinépolis JK Iguatemi — Sessão 1 (IMAX with Laser)',
    subtitle: 'Segunda-feira 07/12 à noite',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar quando abrir a grade da semana.',
  },
  {
    id: 'bud-cine-vip',
    category: 'Ingressos',
    name: 'Cinépolis JK Iguatemi — Sessão 2 (Sala VIP)',
    subtitle: 'Terça-feira 08/12 à noite',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar quando abrir a grade da semana.',
  },
  {
    id: 'bud-roda-rico',
    category: 'Ingressos',
    name: 'Roda Rico (Ingresso Tardezinha)',
    subtitle: 'Terça-feira 08/12 às 17h30',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar no site oficial da Roda Rico.',
  },
  {
    id: 'bud-farol',
    category: 'Ingressos',
    name: 'Farol Santander (Mirante & Exposições)',
    subtitle: 'Quarta-feira 09/12 à tarde',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar no site do Farol Santander.',
  },
  {
    id: 'bud-masp',
    category: 'Ingressos',
    name: 'MASP (Terça-feira Gratuita)',
    subtitle: 'Entrada gratuita às terças mediante emissão online antecipada',
    amountPerPerson: 0,
    included: true,
    sourceNote: 'Documentado na planilha: terça-feira gratuita.',
  },

  // PASSEIOS
  {
    id: 'bud-pavilhao',
    category: 'Passeios',
    name: 'Pavilhão Japonês (Parque Ibirapuera)',
    subtitle: 'Domingo 06/12 pela manhã (~R$ 15,00 inteira)',
    amountPerPerson: 15.0,
    included: true,
    sourceNote: 'Valor aproximado documentado na planilha.',
  },
  {
    id: 'bud-orla',
    category: 'Passeios',
    name: 'Orla TotalPass (Guarda-sol + 2 cadeiras — opcional)',
    subtitle: 'Parque Villa-Lobos (08/12)',
    amountPerPerson: 25.0,
    isOptional: true,
    included: false,
    sourceNote: 'Valor opcional documentado na planilha.',
  },
  {
    id: 'bud-tokyo',
    category: 'Passeios',
    name: 'Tokyo (Entrada pós-19h — opcional)',
    subtitle: 'Grátis antes das 19h; ~R$ 40,00 após 19h',
    amountPerPerson: 40.0,
    isOptional: true,
    included: false,
    sourceNote: 'Valor opcional documentado na planilha.',
  },
  {
    id: 'bud-quiz',
    category: 'Passeios',
    name: 'Quiz&Show (Sessão em grupo — Pinheiros)',
    subtitle: 'Terça-feira 08/12 às 19h30',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar no agendamento da sessão.',
  },
  {
    id: 'bud-bario',
    category: 'Passeios',
    name: 'Bario Bar Santo Amaro (Créditos de Fliperama / Pinball)',
    subtitle: 'Quarta-feira 09/12 às 21h00 (entrada grátis na quarta)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'Consumo livre — preencher média no Admin.',
  },
  {
    id: 'bud-boliche',
    category: 'Passeios',
    name: 'Bom Boliche / Sinuca (Opcional)',
    subtitle: 'A confirmar conforme escolha do grupo',
    amountPerPerson: null,
    included: false,
    sourceNote: 'Opcional.',
  },

  // ALIMENTAÇÃO
  {
    id: 'bud-nyko',
    category: 'Alimentação',
    name: 'Nyko Lamen (Liberdade)',
    subtitle: 'Almoço rápido de domingo (06/12)',
    amountPerPerson: 50.0,
    included: true,
    sourceNote: 'Valor médio documentado na planilha (~R$ 50).',
  },
  {
    id: 'bud-santomar',
    category: 'Alimentação',
    name: 'Santo Mar (Rodízio de Frutos do Mar — Tatuapé)',
    subtitle: 'Jantar Obrigatório 1 (Domingo 06/12)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-chosun',
    category: 'Alimentação',
    name: 'Cho Sun Gal Bi (Rodízio Churrasco Coreano — Tatuapé)',
    subtitle: 'Jantar Obrigatório 2 (Quarta 09/12)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-matacitta',
    category: 'Alimentação',
    name: 'Mata Città (Cidade Matarazzo)',
    subtitle: 'Almoço de terça-feira (08/12)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-tanka',
    category: 'Alimentação',
    name: 'Tanka Restaurante (Buffet Livre Asiático — Liberdade)',
    subtitle: 'Almoço de quarta-feira (09/12)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-bob-joakins',
    category: 'Alimentação',
    name: 'Bob Esponja Burguer + Joakin’s (Segunda 07/12)',
    subtitle: 'Jantar + lanche da madrugada no Itaim/Vila Olímpia',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },
  {
    id: 'bud-paulista-food',
    category: 'Alimentação',
    name: 'Tartarugas Ninja Pizzaria + Madrugada Paulista (Sáb 05/12)',
    subtitle: 'Jantar pós-CCXP26',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin.',
  },

  // HOSPEDAGEM
  {
    id: 'bud-pernoite-extra',
    category: 'Hospedagem',
    name: 'Pernoite / Guarda-malas Noite de Chegada (03/12 → 04/12)',
    subtitle: 'Janela entre pouso em GRU (23h50) e check-in Airbnb (15h)',
    amountPerPerson: null,
    included: true,
    sourceNote: 'A confirmar — preencher no Admin se houver custo extra.',
  },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    priority: 'Alta',
    targetDate: '05 e 06/12',
    place: 'CCXP26 — São Paulo Expo',
    action: 'Garantir credenciais de Sábado e Domingo + baixar app oficial para agendamento de estandes',
    channel: 'Site / App oficial CCXP26',
    status: 'Pendente',
    notes: 'No sábado chegar às 10h para abertura dos portões às 11h.',
  },
  {
    id: 'chk-2',
    priority: 'Alta',
    targetDate: '03/12 → 04/12',
    place: 'Logística Chegada GRU / Airbnb Vila Mariana',
    action: 'Definir acomodação ou guarda-malas entre o pouso (23h50) e o check-in oficial (04/12 às 15h)',
    channel: 'Airbnb / Host Vila Mariana',
    status: 'Pendente',
    notes: 'R. Domingos de Morais, 1164, ap. 405.',
  },
  {
    id: 'chk-3',
    priority: 'Alta',
    targetDate: '06/12 (Dom)',
    place: 'Santo Mar (Tatuapé)',
    action: 'Reservar mesa para o grupo no jantar de domingo (20h00)',
    channel: '@santomartatuape / Telefone',
    status: 'Pendente',
    notes: 'Fecha às segundas-feiras.',
  },
  {
    id: 'chk-4',
    priority: 'Alta',
    targetDate: '07/12 (Seg)',
    place: 'Zoológico de São Paulo + Jardim Botânico',
    action: 'Comprar ingressos online com pelo menos 1 dia de antecedência (combo Zoo + Botânico)',
    channel: 'Site oficial Zoológico SP',
    status: 'Pendente',
    notes: 'R$ 99,90 antecipado vs R$ 119,90 na bilheteria. Avaliar Mundo Dino (+R$ 59,90).',
  },
  {
    id: 'chk-5',
    priority: 'Média',
    targetDate: '07/12 (Seg)',
    place: 'Aquário de São Paulo (Ipiranga)',
    action: 'Comprar ingressos online para segunda-feira (tarifa promocional)',
    channel: 'Site oficial Aquário de SP',
    status: 'Pendente',
    notes: 'Fecha às 17h00.',
  },
  {
    id: 'chk-6',
    priority: 'Alta',
    targetDate: '07/12 (Seg)',
    place: 'Cinépolis JK Iguatemi — Sala IMAX with Laser',
    action: 'Comprar assentos marcados antecipados para a sessão da noite (20h00)',
    channel: 'App / Site Cinépolis ou Ingresso.com',
    status: 'Pendente',
    notes: 'Sessão IMAX with Laser (segunda à noite).',
  },
  {
    id: 'chk-7',
    priority: 'Alta',
    targetDate: '08/12 (Ter)',
    place: 'MASP — Museu de Arte de São Paulo',
    action: 'Emitir ingressos gratuitos de terça-feira no site oficial',
    channel: 'masp.org.br',
    status: 'Pendente',
    notes: 'Terça tem entrada grátis e funcionamento até 20h00.',
  },
  {
    id: 'chk-8',
    priority: 'Alta',
    targetDate: '08/12 (Ter)',
    place: 'Mata Città (Cidade Matarazzo)',
    action: 'Fazer reserva obrigatória de mesa para o almoço (12h30)',
    channel: 'matacitta.com',
    status: 'Pendente',
    notes: 'Sem reserva a fila passa de 1 hora.',
  },
  {
    id: 'chk-9',
    priority: 'Média',
    targetDate: '08/12 (Ter)',
    place: 'Roda Rico (Villa-Lobos)',
    action: 'Comprar ingressos antecipados para o horário do pôr do sol (17h30)',
    channel: 'Site oficial Roda Rico',
    status: 'Pendente',
    notes: 'Fecha às 19h30.',
  },
  {
    id: 'chk-10',
    priority: 'Alta',
    targetDate: '08/12 (Ter)',
    place: 'Quiz&Show (Pinheiros)',
    action: 'Agendar sessão privada/em times para o grupo (19h30)',
    channel: '@quizandshow / Site oficial',
    status: 'Pendente',
    notes: 'Funciona somente com horário agendado.',
  },
  {
    id: 'chk-11',
    priority: 'Alta',
    targetDate: '08/12 (Ter)',
    place: 'Cinépolis JK Iguatemi — Sala VIP',
    action: 'Comprar poltronas VIP marcadas para a sessão da noite (21h30)',
    channel: 'App / Site Cinépolis ou Ingresso.com',
    status: 'Pendente',
    notes: 'Sessão Sala VIP (terça à noite).',
  },
  {
    id: 'chk-12',
    priority: 'Alta',
    targetDate: '09/12 (Qua)',
    place: 'Cho Sun Gal Bi (Tatuapé)',
    action: 'Confirmar reserva de mesas com churrasqueira para o grupo (18h30)',
    channel: '@chosuntatuape / Telefone',
    status: 'Pendente',
    notes: 'Jantar às 18h30 antes de seguir para o Bario Bar Santo Amaro às 21h00.',
  },
  {
    id: 'chk-13',
    priority: 'Média',
    targetDate: '09/12 (Qua)',
    place: 'Bario Bar — Unidade Santo Amaro (Maior Unidade)',
    action: 'Conferir disponibilidade/mesas para o grupo às 21h00 (Av. Washington Luiz, 1860)',
    channel: 'bario.com.br / @bariobar',
    status: 'Pendente',
    notes: 'Entrada gratuita na quarta-feira; aberto até 00h00.',
  },
];

// ============================================================================
// 3. UTILITÁRIOS DE FORMATAÇÃO, CHAVES DE STORAGE E SUPABASE
// ============================================================================

const STORAGE_KEYS = {
  CONFIG: 'sp2026_config_v1',
  DAYS: 'sp2026_days_v1',
  ATTRACTIONS: 'sp2026_attractions_v1',
  STOPS: 'sp2026_stops_v1',
  BUDGET: 'sp2026_budget_v1',
  TRANSPORT: 'sp2026_transport_v1',
  CHECKLIST: 'sp2026_checklist_v1',
  RSVPS: 'sp2026_rsvps_v1',
  STOP_VOTES: 'sp2026_stop_votes_v1',
  PLACE_LIKES: 'sp2026_place_likes_v1',
  VOTER_NAME: 'sp2026_voter_name_v1',
  DEVICE_TOKEN: 'sp2026_device_token_v1',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const target = e.currentTarget;
  if (target.src !== HERO_IMAGES.paulista) {
    target.src = HERO_IMAGES.paulista;
  }
}

function getOrCreateDeviceToken(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
    if (existing) return existing;
    const created =
      'dev_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, created);
    return created;
  } catch {
    return 'dev_session_' + Math.random().toString(36).slice(2);
  }
}

const SUPABASE_SCHEMA_SQL = `-- Execute este script no SQL Editor do Supabase (Plano Gratuito)
-- Ele sincroniza votos (👍/👎), curtidas (❤️), novos lugares e checklist entre todos do grupo:

create table if not exists public.stop_votes (
  id text primary key,
  stop_id text not null,
  voter_name text not null,
  choice text not null check (choice in ('yes', 'no')),
  device_token text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.place_likes (
  id text primary key,
  attraction_id text not null,
  voter_name text not null,
  device_token text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.custom_places (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_shared_state (
  id text primary key,
  airbnb_total_cost numeric,
  arrival_window_note text,
  checklist jsonb not null default '[]'::jsonb,
  budget_items jsonb not null default '[]'::jsonb,
  custom_stops jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stop_votes enable row level security;
alter table public.place_likes enable row level security;
alter table public.custom_places enable row level security;
alter table public.trip_shared_state enable row level security;

drop policy if exists "group_all_stop_votes" on public.stop_votes;
create policy "group_all_stop_votes" on public.stop_votes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_place_likes" on public.place_likes;
create policy "group_all_place_likes" on public.place_likes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_custom_places" on public.custom_places;
create policy "group_all_custom_places" on public.custom_places
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_trip_shared_state" on public.trip_shared_state;
create policy "group_all_trip_shared_state" on public.trip_shared_state
  for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on table public.stop_votes, public.place_likes, public.custom_places, public.trip_shared_state to anon, authenticated;
`;

// ============================================================================
// 4. COMPONENTE PRINCIPAL (APP)
// ============================================================================

export default function App() {
  // Navegação principal
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');

  // Estado PWA: Ícone do App na Tela Inicial & Modo Tela Cheia (Standalone)
  const [appIconUrl, setAppIconUrl] = useState<string>('');
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Detecta se já está aberto como app instalado
    const standaloneMatch =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    setIsStandaloneApp(standaloneMatch);

    // Gera o ícone PNG 512x512 e injeta meta tags + manifest PWA
    const iconDataUrl = generateAppIconDataUrl();
    setAppIconUrl(iconDataUrl);

    const upsertHeadTag = (
      selector: string,
      tagName: 'meta' | 'link',
      attrs: Record<string, string>
    ) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = document.createElement(tagName);
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    upsertHeadTag('meta[name="theme-color"]', 'meta', {
      name: 'theme-color',
      content: '#020617',
    });
    upsertHeadTag('meta[name="apple-mobile-web-app-capable"]', 'meta', {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    });
    upsertHeadTag('meta[name="apple-mobile-web-app-status-bar-style"]', 'meta', {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    });
    upsertHeadTag('meta[name="apple-mobile-web-app-title"]', 'meta', {
      name: 'apple-mobile-web-app-title',
      content: 'SP 2026',
    });
    upsertHeadTag('meta[name="mobile-web-app-capable"]', 'meta', {
      name: 'mobile-web-app-capable',
      content: 'yes',
    });

    if (iconDataUrl) {
      upsertHeadTag('link[rel="apple-touch-icon"]', 'link', {
        rel: 'apple-touch-icon',
        href: iconDataUrl,
      });
      upsertHeadTag('link[rel="icon"]', 'link', {
        rel: 'icon',
        type: 'image/png',
        href: iconDataUrl,
      });
    }

    let manifestBlobUrl = '';
    try {
      const manifestData = {
        name: 'São Paulo 2026 — Viagem em Grupo',
        short_name: 'SP 2026',
        description:
          'Roteiro oficial, enquetes, locais favoritos e rateio da viagem para São Paulo (03 a 10/12/2026).',
        start_url: window.location.href,
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#020617',
        orientation: 'portrait',
        icons: iconDataUrl
          ? [
              {
                src: iconDataUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ]
          : [],
      };
      const blob = new Blob([JSON.stringify(manifestData)], {
        type: 'application/manifest+json',
      });
      manifestBlobUrl = URL.createObjectURL(blob);
      upsertHeadTag('link[rel="manifest"]', 'link', {
        rel: 'manifest',
        href: manifestBlobUrl,
      });
    } catch {
      // Ignora caso Blob URL não seja suportado
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsStandaloneApp(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (manifestBlobUrl) URL.revokeObjectURL(manifestBlobUrl);
    };
  }, []);

  // Estado persistido (carrega do localStorage ou usa os dados exatos das planilhas)
  const [config, setConfig] = useState<TripConfig>(() => {
    const envSb = readInitialSupabaseConfig();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const parsed = saved ? { ...INITIAL_CONFIG, ...JSON.parse(saved) } : INITIAL_CONFIG;
      return {
        ...parsed,
        supabaseUrl: envSb.url || parsed.supabaseUrl,
        supabaseAnonKey: envSb.key || parsed.supabaseAnonKey,
      };
    } catch {
      return {
        ...INITIAL_CONFIG,
        supabaseUrl: envSb.url || INITIAL_CONFIG.supabaseUrl,
        supabaseAnonKey: envSb.key || INITIAL_CONFIG.supabaseAnonKey,
      };
    }
  });

  const [days, setDays] = useState<ItineraryDay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAYS);
      return saved ? JSON.parse(saved) : INITIAL_DAYS;
    } catch {
      return INITIAL_DAYS;
    }
  });

  const [attractions, setAttractions] = useState<AttractionMeta[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTRACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_ATTRACTIONS;
    } catch {
      return INITIAL_ATTRACTIONS;
    }
  });

  const [stops, setStops] = useState<ItineraryStop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOPS);
      return saved ? JSON.parse(saved) : INITIAL_STOPS;
    } catch {
      return INITIAL_STOPS;
    }
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_ITEMS;
    } catch {
      return INITIAL_BUDGET_ITEMS;
    }
  });

  const [transportLegs, setTransportLegs] = useState<TransportLeg[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSPORT);
      return saved ? JSON.parse(saved) : INITIAL_TRANSPORT_LEGS;
    } catch {
      return INITIAL_TRANSPORT_LEGS;
    }
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
    } catch {
      return INITIAL_CHECKLIST;
    }
  });

  const [rsvps, setRsvps] = useState<RsvpEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [voterName, setVoterName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.VOTER_NAME) || '';
    } catch {
      return '';
    }
  });

  const [stopVotes, setStopVotes] = useState<StopVoteEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOP_VOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [placeLikes, setPlaceLikes] = useState<PlaceLikeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLACE_LIKES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sincronização com localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days));
    } catch {}
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTRACTIONS, JSON.stringify(attractions));
    } catch {}
  }, [attractions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOPS, JSON.stringify(stops));
    } catch {}
  }, [stops]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetItems));
    } catch {}
  }, [budgetItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSPORT, JSON.stringify(transportLegs));
    } catch {}
  }, [transportLegs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
    } catch {}
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
    } catch {}
  }, [rsvps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOTER_NAME, voterName);
    } catch {}
  }, [voterName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOP_VOTES, JSON.stringify(stopVotes));
    } catch {}
  }, [stopVotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLACE_LIKES, JSON.stringify(placeLikes));
    } catch {}
  }, [placeLikes]);

  // Estado da sincronização em nuvem (Supabase)
  const cleanSbUrl = config.supabaseUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
  const cleanSbKey = config.supabaseAnonKey.trim();
  const hasSupabase = Boolean(cleanSbUrl && cleanSbKey);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced' | 'error'>(
    hasSupabase ? 'syncing' : 'local'
  );
  const [syncErrorDetail, setSyncErrorDetail] = useState<string>('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const sbFetch = async (path: string, options: RequestInit = {}) => {
    if (!cleanSbUrl || !cleanSbKey) return null;
    if (!cleanSbUrl.startsWith('http')) {
      throw new Error('URL inválida (precisa começar com https://)');
    }
    const headers: Record<string, string> = {
      apikey: cleanSbKey,
      Authorization: `Bearer ${cleanSbKey}`,
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    const res = await fetch(`${cleanSbUrl}/rest/v1/${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      let detail = `Erro HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        if (errBody?.message) detail = errBody.message;
      } catch {}
      throw new Error(detail);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  const syncFromCloud = async (silent = true) => {
    if (!hasSupabase) {
      setSyncStatus('local');
      setSyncErrorDetail('');
      return;
    }
    if (!silent) setSyncStatus('syncing');
    try {
      const [votesRows, likesRows, placesRows, sharedRows] = await Promise.all([
        sbFetch('stop_votes?select=*'),
        sbFetch('place_likes?select=*'),
        sbFetch('custom_places?select=*'),
        sbFetch('trip_shared_state?id=eq.sp2026_main&select=*'),
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
          }) => ({
            id: r.id,
            stopId: r.stop_id,
            voterName: r.voter_name,
            choice: r.choice,
            deviceToken: r.device_token || '',
            updatedAt: r.updated_at || new Date().toISOString(),
          })
        );
        // Deduplica por (stopId + voterName) ficando com o mais recente
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
          }) => ({
            id: r.id,
            attractionId: r.attraction_id,
            voterName: r.voter_name,
            deviceToken: r.device_token || '',
            createdAt: r.created_at || new Date().toISOString(),
          })
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
            typeof shared.arrival_window_note === 'string' && shared.arrival_window_note.trim()
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
  };

  // Sincronização automática ao abrir, ao focar a janela e a cada 8 segundos
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
  }, [cleanSbUrl, cleanSbKey]);

  const pushSharedStateToCloud = async () => {
    if (!hasSupabase) return;
    try {
      await sbFetch('trip_shared_state?on_conflict=id', {
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
  };

  const pushAllLocalToCloud = async () => {
    if (!hasSupabase) {
      showToast('Preencha SUPABASE_URL e SUPABASE_ANON_KEY primeiro.', 'info');
      return;
    }
    setSyncStatus('syncing');
    try {
      if (stopVotes.length > 0) {
        await sbFetch('stop_votes?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(
            stopVotes.map((v) => ({
              id: v.id,
              stop_id: v.stopId,
              voter_name: v.voterName,
              choice: v.choice,
              device_token: v.deviceToken,
              updated_at: v.updatedAt,
            }))
          ),
        });
      }

      if (placeLikes.length > 0) {
        await sbFetch('place_likes?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(
            placeLikes.map((l) => ({
              id: l.id,
              attraction_id: l.attractionId,
              voter_name: l.voterName,
              device_token: l.deviceToken,
              created_at: l.createdAt,
            }))
          ),
        });
      }

      const customOnly = attractions.filter((a) => a.id.startsWith('place_custom_'));
      if (customOnly.length > 0) {
        await sbFetch('custom_places?on_conflict=id', {
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
      showToast('Conectado! Agora use o botão "Copiar Link" ou "WhatsApp" para mandar ao grupo.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setSyncStatus('error');
      setSyncErrorDetail(msg);
      showToast(`Erro no Supabase: ${msg}`, 'info');
    }
  };

  // Toast customizado (substitui qualquer alert())
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3400);
  };

  const handleInstallAppClick = async () => {
    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredInstallPrompt(null);
          showToast('App SP 2026 adicionado à sua tela inicial!');
          return;
        }
      } catch {
        // Fallback para o modal explicativo
      }
    }
    setInstallModalOpen(true);
  };

  // Device token do visitante atual
  const deviceToken = useMemo(() => getOrCreateDeviceToken(), []);

  // Contagem regressiva até o início da viagem
  const daysUntilTrip = useMemo(() => {
    const tripStart = new Date('2026-12-03T00:00:00-03:00').getTime();
    const diff = Math.ceil((tripStart - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, []);

  // Sistema de votação estilo enquete do WhatsApp nas atrações (👍 Sim / 👎 Não) + Coração ❤️ no Explorar
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

    // Clicar no mesmo emoji remove o voto (igual enquete do WhatsApp)
    if (existing && existing.choice === choice) {
      setStopVotes((prev) => prev.filter((v) => v.id !== existing.id));
      if (hasSupabase) {
        sbFetch(`stop_votes?id=eq.${encodeURIComponent(existing.id)}`, {
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

    const normalizedSlug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    const nextEntry: StopVoteEntry = {
      id: existing ? existing.id : `vote_${stopId}_${normalizedSlug}`,
      stopId,
      voterName: cleanName,
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
      sbFetch('stop_votes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: nextEntry.id,
          stop_id: nextEntry.stopId,
          voter_name: nextEntry.voterName,
          choice: nextEntry.choice,
          device_token: nextEntry.deviceToken,
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
        sbFetch(`place_likes?id=eq.${encodeURIComponent(existing.id)}`, {
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

    const normalizedSlug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    const nextLike: PlaceLikeEntry = {
      id: `like_${attractionId}_${normalizedSlug}`,
      attractionId,
      voterName: cleanName,
      deviceToken,
      createdAt: new Date().toISOString(),
    };

    setPlaceLikes((prev) => [...prev, nextLike]);

    if (hasSupabase) {
      sbFetch('place_likes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: nextLike.id,
          attraction_id: nextLike.attractionId,
          voter_name: nextLike.voterName,
          device_token: nextLike.deviceToken,
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

  const uniqueVoters = useMemo(() => {
    const names = new Set<string>();
    stopVotes.forEach((v) => names.add(v.voterName.trim()));
    placeLikes.forEach((l) => names.add(l.voterName.trim()));
    return Array.from(names);
  }, [stopVotes, placeLikes]);

  // Lista pública: APENAS quem vai ("EU VOU")
  const confirmedFriends = useMemo(
    () => rsvps.filter((r) => r.status === 'going'),
    [rsvps]
  );

  // Simulador Financeiro (Uber dividido por 4 por padrão)
  const [peoplePerCar, setPeoplePerCar] = useState<number>(4);
  const [useSurgePricing, setUseSurgePricing] = useState<boolean>(false);

  const financialSummary = useMemo(() => {
    // 1. Transporte (rateio por carro)
    const transportTotal = transportLegs
      .filter((leg) => leg.included)
      .reduce((acc, leg) => {
        const unitFare = useSurgePricing ? leg.uberSurge : leg.uberAvg;
        return acc + (unitFare * leg.tripsCount) / Math.max(1, peoplePerCar);
      }, 0);

    // 2. Categorias de itens
    const byCategory: Record<BudgetCategory, { documentedTotal: number; pendingCount: number }> = {
      Transporte: { documentedTotal: transportTotal, pendingCount: 0 },
      Alimentação: { documentedTotal: 0, pendingCount: 0 },
      Ingressos: { documentedTotal: 0, pendingCount: 0 },
      Hospedagem: { documentedTotal: 0, pendingCount: 0 },
      Passeios: { documentedTotal: 0, pendingCount: 0 },
    };

    budgetItems
      .filter((item) => item.included)
      .forEach((item) => {
        if (item.amountPerPerson === null) {
          byCategory[item.category].pendingCount += 1;
        } else {
          byCategory[item.category].documentedTotal += item.amountPerPerson;
        }
      });

    // Airbnb principal dividido pelo nº de confirmados (mínimo 1 se preenchido)
    if (config.airbnbTotalCost !== null && config.airbnbTotalCost > 0) {
      const divisor = Math.max(1, confirmedFriends.length);
      byCategory.Hospedagem.documentedTotal += config.airbnbTotalCost / divisor;
    } else {
      byCategory.Hospedagem.pendingCount += 1;
    }

    const grandTotal =
      byCategory.Transporte.documentedTotal +
      byCategory.Alimentação.documentedTotal +
      byCategory.Ingressos.documentedTotal +
      byCategory.Hospedagem.documentedTotal +
      byCategory.Passeios.documentedTotal;

    const totalPendingItems =
      byCategory.Alimentação.pendingCount +
      byCategory.Ingressos.pendingCount +
      byCategory.Hospedagem.pendingCount +
      byCategory.Passeios.pendingCount;

    return {
      byCategory,
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
  ]);

  // Modal de backup para copiar o link manualmente caso o navegador bloqueie clipboard dentro de iframe
  const [shareModalData, setShareModalData] = useState<{
    open: boolean;
    url: string;
    inviteText: string;
    isPreviewUrl: boolean;
  }>({
    open: false,
    url: '',
    inviteText: '',
    isPreviewUrl: false,
  });

  // Compartilhar no WhatsApp e Copiar Link (empacota conexão Supabase na URL para funcionar direto no celular dos amigos)
  const buildShareableUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const currentHref =
        window.location.href && window.location.href !== 'about:srcdoc'
          ? window.location.href
          : document.referrer || window.location.origin;
      const urlObj = new URL(currentHref);
      const envUrl = readEnvVar('VITE_SUPABASE_URL') || readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
      if (hasSupabase && !envUrl) {
        const packed = encodeBase64Safe(JSON.stringify({ u: cleanSbUrl, k: cleanSbKey }));
        if (packed) {
          urlObj.searchParams.set('sb', packed);
          urlObj.searchParams.delete('sb_url');
          urlObj.searchParams.delete('sb_key');
        }
      }
      return urlObj.toString();
    } catch {
      return window.location.href || '';
    }
  };

  const buildInviteText = (url: string) =>
    `*${config.title}*\n` +
    `📅 ${config.dateRange}\n` +
    `📍 Base: ${config.baseAddress}\n\n` +
    `Confira o roteiro dia a dia, vote nas atrações (👍/👎), curta seus lugares favoritos (❤️) e veja os custos divididos por ${peoplePerCar} no Uber:\n${url}`;

  const handleCopyOnlyLink = async () => {
    const url = buildShareableUrl();
    const inviteText = buildInviteText(url);
    const isPreviewUrl =
      !url.startsWith('http') ||
      url.includes('googleusercontent.com') ||
      url.includes('webcontainer') ||
      url.includes('localhost');

    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
    const url = buildShareableUrl();
    const text = buildInviteText(url);
    const isPreviewUrl =
      !url.startsWith('http') ||
      url.includes('googleusercontent.com') ||
      url.includes('webcontainer') ||
      url.includes('localhost');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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

  // Estado do Roteiro (dia selecionado, filtro de turno e Drawer de detalhes)
  const [selectedDate, setSelectedDate] = useState<string>('2026-12-05');
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

  // Estado da aba Explorar
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreRegion, setExploreRegion] = useState('Todas');
  const [exploreCategory, setExploreCategory] = useState('Todas');
  const [exploreOnlyExtras, setExploreOnlyExtras] = useState(false);
  const [exploreOnlyLiked, setExploreOnlyLiked] = useState(false);

  // Modal para qualquer pessoa adicionar um novo lugar no Explorar
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
      sbFetch('custom_places?on_conflict=id', {
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

  const categoriesList = [
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
  }, [attractions, exploreQuery, exploreRegion, exploreCategory, exploreOnlyExtras, exploreOnlyLiked, placeLikes]);

  const excludedAttractions = useMemo(
    () => attractions.filter((a) => Boolean(a.excludedReason)),
    [attractions]
  );

  // Estado da Área Administrativa (/admin)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminSection, setAdminSection] = useState<
    'rsvps' | 'custos' | 'reservas' | 'roteiro' | 'supabase'
  >('reservas');
  const [showSql, setShowSql] = useState(false);

  // Envia automaticamente alterações do organizador para o Supabase
  useEffect(() => {
    if (!isAdminAuthenticated || !hasSupabase) return;
    const timer = setTimeout(() => {
      pushSharedStateToCloud();
    }, 650);
    return () => clearTimeout(timer);
  }, [
    isAdminAuthenticated,
    hasSupabase,
    checklist,
    budgetItems,
    stops,
    config.airbnbTotalCost,
    config.arrivalWindowNote,
  ]);

  // Formulário para adicionar parada no Admin
  const [newStopForm, setNewStopForm] = useState({
    dayDate: '2026-12-05',
    shift: 'Tarde' as ShiftType,
    timeLabel: '',
    title: '',
    subtitle: '',
    details: '',
  });

  // Formulário para adicionar custo no Admin
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
    const parsed = newBudgetForm.amount.trim() === '' ? null : Number(newBudgetForm.amount.replace(',', '.'));
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

  // Helper de cor de badge por tipo de dia
  const getDayBadgeStyle = (badge: DayBadgeType) => {
    switch (badge) {
      case 'Dia Livre':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'CCXP26':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/35';
      case 'Chegada':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/35';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-12 selection:bg-blue-500 selection:text-white">
      {/* TOAST DE FEEDBACK */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-slate-900 border border-emerald-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
        </div>
      )}

      {/* CABEÇALHO SUPERIOR (DESKTOP & MOBILE) */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex flex-col items-center justify-center text-white leading-none shadow-lg shadow-blue-950/60">
              <span className="text-[11px] font-black tracking-tight">SP</span>
              <span className="text-[9px] font-bold text-blue-200">26</span>
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-extrabold text-white tracking-tight">
                SP 2026
              </span>
              <span className="block text-[10px] text-slate-400">
                03–10 Dez • Grupo
              </span>
            </div>
          </button>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            {(
              [
                { key: 'inicio', label: 'Início', icon: Home },
                { key: 'roteiro', label: 'Roteiro', icon: Calendar },
                { key: 'explorar', label: 'Explorar', icon: Compass },
                { key: 'custos', label: 'Custos', icon: DollarSign },
                { key: 'admin', label: 'Admin', icon: Shield },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações Rápidas no Topo (Instalar App + Status Nuvem + Identificação + Copiar Link + WhatsApp) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isStandaloneApp && (
              <button
                onClick={handleInstallAppClick}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 transition shrink-0"
                title="Adicionar ícone SP 2026 na tela inicial do celular"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>App</span>
              </button>
            )}

            <button
              onClick={() => {
                if (hasSupabase) {
                  syncFromCloud(false);
                  showToast('Sincronizando com a nuvem...');
                } else {
                  setActiveTab('admin');
                  setAdminSection('supabase');
                }
              }}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-2 rounded-xl border transition shrink-0 ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/60 border-emerald-500/35 text-emerald-300'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-950/60 border-blue-500/35 text-blue-300'
                  : syncStatus === 'error'
                  ? 'bg-rose-950/60 border-rose-500/35 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={
                syncStatus === 'synced'
                  ? `Sincronizado com Supabase${lastSyncedAt ? ` às ${lastSyncedAt}` : ''}`
                  : syncStatus === 'error'
                  ? `Erro na nuvem: ${syncErrorDetail}`
                  : 'Clique para configurar ou sincronizar com Supabase'
              }
            >
              {syncStatus === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Nuvem</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span className="hidden sm:inline">Sync</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Erro</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Local</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setVoterNameInput(voterName);
                setVoterPromptModal({
                  open: true,
                  pendingStopId: null,
                  pendingChoice: null,
                  pendingLikeAttractionId: null,
                });
              }}
              className="text-[11px] font-bold px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-blue-500/40 transition truncate max-w-[84px] sm:max-w-none"
              title="Definir ou trocar seu nome nos votos e curtidas"
            >
              {voterName.trim() ? `👤 ${voterName}` : '👤 Nome'}
            </button>

            <button
              onClick={handleCopyOnlyLink}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold px-2.5 py-2 rounded-xl transition shrink-0"
              title="Copiar link para compartilhar com o grupo"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Copiar Link</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl shadow-lg shadow-emerald-950/50 transition shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* AVISO RÁPIDO CASO ESTEJA EM MODO LOCAL OU COM ERRO NO SUPABASE */}
      {syncStatus === 'error' && (
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="rounded-2xl bg-rose-950/80 border border-rose-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-200">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Sincronização pausada:</strong> {syncErrorDetail || 'Verifique o SQL e as chaves do Supabase.'}
              </span>
            </span>
            <button
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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 pt-4 sm:pt-5 space-y-6">
        {/* ================================================================= */}
        {/* ABA 1: INÍCIO (CAPA + RESUMO + DESTAQUES)                         */}
        {/* ================================================================= */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="relative h-64 sm:h-80 w-full">
                <img
                  src={HERO_IMAGES.paulista}
                  alt="Avenida Paulista, São Paulo"
                  className="w-full h-full object-cover object-center opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    {config.dateRange}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    {daysUntilTrip > 0 ? `Faltam ${daysUntilTrip} dias` : 'Chegou a hora!'}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                    {config.destination} • Planejamento Oficial do Grupo
                  </p>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {config.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    CCXP26, Zoológico + Botânico + Aquário, Cinépolis JK (IMAX & Sala VIP),
                    MASP, Roda Rico no pôr do sol, Liberdade, Bom Retiro, Bario Bar e Churrasco Coreano.
                  </p>
                </div>
              </div>

              {/* Faixa da Base + Galeria rápida */}
              <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Train className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Base da Hospedagem
                      </span>
                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        Check-in 04/12 às 15h
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-0.5">{config.baseAddress}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{config.baseTransit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={HERO_IMAGES.ibirapuera}
                    alt="Parque Ibirapuera"
                    className="h-16 w-full object-cover rounded-xl border border-slate-800"
                  />
                  <img
                    src={HERO_IMAGES.skyline}
                    alt="Horizonte de São Paulo"
                    className="h-16 w-full object-cover rounded-xl border border-slate-800"
                  />
                </div>
              </div>
            </section>

            {/* Banner compacto para instalar como App com Ícone na Tela Inicial */}
            {!isStandaloneApp && (
              <section
                onClick={handleInstallAppClick}
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/70 border border-blue-500/30 hover:border-blue-400/60 p-3.5 sm:p-4 flex items-center justify-between gap-3 transition shadow-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {appIconUrl ? (
                    <img
                      src={appIconUrl}
                      alt="Ícone SP 2026"
                      className="w-11 h-11 rounded-2xl border border-white/15 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                      SP26
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                      Colocar ícone “SP 2026” na tela inicial do celular
                    </p>
                    <p className="text-[11px] text-slate-300 truncate">
                      Abre em tela cheia como aplicativo nativo, sem barra de navegador.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl">
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar</span>
                </span>
              </section>
            )}

            {/* Cards de Resumo Rápido (Custo Estimado + Enquete & Favoritos) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Custo Total por Pessoa */}
              <div
                onClick={() => setActiveTab('custos')}
                className="cursor-pointer group rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 transition shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Custo Estimado / Pessoa
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition">
                    Ver rateio <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {formatBRL(financialSummary.grandTotal)}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Uber ÷ {peoplePerCar}p)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Soma os valores documentados nas planilhas + hospedagem preenchida.{' '}
                  <span className="text-amber-300 font-medium">
                    {financialSummary.totalPendingItems} itens ainda marcados como “A confirmar”.
                  </span>
                </p>
              </div>

              {/* Card Interação do Grupo (Votos 👍/👎 + Curtidas ❤️) */}
              <div
                onClick={() => setActiveTab('explorar')}
                className="cursor-pointer group rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 p-5 transition shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Favoritos & Enquete do Grupo
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-0.5 transition">
                    Explorar locais <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white">
                    {placeLikes.length} ❤️
                  </span>
                  <span className="text-sm text-emerald-400 font-semibold">
                    • {stopVotes.length} votos no roteiro
                    {uniqueVoters.length > 0 ? ` (${uniqueVoters.length} pessoas)` : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Dê <strong className="text-rose-300">❤️ like</strong> nos lugares preferidos na aba Explorar, adicione novas ideias ou vote com{' '}
                  <strong className="text-emerald-300">👍 / 👎</strong> no roteiro.
                </p>
              </div>
            </section>

            {/* Destaques da Viagem */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Destaques do Roteiro Oficial</h2>
                <button
                  onClick={() => setActiveTab('roteiro')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Ver cronograma completo →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    day: '05 e 06/12',
                    title: 'CCXP26',
                    desc: 'Abertura sábado + Artists’ Valley domingo',
                    date: '2026-12-05',
                  },
                  {
                    day: '07/12 Seg',
                    title: 'Combo Bichos',
                    desc: 'Zoológico, Jardim Botânico & Aquário',
                    date: '2026-12-07',
                  },
                  {
                    day: '07 e 08/12',
                    title: 'Cinema JK',
                    desc: 'Sessão IMAX with Laser + Sala VIP',
                    date: '2026-12-07',
                  },
                  {
                    day: '09/12 Qua',
                    title: 'Coreano + Bario',
                    desc: 'Cho Sun Gal Bi & Bario Bar Santo Amaro',
                    date: '2026-12-09',
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    onClick={() => {
                      setSelectedDate(card.date);
                      setActiveTab('roteiro');
                    }}
                    className="text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-blue-400">{card.day}</span>
                    <p className="text-sm font-bold text-white">{card.title}</p>
                    <p className="text-xs text-slate-400 leading-snug">{card.desc}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 2: ROTEIRO OFICIAL (03/12 A 10/12/2026)                        */}
        {/* ================================================================= */}
        {activeTab === 'roteiro' && (
          <div className="space-y-5">
            {/* Barra de Identificação para Votação nas Atrações */}
            <div className="rounded-2xl bg-slate-900/95 border border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🗳️</span>
                {voterName.trim() ? (
                  <p className="text-xs text-slate-300">
                    Votando nas atrações como{' '}
                    <strong className="text-emerald-300 font-extrabold">{voterName}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-300">
                    Clique em <strong className="text-emerald-300">👍 Sim</strong> ou{' '}
                    <strong className="text-rose-300">👎 Não</strong> em qualquer atração para votar com seu nome
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setVoterNameInput(voterName);
                  setVoterPromptModal({
                    open: true,
                    pendingStopId: null,
                    pendingChoice: null,
                    pendingLikeAttractionId: null,
                  });
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/25 px-3 py-1.5 rounded-xl transition"
              >
                {voterName.trim() ? 'Trocar nome' : 'Definir meu nome'}
              </button>
            </div>

            {/* Seletor Horizontal de Dias */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {days.map((day) => {
                const isSelected = day.date === currentDay.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-left transition min-w-[88px] ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-950/60'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`block text-[11px] font-bold uppercase ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {day.weekday}
                    </span>
                    <span className="block text-sm font-extrabold mt-0.5">{day.shortLabel}</span>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : day.badge === 'Dia Livre'
                          ? 'bg-amber-500/15 text-amber-300'
                          : day.badge === 'CCXP26'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {day.badge === 'Roteiro em Grupo' ? 'Grupo' : day.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cabeçalho do Dia Selecionado */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold bg-slate-800 text-white px-2.5 py-1 rounded-lg">
                    {currentDay.shortLabel} ({currentDay.weekday})
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getDayBadgeStyle(
                      currentDay.badge
                    )}`}
                  >
                    {currentDay.badge}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {currentDay.regionFocus}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentDay.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentDay.summary}</p>

              {/* Alerta Inteligente do Dia (quando houver) */}
              {currentDay.smartAlert && (
                <div
                  className={`rounded-2xl p-3.5 border flex items-start gap-3 ${
                    currentDay.smartAlert.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : currentDay.smartAlert.type === 'timeline'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{currentDay.smartAlert.title}</p>
                    <p className="opacity-90 leading-relaxed">
                      {currentDay.date === '2026-12-03'
                        ? config.arrivalWindowNote
                        : currentDay.smartAlert.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Filtro por Turno */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {(['Todos', 'Manhã e Almoço', 'Tarde', 'Noite e Madrugada'] as const).map((shift) => (
                  <button
                    key={shift}
                    onClick={() => setShiftFilter(shift)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      shiftFilter === shift
                        ? 'bg-slate-100 text-slate-950'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {shift}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards das Paradas do Dia */}
            <div className="space-y-3">
              {dayStops.length === 0 ? (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-sm text-slate-400">
                  Nenhuma atividade específica neste turno. Aproveite o tempo livre!
                </div>
              ) : (
                dayStops.map((stop) => {
                  const linkedAttr = stop.attractionId
                    ? attractions.find((a) => a.id === stop.attractionId)
                    : undefined;

                  return (
                    <div key={stop.id} className="space-y-2">
                      <div
                        onClick={() => linkedAttr && setSelectedAttraction(linkedAttr)}
                        className={`rounded-2xl bg-slate-900 border overflow-hidden transition ${
                          linkedAttr
                            ? 'cursor-pointer border-slate-800 hover:border-blue-500/50'
                            : 'border-slate-800/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {linkedAttr && (
                            <div className="sm:w-44 h-36 sm:h-auto shrink-0 relative bg-slate-950">
                              <img
                                src={linkedAttr.imageUrl}
                                alt={linkedAttr.name}
                                onError={handleImgError}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent sm:hidden" />
                            </div>
                          )}

                          <div className="p-4 sm:p-5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md">
                                  {stop.shift}
                                </span>
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {stop.timeLabel}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {stop.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      tag.includes('Obrigatório') || tag.includes('Reserva')
                                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                        : tag.includes('Grátis') || tag.includes('Mais barato')
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                                  {stop.title}
                                </h3>
                                {stop.subtitle && (
                                  <p className="text-xs font-medium text-blue-300 mt-0.5">
                                    {stop.subtitle}
                                  </p>
                                )}
                              </div>

                              {linkedAttr && (
                                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-xl">
                                  Ficha <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                              {stop.details}
                            </p>

                            {/* Dica de Metrô / Uber */}
                            {stop.transitTip && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-2 rounded-xl">
                                <Train className="w-4 h-4 shrink-0 text-cyan-400" />
                                <span>{stop.transitTip}</span>
                              </div>
                            )}

                            {/* Enquete Estilo WhatsApp (👍 Sim / 👎 Não) com Identificação */}
                            {(() => {
                              const votesForStop = stopVotes.filter((v) => v.stopId === stop.id);
                              const yesVotes = votesForStop.filter((v) => v.choice === 'yes');
                              const noVotes = votesForStop.filter((v) => v.choice === 'no');
                              const totalVotes = votesForStop.length;
                              const yesPct =
                                totalVotes > 0 ? Math.round((yesVotes.length / totalVotes) * 100) : 0;
                              const noPct =
                                totalVotes > 0 ? Math.round((noVotes.length / totalVotes) * 100) : 0;
                              const myVote = voterName.trim()
                                ? votesForStop.find(
                                    (v) =>
                                      v.voterName.trim().toLowerCase() ===
                                      voterName.trim().toLowerCase()
                                  )
                                : undefined;

                              return (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 p-3 space-y-2.5"
                                >
                                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="font-semibold">
                                      Você topa essa parada?
                                    </span>
                                    <span>
                                      {totalVotes === 0
                                        ? 'Nenhum voto ainda'
                                        : `${totalVotes} ${totalVotes === 1 ? 'voto' : 'votos'}`}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => handleVoteClick(e, stop.id, 'yes')}
                                      className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition ${
                                        myVote?.choice === 'yes'
                                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                                          : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-emerald-500/40'
                                      }`}
                                    >
                                      <div
                                        className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all duration-300"
                                        style={{ width: `${yesPct}%` }}
                                      />
                                      <div className="relative flex items-center justify-between text-xs font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">👍</span> Sim
                                        </span>
                                        <span>{yesVotes.length}</span>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => handleVoteClick(e, stop.id, 'no')}
                                      className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition ${
                                        myVote?.choice === 'no'
                                          ? 'border-rose-500 bg-rose-500/15 text-rose-200'
                                          : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-rose-500/40'
                                      }`}
                                    >
                                      <div
                                        className="absolute inset-y-0 left-0 bg-rose-500/15 transition-all duration-300"
                                        style={{ width: `${noPct}%` }}
                                      />
                                      <div className="relative flex items-center justify-between text-xs font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">👎</span> Não
                                        </span>
                                        <span>{noVotes.length}</span>
                                      </div>
                                    </button>
                                  </div>

                                  {totalVotes > 0 && (
                                    <div className="pt-1 space-y-1 text-[11px]">
                                      {yesVotes.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-emerald-400 font-bold">👍</span>
                                          {yesVotes.map((v) => (
                                            <span
                                              key={v.id}
                                              className="bg-emerald-500/15 text-emerald-200 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium"
                                            >
                                              {v.voterName}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {noVotes.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-rose-400 font-bold">👎</span>
                                          {noVotes.map((v) => (
                                            <span
                                              key={v.id}
                                              className="bg-rose-500/15 text-rose-200 border border-rose-500/25 px-2 py-0.5 rounded-full font-medium"
                                            >
                                              {v.voterName}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Rodapé rápido da atração vinculada */}
                            {linkedAttr && (
                              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                <span className="truncate max-w-md">{linkedAttr.address}</span>
                                <div className="flex items-center gap-3">
                                  {linkedAttr.rating && (
                                    <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      {linkedAttr.rating.toFixed(1)}
                                    </span>
                                  )}
                                  <span className="text-blue-400 font-semibold">
                                    Ver horários & Maps →
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {stop.walkToNext && (
                        <div className="flex items-center gap-2 pl-4 text-xs text-emerald-300">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{stop.walkToNext}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 3: EXPLORAR CATÁLOGO COMPLETO, CURTIDAS ❤️ & ADICIONAR LUGAR   */}
        {/* ================================================================= */}
        {activeTab === 'explorar' && (
          <div className="space-y-5">
            {/* Cabeçalho & Filtros */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Explorar Locais & Favoritos do Grupo
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dê <strong className="text-rose-300">❤️ coração</strong> nos seus lugares preferidos (aparece quem curtiu!) ou adicione novos locais para o grupo ver.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAddPlaceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-950/50 transition"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Lugar
                  </button>

                  <button
                    onClick={() => setExploreOnlyLiked((v) => !v)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                      exploreOnlyLiked
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        exploreOnlyLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'
                      }`}
                    />
                    Favoritos ({new Set(placeLikes.map((l) => l.attractionId)).size})
                  </button>

                  <button
                    onClick={() => setExploreOnlyExtras((v) => !v)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                      exploreOnlyExtras
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {exploreOnlyExtras ? 'Só Extras' : 'Extras / Dia Livre'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={exploreQuery}
                    onChange={(e) => setExploreQuery(e.target.value)}
                    placeholder="Buscar por nome, bairro, comida, museu..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={exploreRegion}
                  onChange={(e) => setExploreRegion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {regionsList.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg === 'Todas' ? 'Todas as Regiões' : reg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExploreCategory(cat)}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      exploreCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Atrações */}
            {filteredAttractions.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-300">
                  Nenhum local encontrado com esses filtros.
                </p>
                <button
                  onClick={() => {
                    setExploreQuery('');
                    setExploreRegion('Todas');
                    setExploreCategory('Todas');
                    setExploreOnlyExtras(false);
                    setExploreOnlyLiked(false);
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300"
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
                        (l) =>
                          l.voterName.trim().toLowerCase() ===
                          voterName.trim().toLowerCase()
                      )
                    : false;

                  return (
                    <div
                      key={attr.id}
                      onClick={() => setSelectedAttraction(attr)}
                      className="cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 overflow-hidden transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 w-full bg-slate-950">
                          <img
                            src={attr.imageUrl}
                            alt={attr.name}
                            onError={handleImgError}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950/20 to-transparent" />
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-full border border-slate-700/70 truncate">
                              {attr.region}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                                  attr.inOfficialRoute
                                    ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-950/85 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {attr.inOfficialRoute ? 'No Roteiro' : 'Extra / Livre'}
                              </span>

                              {/* Botão Coração (Like) */}
                              <button
                                type="button"
                                onClick={(e) => handleTogglePlaceLike(e, attr.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-extrabold transition active:scale-95 ${
                                  isLikedByMe
                                    ? 'bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-950/60'
                                    : 'bg-slate-950/85 border-slate-700/80 text-slate-200 hover:border-rose-400/60'
                                }`}
                                title="Curtir lugar preferido"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isLikedByMe
                                      ? 'fill-white text-white'
                                      : 'text-rose-400'
                                  }`}
                                />
                                <span>{likesForPlace.length}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-white">{attr.name}</h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                              {attr.category}
                            </span>
                            {attr.addedBy && (
                              <span className="bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-md font-medium">
                                Sugestão de {attr.addedBy}
                              </span>
                            )}
                            {attr.rating && (
                              <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {attr.rating.toFixed(1)} ({attr.reviewsCount?.toLocaleString('pt-BR')})
                              </span>
                            )}
                            {attr.closedDays !== 'Não fecha' && (
                              <span className="text-rose-300 font-medium">• {attr.closedDays}</span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                            {attr.notes}
                          </p>

                          {/* Identificação de quem deu ❤️ neste lugar */}
                          {likesForPlace.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[11px]">
                              <span className="text-rose-400 font-bold">❤️</span>
                              {likesForPlace.map((like) => (
                                <span
                                  key={like.id}
                                  className="bg-rose-500/15 text-rose-200 border border-rose-500/25 px-2 py-0.5 rounded-full font-medium"
                                >
                                  {like.voterName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {attr.distanceKm > 0
                            ? `${attr.distanceKm} km da base • Uber ~${formatBRL(
                                attr.uberAvg / Math.max(1, peoplePerCar)
                              )}/p`
                            : 'São Paulo • Clique para detalhes'}
                        </span>
                        <span className="text-blue-400 font-semibold">Ficha →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Transparência: Locais Excluídos do Roteiro */}
            {excludedAttractions.length > 0 && (
              <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Locais Fora do Roteiro Oficial (Motivo Documentado)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {excludedAttractions.map((ex) => (
                    <div
                      key={ex.id}
                      className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-1"
                    >
                      <p className="text-xs font-bold text-slate-200">{ex.name}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{ex.excludedReason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 4: CUSTOS, TRANSPORTE & SIMULADOR DE RATEIO POR PESSOA        */}
        {/* ================================================================= */}
        {activeTab === 'custos' && (
          <div className="space-y-5">
            {/* Painel Principal do Simulador */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Simulador de Orçamento Individual
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                      {formatBRL(financialSummary.grandTotal)}
                    </h2>
                    <span className="text-xs text-slate-400">por pessoa (itens confirmados)</span>
                  </div>
                </div>

                {/* Controles de Rateio */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 px-2 font-semibold">
                      Uber ÷
                    </span>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setPeoplePerCar(num)}
                        className={`w-7 h-7 rounded-xl text-xs font-extrabold transition ${
                          peoplePerCar === num
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUseSurgePricing((v) => !v)}
                    className={`text-xs font-bold px-3.5 py-2.5 rounded-2xl border transition ${
                      useSurgePricing
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    {useSurgePricing ? 'Uber: Dinâmica 1,5x' : 'Uber: Tarifa Média'}
                  </button>
                </div>
              </div>

              {/* Resumo por Categoria */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(
                  [
                    'Transporte',
                    'Ingressos',
                    'Passeios',
                    'Alimentação',
                    'Hospedagem',
                  ] as BudgetCategory[]
                ).map((cat) => {
                  const data = financialSummary.byCategory[cat];
                  return (
                    <div
                      key={cat}
                      className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3 space-y-1"
                    >
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {cat}
                      </span>
                      <strong className="text-sm sm:text-base font-extrabold text-white block">
                        {formatBRL(data.documentedTotal)}
                      </strong>
                      {data.pendingCount > 0 && (
                        <span className="text-[10px] text-amber-300 block">
                          + {data.pendingCount} a confirmar
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deslocamentos Uber & Metrô */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400" />
                  Deslocamentos Estimados (Uber ÷ {peoplePerCar} pessoas)
                </h3>
                <span className="text-xs font-bold text-emerald-300">
                  {formatBRL(financialSummary.byCategory.Transporte.documentedTotal)} / pessoa
                </span>
              </div>

              <div className="space-y-2">
                {transportLegs.map((leg) => {
                  const unitFare = useSurgePricing ? leg.uberSurge : leg.uberAvg;
                  const perPerson = (unitFare * leg.tripsCount) / Math.max(1, peoplePerCar);
                  return (
                    <label
                      key={leg.id}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 cursor-pointer hover:border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={leg.included}
                          onChange={() =>
                            setTransportLegs((prev) =>
                              prev.map((l) =>
                                l.id === leg.id ? { ...l, included: !l.included } : l
                              )
                            )
                          }
                          className="mt-1 rounded accent-blue-600"
                        />
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-blue-400">
                            {leg.dayLabel} • {leg.tripsCount} trecho(s)
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-white">{leg.route}</p>
                          {leg.metroAlternative && (
                            <p className="text-[11px] text-cyan-300">{leg.metroAlternative}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-white block">
                          {formatBRL(perPerson)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatBRL(unitFare)}/carro
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Itens por Categoria */}
            {(['Ingressos', 'Passeios', 'Alimentação', 'Hospedagem'] as BudgetCategory[]).map(
              (category) => {
                const itemsInCat = budgetItems.filter((i) => i.category === category);
                return (
                  <div
                    key={category}
                    className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{category}</h3>
                      <span className="text-xs font-bold text-blue-300">
                        Subtotal: {formatBRL(financialSummary.byCategory[category].documentedTotal)}
                      </span>
                    </div>

                    {category === 'Hospedagem' && (
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            Airbnb Vila Mariana (04 a 10/12 — Rateio entre confirmados)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {config.airbnbTotalCost !== null
                              ? `Total ${formatBRL(config.airbnbTotalCost)} ÷ ${Math.max(
                                  1,
                                  confirmedFriends.length
                                )} confirmado(s)`
                              : 'Valor total a ser preenchido pelo organizador na aba Admin'}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                            config.airbnbTotalCost !== null
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {config.airbnbTotalCost !== null
                            ? formatBRL(
                                config.airbnbTotalCost / Math.max(1, confirmedFriends.length)
                              )
                            : 'A confirmar'}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {itemsInCat.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 cursor-pointer hover:border-slate-700"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={item.included}
                              onChange={() =>
                                setBudgetItems((prev) =>
                                  prev.map((b) =>
                                    b.id === item.id ? { ...b, included: !b.included } : b
                                  )
                                )
                              }
                              className="mt-1 rounded accent-blue-600"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-xs sm:text-sm font-bold text-white">
                                  {item.name}
                                </p>
                                {item.isOptional && (
                                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                    Opcional
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                              item.amountPerPerson === null
                                ? 'bg-amber-500/15 text-amber-300'
                                : item.amountPerPerson === 0
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {item.amountPerPerson === null
                              ? 'A confirmar'
                              : item.amountPerPerson === 0
                              ? 'Grátis'
                              : formatBRL(item.amountPerPerson)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 5: ÁREA ADMINISTRATIVA (SOMENTE LEITURA + DESBLOQUEIO PIN)    */}
        {/* ================================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            {/* Barra Superior: Modo Visualização para Todos ou Edição Desbloqueada */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isAdminAuthenticated
                      ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                  }`}
                >
                  {isAdminAuthenticated ? (
                    <Unlock className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">
                      Painel de Organização
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isAdminAuthenticated
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isAdminAuthenticated
                        ? 'Modo Edição Ativo'
                        : 'Modo Visualização (Somente Leitura)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAdminAuthenticated
                      ? 'Você pode editar valores, alterar status de reservas e adicionar paradas.'
                      : 'Todo o grupo pode acompanhar reservas, votos e valores. Apenas o organizador altera dados com o PIN.'}
                  </p>
                </div>
              </div>

              {isAdminAuthenticated ? (
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="self-start md:self-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Voltar p/ Somente Leitura
                </button>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex items-center gap-2">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    placeholder={pinError ? 'PIN incorreto!' : 'PIN organizador'}
                    className={`w-36 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                      pinError
                        ? 'border-rose-500 placeholder:text-rose-400'
                        : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shrink-0"
                  >
                    Desbloquear Edição
                  </button>
                </form>
              )}
            </div>

            {/* Sub-abas do Admin (Visíveis para todos) */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: 'reservas', label: `Checklist Reservas (${checklist.length})` },
                  { key: 'rsvps', label: `Votos & Favoritos (${stopVotes.length + placeLikes.length})` },
                  { key: 'custos', label: 'Tabela de Valores' },
                  { key: 'roteiro', label: 'Paradas do Roteiro' },
                  { key: 'supabase', label: 'Config & Nuvem' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.key}
                  onClick={() => setAdminSection(sub.key)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                    adminSection === sub.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* ADMIN 1: RESUMO DOS VOTOS NAS ATRAÇÕES & CURTIDAS ❤️ */}
            {adminSection === 'rsvps' && (
              <div className="space-y-4">
                {/* Ranking de Curtidas ❤️ no Explorar */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">
                      Locais Mais Curtidos no Explorar (❤️)
                    </h3>
                    <span className="text-xs font-bold bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-lg">
                      {placeLikes.length} curtidas
                    </span>
                  </div>

                  {placeLikes.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">
                      Nenhuma curtida ❤️ registrada ainda. Dê coração nos seus lugares preferidos na aba Explorar!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {attractions
                        .filter((a) => placeLikes.some((l) => l.attractionId === a.id))
                        .sort(
                          (a, b) =>
                            placeLikes.filter((l) => l.attractionId === b.id).length -
                            placeLikes.filter((l) => l.attractionId === a.id).length
                        )
                        .map((a) => {
                          const likers = placeLikes
                            .filter((l) => l.attractionId === a.id)
                            .map((l) => l.voterName);
                          return (
                            <div
                              key={a.id}
                              className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 flex items-center justify-between gap-2"
                            >
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-white">{a.name}</p>
                                <p className="text-xs text-rose-300 mt-0.5">
                                  ❤️ {likers.join(', ')}
                                </p>
                              </div>
                              <span className="text-xs font-extrabold bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-lg shrink-0">
                                {likers.length} ❤️
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Placar de Votos 👍 / 👎 no Roteiro */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white">
                      Placar de Votos nas Atrações (👍 Sim / 👎 Não)
                    </h3>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg">
                        👍 Sim: {stopVotes.filter((v) => v.choice === 'yes').length}
                      </span>
                      <span className="bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-lg">
                        👎 Não: {stopVotes.filter((v) => v.choice === 'no').length}
                      </span>
                    </div>
                  </div>

                  {stopVotes.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">
                      Nenhum voto registrado nas atrações ainda. Abra a aba Roteiro para votar com 👍 ou 👎.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {stops
                        .filter((s) => stopVotes.some((v) => v.stopId === s.id))
                        .map((s) => {
                          const votes = stopVotes.filter((v) => v.stopId === s.id);
                          const yesList = votes.filter((v) => v.choice === 'yes').map((v) => v.voterName);
                          const noList = votes.filter((v) => v.choice === 'no').map((v) => v.voterName);
                          return (
                            <div
                              key={s.id}
                              className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {s.dayDate.slice(8, 10)}/12 • {s.title}
                                </span>
                                <span className="text-xs font-bold text-slate-400 shrink-0">
                                  👍 {yesList.length} • 👎 {noList.length}
                                </span>
                              </div>
                              {yesList.length > 0 && (
                                <p className="text-xs text-emerald-300">
                                  👍 Sim: {yesList.join(', ')}
                                </p>
                              )}
                              {noList.length > 0 && (
                                <p className="text-xs text-rose-300">
                                  👎 Não: {noList.join(', ')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADMIN 2: TABELA DE VALORES (EDITÁVEL APENAS COM PIN) */}
            {adminSection === 'custos' && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Hospedagem & Logística da Chegada (03/12)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Valor Total do Airbnb (04 a 10/12) — R$
                      </label>
                      {isAdminAuthenticated ? (
                        <input
                          type="number"
                          step="0.01"
                          value={config.airbnbTotalCost ?? ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              airbnbTotalCost:
                                e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          placeholder="Ex: 3600.00 (divide pelos confirmados)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                        />
                      ) : (
                        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-300">
                          {config.airbnbTotalCost !== null
                            ? formatBRL(config.airbnbTotalCost)
                            : 'A confirmar pelo organizador'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Aviso da Janela Pouso GRU (23h50) → Check-in (15h)
                      </label>
                      {isAdminAuthenticated ? (
                        <input
                          type="text"
                          value={config.arrivalWindowNote}
                          onChange={(e) =>
                            setConfig({ ...config, arrivalWindowNote: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                        />
                      ) : (
                        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300">
                          {config.arrivalWindowNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                  <h3 className="text-base font-bold text-white">
                    {isAdminAuthenticated
                      ? 'Atualizar Valores por Pessoa (Deixe vazio para “A confirmar”)'
                      : 'Valores Cadastrados por Pessoa (Somente Leitura)'}
                  </h3>
                  <div className="space-y-2.5">
                    {budgetItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase">
                            {item.category}
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-white">{item.name}</p>
                        </div>

                        {isAdminAuthenticated ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.amountPerPerson ?? ''}
                              onChange={(e) => {
                                const val =
                                  e.target.value === '' ? null : Number(e.target.value);
                                setBudgetItems((prev) =>
                                  prev.map((b) =>
                                    b.id === item.id ? { ...b, amountPerPerson: val } : b
                                  )
                                );
                              }}
                              placeholder="A confirmar"
                              className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        ) : (
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-lg self-start sm:self-center ${
                              item.amountPerPerson === null
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {item.amountPerPerson === null
                              ? 'A confirmar'
                              : item.amountPerPerson === 0
                              ? 'Grátis (R$ 0)'
                              : formatBRL(item.amountPerPerson)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAdminAuthenticated && (
                    <form
                      onSubmit={handleAddBudgetItem}
                      className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
                    >
                      <select
                        value={newBudgetForm.category}
                        onChange={(e) =>
                          setNewBudgetForm({
                            ...newBudgetForm,
                            category: e.target.value as BudgetCategory,
                          })
                        }
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {(
                          [
                            'Transporte',
                            'Alimentação',
                            'Ingressos',
                            'Hospedagem',
                            'Passeios',
                          ] as BudgetCategory[]
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newBudgetForm.name}
                        onChange={(e) =>
                          setNewBudgetForm({ ...newBudgetForm, name: e.target.value })
                        }
                        placeholder="Nome do gasto..."
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newBudgetForm.amount}
                        onChange={(e) =>
                          setNewBudgetForm({ ...newBudgetForm, amount: e.target.value })
                        }
                        placeholder="Valor R$ (opcional)"
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Custo
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ADMIN 3: CHECKLIST DE 13 RESERVAS E INGRESSOS */}
            {adminSection === 'reservas' && (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <h3 className="text-base font-bold text-white">
                  Checklist Oficial de Reservas & Ingressos (13 Ações)
                </h3>
                <div className="space-y-2.5">
                  {checklist.map((chk) => (
                    <div
                      key={chk.id}
                      className="rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              chk.priority === 'Alta'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            Prioridade {chk.priority}
                          </span>
                          <span className="text-xs font-bold text-blue-400">{chk.targetDate}</span>
                          <span className="text-sm font-bold text-white">{chk.place}</span>
                        </div>
                        <p className="text-xs text-slate-300">{chk.action}</p>
                        <p className="text-[11px] text-slate-400">
                          Canal: {chk.channel} • {chk.notes}
                        </p>
                      </div>

                      {isAdminAuthenticated ? (
                        <select
                          value={chk.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value as ChecklistStatus;
                            setChecklist((prev) =>
                              prev.map((item) =>
                                item.id === chk.id ? { ...item, status: nextStatus } : item
                              )
                            );
                            showToast(`Status de "${chk.place}" atualizado para ${nextStatus}.`);
                          }}
                          className={`text-xs font-bold px-3 py-2 rounded-xl border shrink-0 ${
                            chk.status === 'Confirmado' || chk.status === 'Comprado'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : chk.status === 'Reservado'
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Comprado">Comprado</option>
                          <option value="Reservado">Reservado</option>
                          <option value="Confirmado">Confirmado</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 self-start sm:self-center ${
                            chk.status === 'Confirmado' || chk.status === 'Comprado'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : chk.status === 'Reservado'
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {chk.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN 4: ROTEIRO (SOMENTE LEITURA PARA AMIGOS / EDITÁVEL COM PIN) */}
            {adminSection === 'roteiro' && (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-5">
                {isAdminAuthenticated && (
                  <>
                    <h3 className="text-base font-bold text-white">
                      Adicionar Nova Parada ao Roteiro
                    </h3>

                    <form onSubmit={handleAddStop} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <select
                          value={newStopForm.dayDate}
                          onChange={(e) =>
                            setNewStopForm({ ...newStopForm, dayDate: e.target.value })
                          }
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                        >
                          {days.map((d) => (
                            <option key={d.date} value={d.date}>
                              {d.shortLabel} ({d.weekday}) — {d.title}
                            </option>
                          ))}
                        </select>

                        <select
                          value={newStopForm.shift}
                          onChange={(e) =>
                            setNewStopForm({
                              ...newStopForm,
                              shift: e.target.value as ShiftType,
                            })
                          }
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                        >
                          <option value="Manhã e Almoço">Manhã e Almoço</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noite e Madrugada">Noite e Madrugada</option>
                        </select>

                        <input
                          type="text"
                          value={newStopForm.timeLabel}
                          onChange={(e) =>
                            setNewStopForm({ ...newStopForm, timeLabel: e.target.value })
                          }
                          placeholder="Horário (ex: 16h00 – 18h00)"
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                        />
                      </div>

                      <input
                        type="text"
                        value={newStopForm.title}
                        onChange={(e) =>
                          setNewStopForm({ ...newStopForm, title: e.target.value })
                        }
                        placeholder="Título da parada (ex: Café na Liberdade)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                      />

                      <textarea
                        rows={2}
                        value={newStopForm.details}
                        onChange={(e) =>
                          setNewStopForm({ ...newStopForm, details: e.target.value })
                        }
                        placeholder="Observações e dicas para o grupo..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                      />

                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Adicionar ao Roteiro
                      </button>
                    </form>
                  </>
                )}

                <div className={isAdminAuthenticated ? 'pt-4 border-t border-slate-800 space-y-2' : 'space-y-2'}>
                  <p className="text-xs font-bold text-slate-400">
                    Paradas cadastradas no cronograma ({stops.length})
                  </p>
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {stops.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="text-blue-400 font-bold">
                            {s.dayDate.slice(8, 10)}/12 • {s.shift} •{' '}
                          </span>
                          <span className="text-white font-semibold">{s.title}</span>
                        </div>
                        {isAdminAuthenticated && (
                          <button
                            onClick={() => {
                              setStops((prev) => prev.filter((item) => item.id !== s.id));
                              showToast('Parada removida do roteiro.');
                            }}
                            className="text-rose-400 hover:text-rose-300 shrink-0 p-1"
                            title="Remover parada"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN 5: SUPABASE & VERCEL */}
            {adminSection === 'supabase' && (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">
                      Sincronização em Tempo Real (Supabase Gratuito)
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : syncStatus === 'syncing'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : syncStatus === 'error'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {syncStatus === 'synced'
                      ? `Conectado${lastSyncedAt ? ` (${lastSyncedAt})` : ''}`
                      : syncStatus === 'syncing'
                      ? 'Sincronizando...'
                      : syncStatus === 'error'
                      ? 'Erro na conexão'
                      : 'Modo Local (sem nuvem)'}
                  </span>
                </div>

                {syncStatus === 'error' && syncErrorDetail && (
                  <div className="rounded-2xl bg-rose-950/70 border border-rose-500/40 p-3.5 text-xs text-rose-200 space-y-1">
                    <p className="font-bold text-rose-100">Detalhe do erro retornado pelo Supabase:</p>
                    <p className="font-mono break-all">{syncErrorDetail}</p>
                    <p className="text-rose-300 pt-1">
                      Dica: Se aparecer “relation does not exist” ou “Could not find the table”, copie o SQL abaixo e clique em Run no SQL Editor do Supabase.
                    </p>
                  </div>
                )}

                {/* Passo a passo rápido para ativar em 3 minutos */}
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white">
                    Como ativar o banco gratuito em 3 minutos:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>
                      Crie um projeto gratuito em{' '}
                      <span className="text-blue-400 font-semibold">supabase.com</span> (New Project).
                    </li>
                    <li>
                      Abra <strong className="text-slate-200">SQL Editor</strong>, clique em{' '}
                      <strong className="text-emerald-300">Copiar SQL</strong> abaixo e execute (Run).
                    </li>
                    <li>
                      Vá em <strong className="text-slate-200">Project Settings → API</strong>, cole a{' '}
                      <strong className="text-slate-200">Project URL</strong> e a{' '}
                      <strong className="text-slate-200">anon public key</strong> abaixo, clique em{' '}
                      <strong className="text-emerald-300">Testar & Enviar Dados</strong> e depois em{' '}
                      <strong className="text-emerald-300">Copiar Link</strong> ou{' '}
                      <strong className="text-emerald-300">WhatsApp</strong> para mandar o link já conectado para o grupo.
                    </li>
                  </ol>
                </div>

                {!isAdminAuthenticated ? (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Digite o PIN do organizador (<strong className="text-slate-200">2026</strong>) no topo desta aba para colar suas chaves do Supabase e gerenciar a nuvem.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          PIN do Admin
                        </label>
                        <input
                          type="text"
                          value={config.adminPin}
                          onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          SUPABASE_URL
                        </label>
                        <input
                          type="text"
                          value={config.supabaseUrl}
                          onChange={(e) =>
                            setConfig({ ...config, supabaseUrl: e.target.value })
                          }
                          placeholder="https://xxxx.supabase.co"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          SUPABASE_ANON_KEY
                        </label>
                        <input
                          type="password"
                          value={config.supabaseAnonKey}
                          onChange={(e) =>
                            setConfig({ ...config, supabaseAnonKey: e.target.value })
                          }
                          placeholder="eyJhbGciOi..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={pushAllLocalToCloud}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Cloud className="w-3.5 h-3.5" /> Testar & Enviar Dados p/ Nuvem
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          syncFromCloud(false);
                          showToast('Buscando atualizações do grupo...');
                        }}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Agora
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const ok = copyTextFallback(SUPABASE_SCHEMA_SQL);
                          navigator.clipboard?.writeText(SUPABASE_SCHEMA_SQL).catch(() => {});
                          if (ok) {
                            showToast('Script SQL copiado!');
                          } else {
                            setShowSql(true);
                            showToast('SQL aberto abaixo para você selecionar e copiar.', 'info');
                          }
                        }}
                        className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar SQL
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSql((v) => !v)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 px-2 py-2"
                      >
                        {showSql ? 'Ocultar SQL' : 'Ver SQL'}
                      </button>
                    </div>

                    {showSql && (
                      <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] text-emerald-300 overflow-x-auto leading-relaxed select-all">
                        {SUPABASE_SCHEMA_SQL}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA PARA MOBILE                      */}
      {/* ================================================================= */}
      <nav
        aria-label="Navegação Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-1.5 py-1.5 shadow-2xl"
      >
        <div className="grid grid-cols-5 gap-1">
          {(
            [
              { key: 'inicio', label: 'Início', icon: Home },
              { key: 'roteiro', label: 'Roteiro', icon: Calendar },
              { key: 'explorar', label: 'Explorar', icon: Compass },
              { key: 'custos', label: 'Custos', icon: DollarSign },
              { key: 'admin', label: 'Admin', icon: Shield },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition active:scale-95 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-[10px] mt-0.5 font-bold ${
                    isActive ? 'text-blue-300' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ================================================================= */}
      {/* MODAL DE COMPARTILHAMENTO & CÓPIA SEGURA DO LINK                  */}
      {/* ================================================================= */}
      {shareModalData.open && (
        <div
          onClick={() => setShareModalData({ ...shareModalData, open: false })}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-400" />
                Link do Grupo SP 2026
              </h3>
              <button
                onClick={() => setShareModalData({ ...shareModalData, open: false })}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareModalData.isPreviewUrl && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/35 p-3.5 text-xs text-amber-200 space-y-1">
                <p className="font-bold text-amber-100">
                  Atenção: Você está dentro da tela de teste (Preview)
                </p>
                <p className="leading-relaxed">
                  Links de preview internos do Google não abrem no celular dos seus amigos. Para gerar o link público definitivo (ex.:{' '}
                  <span className="font-mono text-white">sp-2026.vercel.app</span>), publique o projeto seguindo o guia rápido ou copie o endereço público após publicar.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Link direto (toque na caixa para selecionar tudo):
              </label>
              <input
                type="text"
                readOnly
                value={shareModalData.url}
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => e.currentTarget.select()}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-blue-300 font-mono select-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  copyTextFallback(shareModalData.url);
                  navigator.clipboard?.writeText(shareModalData.url).catch(() => {});
                  showToast('Link copiado!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> Copiar Só o Link
              </button>

              <button
                type="button"
                onClick={() => {
                  copyTextFallback(shareModalData.inviteText);
                  navigator.clipboard?.writeText(shareModalData.inviteText).catch(() => {});
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(
                    shareModalData.inviteText
                  )}`;
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL DE INSTALAÇÃO NA TELA INICIAL (ÍCONE DE APP NATIVO)         */}
      {/* ================================================================= */}
      {installModalOpen && (
        <div
          onClick={() => setInstallModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {appIconUrl ? (
                  <img
                    src={appIconUrl}
                    alt="Ícone SP 2026"
                    className="w-14 h-14 rounded-2xl border border-white/20 shadow-xl shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-base shrink-0">
                    SP 26
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Web App (PWA)
                  </span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    SP 2026 na Tela Inicial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Abre em tela cheia, sem barra de endereço!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInstallModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deferredInstallPrompt && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deferredInstallPrompt.prompt();
                    const res = await deferredInstallPrompt.userChoice;
                    if (res.outcome === 'accepted') {
                      setDeferredInstallPrompt(null);
                      setInstallModalOpen(false);
                      showToast('Ícone SP 2026 instalado na tela inicial!');
                    }
                  } catch {}
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                Instalar Aplicativo Agora
              </button>
            )}

            <div className="space-y-3 text-xs">
              {/* Passo a passo iPhone */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <p className="font-extrabold text-white flex items-center gap-2">
                  <span>🍎</span> iPhone (Safari)
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>
                    Abra este link no <strong className="text-white">Safari</strong> (se abriu dentro do WhatsApp, toque no ícone do Safari no canto inferior direito).
                  </li>
                  <li>
                    Toque no botão <strong className="text-blue-300">Compartilhar</strong> (quadrado com seta para cima na barra inferior).
                  </li>
                  <li>
                    Role para baixo e toque em{' '}
                    <strong className="text-emerald-300">“Adicionar à Tela de Início”</strong> →{' '}
                    <strong className="text-white">Adicionar</strong>.
                  </li>
                </ol>
              </div>

              {/* Passo a passo Android */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <p className="font-extrabold text-white flex items-center gap-2">
                  <span>🤖</span> Android (Chrome / Samsung Internet)
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>
                    Toque nos <strong className="text-white">3 pontinhos (⋮)</strong> no canto superior direito do navegador.
                  </li>
                  <li>
                    Selecione <strong className="text-emerald-300">“Instalar aplicativo”</strong> ou{' '}
                    <strong className="text-emerald-300">“Adicionar à tela inicial”</strong>.
                  </li>
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInstallModalOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL PARA QUALQUER PESSOA ADICIONAR UM NOVO LUGAR NO EXPLORAR    */}
      {/* ================================================================= */}
      {addPlaceModalOpen && (
        <div
          onClick={() => setAddPlaceModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Adicionar Novo Lugar
                </h3>
                <p className="text-xs text-slate-400">
                  Qualquer pessoa do grupo pode sugerir restaurantes, bares ou passeios aqui.
                </p>
              </div>
              <button
                onClick={() => setAddPlaceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPlace} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaceForm.name}
                  onChange={(e) =>
                    setNewPlaceForm({ ...newPlaceForm, name: e.target.value })
                  }
                  placeholder="Ex: Z Deli Sandwich Shop, Pinacoteca, Bar da Dona Onça..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Região / Bairro
                  </label>
                  <select
                    value={newPlaceForm.region}
                    onChange={(e) =>
                      setNewPlaceForm({ ...newPlaceForm, region: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {regionsList
                      .filter((r) => r !== 'Todas')
                      .map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    <option value="14. Sugestões Extras do Grupo">
                      14. Sugestões Extras do Grupo
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newPlaceForm.category}
                    onChange={(e) =>
                      setNewPlaceForm({
                        ...newPlaceForm,
                        category: e.target.value as AttractionMeta['category'],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {categoriesList
                      .filter((c) => c !== 'Todas')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço ou Referência
                  </label>
                  <input
                    type="text"
                    value={newPlaceForm.address}
                    onChange={(e) =>
                      setNewPlaceForm({ ...newPlaceForm, address: e.target.value })
                    }
                    placeholder="Ex: Pinheiros / Perto do Metrô..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horário (opcional)
                  </label>
                  <input
                    type="text"
                    value={newPlaceForm.hours}
                    onChange={(e) =>
                      setNewPlaceForm({ ...newPlaceForm, hours: e.target.value })
                    }
                    placeholder="Ex: Ter a Dom 12h às 23h"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Por que vale a pena ir? / Dicas
                </label>
                <textarea
                  rows={2}
                  value={newPlaceForm.notes}
                  onChange={(e) =>
                    setNewPlaceForm({ ...newPlaceForm, notes: e.target.value })
                  }
                  placeholder="Ex: Hambúrguer premiado, ótimo para o dia livre..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link de Foto (opcional)
                </label>
                <input
                  type="url"
                  value={newPlaceForm.imageUrl}
                  onChange={(e) =>
                    setNewPlaceForm({ ...newPlaceForm, imageUrl: e.target.value })
                  }
                  placeholder="https://... (se vazio, usa foto padrão de SP)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg shadow-blue-950/60"
              >
                Salvar Lugar no Explorar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL RÁPIDO DE IDENTIFICAÇÃO DE NOME PARA VOTAÇÃO E CURTIDAS ❤️  */}
      {/* ================================================================= */}
      {voterPromptModal.open && (
        <div
          onClick={() =>
            setVoterPromptModal({
              open: false,
              pendingStopId: null,
              pendingChoice: null,
              pendingLikeAttractionId: null,
            })
          }
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>👤</span> Quem está interagindo?
              </h3>
              <button
                onClick={() =>
                  setVoterPromptModal({
                    open: false,
                    pendingStopId: null,
                    pendingChoice: null,
                    pendingLikeAttractionId: null,
                  })
                }
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Digite seu nome ou apelido uma única vez para que seus votos ({' '}
              <strong className="text-emerald-300">👍</strong> /{' '}
              <strong className="text-rose-300">👎</strong> ) e lugares favoritos ({' '}
              <strong className="text-rose-300">❤️</strong> ) fiquem identificados para todo o grupo.
            </p>

            <form onSubmit={handleConfirmVoterName} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                value={voterNameInput}
                onChange={(e) => setVoterNameInput(e.target.value)}
                placeholder="Ex: Lucas, Rafa, Mari..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition"
              >
                Salvar nome e continuar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* DRAWER / MODAL DE FICHA DETALHADA DA ATRAÇÃO                      */}
      {/* ================================================================= */}
      {selectedAttraction && (
        <div
          onClick={() => setSelectedAttraction(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedAttraction.imageUrl}
                alt={selectedAttraction.name}
                onError={handleImgError}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedAttraction(null)}
                className="absolute top-3 right-3 text-white bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md p-2 rounded-xl border border-slate-700/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  {selectedAttraction.region} • {selectedAttraction.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedAttraction.name}
                </h3>
              </div>

              {(() => {
                const likesForModal = placeLikes.filter(
                  (l) => l.attractionId === selectedAttraction.id
                );
                const isLikedModal = voterName.trim()
                  ? likesForModal.some(
                      (l) =>
                        l.voterName.trim().toLowerCase() ===
                        voterName.trim().toLowerCase()
                    )
                  : false;

                return (
                  <button
                    type="button"
                    onClick={(e) => handleTogglePlaceLike(e, selectedAttraction.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-extrabold transition ${
                      isLikedModal
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-rose-500/50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLikedModal ? 'fill-white text-white' : 'text-rose-400'
                      }`}
                    />
                    <span>{likesForModal.length}</span>
                  </button>
                );
              })()}
            </div>

            {placeLikes.filter((l) => l.attractionId === selectedAttraction.id).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-rose-400 font-bold">❤️ Favoritado por:</span>
                {placeLikes
                  .filter((l) => l.attractionId === selectedAttraction.id)
                  .map((l) => (
                    <span
                      key={l.id}
                      className="bg-rose-500/15 text-rose-200 border border-rose-500/25 px-2.5 py-0.5 rounded-full font-semibold"
                    >
                      {l.voterName}
                    </span>
                  ))}
              </div>
            )}

            {selectedAttraction.rating && (
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedAttraction.rating.toFixed(1)} no Google
                </span>
                <span className="text-slate-400">
                  ({selectedAttraction.reviewsCount?.toLocaleString('pt-BR')} avaliações)
                </span>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-1">
                <span className="text-slate-400 font-semibold block">Horário de Funcionamento</span>
                <p className="text-white font-medium">{selectedAttraction.hours}</p>
                {selectedAttraction.closedDays !== 'Não fecha' && (
                  <p className="text-rose-300 font-bold mt-1">
                    Atenção: {selectedAttraction.closedDays}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-1">
                <span className="text-slate-400 font-semibold block">Endereço</span>
                <p className="text-white">{selectedAttraction.address}</p>
              </div>

              {selectedAttraction.distanceKm > 0 && (
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block">Distância Base</span>
                    <strong className="text-white text-sm">
                      {selectedAttraction.distanceKm} km
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Uber (÷ {peoplePerCar}p)</span>
                    <strong className="text-emerald-300 text-sm">
                      {formatBRL(selectedAttraction.uberAvg / Math.max(1, peoplePerCar))}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Carro Cheio</span>
                    <strong className="text-slate-300 text-sm">
                      {formatBRL(selectedAttraction.uberAvg)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-blue-500/10 border border-blue-500/25 p-3.5 space-y-1">
                <span className="text-blue-300 font-bold block">Observações & Dicas</span>
                <p className="text-slate-200 leading-relaxed">{selectedAttraction.notes}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={selectedAttraction.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition"
              >
                <MapPin className="w-4 h-4" /> Abrir no Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {selectedAttraction.instagram && (
                <a
                  href={`https://instagram.com/${selectedAttraction.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl transition"
                >
                  {selectedAttraction.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}