interface ShareUrlOptions {
  hasSupabase: boolean;
  cleanSbUrl: string;
  cleanSbKey: string;
}

export function buildShareableUrl(_options: ShareUrlOptions): string {
  if (typeof window === 'undefined') return '';
  try {
    const currentHref =
      window.location.href && window.location.href !== 'about:srcdoc'
        ? window.location.href
        : document.referrer || window.location.origin;
    const urlObj = new URL(currentHref);
    urlObj.searchParams.delete('sb');
    urlObj.searchParams.delete('sb_url');
    urlObj.searchParams.delete('sb_key');
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
