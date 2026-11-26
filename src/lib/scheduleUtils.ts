import type { ItineraryStop, ShiftType } from '../types';

export interface ParsedTimeRange {
  startMin: number;
  endMin: number;
  sortMinutes: number;
  hasExplicitTime: boolean;
}

export interface TimeInputValidation {
  valid: boolean;
  normalizedLabel: string;
  hasExplicitTime: boolean;
  error?: string;
}

const SHIFT_ORDER: Record<ShiftType, number> = {
  'Manhã e Almoço': 0,
  Tarde: 1,
  'Noite e Madrugada': 2,
};

const SHIFT_FALLBACK_RANGE: Record<ShiftType, { start: number; end: number }> = {
  'Manhã e Almoço': { start: 9 * 60, end: 12 * 60 },
  Tarde: { start: 14 * 60, end: 17 * 60 },
  'Noite e Madrugada': { start: 19 * 60, end: 22 * 60 },
};

const RANGE_SPLIT_REGEX = /(?:\s*(?:–|—|-)\s*|\s+(?:a|as|às|ate|até)\s+)/i;

function parseSingleTimeToken(segment: string): number | null {
  const s = segment.trim();
  if (!s) return null;

  let hour = -1;
  let minute = 0;

  const explicit = /^(\d{1,2})\s*(?:h\s*(\d{2})?|:\s*(\d{2}))$/i.exec(s);
  if (explicit) {
    hour = Number(explicit[1]);
    minute = Number(explicit[2] ?? explicit[3] ?? '0');
  } else if (/^(\d{1,2})$/.test(s)) {
    hour = Number(s);
    minute = 0;
  } else {
    const compact = /^(\d{2})(\d{2})$/.exec(s);
    const spaced = /^(\d{1,2})\s+(\d{2})$/.exec(s);
    if (compact) {
      hour = Number(compact[1]);
      minute = Number(compact[2]);
    } else if (spaced) {
      hour = Number(spaced[1]);
      minute = Number(spaced[2]);
    } else {
      return null;
    }
  }

  if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
    return hour * 60 + minute;
  }
  return null;
}

function extractTimeMatches(text: string): number[] {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];

  const segments = trimmed
    .split(RANGE_SPLIT_REGEX)
    .map((seg) => seg.trim())
    .filter((seg) => seg.length > 0);

  if (segments.length === 1 || segments.length === 2) {
    const parsedSegments = segments.map((seg) => parseSingleTimeToken(seg));
    if (parsedSegments.every((v): v is number => v !== null)) {
      return parsedSegments;
    }
    if (
      segments.length === 2 &&
      parsedSegments[0] !== null &&
      /^madrugada$/i.test(segments[1])
    ) {
      return [parsedSegments[0]];
    }
  }

  const matches: number[] = [];
  const regex = /\b(\d{1,2})\s*(?:h\s*(\d{2})?|:\s*(\d{2}))/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(trimmed)) !== null) {
    const hour = Number(m[1]);
    const minute = Number(m[2] ?? m[3] ?? '0');
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      matches.push(hour * 60 + minute);
    }
  }
  return matches;
}

export function formatMinutesAsTime(totalMin: number): string {
  const wrapped = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60)
    .toString()
    .padStart(2, '0');
  const m = (wrapped % 60).toString().padStart(2, '0');
  return `${h}h${m}`;
}

export function validateAndNormalizeTimeInput(raw: string): TimeInputValidation {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return {
      valid: true,
      normalizedLabel: 'Horário flexível',
      hasExplicitTime: false,
    };
  }

  if (!/\d/.test(trimmed) && /madrugada|livre|flex[ií]vel|opcional/i.test(trimmed)) {
    return {
      valid: true,
      normalizedLabel: trimmed,
      hasExplicitTime: false,
    };
  }

  const segments = trimmed.split(RANGE_SPLIT_REGEX);
  if (
    (segments.length === 1 || segments.length === 2) &&
    segments.every((seg) => seg.trim().length > 0)
  ) {
    const parsed = segments.map((seg) => parseSingleTimeToken(seg));
    if (parsed.every((v): v is number => v !== null)) {
      const normalizedLabel =
        parsed.length === 1
          ? formatMinutesAsTime(parsed[0])
          : `${formatMinutesAsTime(parsed[0])} – ${formatMinutesAsTime(parsed[1])}`;
      return {
        valid: true,
        normalizedLabel,
        hasExplicitTime: true,
      };
    }

    if (
      segments.length === 2 &&
      parsed[0] !== null &&
      /^madrugada$/i.test(segments[1].trim())
    ) {
      return {
        valid: true,
        normalizedLabel: `${formatMinutesAsTime(parsed[0])} – Madrugada`,
        hasExplicitTime: true,
      };
    }
  }

  return {
    valid: false,
    normalizedLabel: trimmed,
    hasExplicitTime: false,
    error: 'Horário inválido. Use ex: 13, 13h30, 15:00 ou 13h–15h.',
  };
}

export function parseStopTimeRange(
  timeLabel: string,
  shift: ShiftType
): ParsedTimeRange {
  const normalized = (timeLabel || '').trim();
  const lower = normalized.toLowerCase();
  const times = extractTimeMatches(normalized);

  if (times.length > 0) {
    let startMin = times[0];
    if (shift === 'Noite e Madrugada' && startMin < 6 * 60) {
      startMin += 24 * 60;
    }

    let endMin: number;
    if (times.length >= 2) {
      endMin = times[1];
      if (shift === 'Noite e Madrugada' && endMin < 6 * 60) {
        endMin += 24 * 60;
      }
      if (endMin <= startMin) {
        endMin += 24 * 60;
      }
    } else {
      endMin = startMin + 90;
    }

    return {
      startMin,
      endMin,
      sortMinutes: startMin,
      hasExplicitTime: true,
    };
  }

  const fallback = SHIFT_FALLBACK_RANGE[shift];
  const isMadrugada = lower.includes('madrugada');
  const isPosJantar = /p[oó]s[\s-]*jantar/.test(lower);
  const startMin = isMadrugada
    ? 24 * 60
    : isPosJantar
    ? 22 * 60 + 30
    : fallback.start;
  const endMin = isMadrugada ? 26 * 60 : isPosJantar ? 24 * 60 : fallback.end;

  return {
    startMin,
    endMin,
    sortMinutes: startMin,
    hasExplicitTime: false,
  };
}

export function inferShiftFromTimeLabel(timeLabel: string): ShiftType | null {
  const normalized = (timeLabel || '').trim();
  if (!normalized) return null;
  if (normalized.toLowerCase().includes('madrugada')) {
    return 'Noite e Madrugada';
  }
  const times = extractTimeMatches(normalized);
  if (times.length === 0) return null;
  const firstMin = times[0];
  if (firstMin < 5 * 60 || firstMin >= 18 * 60) {
    return 'Noite e Madrugada';
  }
  if (firstMin < 12 * 60 + 30) {
    return 'Manhã e Almoço';
  }
  return 'Tarde';
}

export function compareStopsChronologically(
  a: ItineraryStop,
  b: ItineraryStop
): number {
  const rangeA = parseStopTimeRange(a.timeLabel, a.shift);
  const rangeB = parseStopTimeRange(b.timeLabel, b.shift);
  if (rangeA.sortMinutes !== rangeB.sortMinutes) {
    return rangeA.sortMinutes - rangeB.sortMinutes;
  }
  const shiftDiff = SHIFT_ORDER[a.shift] - SHIFT_ORDER[b.shift];
  if (shiftDiff !== 0) return shiftDiff;
  return a.title.localeCompare(b.title, 'pt-BR');
}

export function findTimeConflicts(
  candidateTimeLabel: string,
  candidateShift: ShiftType,
  dayStops: ItineraryStop[]
): ItineraryStop[] {
  const candidate = parseStopTimeRange(candidateTimeLabel, candidateShift);
  if (!candidate.hasExplicitTime) return [];

  return dayStops.filter((stop) => {
    const existing = parseStopTimeRange(stop.timeLabel, stop.shift);
    if (!existing.hasExplicitTime) return false;
    return candidate.startMin < existing.endMin && existing.startMin < candidate.endMin;
  });
}

function normalizePlaceName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const GENERIC_LOCATION_WORDS = new Set([
  'parque',
  'museu',
  'shopping',
  'bar',
  'restaurante',
  'cafe',
  'padaria',
  'centro',
  'liberdade',
  'paulista',
  'av paulista',
  'ipiranga',
  'moema',
  'pinheiros',
  'tatuape',
  'vila mariana',
  'itaim bibi',
  'bom retiro',
  'santo amaro',
  'barra funda',
  'jardins',
  'bela vista',
  'agua funda',
  'vila olimpia',
]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWholePhrase(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  return new RegExp(`(?:^|\\s)${escapeRegex(needle)}(?:$|\\s)`).test(haystack);
}

function buildAttractionNeedles(attractionName: string): string[] {
  const candidates = new Set<string>();
  const base = normalizePlaceName(attractionName);
  const beforeDash = normalizePlaceName(
    attractionName.split(/\s*(?:—|–| - |:)\s*/)[0] || ''
  );

  for (const rawCandidate of [base, beforeDash]) {
    if (!rawCandidate) continue;
    candidates.add(rawCandidate);
    const withoutCity = rawCandidate
      .replace(/\s+(?:de\s+sao\s+paulo|sao\s+paulo|de\s+sp|sp)$/, '')
      .trim();
    if (withoutCity) candidates.add(withoutCity);
  }

  if (beforeDash) {
    const withoutVenueSuffix = beforeDash
      .replace(/\s+(?:restaurante|pizzaria|hamburgueria|lanchonete|padaria|burguer|bar)$/, '')
      .trim();
    if (
      withoutVenueSuffix.length >= 5 &&
      !GENERIC_LOCATION_WORDS.has(withoutVenueSuffix)
    ) {
      candidates.add(withoutVenueSuffix);
    }
  }

  return Array.from(candidates).filter(
    (needle) => needle.length >= 4 && !GENERIC_LOCATION_WORDS.has(needle)
  );
}

export function findSameAttractionStops(
  attractionId: string,
  attractionName: string,
  allStops: ItineraryStop[]
): ItineraryStop[] {
  const needles = buildAttractionNeedles(attractionName);

  return allStops.filter((stop) => {
    if (attractionId && stop.attractionId === attractionId) return true;
    const normTitleSub = normalizePlaceName(`${stop.title} ${stop.subtitle}`);
    if (needles.some((needle) => containsWholePhrase(normTitleSub, needle))) {
      return true;
    }

    const normDetails = normalizePlaceName(stop.details);
    return needles.some(
      (needle) => needle.length >= 10 && containsWholePhrase(normDetails, needle)
    );
  });
}
