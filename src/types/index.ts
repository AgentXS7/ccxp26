export type TabKey = 'inicio' | 'roteiro' | 'explorar' | 'custos' | 'admin';
export type ShiftType = 'Manhã e Almoço' | 'Tarde' | 'Noite e Madrugada';
export type DayBadgeType = 'Chegada' | 'Dia Livre' | 'CCXP26' | 'Roteiro em Grupo';
export type RsvpStatus = 'going' | 'not_going';
export type ChecklistStatus = 'Pendente' | 'Comprado' | 'Reservado' | 'Confirmado';
export type BudgetCategory =
  | 'Transporte'
  | 'Alimentação'
  | 'Ingressos'
  | 'Hospedagem'
  | 'Passeios';

export type PersonalExpenseCategory = BudgetCategory | 'Compras & Extras';

export interface PersonalExtraItem {
  id: string;
  category: PersonalExpenseCategory;
  name: string;
  notes?: string;
  amount: number;
  included: boolean;
  paid?: boolean;
  createdAt: string;
}

export interface PersonalBudgetState {
  includedOverrides: Record<string, boolean>;
  transportOverrides: Record<string, boolean>;
  amountOverrides: Record<string, number>;
  paidMap: Record<string, boolean>;
  extraItems: PersonalExtraItem[];
}

export type ThemePresetId = 'hoyolab' | 'geo' | 'anemo' | 'pyro' | 'electro' | 'sakura';

export interface UserPreferences {
  themePreset: ThemePresetId;
  compactCards: boolean;
  avatarBadge?: string;
  /** Foto de perfil opcional em Data URL compactada (sincronizada para o grupo) */
  avatarPhoto?: string;
  /** Mostrar mascote no canto (padrão: true) */
  showMascot?: boolean;
  /** Mostrar adesivos flutuando no fundo (padrão: true) */
  showStickers?: boolean;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface AttractionMeta {
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
  period:
    | 'Dia'
    | 'Noite'
    | 'Madrugada'
    | 'Dia / Noite'
    | 'Noite / Madrugada'
    | 'Dia / Tardezinha'
    | '24h';
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

export interface ItineraryStop {
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
  isPersonal?: boolean;
}

export interface PersonalItineraryState {
  /** IDs de paradas oficiais não obrigatórias ocultadas pelo usuário no próprio roteiro */
  hiddenStopIds: string[];
  /** Paradas pessoais adicionadas pelo usuário (puxadas do Explorar ou criadas) */
  addedStops: ItineraryStop[];
}

export interface ItineraryDay {
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

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  subtitle: string;
  amountPerPerson: number | null; // null = "A confirmar" (não inventado)
  isOptional?: boolean;
  included: boolean;
  sourceNote: string;
}

export interface TransportLeg {
  id: string;
  dayLabel: string;
  route: string;
  uberAvg: number;
  uberSurge: number;
  tripsCount: number; // ex.: 2 = ida e volta
  included: boolean;
  metroAlternative?: string;
}

export interface ChecklistItem {
  id: string;
  priority: 'Alta' | 'Média' | 'Atenção';
  targetDate: string;
  place: string;
  action: string;
  channel: string;
  status: ChecklistStatus;
  notes: string;
}

export interface StopVoteEntry {
  id: string;
  stopId: string;
  voterName: string;
  avatarBadge?: string;
  choice: 'yes' | 'no';
  deviceToken: string;
  updatedAt: string;
}

export interface PlaceLikeEntry {
  id: string;
  attractionId: string;
  voterName: string;
  avatarBadge?: string;
  deviceToken: string;
  createdAt: string;
}

export interface RsvpEntry {
  id: string;
  name: string;
  phone: string;
  status: RsvpStatus;
  periodNote: string;
  comment: string;
  deviceToken: string;
  createdAt: string;
}

export interface TripConfig {
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
