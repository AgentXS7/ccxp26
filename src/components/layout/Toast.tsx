import { CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type?: 'success' | 'info' } | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#181e36] border border-[#47C5B8]/45 text-[#EEF1FA] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md"
    >
      {toast.type === 'info' ? (
        <Info className="w-5 h-5 text-[#E5B869] shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-[#47C5B8] shrink-0" />
      )}
      <p className="text-sm font-medium leading-snug">{toast.message}</p>
    </div>
  );
}
