-- Zinkbad: im Supabase SQL-Editor ausführen.

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  description text,
  flyer_path  text,
  flyer_alt   text,
  -- [{ "name": "DJ X", "instagram_url": "https://…" }], Headliner zuerst
  lineup      jsonb not null default '[]'::jsonb,
  -- [{ "id": "earlybird", "label": "1x EarlyBird", "price_chf": 45, "sold_out": false }]
  tickets     jsonb not null default '[]'::jsonb,
  -- optionaler externer Ticket-Link (überschreibt den Payrexx-Checkout)
  ticket_url  text,
  status      text not null default 'draft'
              check (status in ('draft','published','cancelled','sold_out')),
  is_featured boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index events_public_idx on public.events (starts_at) where status <> 'draft';

create table public.site_settings (
  key   text primary key,
  value jsonb not null
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins        enable row level security;
alter table public.events        enable row level security;
alter table public.site_settings enable row level security;

create policy "admins read self" on public.admins
  for select using (user_id = auth.uid());

create policy "public reads non-draft events" on public.events
  for select using (status <> 'draft' or public.is_admin());
create policy "admins write events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads settings" on public.site_settings
  for select using (true);
create policy "admins write settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Flyer-Bucket (öffentlich lesbar, nur Admins schreiben)
insert into storage.buckets (id, name, public) values ('flyers','flyers', true)
  on conflict (id) do nothing;
create policy "admins upload flyers" on storage.objects
  for insert with check (bucket_id = 'flyers' and public.is_admin());
create policy "admins update flyers" on storage.objects
  for update using (bucket_id = 'flyers' and public.is_admin());
create policy "admins delete flyers" on storage.objects
  for delete using (bucket_id = 'flyers' and public.is_admin());

-- Ersten Admin nach Anlegen des Users in Auth > Users eintragen:
-- insert into public.admins (user_id) select id from auth.users where email = 'DEINE@MAIL';
