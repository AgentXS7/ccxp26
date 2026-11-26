import type React from 'react';
import {
  Car,
  Eye,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Unlock,
} from 'lucide-react';
import { GROUP_MEMBERS } from '../../data/members';
import type { SyncStatus } from '../../hooks/useSupabaseSync';
import { formatBRL } from '../../lib/utils';
import type {
  AttractionMeta,
  BudgetCategory,
  BudgetItem,
  ChecklistItem,
  ChecklistStatus,
  GroupMemberId,
  ItineraryDay,
  ItineraryStop,
  MemberCloudProfile,
  PlaceLikeEntry,
  StopVoteEntry,
  TransportLeg,
  TripConfig,
} from '../../types';
import { AnimeDislikeIcon, AnimeHeartIcon, AnimeLikeIcon } from '../ui/AnimeDecor';
import { useConfirm } from '../ui/ConfirmProvider';
import { UserAvatar } from '../ui/UserAvatar';

import { AdminLugaresSection } from './AdminLugaresSection';
import { AdminRoteiroSection, type NewStopFormState } from './AdminRoteiroSection';

export type AdminSectionKey =
  | 'rsvps'
  | 'custos'
  | 'reservas'
  | 'roteiro'
  | 'lugares';

interface AdminTabProps {
  config: TripConfig;
  setConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
  days: ItineraryDay[];
  attractions: AttractionMeta[];
  stops: ItineraryStop[];
  setStops: React.Dispatch<React.SetStateAction<ItineraryStop[]>>;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  transportLegs: TransportLeg[];
  setTransportLegs: React.Dispatch<React.SetStateAction<TransportLeg[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  stopVotes: StopVoteEntry[];
  placeLikes: PlaceLikeEntry[];
  userProfiles: Record<string, string>;
  memberProfiles: Partial<Record<GroupMemberId, MemberCloudProfile>>;
  voterName: string;
  avatarPhoto?: string;
  isAdminAuthenticated: boolean;
  onUnlockMemberDevices: (memberId: GroupMemberId) => void;
  setIsAdminAuthenticated: (v: boolean) => void;
  pinInput: string;
  setPinInput: (v: string) => void;
  pinError: boolean;
  setPinError: (v: boolean) => void;
  adminSection: AdminSectionKey;
  setAdminSection: (s: AdminSectionKey) => void;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  newStopForm: NewStopFormState;
  setNewStopForm: React.Dispatch<React.SetStateAction<NewStopFormState>>;
  newBudgetForm: {
    category: BudgetCategory;
    name: string;
    subtitle: string;
    amount: string;
  };
  setNewBudgetForm: React.Dispatch<
    React.SetStateAction<{
      category: BudgetCategory;
      name: string;
      subtitle: string;
      amount: string;
    }>
  >;
  newTransportForm: {
    dayLabel: string;
    route: string;
    tripsCount: string;
    uberAvg: string;
  };
  setNewTransportForm: React.Dispatch<
    React.SetStateAction<{
      dayLabel: string;
      route: string;
      tripsCount: string;
      uberAvg: string;
    }>
  >;
  onAdminLogin: (e: React.FormEvent) => void;
  onAddStop: (e: React.FormEvent) => void;
  onAddBudgetItem: (e: React.FormEvent) => void;
  onAddTransportLeg: (e: React.FormEvent) => void;
  onDeletePlaceAsAdmin: (attr: AttractionMeta) => void;
  onSyncNow: () => void;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export function AdminTab({
  config,
  setConfig,
  days,
  attractions,
  stops,
  setStops,
  budgetItems,
  setBudgetItems,
  transportLegs,
  setTransportLegs,
  checklist,
  setChecklist,
  stopVotes,
  placeLikes,
  userProfiles,
  memberProfiles,
  voterName,
  avatarPhoto,
  isAdminAuthenticated,
  onUnlockMemberDevices,
  setIsAdminAuthenticated,
  pinInput,
  setPinInput,
  pinError,
  setPinError,
  adminSection,
  setAdminSection,
  syncStatus,
  lastSyncedAt,
  newStopForm,
  setNewStopForm,
  newBudgetForm,
  setNewBudgetForm,
  newTransportForm,
  setNewTransportForm,
  onAdminLogin,
  onAddStop,
  onAddBudgetItem,
  onAddTransportLeg,
  onDeletePlaceAsAdmin,
  onSyncNow,
  showToast,
}: AdminTabProps) {
  const confirm = useConfirm();
  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="rounded-3xl hoyo-card hoyo-gold-hairline p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isAdminAuthenticated
                ? 'bg-[#47C5B8]/18 border-[#47C5B8]/40 text-[#8AE5DB]'
                : 'bg-[#E5B869]/15 border-[#E5B869]/35 text-[#F6D794]'
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
              <h2 className="text-base font-extrabold text-white">Painel de Organização</h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isAdminAuthenticated
                    ? 'bg-[#47C5B8]/15 text-[#8AE5DB] border-[#47C5B8]/35'
                    : 'bg-[#E5B869]/15 text-[#F6D794] border-[#E5B869]/35'
                }`}
              >
                {isAdminAuthenticated
                  ? 'Modo Edição Ativo'
                  : 'Modo Visualização (Somente Leitura)'}
              </span>
            </div>
            <p className="text-xs text-[#9BA3C2] mt-0.5">
              {isAdminAuthenticated
                ? 'Você pode editar valores, alterar status de reservas e adicionar paradas.'
                : 'Todo o grupo pode acompanhar reservas, votos e valores. Apenas o organizador altera dados com o PIN.'}
            </p>
          </div>
        </div>

        {isAdminAuthenticated ? (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border ${
                syncStatus === 'synced'
                  ? 'bg-[#47C5B8]/15 border-[#47C5B8]/40 text-[#8AE5DB]'
                  : syncStatus === 'syncing'
                  ? 'bg-[#657EF8]/15 border-[#657EF8]/40 text-[#B8C5FF]'
                  : syncStatus === 'error'
                  ? 'bg-[#EC6B6B]/15 border-[#EC6B6B]/40 text-[#FFD0D0]'
                  : 'bg-[#212847] border-[#8596D6]/25 text-[#CBD2EC]'
              }`}
            >
              {syncStatus === 'synced'
                ? `Nuvem OK${lastSyncedAt ? ` (${lastSyncedAt})` : ''}`
                : syncStatus === 'syncing'
                ? 'Sincronizando...'
                : syncStatus === 'error'
                ? 'Erro na nuvem'
                : 'Modo Local'}
            </span>
            <button
              type="button"
              onClick={onSyncNow}
              className="text-xs font-bold hoyo-accent-btn px-3 py-2 rounded-xl flex items-center gap-1.5"
              title="Buscar atualizações do grupo agora"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
            </button>
            <button
              type="button"
              onClick={() => setIsAdminAuthenticated(false)}
              className="text-xs font-semibold text-[#CBD2EC] hover:text-white bg-[#212847] px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-[#8596D6]/20"
            >
              <Lock className="w-3.5 h-3.5" /> Voltar p/ Somente Leitura
            </button>
          </div>
        ) : (
          <form onSubmit={onAdminLogin} className="flex items-center gap-2">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (pinError) setPinError(false);
              }}
              placeholder={pinError ? 'PIN incorreto!' : 'PIN organizador'}
              className={`w-36 hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                pinError
                  ? 'border-[#EC6B6B] placeholder:text-[#F7A3A3]'
                  : 'focus:border-[#657EF8]'
              }`}
            />
            <button
              type="submit"
              className="hoyo-accent-btn font-bold text-xs px-3.5 py-2 rounded-xl transition shrink-0"
            >
              Desbloquear Edição
            </button>
          </form>
        )}
      </div>

      {/* Sub-abas do Admin */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { key: 'reservas', label: `Checklist Reservas (${checklist.length})` },
            {
              key: 'rsvps',
              label: `Votos & Favoritos (${stopVotes.length + placeLikes.length})`,
            },
            { key: 'custos', label: 'Tabela de Valores' },
            { key: 'roteiro', label: 'Paradas do Roteiro' },
            {
              key: 'lugares',
              label: `Lugares Explorar (${attractions.filter((a) => !a.excludedReason).length})`,
            },
          ] as const
        ).map((sub) => (
          <button
            key={sub.key}
            type="button"
            onClick={() => setAdminSection(sub.key)}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition ${
              adminSection === sub.key
                ? 'hoyo-accent-btn'
                : 'hoyo-card text-[#9BA3C2] hover:text-white'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* ADMIN 1: RESUMO DOS VOTOS & CURTIDAS */}
      {adminSection === 'rsvps' && (
        <div className="space-y-4">
          <div className="rounded-3xl hoyo-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Locais Mais Curtidos no Explorar</span>
                <AnimeHeartIcon className="w-4 h-4" />
              </h3>
              <span className="text-xs font-bold bg-[#EC6B6B]/18 text-[#FFD0D0] px-2.5 py-1 rounded-lg">
                {placeLikes.length} curtidas
              </span>
            </div>

            {placeLikes.length === 0 ? (
              <p className="text-xs text-[#9BA3C2] py-2">
                Nenhuma curtida registrada ainda. Abra a aba Explorar e clique em{' '}
                <AnimeHeartIcon className="w-3.5 h-3.5" /> nos lugares favoritos!
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
                    const normalizedMe = voterName.trim().toLowerCase();
                    return (
                      <div
                        key={a.id}
                        className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-white">{a.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#F7A3A3]">
                            <AnimeHeartIcon className="w-3.5 h-3.5" />
                            {likers.map((name) => {
                              const k = name.trim().toLowerCase();
                              const p = k === normalizedMe && avatarPhoto ? avatarPhoto : userProfiles[k];
                              return (
                                <span
                                  key={name}
                                  className="inline-flex items-center gap-1 bg-[#EC6B6B]/15 text-[#FFD0D0] px-2 py-0.5 rounded-full text-[11px]"
                                >
                                  <UserAvatar photo={p} name={name} sizeClass="w-3.5 h-3.5" textClass="text-[8px]" />
                                  <span>{name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#EC6B6B]/18 text-[#FFD0D0] px-2.5 py-1 rounded-lg shrink-0">
                          <span>{likers.length}</span>
                          <AnimeHeartIcon className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="rounded-3xl hoyo-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>Placar de Votos nas Atrações</span>
                <span className="inline-flex items-center gap-1 text-xs font-normal text-[#9BA3C2]">
                  (<AnimeLikeIcon className="w-3.5 h-3.5" /> Sim / <AnimeDislikeIcon className="w-3.5 h-3.5" /> Não)
                </span>
              </h3>
              <div className="flex gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 bg-[#47C5B8]/15 text-[#8AE5DB] px-2.5 py-1 rounded-lg">
                  <AnimeLikeIcon className="w-3.5 h-3.5" /> Sim: {stopVotes.filter((v) => v.choice === 'yes').length}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#EC6B6B]/18 text-[#FFD0D0] px-2.5 py-1 rounded-lg">
                  <AnimeDislikeIcon className="w-3.5 h-3.5" /> Não: {stopVotes.filter((v) => v.choice === 'no').length}
                </span>
              </div>
            </div>

            {stopVotes.length === 0 ? (
              <p className="text-xs text-[#9BA3C2] py-2">
                Nenhum voto registrado nas atrações ainda. Abra a aba Roteiro para votar com{' '}
                <AnimeLikeIcon className="w-3.5 h-3.5" /> ou <AnimeDislikeIcon className="w-3.5 h-3.5" />.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stops
                  .filter((s) => stopVotes.some((v) => v.stopId === s.id))
                  .map((s) => {
                    const votes = stopVotes.filter((v) => v.stopId === s.id);
                    const yesList = votes
                      .filter((v) => v.choice === 'yes')
                      .map((v) => v.voterName);
                    const noList = votes
                      .filter((v) => v.choice === 'no')
                      .map((v) => v.voterName);
                    return (
                      <div key={s.id} className="rounded-2xl hoyo-card-inner p-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {s.dayDate.slice(8, 10)}/12 • {s.title}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9BA3C2] shrink-0">
                            <AnimeLikeIcon className="w-3.5 h-3.5" /> {yesList.length} •{' '}
                            <AnimeDislikeIcon className="w-3.5 h-3.5" /> {noList.length}
                          </span>
                        </div>
                        {yesList.length > 0 && (
                          <p className="text-xs text-[#8AE5DB] flex items-center gap-1.5 flex-wrap">
                            <AnimeLikeIcon className="w-3.5 h-3.5" /> Sim: {yesList.join(', ')}
                          </p>
                        )}
                        {noList.length > 0 && (
                          <p className="text-xs text-[#F7A3A3] flex items-center gap-1.5 flex-wrap">
                            <AnimeDislikeIcon className="w-3.5 h-3.5" /> Não: {noList.join(', ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Perfis Fixos do Grupo (Trava de Aparelho + Código de Transferência) */}
          <div className="rounded-3xl hoyo-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">
                  Perfis do Grupo (Max, Allan, Dino, Leandro)
                </h3>
                <p className="text-xs text-[#9BA3C2]">
                  Cada perfil fica travado no aparelho do dono. Se alguém trocar de celular ou esquecer o código, você libera aqui sem apagar nada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GROUP_MEMBERS.map((member) => {
                const cloud = memberProfiles[member.id];
                const devicesCount = cloud?.trustedDevices?.length || 0;
                return (
                  <div
                    key={member.id}
                    className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        photo={cloud?.avatarPhoto || undefined}
                        name={member.name}
                        sizeClass="w-9 h-9"
                        textClass="text-xs"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-[#9BA3C2]">
                          {devicesCount > 0
                            ? `Travado em ${devicesCount} ${devicesCount === 1 ? 'aparelho' : 'aparelhos'}`
                            : 'Disponível (sem aparelho travado)'}
                        </p>
                        {isAdminAuthenticated && cloud?.transferCode && (
                          <p className="text-[10px] text-[#F6D794] font-mono inline-flex items-center gap-1 mt-0.5">
                            <KeyRound className="w-3 h-3" /> Código: {cloud.transferCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAdminAuthenticated && devicesCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onUnlockMemberDevices(member.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#E5B869]/15 border border-[#E5B869]/40 text-[#F6D794] hover:bg-[#E5B869]/25 shrink-0 transition"
                        title="Liberar aparelho (preserva foto, gastos e roteiro)"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Liberar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN 2: TABELA DE VALORES */}
      {adminSection === 'custos' && (
        <div className="space-y-4">
          <div className="rounded-3xl hoyo-card p-5 space-y-4">
            <h3 className="text-base font-bold text-white">
              Hospedagem & Logística da Chegada (03/12)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
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
                    className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                ) : (
                  <div className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#F6D794]">
                    {config.airbnbTotalCost !== null
                      ? formatBRL(config.airbnbTotalCost)
                      : 'A confirmar pelo organizador'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                  Aviso da Janela Pouso GRU (23h50) → Check-in (15h)
                </label>
                {isAdminAuthenticated ? (
                  <input
                    type="text"
                    value={config.arrivalWindowNote}
                    onChange={(e) =>
                      setConfig({ ...config, arrivalWindowNote: e.target.value })
                    }
                    className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                ) : (
                  <div className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-xs text-[#CBD2EC]">
                    {config.arrivalWindowNote}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deslocamentos Uber (Base Editável do Grupo) */}
          <div className="rounded-3xl hoyo-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#E5B869]" />
                  Deslocamentos Uber — Base do Grupo ({transportLegs.length})
                </h3>
                <p className="text-xs text-[#9BA3C2]">
                  Valores por carro (a aba Custos divide automaticamente por pessoa; cada amigo também pode ajustar o valor dele).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {transportLegs.map((leg) => (
                <div
                  key={leg.id}
                  className="rounded-2xl hoyo-card-inner p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#8CA0FF] uppercase">
                      {leg.dayLabel}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white">{leg.route}</p>
                    {leg.metroAlternative && (
                      <p className="text-[11px] text-[#8AE5DB] mt-0.5">{leg.metroAlternative}</p>
                    )}
                  </div>

                  {isAdminAuthenticated ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1 text-[11px] text-[#9BA3C2]">
                        <span>Trechos</span>
                        <input
                          type="number"
                          min="1"
                          value={leg.tripsCount}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setTransportLegs((prev) =>
                              prev.map((l) => (l.id === leg.id ? { ...l, tripsCount: val } : l))
                            );
                          }}
                          className="w-16 bg-[#1D2442] border border-[#8596D6]/25 rounded-xl px-2.5 py-1.5 text-xs text-white text-center"
                        />
                      </label>

                      <label className="flex items-center gap-1 text-[11px] text-[#9BA3C2]">
                        <span>Média R$/carro</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={leg.uberAvg}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setTransportLegs((prev) =>
                              prev.map((l) =>
                                l.id === leg.id
                                  ? {
                                      ...l,
                                      uberAvg: val,
                                      uberSurge: Number((val * 1.5).toFixed(2)),
                                    }
                                  : l
                              )
                            );
                          }}
                          className="w-24 bg-[#1D2442] border border-[#8596D6]/25 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </label>

                      <label className="flex items-center gap-1 text-[11px] text-[#9BA3C2]">
                        <span>Dinâmica R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={leg.uberSurge}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setTransportLegs((prev) =>
                              prev.map((l) => (l.id === leg.id ? { ...l, uberSurge: val } : l))
                            );
                          }}
                          className="w-24 bg-[#1D2442] border border-[#8596D6]/25 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Remover trecho Uber?',
                            message: `Remover o trecho "${leg.route}" da base de custos do grupo?`,
                            confirmLabel: 'Remover trecho',
                            tone: 'danger',
                          });
                          if (ok) {
                            setTransportLegs((prev) => prev.filter((l) => l.id !== leg.id));
                            showToast('Trecho removido da base do grupo.', 'info');
                          }
                        }}
                        className="p-2 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFD0D0] hover:bg-[#EC6B6B]/30 transition shrink-0"
                        title="Remover trecho Uber da base do grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#1D2442] text-white self-start lg:self-center shrink-0">
                      {leg.tripsCount}x • Média {formatBRL(leg.uberAvg)}/carro • Din.{' '}
                      {formatBRL(leg.uberSurge)}/carro
                    </span>
                  )}
                </div>
              ))}
            </div>

            {isAdminAuthenticated && (
              <form
                onSubmit={onAddTransportLeg}
                className="pt-4 border-t border-[#8596D6]/15 grid grid-cols-1 sm:grid-cols-5 gap-2.5"
              >
                <input
                  type="text"
                  value={newTransportForm.dayLabel}
                  onChange={(e) =>
                    setNewTransportForm({ ...newTransportForm, dayLabel: e.target.value })
                  }
                  placeholder="Dia (ex: 04/12 Sex)"
                  className="hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={newTransportForm.route}
                  onChange={(e) =>
                    setNewTransportForm({ ...newTransportForm, route: e.target.value })
                  }
                  placeholder="Rota (ex: Vila Mariana ↔ Pinheiros)"
                  className="sm:col-span-2 hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newTransportForm.tripsCount}
                    onChange={(e) =>
                      setNewTransportForm({ ...newTransportForm, tripsCount: e.target.value })
                    }
                    placeholder="Trechos"
                    className="hoyo-card-inner rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTransportForm.uberAvg}
                    onChange={(e) =>
                      setNewTransportForm({ ...newTransportForm, uberAvg: e.target.value })
                    }
                    placeholder="Média R$"
                    className="hoyo-card-inner rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="hoyo-accent-btn font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar Trecho
                </button>
              </form>
            )}
          </div>

          <div className="rounded-3xl hoyo-card p-5 space-y-3">
            <h3 className="text-base font-bold text-white">
              {isAdminAuthenticated
                ? 'Atualizar Valores por Pessoa (Deixe vazio para “A confirmar”)'
                : 'Valores Cadastrados por Pessoa (Somente Leitura)'}
            </h3>
            <div className="space-y-2.5">
              {budgetItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl hoyo-card-inner p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#8CA0FF] uppercase">
                      {item.category}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white">{item.name}</p>
                  </div>

                  {isAdminAuthenticated ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#9BA3C2]">R$</span>
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
                        className="w-32 bg-[#1D2442] border border-[#8596D6]/25 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Remover custo da base?',
                            message: `Remover "${item.name}" da tabela de valores do grupo?`,
                            confirmLabel: 'Remover custo',
                            tone: 'danger',
                          });
                          if (ok) {
                            setBudgetItems((prev) => prev.filter((b) => b.id !== item.id));
                            showToast(`"${item.name}" removido da tabela de custos.`, 'info');
                          }
                        }}
                        className="p-2 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFD0D0] hover:bg-[#EC6B6B]/30 transition shrink-0"
                        title="Remover gasto da base do grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg self-start sm:self-center ${
                        item.amountPerPerson === null
                          ? 'bg-[#E5B869]/12 text-[#F6D794] border border-[#E5B869]/25'
                          : 'bg-[#1D2442] text-white'
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
                onSubmit={onAddBudgetItem}
                className="pt-4 border-t border-[#8596D6]/15 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
              >
                <select
                  value={newBudgetForm.category}
                  onChange={(e) =>
                    setNewBudgetForm({
                      ...newBudgetForm,
                      category: e.target.value as BudgetCategory,
                    })
                  }
                  className="hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
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
                    <option key={c} value={c} className="bg-[#14192D]">
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
                  className="hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  value={newBudgetForm.amount}
                  onChange={(e) =>
                    setNewBudgetForm({ ...newBudgetForm, amount: e.target.value })
                  }
                  placeholder="Valor R$ (opcional)"
                  className="hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="hoyo-accent-btn font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar Custo
                </button>
              </form>
            )}
            {isAdminAuthenticated && (
              <p className="text-[11px] text-[#9BA3C2] pt-1">
                Itens da categoria &ldquo;Transporte&rdquo; (ex.: Passagem aérea, Metrô, Transfer) aparecem em Transporte &amp; Deslocamentos na aba Custos.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ADMIN 3: CHECKLIST DE RESERVAS */}
      {adminSection === 'reservas' && (
        <div className="rounded-3xl hoyo-card p-5 space-y-3">
          <h3 className="text-base font-bold text-white">
            Checklist Oficial de Reservas & Ingressos (13 Ações)
          </h3>
          <div className="space-y-2.5">
            {checklist.map((chk) => (
              <div
                key={chk.id}
                className="rounded-2xl hoyo-card-inner p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        chk.priority === 'Alta'
                          ? 'bg-[#EC6B6B]/20 text-[#FFD0D0]'
                          : 'bg-[#E5B869]/20 text-[#F6D794]'
                      }`}
                    >
                      Prioridade {chk.priority}
                    </span>
                    <span className="text-xs font-bold text-[#8CA0FF]">{chk.targetDate}</span>
                    <span className="text-sm font-bold text-white">{chk.place}</span>
                  </div>
                  <p className="text-xs text-[#CBD2EC]">{chk.action}</p>
                  <p className="text-[11px] text-[#9BA3C2]">
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
                    className={`text-xs font-bold px-3 py-2 rounded-xl border shrink-0 bg-[#14192D] ${
                      chk.status === 'Confirmado' || chk.status === 'Comprado'
                        ? 'border-[#47C5B8]/45 text-[#8AE5DB]'
                        : chk.status === 'Reservado'
                        ? 'border-[#657EF8]/45 text-[#B8C5FF]'
                        : 'border-[#E5B869]/45 text-[#F6D794]'
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
                        ? 'bg-[#47C5B8]/15 border-[#47C5B8]/40 text-[#8AE5DB]'
                        : chk.status === 'Reservado'
                        ? 'bg-[#657EF8]/15 border-[#657EF8]/40 text-[#B8C5FF]'
                        : 'bg-[#E5B869]/15 border-[#E5B869]/40 text-[#F6D794]'
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

      {/* ADMIN 4: ROTEIRO */}
      {adminSection === 'roteiro' && (
        <AdminRoteiroSection
          days={days}
          attractions={attractions}
          stops={stops}
          setStops={setStops}
          isAdminAuthenticated={isAdminAuthenticated}
          newStopForm={newStopForm}
          setNewStopForm={setNewStopForm}
          onAddStop={onAddStop}
          showToast={showToast}
        />
      )}

      {/* ADMIN 4B: LUGARES DO EXPLORAR */}
      {adminSection === 'lugares' && (
        <AdminLugaresSection
          attractions={attractions}
          isAdminAuthenticated={isAdminAuthenticated}
          onDeletePlaceAsAdmin={onDeletePlaceAsAdmin}
        />
      )}
    </div>
  );
}
