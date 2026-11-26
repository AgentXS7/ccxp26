export interface PhotoSuggestion {
  url: string;
  thumbUrl: string;
  label: string;
  source: 'Unsplash' | 'Wikimedia';
}

export const CURATED_UNSPLASH_BY_CATEGORY: Record<string, PhotoSuggestion[]> = {
  Restaurante: [
    {
      url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=320&q=70',
      label: 'Lámen / Japonês',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=320&q=70',
      label: 'Churrasco Coreano',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&q=70',
      label: 'Hambúrguer / Lanche',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=320&q=70',
      label: 'Pizza',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=320&q=70',
      label: 'Restaurante',
      source: 'Unsplash',
    },
  ],
  'Bar e noite': [
    {
      url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=320&q=70',
      label: 'Fliperama / Arcade',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=320&q=70',
      label: 'Drinks / Coquetel',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=320&q=70',
      label: 'Bar Noturno',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=320&q=70',
      label: 'Neon / Rooftop',
      source: 'Unsplash',
    },
  ],
  'Parque e lazer': [
    {
      url: 'https://images.unsplash.com/photo-1578002573559-689b0abc4148?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1578002573559-689b0abc4148?auto=format&fit=crop&w=320&q=70',
      label: 'Parque Ibirapuera',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=320&q=70',
      label: 'Jardim / Natureza',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=320&q=70',
      label: 'Trilha / Verde',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=320&q=70',
      label: 'Roda Gigante',
      source: 'Unsplash',
    },
  ],
  'Museu e cultura': [
    {
      url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=320&q=70',
      label: 'Exposição / Galeria',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?auto=format&fit=crop&w=320&q=70',
      label: 'Museu Histórico',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=320&q=70',
      label: 'Av. Paulista',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=320&q=70',
      label: 'Arte Urbana',
      source: 'Unsplash',
    },
  ],
  Shopping: [
    {
      url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=320&q=70',
      label: 'Shopping / Lojas',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=320&q=70',
      label: 'Compras',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=70',
      label: 'Eletrônicos / Geek',
      source: 'Unsplash',
    },
  ],
  Cinema: [
    {
      url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=320&q=70',
      label: 'Sala de Cinema',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=320&q=70',
      label: 'Cinema / Telona',
      source: 'Unsplash',
    },
  ],
  Passeio: [
    {
      url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=320&q=70',
      label: 'Bairro Oriental',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=320&q=70',
      label: 'Mirante / Cidade',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=320&q=70',
      label: 'Centro de SP',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=320&q=70',
      label: 'Evento / Games',
      source: 'Unsplash',
    },
  ],
  'Doces e café': [
    {
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=320&q=70',
      label: 'Padaria / Café',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=320&q=70',
      label: 'Doces / Sobremesa',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=320&q=70',
      label: 'Sorvete / Gelato',
      source: 'Unsplash',
    },
    {
      url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=320&q=70',
      label: 'Balas & Doces',
      source: 'Unsplash',
    },
  ],
};

export function buildUnsplashSearchUrl(query: string): string {
  const clean = query.trim() || 'sao paulo';
  return `https://unsplash.com/s/photos/${encodeURIComponent(clean)}`;
}

interface WikiImageInfo {
  url?: string;
  thumburl?: string;
  mime?: string;
}

interface WikiPage {
  title?: string;
  imageinfo?: WikiImageInfo[];
}

/**
 * Busca fotos reais da internet via API pública CORS do Wikimedia Commons
 * (não exige chave de API e funciona direto do navegador).
 */
export async function searchInternetPhotos(query: string): Promise<PhotoSuggestion[]> {
  const clean = query.trim();
  if (!clean) return [];

  const endpoint =
    `https://commons.wikimedia.org/w/api.php?action=query` +
    `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(clean)}` +
    `&gsrlimit=12&prop=imageinfo&iiprop=url|mime&iiurlwidth=900&format=json&origin=*`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error('Falha ao buscar fotos online');
  }

  const json = (await res.json()) as {
    query?: { pages?: Record<string, WikiPage> };
  };

  const pages = Object.values(json.query?.pages || {});
  const results: PhotoSuggestion[] = [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = (info.mime || '').toLowerCase();
    if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/webp') {
      continue;
    }
    const imageUrl = info.thumburl || info.url;
    if (!imageUrl) continue;

    const cleanLabel = (page.title || '')
      .replace(/^File:/i, '')
      .replace(/\.[a-z0-9]+$/i, '')
      .slice(0, 32);

    results.push({
      url: imageUrl,
      thumbUrl: imageUrl,
      label: cleanLabel || clean,
      source: 'Wikimedia',
    });

    if (results.length >= 6) break;
  }

  return results;
}
