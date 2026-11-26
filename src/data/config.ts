import type { TripConfig } from '../types';
import { readEnvVar } from '../lib/utils';

export const HERO_IMAGES = {
  paulista:
    'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1400&q=80',
  ibirapuera:
    'https://images.unsplash.com/photo-1578002573559-689b0abc4148?auto=format&fit=crop&w=1000&q=80',
  skyline:
    'https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=1000&q=80',
};

export const INITIAL_CONFIG: TripConfig = {
  title: 'São Paulo 2026 — Viagem em Grupo',
  destination: 'São Paulo, SP',
  dateRange: '03 a 10 de Dezembro de 2026',
  baseAddress: 'R. Domingos de Morais, 1164, ap. 405 — Vila Mariana',
  baseTransit: 'Ao lado das estações Vila Mariana e Ana Rosa (Linha 1-Azul do Metrô)',
  arrivalWindowNote:
    'Pouso em GRU às 23h50 do dia 03/12. Check-in oficial do Airbnb liberado em 04/12 às 15h — definir pernoite ou guarda-malas da 1ª noite aqui.',
  airbnbTotalCost: null,
  adminPin: '2026',
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
};
