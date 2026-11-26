import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { HoyoDialog } from './HoyoDialog';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const finish = useCallback((result: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setRequest(null);
    resolver?.(result);
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setRequest(options);
    });
  }, []);

  const isDanger = (request?.tone ?? 'danger') === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <HoyoDialog
        open={Boolean(request)}
        onClose={() => finish(false)}
        ariaLabelledBy="hoyoConfirmTitle"
        maxWidthClass="sm:max-w-sm"
      >
        {request && (
          <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    isDanger
                      ? 'bg-[#EC6B6B]/18 border-[#EC6B6B]/40 text-[#FFB4B4]'
                      : 'bg-[#E5B869]/18 border-[#E5B869]/40 text-[#F6D794]'
                  }`}
                >
                  {isDanger ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <HelpCircle className="w-4 h-4" />
                  )}
                </div>
                <h3
                  id="hoyoConfirmTitle"
                  className="text-base font-extrabold text-white leading-snug"
                >
                  {request.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => finish(false)}
                aria-label="Fechar"
                className="text-[#9BA3C2] hover:text-white p-1.5 rounded-xl bg-[#212847] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#CBD2EC] leading-relaxed">
              {request.message}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => finish(false)}
                className="bg-[#212847] hover:bg-[#2B3359] border border-[#8596D6]/25 text-[#CBD2EC] hover:text-white font-bold text-xs py-3 px-4 rounded-xl transition"
              >
                {request.cancelLabel || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={`font-extrabold text-xs py-3 px-4 rounded-xl transition ${
                  isDanger
                    ? 'bg-[#EC6B6B] hover:bg-[#f27c7c] text-white shadow-lg'
                    : 'hoyo-accent-btn shadow-lg'
                }`}
              >
                {request.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </HoyoDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return ctx;
}
