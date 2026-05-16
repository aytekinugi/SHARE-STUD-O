-- Vanguard AI Supabase schema — Phase 2 Scale & Polish
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  level integer not null default 1,
  xp integer not null default 0,
  gold integer not null default 0,
  bio text,
  health_points integer not null default 100,
  character_class text,
  onboarding_completed boolean not null default false,
  focus_boost_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.quests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  difficulty integer not null check (difficulty between 1 and 500),
  status text not null default 'todo' check (status in ('todo','done')),
  category text not null check (category in ('str','int','cha')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  insight_type text not null default 'quest_plan' check (insight_type in ('quest_plan','oracle_prediction','daily_report')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_type text not null default 'free' check (plan_type in ('free','pro')),
  expiry_date timestamptz
);

create table if not exists public.guilds (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  goal_category text not null check (goal_category in ('str','int','cha')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  weekly_xp integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table if not exists public.guild_messages (
  id uuid primary key default uuid_generate_v4(),
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  item_type text not null check (item_type in ('skin','boost')),
  price_gold integer not null check (price_gold >= 0),
  effect_json jsonb,
  rarity text not null default 'common' check (rarity in ('common','rare','legendary')),
  active boolean not null default true
);

create table if not exists public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  marketplace_item_id uuid not null references public.marketplace_items(id),
  purchased_at timestamptz not null default now()
);

create table if not exists public.skill_nodes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('str','int','cha')),
  node_key text not null,
  title text not null,
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  unique(user_id, node_key)
);

alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.ai_insights enable row level security;
alter table public.subscriptions enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.guild_messages enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.skill_nodes enable row level security;

-- Helper prevents leaking private guild chat to non-members.
create or replace function public.is_guild_member(gid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$ select exists(select 1 from public.guild_members gm where gm.guild_id = gid and gm.user_id = auth.uid()); $$;

-- Drop/recreate policies for idempotent local iterations.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies where schemaname='public' loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "quests_select_own" on public.quests for select using (auth.uid() = user_id);
create policy "quests_insert_own" on public.quests for insert with check (auth.uid() = user_id);
create policy "quests_update_own" on public.quests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quests_delete_own" on public.quests for delete using (auth.uid() = user_id);

create policy "insights_select_own" on public.ai_insights for select using (auth.uid() = user_id);
create policy "insights_insert_own" on public.ai_insights for insert with check (auth.uid() = user_id);
create policy "insights_update_own" on public.ai_insights for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "guilds_select_member_or_discovery" on public.guilds for select using (true);
create policy "guilds_insert_owner" on public.guilds for insert with check (auth.uid() = owner_id);
create policy "guilds_update_owner" on public.guilds for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "guild_members_select_if_member_or_self_join" on public.guild_members for select using (auth.uid() = user_id or public.is_guild_member(guild_id));
create policy "guild_members_insert_self" on public.guild_members for insert with check (auth.uid() = user_id);
create policy "guild_members_update_self" on public.guild_members for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "guild_members_delete_self" on public.guild_members for delete using (auth.uid() = user_id);

create policy "guild_messages_select_members" on public.guild_messages for select using (public.is_guild_member(guild_id));
create policy "guild_messages_insert_members" on public.guild_messages for insert with check (auth.uid() = user_id and public.is_guild_member(guild_id));
create policy "guild_messages_delete_own" on public.guild_messages for delete using (auth.uid() = user_id);

create policy "marketplace_items_public_read" on public.marketplace_items for select using (active = true);
create policy "inventory_select_own" on public.inventory_items for select using (auth.uid() = user_id);
create policy "inventory_insert_own" on public.inventory_items for insert with check (auth.uid() = user_id);

create policy "skill_nodes_select_own" on public.skill_nodes for select using (auth.uid() = user_id);
create policy "skill_nodes_insert_own" on public.skill_nodes for insert with check (auth.uid() = user_id);
create policy "skill_nodes_update_own" on public.skill_nodes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id, plan_type)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.marketplace_items (name, description, item_type, price_gold, effect_json, rarity) values
  ('Obsidian Mantle', 'A legendary dark-gold avatar skin for disciplined operators.', 'skin', 120, '{"skin":"obsidian_mantle"}', 'legendary'),
  ('Emerald Focus Boost', 'For the next 2 hours, completed quests grant +20% XP.', 'boost', 45, '{"xp_multiplier":1.2,"duration_hours":2}', 'rare'),
  ('Golden Warpaint', 'A radiant avatar accent for peak streak weeks.', 'skin', 70, '{"skin":"golden_warpaint"}', 'rare')
on conflict do nothing;

create index if not exists quests_user_status_idx on public.quests(user_id, status);
create index if not exists quests_completed_idx on public.quests(user_id, completed_at desc);
create index if not exists ai_insights_user_created_idx on public.ai_insights(user_id, created_at desc);
create index if not exists guild_members_guild_weekly_idx on public.guild_members(guild_id, weekly_xp desc);
create index if not exists guild_messages_guild_created_idx on public.guild_messages(guild_id, created_at desc);

create or replace function public.increment_guild_weekly_xp(xp_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.guild_members
  set weekly_xp = weekly_xp + greatest(0, xp_delta)
  where user_id = auth.uid();
end;
$$;

-- Stripe billing linkage (deploy on existing projects with: run this block in SQL editor)
alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;

create unique index if not exists subscriptions_stripe_customer_id_unique
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;
