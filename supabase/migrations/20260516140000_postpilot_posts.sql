-- PostPilot TR — gönderi bulutu + medya bucket

create table if not exists public.postpilot_posts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists postpilot_posts_user_created_idx
  on public.postpilot_posts (user_id, created_at desc);

alter table public.postpilot_posts enable row level security;

create policy postpilot_posts_select_own on public.postpilot_posts
  for select using (auth.uid() = user_id);

create policy postpilot_posts_insert_own on public.postpilot_posts
  for insert with check (auth.uid() = user_id);

create policy postpilot_posts_update_own on public.postpilot_posts
  for update using (auth.uid() = user_id);

create policy postpilot_posts_delete_own on public.postpilot_posts
  for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do update set public = true;

create policy post_media_public_read on storage.objects
  for select using (bucket_id = 'post-media');

create policy post_media_insert_own on storage.objects
  for insert
  with check (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy post_media_delete_own on storage.objects
  for delete
  using (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
