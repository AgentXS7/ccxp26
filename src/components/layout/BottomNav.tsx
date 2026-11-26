import { Calendar, Compass, DollarSign, Home, Shield } from 'lucide-react';
import type { TabKey } from '../../types';

interface BottomNavProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const MOBILE_ITEMS = [
  { key: 'inicio', label: 'Início', icon: Home },
  { key: 'roteiro', label: 'Roteiro', icon: Calendar },
  { key: 'explorar', label: 'Explorar', icon: Compass },
  { key: 'custos', label: 'Custos', icon: DollarSign },
  { key: 'admin', label: 'Admin', icon: Shield },
] as const;

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação Mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0C0F1D]/95 backdrop-blur-xl border-t border-[#8596D6]/18 px-2 pt-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] shadow-2xl"
    >
      <div className="grid grid-cols-5 gap-1">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1.5 px-1 rounded-xl transition active:scale-95 ${
                isActive
                  ? 'hoyo-accent-pill border'
                  : 'text-[#8F97B8] hover:text-[#EEF1FA] border border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#E5B869]' : 'text-[#8F97B8]'
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 font-bold ${
                  isActive ? 'text-white' : 'text-[#8F97B8]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
