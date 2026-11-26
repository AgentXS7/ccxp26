import type React from 'react';
import { Car } from 'lucide-react';
import { formatBRL } from '../../lib/utils';
import type {
  BudgetCategory,
  BudgetItem,
  TransportLeg,
  TripConfig,
} from '../../types';

interface CostsTabProps {
  config: TripConfig;
  confirmedFriendsCount: number;
  peoplePerCar: number;
  setPeoplePerCar: (n: number) => void;
  useSurgePricing: boolean;
  setUseSurgePricing: React.Dispatch<React.SetStateAction<boolean>>;
  financialSummary: {
    byCategory: Record<BudgetCategory, { documentedTotal: number; pendingCount: number }>;
    grandTotal: number;
    totalPendingItems: number;
  };
  transportLegs: TransportLeg[];
  setTransportLegs: React.Dispatch<React.SetStateAction<TransportLeg[]>>;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}

export function CostsTab({
  config,
  confirmedFriendsCount,
  peoplePerCar,
  setPeoplePerCar,
  useSurgePricing,
  setUseSurgePricing,
  financialSummary,
  transportLegs,
  setTransportLegs,
  budgetItems,
  setBudgetItems,
}: CostsTabProps) {
  return (
    <div className="space-y-5">
      {/* Painel Principal do Simulador */}
      <div className="rounded-3xl hoyo-card hoyo-gold-hairline p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5B869]">
              Simulador de Orçamento Individual
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatBRL(financialSummary.grandTotal)}
              </h2>
              <span className="text-xs text-[#9BA3C2]">por pessoa (itens confirmados)</span>
            </div>
          </div>

          {/* Controles de Rateio */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hoyo-card-inner rounded-2xl p-1.5 flex items-center gap-1">
              <span className="text-[11px] text-[#9BA3C2] px-2 font-semibold">
                Uber ÷
              </span>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPeoplePerCar(num)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold transition ${
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
              className={`text-xs font-bold px-3.5 py-2.5 rounded-2xl border transition ${
                useSurgePricing
                  ? 'bg-[#E5B869]/18 border-[#E5B869]/45 text-[#F6D794]'
                  : 'hoyo-card-inner text-[#CBD2EC]'
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
              <div key={cat} className="rounded-2xl hoyo-card-inner p-3 space-y-1">
                <span className="text-[11px] font-semibold text-[#9BA3C2] block">
                  {cat}
                </span>
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
        </div>
      </div>

      {/* Deslocamentos Uber & Metrô */}
      <div className="rounded-3xl hoyo-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-[#E5B869]" />
            Deslocamentos Estimados (Uber ÷ {peoplePerCar} pessoas)
          </h3>
          <span className="text-xs font-bold text-[#8AE5DB] shrink-0">
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
                className="flex items-start justify-between gap-3 rounded-2xl hoyo-card-inner p-3.5 cursor-pointer hover:border-[#E5B869]/35 transition"
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
                    className="mt-1 rounded w-4 h-4 shrink-0"
                  />
                  <span className="space-y-0.5 block">
                    <span className="text-[11px] font-bold text-[#8CA0FF] block">
                      {leg.dayLabel} • {leg.tripsCount} trecho(s)
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
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-white block">
                    {formatBRL(perPerson)}
                  </span>
                  <span className="text-[10px] text-[#9BA3C2]">
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
            <div key={category} className="rounded-3xl hoyo-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{category}</h3>
                <span className="text-xs font-bold text-[#CAD4FF]">
                  Subtotal: {formatBRL(financialSummary.byCategory[category].documentedTotal)}
                </span>
              </div>

              {category === 'Hospedagem' && (
                <div className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      Airbnb Vila Mariana (04 a 10/12 — Rateio entre confirmados)
                    </p>
                    <p className="text-[11px] text-[#9BA3C2]">
                      {config.airbnbTotalCost !== null
                        ? `Total ${formatBRL(config.airbnbTotalCost)} ÷ ${Math.max(
                            1,
                            confirmedFriendsCount
                          )} confirmado(s)`
                        : 'Valor total a ser preenchido pelo organizador na aba Admin'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                      config.airbnbTotalCost !== null
                        ? 'bg-[#47C5B8]/15 text-[#8AE5DB]'
                        : 'bg-[#E5B869]/15 text-[#F6D794]'
                    }`}
                  >
                    {config.airbnbTotalCost !== null
                      ? formatBRL(
                          config.airbnbTotalCost / Math.max(1, confirmedFriendsCount)
                        )
                      : 'A confirmar'}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {itemsInCat.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-2xl hoyo-card-inner p-3.5 cursor-pointer hover:border-[#E5B869]/35 transition"
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
                        className="mt-1 rounded w-4 h-4 shrink-0"
                      />
                      <span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {item.name}
                          </span>
                          {item.isOptional && (
                            <span className="text-[10px] font-bold bg-[#212847] text-[#CBD2EC] px-2 py-0.5 rounded">
                              Opcional
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-[#9BA3C2] mt-0.5 block">
                          {item.subtitle}
                        </span>
                      </span>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                        item.amountPerPerson === null
                          ? 'bg-[#E5B869]/15 text-[#F6D794]'
                          : item.amountPerPerson === 0
                          ? 'bg-[#47C5B8]/15 text-[#8AE5DB]'
                          : 'bg-[#1F2644] text-white'
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
  );
}
