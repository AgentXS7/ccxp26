import { useEffect, useState } from 'react';
import { generateAppIconDataUrl } from '../lib/pwa';
import type { BeforeInstallPromptEvent } from '../types';

export function usePwa(showToast: (msg: string, type?: 'success' | 'info') => void) {
  const [appIconUrl, setAppIconUrl] = useState<string>('');
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneMatch =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    setIsStandaloneApp(standaloneMatch);

    setAppIconUrl(generateAppIconDataUrl() || '/icon-192.png');

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsStandaloneApp(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallAppClick = async () => {
    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredInstallPrompt(null);
          showToast('App SP 2026 adicionado à sua tela inicial!');
          return;
        }
      } catch {
        // Fallback para o modal explicativo iOS/Android
      }
    }
    setInstallModalOpen(true);
  };

  const triggerDeferredPrompt = async () => {
    if (!deferredInstallPrompt) return;
    try {
      await deferredInstallPrompt.prompt();
      const res = await deferredInstallPrompt.userChoice;
      if (res.outcome === 'accepted') {
        setDeferredInstallPrompt(null);
        setInstallModalOpen(false);
        showToast('Ícone SP 2026 instalado na tela inicial!');
      }
    } catch {
      // Ignora
    }
  };

  return {
    appIconUrl,
    deferredInstallPrompt,
    installModalOpen,
    setInstallModalOpen,
    isStandaloneApp,
    handleInstallAppClick,
    triggerDeferredPrompt,
  };
}
