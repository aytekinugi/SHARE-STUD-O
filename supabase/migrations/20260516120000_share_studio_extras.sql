-- Share studio extras (idempotent). Safe to run on existing Vanguard projects.

alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;

create unique index if not exists subscriptions_stripe_customer_id_unique
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create table if not exists public.short_links (
  id text primary key,
  target_url text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.short_links add column if not exists clicks integer not null default 0;
alter table public.short_links enable row level security;
drop policy if exists "short_links_select_all" on public.short_links;
create policy "short_links_select_all" on public.short_links for select using (true);
drop policy if exists "short_links_insert_own" on public.short_links;
create policy "short_links_insert_own" on public.short_links for insert with check (auth.uid() = user_id);
drop policy if exists "short_links_delete_own" on public.short_links;
create policy "short_links_delete_own" on public.short_links for delete using (auth.uid() = user_id);

create table if not exists public.share_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.share_templates enable row level security;
drop policy if exists "share_templates_select_own" on public.share_templates;
create policy "share_templates_select_own" on public.share_templates for select using (auth.uid() = user_id);
drop policy if exists "share_templates_insert_own" on public.share_templates;
create policy "share_templates_insert_own" on public.share_templates for insert with check (auth.uid() = user_id);
drop policy if exists "share_templates_delete_own" on public.share_templates;
create policy "share_templates_delete_own" on public.share_templates for delete using (auth.uid() = user_id);

create table if not exists public.guild_share_templates (
  id uuid primary key default uuid_generate_v4(),
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.guild_share_templates enable row level security;
drop policy if exists "guild_share_templates_select_member" on public.guild_share_templates;
create policy "guild_share_templates_select_member" on public.guild_share_templates for select using (
  exists (
    select 1 from public.guild_members gm
    where gm.guild_id = guild_share_templates.guild_id and gm.user_id = auth.uid()
  )
);
drop policy if exists "guild_share_templates_insert_member" on public.guild_share_templates;
create policy "guild_share_templates_insert_member" on public.guild_share_templates for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.guild_members gm
    where gm.guild_id = guild_id and gm.user_id = auth.uid()
  )
);
drop policy if exists "guild_share_templates_delete_own" on public.guild_share_templates;
create policy "guild_share_templates_delete_own" on public.guild_share_templates for delete using (auth.uid() = user_id);

create or replace function public.increment_short_link_clicks(link_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.short_links set clicks = clicks + 1 where id = link_id;
end;
$$;
