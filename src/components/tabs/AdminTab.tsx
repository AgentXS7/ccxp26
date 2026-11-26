import type React from 'react';
import {
  Cloud,
  Copy,
  Database,
  Eye,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Unlock,
} from 'lucide-react';
import type { SyncStatus } from '../../hooks/useSupabaseSync';
import { SUPABASE_SCHEMA_SQL } from '../../lib/supabase';
import { copyTextFallback, formatBRL } from '../../lib/utils';
import type {
  AttractionMeta,
  BudgetCategory,
  BudgetItem,
  ChecklistItem,
  ChecklistStatus,
  ItineraryDay,
  ItineraryStop,
  PlaceLikeEntry,
  ShiftType,
  StopVoteEntry,
  TripConfig,
} from '../../types';
import { AnimeDislikeIcon, AnimeHeartIcon, AnimeLikeIcon } from '../ui/AnimeDecor';
import { UserAvatar } from '../ui/UserAvatar';

export type AdminSectionKey = 'rsvps' | 'custos' | 'reservas' | 'roteiro' | 'supabase';

interface AdminTabProps {
  config: TripConfig;
  setConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
  days: ItineraryDay[];
  attractions: AttractionMeta[];
  stops: ItineraryStop[];
  setStops: React.Dispatch<React.SetStateAction<ItineraryStop[]>>;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  stopVotes: StopVoteEntry[];
  placeLikes: PlaceLikeEntry[];
  userProfiles: Record<string, string>;
  voterName: string;
  avatarPhoto?: string;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (v: boolean) => void;
  pinInput: string;
  setPinInput: (v: string) => void;
  pinError: boolean;
  setPinError: (v: boolean) => void;
  adminSection: AdminSectionKey;
  setAdminSection: (s: AdminSectionKey) => void;
  showSql: boolean;
  setShowSql: React.Dispatch<React.SetStateAction<boolean>>;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncErrorDetail: string;
  newStopForm: {
    dayDate: string;
    shift: ShiftType;
    timeLabel: string;
    title: string;
    subtitle: string;
    details: string;
  };
  setNewStopForm: React.Dispatch<
    React.SetStateAction<{
      dayDate: string;
      shift: ShiftType;
      timeLabel: string;
      title: string;
      subtitle: string;
      details: string;
    }>
  >;
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
  onAdminLogin: (e: React.FormEvent) => void;
  onAddStop: (e: React.FormEvent) => void;
  onAddBudgetItem: (e: React.FormEvent) => void;
  onPushAllLocalToCloud: () => void;
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
  checklist,
  setChecklist,
  stopVotes,
  placeLikes,
  userProfiles,
  voterName,
  avatarPhoto,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  pinInput,
  setPinInput,
  pinError,
  setPinError,
  adminSection,
  setAdminSection,
  showSql,
  setShowSql,
  syncStatus,
  lastSyncedAt,
  syncErrorDetail,
  newStopForm,
  setNewStopForm,
  newBudgetForm,
  setNewBudgetForm,
  onAdminLogin,
  onAddStop,
  onAddBudgetItem,
  onPushAllLocalToCloud,
  onSyncNow,
  showToast,
}: AdminTabProps) {
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
          <button
            type="button"
            onClick={() => setIsAdminAuthenticated(false)}
            className="self-start md:self-center text-xs font-semibold text-[#CBD2EC] hover:text-white bg-[#212847] px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-[#8596D6]/20"
          >
            <Lock className="w-3.5 h-3.5" /> Voltar p/ Somente Leitura
          </button>
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
            { key: 'supabase', label: 'Config & Nuvem' },
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
                    <div className="flex items-center gap-2">
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
        <div className="rounded-3xl hoyo-card p-5 space-y-5">
          {isAdminAuthenticated && (
            <>
              <h3 className="text-base font-bold text-white">
                Adicionar Nova Parada ao Roteiro
              </h3>

              <form onSubmit={onAddStop} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    value={newStopForm.dayDate}
                    onChange={(e) =>
                      setNewStopForm({ ...newStopForm, dayDate: e.target.value })
                    }
                    className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {days.map((d) => (
                      <option key={d.date} value={d.date} className="bg-[#14192D]">
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
                    className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="Manhã e Almoço" className="bg-[#14192D]">
                      Manhã e Almoço
                    </option>
                    <option value="Tarde" className="bg-[#14192D]">
                      Tarde
                    </option>
                    <option value="Noite e Madrugada" className="bg-[#14192D]">
                      Noite e Madrugada
                    </option>
                  </select>

                  <input
                    type="text"
                    value={newStopForm.timeLabel}
                    onChange={(e) =>
                      setNewStopForm({ ...newStopForm, timeLabel: e.target.value })
                    }
                    placeholder="Horário (ex: 16h00 – 18h00)"
                    className="hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <input
                  type="text"
                  value={newStopForm.title}
                  onChange={(e) =>
                    setNewStopForm({ ...newStopForm, title: e.target.value })
                  }
                  placeholder="Título da parada (ex: Café na Liberdade)"
                  className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
                />

                <textarea
                  rows={2}
                  value={newStopForm.details}
                  onChange={(e) =>
                    setNewStopForm({ ...newStopForm, details: e.target.value })
                  }
                  placeholder="Observações e dicas para o grupo..."
                  className="w-full hoyo-card-inner rounded-xl px-3 py-2.5 text-xs text-white"
                />

                <button
                  type="submit"
                  className="hoyo-accent-btn font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Adicionar ao Roteiro
                </button>
              </form>
            </>
          )}

          <div
            className={
              isAdminAuthenticated ? 'pt-4 border-t border-[#8596D6]/15 space-y-2' : 'space-y-2'
            }
          >
            <p className="text-xs font-bold text-[#9BA3C2]">
              Paradas cadastradas no cronograma ({stops.length})
            </p>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {stops.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl hoyo-card-inner px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[#8CA0FF] font-bold">
                      {s.dayDate.slice(8, 10)}/12 • {s.shift} •{' '}
                    </span>
                    <span className="text-white font-semibold">{s.title}</span>
                  </div>
                  {isAdminAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setStops((prev) => prev.filter((item) => item.id !== s.id));
                        showToast('Parada removida do roteiro.');
                      }}
                      className="text-[#F49797] hover:text-white shrink-0 p-1"
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
        <div className="rounded-3xl hoyo-card hoyo-gold-hairline p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#47C5B8]" />
              <h3 className="text-base font-bold text-white">
                Sincronização em Tempo Real (Supabase Gratuito)
              </h3>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
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
                ? `Conectado${lastSyncedAt ? ` (${lastSyncedAt})` : ''}`
                : syncStatus === 'syncing'
                ? 'Sincronizando...'
                : syncStatus === 'error'
                ? 'Erro na conexão'
                : 'Modo Local (sem nuvem)'}
            </span>
          </div>

          {syncStatus === 'error' && syncErrorDetail && (
            <div className="rounded-2xl bg-[#EC6B6B]/12 border border-[#EC6B6B]/40 p-3.5 text-xs text-[#FFD0D0] space-y-1">
              <p className="font-bold text-white">Detalhe do erro retornado pelo Supabase:</p>
              <p className="font-mono break-all">{syncErrorDetail}</p>
              <p className="pt-1">
                Dica: Se aparecer “relation does not exist” ou “Could not find the table”, copie o SQL abaixo e clique em Run no SQL Editor do Supabase.
              </p>
            </div>
          )}

          <div className="rounded-2xl hoyo-card-inner p-4 space-y-2 text-xs text-[#CBD2EC]">
            <p className="font-bold text-white">Como ativar o banco gratuito em 3 minutos:</p>
            <ol className="list-decimal list-inside space-y-1 text-[#9BA3C2]">
              <li>
                Crie um projeto gratuito em{' '}
                <span className="text-[#8CA0FF] font-semibold">supabase.com</span> (New Project).
              </li>
              <li>
                Abra <strong className="text-white">SQL Editor</strong>, clique em{' '}
                <strong className="text-[#8AE5DB]">Copiar SQL</strong> abaixo e execute (Run).
              </li>
              <li>
                Vá em <strong className="text-white">Project Settings → API</strong>, cole a{' '}
                <strong className="text-white">Project URL</strong> e a{' '}
                <strong className="text-white">anon public key</strong> abaixo, clique em{' '}
                <strong className="text-[#8AE5DB]">Testar & Enviar Dados</strong> e depois em{' '}
                <strong className="text-[#8AE5DB]">Copiar Link</strong> ou{' '}
                <strong className="text-[#8AE5DB]">WhatsApp</strong> para mandar o link já conectado para o grupo (ou configure via{' '}
                <code className="text-[#E5B869]">VITE_SUPABASE_URL</code> e{' '}
                <code className="text-[#E5B869]">VITE_SUPABASE_ANON_KEY</code> na Vercel!).
              </li>
            </ol>
          </div>

          {!isAdminAuthenticated ? (
            <div className="rounded-2xl hoyo-card-inner p-4 text-xs text-[#9BA3C2] flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#E5B869] shrink-0" />
              <span>
                Digite o PIN do organizador (<strong className="text-white">2026</strong>) no topo desta aba para colar suas chaves do Supabase e gerenciar a nuvem.
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                    PIN do Admin
                  </label>
                  <input
                    type="text"
                    value={config.adminPin}
                    onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                    className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                    SUPABASE_URL
                  </label>
                  <input
                    type="text"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    placeholder="https://xxxx.supabase.co"
                    className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD2EC] mb-1">
                    SUPABASE_ANON_KEY
                  </label>
                  <input
                    type="password"
                    value={config.supabaseAnonKey}
                    onChange={(e) =>
                      setConfig({ ...config, supabaseAnonKey: e.target.value })
                    }
                    placeholder="eyJhbGciOi..."
                    className="w-full hoyo-card-inner rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onPushAllLocalToCloud}
                  className="text-xs font-bold bg-[#2A9D8F] hover:bg-[#31B2A2] text-white px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" /> Testar & Enviar Dados p/ Nuvem
                </button>

                <button
                  type="button"
                  onClick={onSyncNow}
                  className="text-xs font-bold hoyo-accent-btn px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
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
                  className="text-xs font-bold bg-[#212847] hover:bg-[#2B3359] text-white px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar SQL
                </button>

                <button
                  type="button"
                  onClick={() => setShowSql((v) => !v)}
                  className="text-xs font-bold text-[#8CA0FF] hover:text-white px-2 py-2"
                >
                  {showSql ? 'Ocultar SQL' : 'Ver SQL'}
                </button>
              </div>

              {showSql && (
                <pre className="hoyo-card-inner rounded-2xl p-4 text-[11px] text-[#8AE5DB] overflow-x-auto leading-relaxed select-all">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
