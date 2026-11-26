// Gera fallback em Data URL caso necessário; no build Vite usamos /icon-192.png e /icon-512.png estáticos
export function generateAppIconDataUrl(): string {
  try {
    if (typeof document === 'undefined') return '';
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#1b2244');
    grad.addColorStop(0.55, '#12172e');
    grad.addColorStop(1, '#0c0f1d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const glow = ctx.createRadialGradient(256, 120, 20, 256, 160, 280);
    glow.addColorStop(0, 'rgba(101, 126, 248, 0.35)');
    glow.addColorStop(1, 'rgba(101, 126, 248, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(229, 184, 105, 0.48)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(22, 22, 468, 468, 96);
    ctx.stroke();

    ctx.fillStyle = 'rgba(229, 184, 105, 0.16)';
    ctx.beginPath();
    ctx.roundRect(156, 78, 200, 44, 22);
    ctx.fill();

    ctx.fillStyle = '#E5B869';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('03–10 DEZ', 256, 101);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 168px system-ui, -apple-system, sans-serif';
    ctx.fillText('SP', 256, 238);

    ctx.fillStyle = '#8CA0FF';
    ctx.font = '800 66px system-ui, -apple-system, sans-serif';
    ctx.fillText('2026', 256, 362);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silencioso em dev ou navegadores sem suporte
    });
  });
}
