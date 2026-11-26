import { Copy, Link2, Share2, X } from 'lucide-react';
import { copyTextFallback } from '../../lib/utils';
import { HoyoDialog } from '../ui/HoyoDialog';

interface ShareModalProps {
  open: boolean;
  url: string;
  inviteText: string;
  isPreviewUrl: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export function ShareModal({
  open,
  url,
  inviteText,
  isPreviewUrl,
  onClose,
  showToast,
}: ShareModalProps) {
  return (
    <HoyoDialog open={open} onClose={onClose} ariaLabelledBy="shareDialogTitle">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3
            id="shareDialogTitle"
            className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2"
          >
            <Link2 className="w-5 h-5 text-[#E5B869]" />
            Link do Grupo SP 2026
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1.5 rounded-xl bg-[#212847]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isPreviewUrl && (
          <div className="rounded-2xl bg-[#E5B869]/10 border border-[#E5B869]/35 p-3.5 text-xs text-[#FCE6B4] space-y-1">
            <p className="font-bold text-white">
              Atenção: Você está rodando em ambiente local/preview
            </p>
            <p className="leading-relaxed">
              Links locais (<span className="font-mono">localhost</span>) só abrem neste aparelho.
              Após publicar na Vercel (grátis), gere o link público definitivo (ex.:{' '}
              <span className="font-mono text-white">sp-2026.vercel.app</span>) para mandar ao grupo.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#CBD2EC]">
            Link direto (toque na caixa para selecionar tudo):
          </label>
          <input
            type="text"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            className="w-full hoyo-card-inner rounded-xl px-3.5 py-2.5 text-xs text-[#A3B4FF] font-mono select-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              copyTextFallback(url);
              navigator.clipboard?.writeText(url).catch(() => {});
              showToast('Link copiado!');
            }}
            className="flex-1 hoyo-accent-btn font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Copy className="w-4 h-4" /> Copiar Só o Link
          </button>

          <button
            type="button"
            onClick={() => {
              copyTextFallback(inviteText);
              navigator.clipboard?.writeText(inviteText).catch(() => {});
              const waUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
              window.open(waUrl, '_blank', 'noopener,noreferrer');
            }}
            className="flex-1 bg-[#2A9D8F] hover:bg-[#31B2A2] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" /> Abrir WhatsApp
          </button>
        </div>
      </div>
    </HoyoDialog>
  );
}
