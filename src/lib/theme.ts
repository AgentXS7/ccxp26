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
    label: 'Expresso Astral',
    subtitle: 'Star Rail • Índigo Estelar',
    swatch: '#657EF8',
    badgeText: 'Padrão',
  },
  {
    id: 'geo',
    label: 'Cajado da Elfa',
    subtitle: 'Frieren • Dourado Arcano',
    swatch: '#DFA94A',
    badgeText: 'Arcano',
  },
  {
    id: 'anemo',
    label: 'Brisa de Hyrule',
    subtitle: 'Zelda • Turquesa Sheikah',
    swatch: '#3DC6B5',
    badgeText: 'Sheikah',
  },
  {
    id: 'pyro',
    label: 'Phantom Thieves',
    subtitle: 'Persona • Carmesim Rebelde',
    swatch: '#EC6B6B',
    badgeText: 'Persona',
  },
  {
    id: 'electro',
    label: 'Neo Tokyo Arcade',
    subtitle: 'Cyber • Violeta Neon',
    swatch: '#A77BFF',
    badgeText: 'Arcade',
  },
  {
    id: 'sakura',
    label: 'Pétala de Shibuya',
    subtitle: 'Lo-Fi • Rosa Sakura',
    swatch: '#F082B2',
    badgeText: 'Sakura',
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
