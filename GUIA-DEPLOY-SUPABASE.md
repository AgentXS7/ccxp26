# Guia Completo: Supabase + Deploy Grátis (0800) + PWA (Android & iPhone)

Este guia mostra passo a passo como colocar o app **SP 2026** no ar de graça, conectado em tempo real para todos os amigos votarem, curtirem lugares e acompanharem os custos juntos.

---

## Parte 1 — Configurar o Banco de Dados Gratuito no Supabase (3 minutos)

1. Acesse [https://supabase.com](https://supabase.com) e faça login (pode usar sua conta do GitHub).
2. Clique em **New Project**:
   - **Name:** `sp-2026-viagem`
   - **Database Password:** crie qualquer senha e guarde (não precisa decorar para o app).
   - **Region:** escolha **South America (São Paulo)** (`sa-east-1`) para ficar super rápido no Brasil!
   - Clique em **Create new project** e aguarde ~1 minuto até ficar pronto.
3. No menu lateral esquerdo, clique em **SQL Editor** → **+ New query**.
4. Cole todo o SQL abaixo e clique em **Run** (ou `Ctrl + Enter`):

```sql
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
```

5. Agora pegue as duas chaves de acesso:
   - No menu lateral esquerdo, vá em **Project Settings** (ícone de engrenagem) → **API** (ou **Data API** / **API Keys**).
   - Copie:
     1. **Project URL** (algo como `https://abcdefghijkl.supabase.co`)
     2. **anon public key** (chave longa que começa com `eyJ...` ou `sb_publishable_...`)

---

## Parte 2 — Subir em Hospedagem 0800 (Vercel — Recomendado)

> A Vercel é gratuita para projetos pessoais, gera link HTTPS automático (obrigatório para PWA funcionar no iPhone e Android!) e atualiza sozinha quando você alterar algo.

### Passo A: Subir para o GitHub
1. Crie um repositório novo no [https://github.com/new](https://github.com/new) (ex: `sp-2026-viagem`).
2. Na pasta `c:\ccxp26`, rode no terminal:
   ```bash
   git init
   git add .
   git commit -m "App SP 2026 reorganizado com tema HoYoLAB"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/sp-2026-viagem.git
   git push -u origin main
   ```

### Passo B: Publicar na Vercel
1. Acesse [https://vercel.com](https://vercel.com) e entre com sua conta do GitHub.
2. Clique em **Add New... → Project** e selecione o repositório `sp-2026-viagem`.
3. O framework **Vite** será detectado automaticamente (`npm run build` e pasta `dist`).
4. **ANTES de clicar em Deploy**, abra a seção **Environment Variables** e adicione as duas chaves do Supabase:
   - `VITE_SUPABASE_URL` = *(cole sua Project URL do Supabase)*
   - `VITE_SUPABASE_ANON_KEY` = *(cole sua anon public key do Supabase)*
5. Clique em **Deploy**.

Pronto! Em ~40 segundos você ganha um link público HTTPS tipo `https://sp-2026-viagem.vercel.app`.
Como as variáveis `VITE_SUPABASE_*` foram colocadas na Vercel, **todo amigo que abrir o link já entra conectado ao banco do grupo automaticamente**, sem precisar digitar chave nenhuma!

*(Alternativa alternativa 0800 sem GitHub: instale a CLI da Vercel com `npx vercel --prod` direto da pasta `c:\ccxp26`, e depois configure as 2 variáveis ou conecte direto pela aba Admin → Config & Nuvem dentro do próprio app usando o PIN `2026` e compartilhe pelo botão **WhatsApp**).*

---

## Parte 3 — Instalar como App no Celular (PWA)

### No iPhone (iOS)
1. Abra o link publicado no **Safari** (se alguém mandou no WhatsApp, toque no ícone de bússola/Safari no canto para sair do navegador interno do WhatsApp).
2. Toque no ícone de **Compartilhar** (quadrado com seta pra cima na barra de baixo).
3. Toque em **Adicionar à Tela de Início** → **Adicionar**.
4. O ícone **SP 2026** aparecerá na tela inicial e abrirá em tela cheia, sem barra do navegador e com cache offline!

### No Android (Chrome / Edge / Samsung Internet)
1. Abra o link publicado no Chrome.
2. Toque no botão **Instalar** no banner do app (ou no menu **⋮ → Instalar aplicativo / Adicionar à tela inicial**).
3. Confirme e pronto!

---

## Parte 4 — Personalizar no Celular (Para cada amigo)

- Toque no ícone de **Paleta (🎨)** no topo ou no card **"Personalizar no Celular"** na tela inicial:
  - Escolha a cor de destaque estilo HoYoLAB (**Astral Indigo**, **Ouro Paulista**, **Brisa Ibirapuera** ou **Neon Liberdade**).
  - Escolha seu ícone de viajante (`🧭`, `⭐`, `🎒`, `🍜`, `🎮`, etc.) e seu nome para os votos (`👍`/`👎`) e favoritos (`❤️`).
  - Ative o **Modo Lista Compacta no Celular** se preferir ver mais paradas e atrações por tela sem imagens grandes.
