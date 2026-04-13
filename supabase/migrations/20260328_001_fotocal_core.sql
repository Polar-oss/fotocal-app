create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  notes text not null default '',
  calories integer not null check (calories > 0 and calories < 10000),
  logged_date date not null default current_date,
  eaten_at time not null default localtime,
  shared_to_circle boolean not null default false,
  image_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists friends_user_id_lower_idx
on public.friends (user_id, lower(name));

create index if not exists meals_user_id_logged_date_idx
on public.meals (user_id, logged_date desc, eaten_at desc);

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at
before update on public.meals
for each row
execute function public.set_updated_at();

alter table public.meals enable row level security;
alter table public.friends enable row level security;

drop policy if exists "Users can read own meals" on public.meals;
create policy "Users can read own meals"
on public.meals
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own meals" on public.meals;
create policy "Users can insert own meals"
on public.meals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own meals" on public.meals;
create policy "Users can update own meals"
on public.meals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own meals" on public.meals;
create policy "Users can delete own meals"
on public.meals
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own friends" on public.friends;
create policy "Users can read own friends"
on public.friends
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own friends" on public.friends;
create policy "Users can insert own friends"
on public.friends
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own friends" on public.friends;
create policy "Users can delete own friends"
on public.friends
for delete
using (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'meal-images',
  'meal-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own meal images" on storage.objects;
create policy "Users can read own meal images"
on storage.objects
for select
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own meal images" on storage.objects;
create policy "Users can upload own meal images"
on storage.objects
for insert
with check (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own meal images" on storage.objects;
create policy "Users can update own meal images"
on storage.objects
for update
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own meal images" on storage.objects;
create policy "Users can delete own meal images"
on storage.objects
for delete
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
