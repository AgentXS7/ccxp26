import { readEnvVar } from './utils';

export function readInitialSupabaseConfig(): { url: string; key: string } {
  const url = readEnvVar('VITE_SUPABASE_URL') || readEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnvVar('VITE_SUPABASE_ANON_KEY') || readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return { url: url.trim(), key: key.trim() };
}

export async function sbFetch(
  cleanSbUrl: string,
  cleanSbKey: string,
  path: string,
  options: RequestInit = {}
) {
  if (!cleanSbUrl || !cleanSbKey) return null;
  if (!cleanSbUrl.startsWith('http')) {
    throw new Error('URL inválida (precisa começar com https://)');
  }
  const headers: Record<string, string> = {
    apikey: cleanSbKey,
    Authorization: `Bearer ${cleanSbKey}`,
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${cleanSbUrl}/rest/v1/${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail = `Erro HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      if (errBody?.message) detail = errBody.message;
    } catch {
      // Ignora erro ao parsear corpo de erro
    }
    throw new Error(detail);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const SUPABASE_SCHEMA_SQL = `-- Execute este script no SQL Editor do Supabase (Plano Gratuito)
-- Ele sincroniza votos (👍/👎), curtidas (❤️), novos lugares e checklist entre todos do grupo:

create table if not exists public.stop_votes (
  id text primary key,
  stop_id text not null,
  voter_name text not null,
  choice text not null check (choice in ('yes', 'no')),
  device_token text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.place_likes (
  id text primary key,
  attraction_id text not null,
  voter_name text not null,
  device_token text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.custom_places (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_shared_state (
  id text primary key,
  airbnb_total_cost numeric,
  arrival_window_note text,
  checklist jsonb not null default '[]'::jsonb,
  budget_items jsonb not null default '[]'::jsonb,
  custom_stops jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stop_votes enable row level security;
alter table public.place_likes enable row level security;
alter table public.custom_places enable row level security;
alter table public.trip_shared_state enable row level security;

drop policy if exists "group_all_stop_votes" on public.stop_votes;
create policy "group_all_stop_votes" on public.stop_votes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_place_likes" on public.place_likes;
create policy "group_all_place_likes" on public.place_likes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_custom_places" on public.custom_places;
create policy "group_all_custom_places" on public.custom_places
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "group_all_trip_shared_state" on public.trip_shared_state;
create policy "group_all_trip_shared_state" on public.trip_shared_state
  for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on table public.stop_votes, public.place_likes, public.custom_places, public.trip_shared_state to anon, authenticated;
`;
