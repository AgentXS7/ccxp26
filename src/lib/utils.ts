import type React from 'react';
import { HERO_IMAGES } from '../data/config';
import { STORAGE_KEYS } from './storage';

export function readEnvVar(key: string): string {
  try {
    const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (viteEnv && typeof viteEnv[key] === 'string' && viteEnv[key].trim()) {
      return viteEnv[key].trim();
    }
    const nodeProc = (globalThis as { process?: { env?: Record<string, string> } }).process;
    if (nodeProc?.env && typeof nodeProc.env[key] === 'string') {
      return nodeProc.env[key].trim();
    }
    const win =
      typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
    const runtimeEnv = win?.__ENV__ as Record<string, string> | undefined;
    if (runtimeEnv && typeof runtimeEnv[key] === 'string') {
      return runtimeEnv[key].trim();
    }
  } catch {
    // Ignora
  }
  return '';
}

export function decodeBase64Safe(str: string): string {
  try {
    return atob(str);
  } catch {
    return '';
  }
}

export function encodeBase64Safe(str: string): string {
  try {
    return btoa(str);
  } catch {
    return '';
  }
}

export function copyTextFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const target = e.currentTarget;
  if (target.src !== HERO_IMAGES.paulista) {
    target.src = HERO_IMAGES.paulista;
  }
}

export function getOrCreateDeviceToken(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
    if (existing) return existing;
    const created =
      'dev_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, created);
    return created;
  } catch {
    return 'dev_session_' + Math.random().toString(36).slice(2);
  }
}

export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
}

const BADGE_SEPARATOR = '::badge=';

export function packDeviceTokenWithBadge(token: string, badge?: string): string {
  const cleanToken = token.split(BADGE_SEPARATOR)[0] || token;
  if (!badge) return cleanToken;
  return `${cleanToken}${BADGE_SEPARATOR}${badge}`;
}

export function unpackDeviceToken(raw?: string): {
  deviceToken: string;
  avatarBadge?: string;
} {
  if (!raw) return { deviceToken: '' };
  const idx = raw.indexOf(BADGE_SEPARATOR);
  if (idx === -1) return { deviceToken: raw };
  const deviceToken = raw.slice(0, idx);
  const avatarBadge = raw.slice(idx + BADGE_SEPARATOR.length).trim();
  return {
    deviceToken,
    avatarBadge: avatarBadge || undefined,
  };
}

/**
 * Redimensiona e recorta (quadrado central) uma foto de perfil para Data URL leve (~4–8 KB),
 * ideal para salvar no localStorage e exibir no app sem pesar.
 */
export function compressAvatarImage(file: File, size = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const minSide = Math.min(img.width, img.height);
        const sx = Math.max(0, (img.width - minSide) / 2);
        const sy = Math.max(0, (img.height - minSide) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponível.'));
          return;
        }
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Retorna a data atual no fuso horário de São Paulo no formato YYYY-MM-DD.
 */
export function getSaoPauloTodayIso(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
