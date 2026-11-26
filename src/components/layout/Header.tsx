import {
  AlertTriangle,
  Calendar,
  Cloud,
  CloudOff,
  Compass,
  DollarSign,
  Home,
  Link2,
  Palette,
  RefreshCw,
  Share2,
  Shield,
  Smartphone,
} from 'lucide-react';
import type { SyncStatus } from '../../hooks/useSupabaseSync';
import type { TabKey } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface HeaderProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isStandaloneApp: boolean;
  onInstallClick: () => void;
  hasSupabase: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncErrorDetail: string;
  pendingQueueCount: number;
  onSyncClick: () => void;
  voterName: string;
  avatarPhoto?: string;
  onOpenVoterModal: () => void;
  onOpenThemeModal: () => void;
  onCopyLink: () => void;
  onShareWhatsApp: () => void;
}

const NAV_ITEMS = [
  { key: 'inicio', label: 'Início', icon: Home },
  { key: 'roteiro', label: 'Roteiro', icon: Calendar },
  { key: 'explorar', label: 'Explorar', icon: Compass },
  { key: 'custos', label: 'Custos', icon: DollarSign },
  { key: 'admin', label: 'Admin', icon: Shield },
] as const;

export function Header({
  activeTab,
  setActiveTab,
  isStandaloneApp,
  onInstallClick,
  hasSupabase,
  syncStatus,
  lastSyncedAt,
  syncErrorDetail,
  pendingQueueCount,
  onSyncClick,
  voterName,
  avatarPhoto,
  onOpenVoterModal,
  onOpenThemeModal,
  onCopyLink,
  onShareWhatsApp,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0C0F1D]/90 backdrop-blur-xl border-b border-[#8596D6]/15 pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Marca SP 2026 com a Logo Personalizada */}
        <button
          type="button"
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2 text-left group shrink-0 min-w-0"
        >
          <img
            src="/icon-192.png"
            alt="SP 2026"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#E5B869]/50 shadow-lg object-cover shrink-0"
          />
          <div className="leading-tight min-w-0">
            <span className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#F3F5FC] tracking-tight whitespace-nowrap">
              SP 2026
              <span className="text-[10px] text-[#E5B869]" aria-hidden="true">
                ✦
              </span>
            </span>
            <span className="hidden sm:block text-[10px] text-[#9BA3C2]">03–10 Dez • Grupo</span>
          </div>
        </button>

        {/* Navegação Desktop estilo pílulas HoYoLAB */}
        <nav
          aria-label="Navegação Principal"
          className="hidden md:flex items-center gap-1 bg-[#14192D]/95 border border-[#8596D6]/18 p-1 rounded-2xl"
        >
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'hoyo-accent-btn shadow-md'
                    : 'text-[#9BA3C2] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Ações Rápidas no Topo — compactas em celular para nunca estourar largura */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isStandaloneApp && (
            <button
              type="button"
              onClick={onInstallClick}
              className="inline-flex items-center gap-1 text-[11px] font-bold p-2 sm:px-2.5 sm:py-2 rounded-xl hoyo-accent-pill border transition shrink-0"
              title="Adicionar ícone SP 2026 na tela inicial do celular"
              aria-label="Instalar App"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#E5B869]" />
              <span className="hidden sm:inline">App</span>
            </button>
          )}

          {/* Botão de Personalização de Tema no celular */}
          <button
            type="button"
            onClick={onOpenThemeModal}
            className="inline-flex items-center justify-center p-2 rounded-xl bg-[#171C33] border border-[#8596D6]/20 text-[#E5B869] hover:border-[#E5B869]/50 transition shrink-0"
            title="Personalizar tema e visual no seu celular"
            aria-label="Personalizar tema"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Status Nuvem Supabase */}
          <button
            type="button"
            onClick={onSyncClick}
            className={`inline-flex items-center gap-1 text-[11px] font-bold p-2 sm:px-2.5 sm:py-2 rounded-xl border transition shrink-0 ${
              syncStatus === 'synced'
                ? 'bg-[#47C5B8]/12 border-[#47C5B8]/35 text-[#8AE5DB]'
                : syncStatus === 'syncing'
                ? 'bg-[#657EF8]/15 border-[#657EF8]/40 text-[#B8C5FF]'
                : syncStatus === 'error'
                ? 'bg-[#EC6B6B]/15 border-[#EC6B6B]/40 text-[#FFB5B5]'
                : 'bg-[#171C33] border-[#8596D6]/20 text-[#9BA3C2] hover:text-white'
            }`}
            title={
              pendingQueueCount > 0
                ? `${pendingQueueCount} alteração(ões) feita(s) offline aguardando internet para sincronizar`
                : syncStatus === 'synced'
                ? `Sincronizado com Supabase${lastSyncedAt ? ` às ${lastSyncedAt}` : ''}`
                : syncStatus === 'error'
                ? `Erro na nuvem: ${syncErrorDetail}`
                : hasSupabase
                ? 'Sincronizar agora'
                : 'Clique para configurar o Supabase'
            }
            aria-label="Status da sincronização na nuvem"
          >
            {syncStatus === 'synced' ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-[#47C5B8]" />
                <span className="hidden sm:inline">Nuvem</span>
              </>
            ) : syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#657EF8]" />
                <span className="hidden sm:inline">Sync</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-[#EC6B6B]" />
                <span className="hidden sm:inline">Erro</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Local</span>
              </>
            )}
            {pendingQueueCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#E5B869] text-[#0C0F1D] text-[10px] font-black leading-none">
                {pendingQueueCount}
              </span>
            )}
          </button>

          {/* Perfil do Viajante (Foto + Nome) */}
          <button
            type="button"
            onClick={onOpenVoterModal}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-xl bg-[#171C33] border border-[#8596D6]/20 text-[#EEF1FA] hover:border-[#E5B869]/45 transition max-w-[92px] sm:max-w-[150px] shrink-0"
            title="Seu perfil (foto e nome)"
          >
            <UserAvatar
              photo={avatarPhoto}
              name={voterName}
              sizeClass="w-5 h-5"
              textClass="text-[10px]"
            />
            <span className="truncate">{voterName.trim() ? voterName : 'Perfil'}</span>
          </button>

          {/* Copiar Link */}
          <button
            type="button"
            onClick={onCopyLink}
            className="flex items-center gap-1 bg-[#1B223E] hover:bg-[#232B4D] border border-[#8596D6]/25 text-[#EEF1FA] text-xs font-bold p-2 sm:px-2.5 sm:py-2 rounded-xl transition shrink-0"
            title="Copiar link para compartilhar com o grupo"
            aria-label="Copiar link"
          >
            <Link2 className="w-3.5 h-3.5 text-[#8CA0FF]" />
            <span className="hidden sm:inline">Copiar Link</span>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={onShareWhatsApp}
            className="flex items-center gap-1.5 bg-[#2A9D8F] hover:bg-[#31B2A2] active:scale-[0.98] text-white text-xs font-bold p-2 sm:px-3 sm:py-2 rounded-xl shadow-lg transition shrink-0"
            aria-label="Compartilhar no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
}
