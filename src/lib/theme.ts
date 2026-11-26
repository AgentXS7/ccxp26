import type { ThemePresetId } from '../types';

export interface ThemePresetMeta {
  id: ThemePresetId;
  label: string;
  subtitle: string;
  swatch: string;
  badgeText: string;
}

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: 'hoyolab',
    label: 'Astral Indigo',
    subtitle: 'Clássico HoYoLAB',
    swatch: '#657EF8',
    badgeText: 'Padrão',
  },
  {
    id: 'geo',
    label: 'Ouro Paulista',
    subtitle: 'Dourado Expedição',
    swatch: '#DFA94A',
    badgeText: 'Geo',
  },
  {
    id: 'anemo',
    label: 'Brisa Ibirapuera',
    subtitle: 'Turquesa Waypoint',
    swatch: '#3DC6B5',
    badgeText: 'Anemo',
  },
  {
    id: 'pyro',
    label: 'Neon Liberdade',
    subtitle: 'Carmesim Noturno',
    swatch: '#EC6B6B',
    badgeText: 'Pyro',
  },
];

export const AVATAR_BADGES = [
  '🎮',
  '👾',
  '⚔️',
  '🪄',
  '🦊',
  '🐉',
  '🎌',
  '🍡',
  '🍜',
  '🧋',
  '🧭',
  '⭐',
  '⚡',
  '🎧',
  '🎬',
  '🎡',
];
