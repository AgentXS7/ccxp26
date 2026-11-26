import { encodeBase64Safe, readEnvVar } from './utils';

interface ShareUrlOptions {
  hasSupabase: boolean;
  cleanSbUrl: string;
  cleanSbKey: string;
}

export function buildShareableUrl({
  hasSupabase,
  cleanSbUrl,
  cleanSbKey,
}: ShareUrlOptions): string {
  if (typeof window === 'undefined') return '';
  try {
    const currentHref =
      window.location.href && window.location.href !== 'about:srcdoc'
        ? window.location.href
        : document.referrer || window.location.origin;
    const urlObj = new URL(currentHref);
    const envUrl = readEnvVar('VITE_SUPABASE_URL') || readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    if (hasSupabase && !envUrl) {
      const packed = encodeBase64Safe(JSON.stringify({ u: cleanSbUrl, k: cleanSbKey }));
      if (packed) {
        urlObj.searchParams.set('sb', packed);
        urlObj.searchParams.delete('sb_url');
        urlObj.searchParams.delete('sb_key');
      }
    }
    return urlObj.toString();
  } catch {
    return window.location.href || '';
  }
}

export function isLocalOrPreviewUrl(url: string): boolean {
  return (
    !url.startsWith('http') ||
    url.includes('googleusercontent.com') ||
    url.includes('webcontainer') ||
    url.includes('localhost') ||
    url.includes('127.0.0.1')
  );
}
