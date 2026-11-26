import { Download, X } from 'lucide-react';
import type { BeforeInstallPromptEvent } from '../../types';
import { HoyoDialog } from '../ui/HoyoDialog';

interface InstallModalProps {
  open: boolean;
  appIconUrl: string;
  deferredInstallPrompt: BeforeInstallPromptEvent | null;
  onTriggerPrompt: () => void;
  onClose: () => void;
}

export function InstallModal({
  open,
  appIconUrl,
  deferredInstallPrompt,
  onTriggerPrompt,
  onClose,
}: InstallModalProps) {
  return (
    <HoyoDialog
      open={open}
      onClose={onClose}
      ariaLabelledBy="installDialogTitle"
      maxWidthClass="sm:max-w-md"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {appIconUrl ? (
              <img
                src={appIconUrl}
                alt="Ícone SP 2026"
                className="w-14 h-14 rounded-2xl border border-[#E5B869]/40 shadow-xl shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl hoyo-accent-btn flex items-center justify-center text-white font-black text-base shrink-0">
                SP 26
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#47C5B8]">
                Web App (PWA)
              </span>
              <h3
                id="installDialogTitle"
                className="text-lg font-extrabold text-white leading-tight"
              >
                SP 2026 na Tela Inicial
              </h3>
              <p className="text-xs text-[#9BA3C2]">
                Abre em tela cheia, sem barra de endereço!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1.5 rounded-xl bg-[#212847]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {deferredInstallPrompt && (
          <button
            type="button"
            onClick={onTriggerPrompt}
            className="w-full bg-[#2A9D8F] hover:bg-[#31B2A2] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Instalar Aplicativo Agora
          </button>
        )}

        <div className="space-y-3 text-xs">
          <div className="rounded-2xl hoyo-card-inner p-4 space-y-2">
            <p className="font-extrabold text-white flex items-center gap-2">
              <span>🍎</span> iPhone (Safari)
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#CBD2EC] leading-relaxed">
              <li>
                Abra este link no <strong className="text-white">Safari</strong> (se abriu dentro do WhatsApp, toque no ícone do Safari no canto inferior direito).
              </li>
              <li>
                Toque no botão <strong className="text-[#8CA0FF]">Compartilhar</strong> (quadrado com seta para cima na barra inferior).
              </li>
              <li>
                Role para baixo e toque em{' '}
                <strong className="text-[#8AE5DB]">“Adicionar à Tela de Início”</strong> →{' '}
                <strong className="text-white">Adicionar</strong>.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl hoyo-card-inner p-4 space-y-2">
            <p className="font-extrabold text-white flex items-center gap-2">
              <span>🤖</span> Android (Chrome / Samsung Internet)
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#CBD2EC] leading-relaxed">
              <li>
                Toque nos <strong className="text-white">3 pontinhos (⋮)</strong> no canto superior direito do navegador.
              </li>
              <li>
                Selecione <strong className="text-[#8AE5DB]">“Instalar aplicativo”</strong> ou{' '}
                <strong className="text-[#8AE5DB]">“Adicionar à tela inicial”</strong>.
              </li>
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#212847] hover:bg-[#2B3359] text-[#EEF1FA] font-bold text-xs py-3 rounded-xl transition"
        >
          Entendi
        </button>
      </div>
    </HoyoDialog>
  );
}
