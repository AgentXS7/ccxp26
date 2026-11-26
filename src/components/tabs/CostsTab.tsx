import type React from 'react';
import { useState } from 'react';
import {
  Car,
  Check,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { formatBRL } from '../../lib/utils';
import type {
  BudgetCategory,
  BudgetItem,
  PersonalBudgetState,
  PersonalExpenseCategory,
  PersonalExtraItem,
  TransportLeg,
  TripConfig,
} from '../../types';
import { CornerOrnaments } from '../ui/AnimeDecor';

interface CostsTabProps {
  config: TripConfig;
  confirmedFriendsCount: number;
  peoplePerCar: number;
  setPeoplePerCar: (n: number) => void;
  useSurgePricing: boolean;
  setUseSurgePricing: React.Dispatch<React.SetStateAction<boolean>>;
  financialSummary: {
    byCategory: Record<BudgetCategory, { documentedTotal: number; pendingCount: number }>;
    shoppingExtrasTotal: number;
    allExtrasTotal: number;
    paidTotal: number;
    grandTotal: number;
    totalPendingItems: number;
  };
  transportLegs: TransportLeg[];
  budgetItems: BudgetItem[];
  personalBudget: PersonalBudgetState;
  setPersonalBudget: React.Dispatch<React.SetStateAction<PersonalBudgetState>>;
  canEdit: boolean;
  onRequireAuth: () => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const EXTRA_CATEGORIES: PersonalExpenseCategory[] = [
  'Compras & Extras',
  'Alimentação',
  'Ingressos',
  'Passeios',
  'Transporte',
  'Hospedagem',
];

export function CostsTab({
  config,
  confirmedFriendsCount,
  peoplePerCar,
  setPeoplePerCar,
  useSurgePricing,
  setUseSurgePricing,
  financialSummary,
  transportLegs,
  budgetItems,
  personalBudget,
  setPersonalBudget,
  canEdit,
  onRequireAuth,
  showToast,
}: CostsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraCategory, setExtraCategory] =
    useState<PersonalExpenseCategory>('Compras & Extras');
  const [extraNotes, setExtraNotes] = useState('');
  const [extraPaid, setExtraPaid] = useState(false);

  // Edição inline de "Meu valor" em um item oficial (salvo só para o usuário)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const hasPersonalCustomizations =
    Object.keys(personalBudget.includedOverrides).length > 0 ||
    Object.keys(personalBudget.transportOverrides).length > 0 ||
    Object.keys(personalBudget.amountOverrides).length > 0 ||
    Object.keys(personalBudget.paidMap).length > 0;

  const remainingToPay = Math.max(0, financialSummary.grandTotal - financialSummary.paidTotal);

  const toggleOfficialIncluded = (item: BudgetItem) => {
    const current =
      personalBudget.includedOverrides[item.id] !== undefined
        ? personalBudget.includedOverrides[item.id]
        : item.included;
    setPersonalBudget((prev) => ({
      ...prev,
      includedOverrides: {
        ...prev.includedOverrides,
        [item.id]: !current,
      },
    }));
  };

  const toggleTransportIncluded = (leg: TransportLeg) => {
    const current =
      personalBudget.transportOverrides[leg.id] !== undefined
        ? personalBudget.transportOverrides[leg.id]
        : leg.included;
    setPersonalBudget((prev) => ({
      ...prev,
      transportOverrides: {
        ...prev.transportOverrides,
        [leg.id]: !current,
      },
    }));
  };

  const togglePaid = (id: string) => {
    setPersonalBudget((prev) => ({
      ...prev,
      paidMap: {
        ...prev.paidMap,
        [id]: !prev.paidMap[id],
      },
    }));
  };

  const startEditingAmount = (id: string, currentAmount: number | null) => {
    if (!canEdit) {
      onRequireAuth();
      return;
    }
    setEditingItemId(id);
    setEditingValue(currentAmount !== null ? String(currentAmount) : '');
  };

  const saveAmountOverride = (id: string) => {
    const normalized = editingValue.trim().replace(',', '.');
    if (normalized === '') {
      setPersonalBudget((prev) => {
        const next = { ...prev.amountOverrides };
        delete next[id];
        return { ...prev, amountOverrides: next };
      });
      setEditingItemId(null);
      return;
    }
    const parsed = Number(normalized);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setPersonalBudget((prev) => ({
      ...prev,
      amountOverrides: {
        ...prev.amountOverrides,
        [id]: parsed,
      },
    }));
    setEditingItemId(null);
    showToast('Seu valor pessoal foi salvo (só no seu aparelho).');
  };

  const resetAmountOverride = (id: string) => {
    setPersonalBudget((prev) => {
      const next = { ...prev.amountOverrides };
      delete next[id];
      return { ...prev, amountOverrides: next };
    });
    setEditingItemId(null);
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = extraName.trim();
    const parsed = Number(extraAmount.trim().replace(',', '.'));
    if (!cleanName || Number.isNaN(parsed) || parsed < 0) return;

    const created: PersonalExtraItem = {
      id: 'extra_' + Date.now().toString(36),
      category: extraCategory,
      name: cleanName,
      notes: extraNotes.trim() || undefined,
      amount: parsed,
      included: true,
      paid: extraPaid,
      createdAt: new Date().toISOString(),
    };

    setPersonalBudget((prev) => ({
      ...prev,
      extraItems: [created, ...prev.extraItems],
    }));

    setExtraName('');
    setExtraAmount('');
    setExtraNotes('');
    setExtraPaid(false);
    setShowAddForm(false);
    showToast(`"${cleanName}" adicionado ao seu controle pessoal!`);
  };

  const toggleExtraIncluded = (id: string) => {
    setPersonalBudget((prev) => ({
      ...prev,
      extraItems: prev.extraItems.map((ex) =>
        ex.id === id ? { ...ex, included: !ex.included } : ex
      ),
    }));
  };

  const toggleExtraPaid = (id: string) => {
    setPersonalBudget((prev) => ({
      ...prev,
      extraItems: prev.extraItems.map((ex) =>
        ex.id === id ? { ...ex, paid: !ex.paid } : ex
      ),
    }));
  };

  const removeExtra = (id: string) => {
    setPersonalBudget((prev) => ({
      ...prev,
      extraItems: prev.extraItems.filter((ex) => ex.id !== id),
    }));
  };

  const handleResetPersonalOverrides = () => {
    setPersonalBudget((prev) => ({
      ...prev,
      includedOverrides: {},
      transportOverrides: {},
      amountOverrides: {},
      paidMap: {},
    }));
    showToast('Marcações e valores restaurados para o padrão do grupo.', 'info');
  };

  const airbnbIncluded =
    personalBudget.includedOverrides['airbnb-base'] !== undefined
      ? personalBudget.includedOverrides['airbnb-base']
      : true;
  const airbnbOfficialShare =
    config.airbnbTotalCost !== null && config.airbnbTotalCost > 0
      ? config.airbnbTotalCost / Math.max(1, confirmedFriendsCount)
      : null;
  const airbnbHasOverride = personalBudget.amountOverrides['airbnb-base'] !== undefined;
  const airbnbEffectiveAmount = airbnbHasOverride
    ? personalBudget.amountOverrides['airbnb-base']
    : airbnbOfficialShare;
  const airbnbPaid = Boolean(personalBudget.paidMap['airbnb-base']);

  const transportBudgetItems = budgetItems.filter((i) => i.category === 'Transporte');

  const renderBudgetItemRow = (item: BudgetItem) => {
    const isIncluded =
      personalBudget.includedOverrides[item.id] !== undefined
        ? personalBudget.includedOverrides[item.id]
        : item.included;
    const hasOverride = personalBudget.amountOverrides[item.id] !== undefined;
    const effectiveAmount = hasOverride
      ? personalBudget.amountOverrides[item.id]
      : item.amountPerPerson;
    const isPaid = Boolean(personalBudget.paidMap[item.id]);
    const isEditing = editingItemId === item.id;

    return (
      <div
        key={item.id}
        className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl hoyo-card-inner p-3.5 hover:border-[#E5B869]/35 transition ${
          !isIncluded ? 'opacity-55' : ''
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isIncluded}
            onChange={() => toggleOfficialIncluded(item)}
            className="mt-1 rounded w-4 h-4 shrink-0"
          />
          <span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white">{item.name}</span>
              {item.isOptional && (
                <span className="text-[10px] font-bold bg-[#212847] text-[#CBD2EC] px-2 py-0.5 rounded">
                  Opcional
                </span>
              )}
              {hasOverride && (
                <span className="text-[10px] font-bold hoyo-accent-pill border px-1.5 py-0.5 rounded">
                  Meu valor
                </span>
              )}
            </span>
            <span className="text-[11px] text-[#9BA3C2] mt-0.5 block">{item.subtitle}</span>
          </span>
        </label>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {isIncluded && effectiveAmount !== null && effectiveAmount > 0 && (
            <button
              type="button"
              onClick={() => togglePaid(item.id)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                isPaid
                  ? 'bg-[#47C5B8]/20 border-[#47C5B8]/45 text-[#8AE5DB]'
                  : 'bg-[#171C33] border-[#8596D6]/20 text-[#9BA3C2] hover:text-white'
              }`}
            >
              {isPaid ? '✓ Pago' : 'Pago?'}
            </button>
          )}

          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                min="0"
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveAmountOverride(item.id);
                  if (e.key === 'Escape') setEditingItemId(null);
                }}
                placeholder="R$"
                className="w-24 bg-[#14192D] border border-[#657EF8] rounded-lg px-2 py-1 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => saveAmountOverride(item.id)}
                className="p-1.5 rounded-lg hoyo-accent-btn"
                title="Salvar meu valor"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              {hasOverride && (
                <button
                  type="button"
                  onClick={() => resetAmountOverride(item.id)}
                  className="p-1.5 rounded-lg bg-[#212847] text-[#CBD2EC]"
                  title="Voltar ao padrão do grupo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEditingAmount(item.id, effectiveAmount)}
              title="Toque para personalizar o seu valor (não altera o grupo)"
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-transparent hover:border-[#E5B869]/50 transition ${
                effectiveAmount === null
                  ? 'bg-[#E5B869]/15 text-[#F6D794]'
                  : effectiveAmount === 0
                  ? 'bg-[#47C5B8]/15 text-[#8AE5DB]'
                  : 'bg-[#1F2644] text-white'
              }`}
            >
              <span>
                {effectiveAmount === null
                  ? 'A confirmar'
                  : effectiveAmount === 0
                  ? 'Grátis'
                  : formatBRL(effectiveAmount)}
              </span>
              <Pencil className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {!canEdit && (
        <div className="rounded-2xl bg-[#E5B869]/12 border border-[#E5B869]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#FCE7BE]">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#E5B869] shrink-0" />
            <span>
              Modo somente leitura — selecione seu perfil do grupo no topo para personalizar ou adicionar custos.
            </span>
          </span>
          <button
            type="button"
            onClick={onRequireAuth}
            className="text-xs font-extrabold px-3 py-1.5 rounded-xl hoyo-accent-btn shrink-0"
          >
            Entrar no perfil
          </button>
        </div>
      )}

      {/* Painel Principal do Controle de Gastos Pessoal */}
      <div className="relative rounded-3xl hoyo-card hoyo-gold-hairline hoyo-shimmer-top p-5 sm:p-6 space-y-5">
        <CornerOrnaments />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E5B869]">
              <Wallet className="w-3.5 h-3.5" />
              Seu Controle de Gastos Pessoal
            </span>
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatBRL(financialSummary.grandTotal)}
              </h2>
              <span className="text-xs text-[#9BA3C2]">
                estimado pra você
                {financialSummary.totalPendingItems > 0
                  ? ` (+ ${financialSummary.totalPendingItems} a confirmar)`
                  : ''}
              </span>
            </div>

            {/* Resumo rápido: Já pago / Falta / Extras */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {financialSummary.paidTotal > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#47C5B8]/15 border border-[#47C5B8]/35 text-[#8AE5DB]">
                  <Check className="w-3 h-3" />
                  Já pago: {formatBRL(financialSummary.paidTotal)}
                </span>
              )}
              {financialSummary.paidTotal > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1C223B] border border-[#8596D6]/25 text-[#CBD2EC]">
                  Falta: {formatBRL(remainingToPay)}
                </span>
              )}
              {financialSummary.allExtrasTotal > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full hoyo-accent-pill border">
                  <ShoppingBag className="w-3 h-3" />
                  Meus extras: {formatBRL(financialSummary.allExtrasTotal)}
                </span>
              )}
            </div>
          </div>

          {/* Ação + Custo extra & Controles de Rateio */}
          <div className="flex flex-col sm:items-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!canEdit) {
                  onRequireAuth();
                  return;
                }
                setShowAddForm((v) => !v);
              }}
              className="inline-flex items-center justify-center gap-1.5 hoyo-accent-btn text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg transition active:scale-[0.98]"
            >
              {!canEdit ? (
                <Lock className="w-4 h-4" />
              ) : showAddForm ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{showAddForm && canEdit ? 'Fechar formulário' : '+ Custo extra'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hoyo-card-inner rounded-2xl p-1 flex items-center gap-1">
                <span className="text-[11px] text-[#9BA3C2] px-2 font-semibold">Uber ÷</span>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeoplePerCar(num)}
                    className={`w-7 h-7 rounded-xl text-xs font-extrabold transition ${
                      peoplePerCar === num
                        ? 'hoyo-accent-btn shadow'
                        : 'text-[#9BA3C2] hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setUseSurgePricing((v) => !v)}
                className={`text-xs font-bold px-3 py-2 rounded-2xl border transition ${
                  useSurgePricing
                    ? 'bg-[#E5B869]/18 border-[#E5B869]/45 text-[#F6D794]'
                    : 'hoyo-card-inner text-[#CBD2EC]'
                }`}
              >
                {useSurgePricing ? 'Uber: 1,5x' : 'Uber: Média'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulário expansível de + Custo extra */}
        {showAddForm && (
          <form
            onSubmit={handleAddExtra}
            className="rounded-2xl hoyo-card-inner border-[#E5B869]/35 p-4 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  Novo Custo Extra (só no seu celular)
                </h3>
                <p className="text-[11px] text-[#9BA3C2]">
                  Não altera a planilha oficial do grupo — ideal para compras, lembranças, passagem ou lanches seus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="Ex: Funko CCXP, Passagem aérea, Biscoitos..."
                className="sm:col-span-2 bg-[#14192D] border border-[#8596D6]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9BA3C2]">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-[#14192D] border border-[#8596D6]/25 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value as PersonalExpenseCategory)}
                className="bg-[#14192D] border border-[#8596D6]/25 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              >
                {EXTRA_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#14192D]">
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="Observação opcional (ex: Pix, cartão 2x...)"
                className="sm:col-span-2 bg-[#14192D] border border-[#8596D6]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#657EF8]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-[#CBD2EC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraPaid}
                  onChange={(e) => setExtraPaid(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span>Já paguei esse gasto</span>
              </label>

              <button
                type="submit"
                className="hoyo-accent-btn font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                Salvar no meu controle
              </button>
            </div>
          </form>
        )}

        {/* Resumo por Categoria */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
              <div key={cat} className="rounded-2xl hoyo-card-inner p-3 space-y-1">
                <span className="text-[11px] font-semibold text-[#9BA3C2] block">{cat}</span>
                <strong className="text-sm sm:text-base font-extrabold text-white block">
                  {formatBRL(data.documentedTotal)}
                </strong>
                {data.pendingCount > 0 && (
                  <span className="text-[10px] text-[#E5B869] block">
                    + {data.pendingCount} a confirmar
                  </span>
                )}
              </div>
            );
          })}

          <div className="rounded-2xl hoyo-card-inner border-[#E5B869]/25 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-[#F6D794] block">
              Compras &amp; Extras
            </span>
            <strong className="text-sm sm:text-base font-extrabold text-white block">
              {formatBRL(financialSummary.shoppingExtrasTotal)}
            </strong>
            <span className="text-[10px] text-[#9BA3C2] block">
              {personalBudget.extraItems.length}{' '}
              {personalBudget.extraItems.length === 1 ? 'item seu' : 'itens seus'}
            </span>
          </div>
        </div>

        {/* Barra de aviso + restaurar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#9BA3C2] border-t border-[#8596D6]/15">
          <span>
            💡 Toque no valor de qualquer item (inclusive Uber ou “A confirmar”) para colocar o{' '}
            <strong className="text-[#CBD2EC]">seu valor real</strong> — fica salvo no seu perfil sem mudar a base do grupo.
          </span>
          {hasPersonalCustomizations && (
            <button
              type="button"
              onClick={handleResetPersonalOverrides}
              className="inline-flex items-center gap-1 font-bold text-[#8CA0FF] hover:text-white shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar padrão do grupo
            </button>
          )}
        </div>
      </div>

      {/* Meus Custos Extras (Privados no Aparelho) */}
      {personalBudget.extraItems.length > 0 && (
        <div className="rounded-3xl hoyo-card border-[#E5B869]/30 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#E5B869]" />
              Meus Custos Extras
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full hoyo-accent-pill border">
                Só pra você
              </span>
            </h3>
            <span className="text-xs font-bold text-[#F6D794] shrink-0">
              {formatBRL(financialSummary.allExtrasTotal)}
            </span>
          </div>

          <div className="space-y-2">
            {personalBudget.extraItems.map((extra) => (
              <div
                key={extra.id}
                className={`flex items-start justify-between gap-3 rounded-2xl hoyo-card-inner p-3.5 transition ${
                  !extra.included ? 'opacity-55' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={extra.included}
                    onChange={() => toggleExtraIncluded(extra.id)}
                    aria-label={`Incluir ${extra.name}`}
                    className="mt-1 rounded w-4 h-4 shrink-0 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {extra.name}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#212847] text-[#CBD2EC] px-2 py-0.5 rounded">
                        {extra.category}
                      </span>
                    </div>
                    {extra.notes && (
                      <span className="text-[11px] text-[#9BA3C2] mt-0.5 block">
                        {extra.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {extra.included && (
                    <button
                      type="button"
                      onClick={() => toggleExtraPaid(extra.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        extra.paid
                          ? 'bg-[#47C5B8]/20 border-[#47C5B8]/45 text-[#8AE5DB]'
                          : 'bg-[#171C33] border-[#8596D6]/20 text-[#9BA3C2] hover:text-white'
                      }`}
                    >
                      {extra.paid ? '✓ Pago' : 'Pagar?'}
                    </button>
                  )}

                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#1F2644] text-white">
                    {formatBRL(extra.amount)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeExtra(extra.id)}
                    aria-label={`Remover ${extra.name}`}
                    title="Remover custo extra"
                    className="p-1.5 rounded-lg text-[#9BA3C2] hover:text-[#FFB5B5] hover:bg-[#EC6B6B]/15 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transporte & Deslocamentos (Uber + itens extras da base Transporte) */}
      <div className="rounded-3xl hoyo-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-[#E5B869]" />
            Transporte &amp; Deslocamentos (Uber ÷ {peoplePerCar} pessoas)
          </h3>
          <span className="text-xs font-bold text-[#8AE5DB] shrink-0">
            {formatBRL(financialSummary.byCategory.Transporte.documentedTotal)} / pessoa
            {financialSummary.byCategory.Transporte.pendingCount > 0
              ? ` (+ ${financialSummary.byCategory.Transporte.pendingCount} a confirmar)`
              : ''}
          </span>
        </div>

        <div className="space-y-2">
          {transportLegs.map((leg) => {
            const isIncluded =
              personalBudget.transportOverrides[leg.id] !== undefined
                ? personalBudget.transportOverrides[leg.id]
                : leg.included;
            const hasOverride = personalBudget.amountOverrides[leg.id] !== undefined;
            const isPaid = Boolean(personalBudget.paidMap[leg.id]);
            const unitFare = useSurgePricing ? leg.uberSurge : leg.uberAvg;
            const defaultPerPerson = (unitFare * leg.tripsCount) / Math.max(1, peoplePerCar);
            const effectivePerPerson = hasOverride
              ? personalBudget.amountOverrides[leg.id]
              : defaultPerPerson;
            const isEditing = editingItemId === leg.id;

            return (
              <div
                key={leg.id}
                className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl hoyo-card-inner p-3.5 hover:border-[#E5B869]/35 transition ${
                  !isIncluded ? 'opacity-55' : ''
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isIncluded}
                    onChange={() => toggleTransportIncluded(leg)}
                    className="mt-1 rounded w-4 h-4 shrink-0"
                  />
                  <span className="space-y-0.5 block">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#8CA0FF]">
                        {leg.dayLabel} • {leg.tripsCount} trecho(s)
                      </span>
                      {hasOverride && (
                        <span className="text-[10px] font-bold hoyo-accent-pill border px-1.5 py-0.5 rounded">
                          Meu valor
                        </span>
                      )}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {leg.route}
                    </span>
                    {leg.metroAlternative && (
                      <span className="text-[11px] text-[#8AE5DB] block">
                        {leg.metroAlternative}
                      </span>
                    )}
                  </span>
                </label>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isIncluded && effectivePerPerson > 0 && (
                    <button
                      type="button"
                      onClick={() => togglePaid(leg.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        isPaid
                          ? 'bg-[#47C5B8]/20 border-[#47C5B8]/45 text-[#8AE5DB]'
                          : 'bg-[#171C33] border-[#8596D6]/20 text-[#9BA3C2] hover:text-white'
                      }`}
                    >
                      {isPaid ? '✓ Pago' : 'Pago?'}
                    </button>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveAmountOverride(leg.id);
                          if (e.key === 'Escape') setEditingItemId(null);
                        }}
                        placeholder="R$"
                        className="w-24 bg-[#14192D] border border-[#657EF8] rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => saveAmountOverride(leg.id)}
                        className="p-1.5 rounded-lg hoyo-accent-btn"
                        title="Salvar meu valor"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      {hasOverride && (
                        <button
                          type="button"
                          onClick={() => resetAmountOverride(leg.id)}
                          className="p-1.5 rounded-lg bg-[#212847] text-[#CBD2EC]"
                          title="Voltar ao padrão do grupo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() =>
                          startEditingAmount(leg.id, Number(effectivePerPerson.toFixed(2)))
                        }
                        title="Toque para personalizar sua parte neste trecho (não altera o grupo)"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-lg bg-[#1F2644] text-white border border-transparent hover:border-[#E5B869]/50 transition"
                      >
                        <span>{formatBRL(effectivePerPerson)}</span>
                        <Pencil className="w-3 h-3 opacity-60" />
                      </button>
                      <span className="text-[10px] text-[#9BA3C2] block mt-0.5">
                        {hasOverride
                          ? `Base grupo: ${formatBRL(defaultPerPerson)}`
                          : `${formatBRL(unitFare)}/carro`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {transportBudgetItems.length > 0 && (
          <div className="pt-3 mt-3 border-t border-[#8596D6]/15 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8CA0FF]">
              Outros gastos de Transporte (Base do Grupo)
            </p>
            <div className="space-y-2">{transportBudgetItems.map(renderBudgetItemRow)}</div>
          </div>
        )}
      </div>

      {/* Itens por Categoria (Base Oficial + Sobrescritas Pessoais) */}
      {(['Ingressos', 'Passeios', 'Alimentação', 'Hospedagem'] as BudgetCategory[]).map(
        (category) => {
          const itemsInCat = budgetItems.filter((i) => i.category === category);
          return (
            <div key={category} className="rounded-3xl hoyo-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{category}</h3>
                <span className="text-xs font-bold text-[#CAD4FF]">
                  Subtotal: {formatBRL(financialSummary.byCategory[category].documentedTotal)}
                </span>
              </div>

              {category === 'Hospedagem' && (
                <div
                  className={`rounded-2xl hoyo-card-inner p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !airbnbIncluded ? 'opacity-55' : ''
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={airbnbIncluded}
                      onChange={() =>
                        setPersonalBudget((prev) => ({
                          ...prev,
                          includedOverrides: {
                            ...prev.includedOverrides,
                            'airbnb-base': !airbnbIncluded,
                          },
                        }))
                      }
                      className="mt-1 rounded w-4 h-4 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-white">
                          Airbnb Vila Mariana (04 a 10/12)
                        </p>
                        {airbnbHasOverride && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded hoyo-accent-pill border">
                            Meu valor
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9BA3C2]">
                        {airbnbHasOverride
                          ? 'Valor preenchido só no seu controle pessoal'
                          : config.airbnbTotalCost !== null
                          ? `Total ${formatBRL(config.airbnbTotalCost)} ÷ ${Math.max(
                              1,
                              confirmedFriendsCount
                            )} confirmado(s)`
                          : 'Toque no valor ao lado para colocar sua parte ou aguarde o Admin'}
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {airbnbIncluded && airbnbEffectiveAmount !== null && airbnbEffectiveAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => togglePaid('airbnb-base')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                          airbnbPaid
                            ? 'bg-[#47C5B8]/20 border-[#47C5B8]/45 text-[#8AE5DB]'
                            : 'bg-[#171C33] border-[#8596D6]/20 text-[#9BA3C2] hover:text-white'
                        }`}
                      >
                        {airbnbPaid ? '✓ Pago' : 'Pago?'}
                      </button>
                    )}

                    {editingItemId === 'airbnb-base' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveAmountOverride('airbnb-base');
                            if (e.key === 'Escape') setEditingItemId(null);
                          }}
                          placeholder="R$"
                          className="w-24 bg-[#14192D] border border-[#657EF8] rounded-lg px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => saveAmountOverride('airbnb-base')}
                          className="p-1.5 rounded-lg hoyo-accent-btn"
                          title="Salvar meu valor"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        {airbnbHasOverride && (
                          <button
                            type="button"
                            onClick={() => resetAmountOverride('airbnb-base')}
                            className="p-1.5 rounded-lg bg-[#212847] text-[#CBD2EC]"
                            title="Voltar ao padrão do grupo"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingAmount('airbnb-base', airbnbEffectiveAmount)}
                        title="Toque para definir sua parte (só no seu aparelho)"
                        className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-transparent hover:border-[#E5B869]/50 transition ${
                          airbnbEffectiveAmount !== null
                            ? 'bg-[#47C5B8]/15 text-[#8AE5DB]'
                            : 'bg-[#E5B869]/15 text-[#F6D794]'
                        }`}
                      >
                        <span>
                          {airbnbEffectiveAmount !== null
                            ? formatBRL(airbnbEffectiveAmount)
                            : 'A confirmar'}
                        </span>
                        <Pencil className="w-3 h-3 opacity-65" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">{itemsInCat.map(renderBudgetItemRow)}</div>
            </div>
          );
        }
      )}
    </div>
  );
}
