-- Run in the Supabase SQL editor before enabling the shared student features.
-- Keep Auth > Confirm email enabled and configure custom SMTP for UEH recipients.
create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  campus text, study_level text, age integer check (age between 16 and 100), major text,
  gender text, bio text check (char_length(bio) <= 500), living_area text,
  hometown text, hobbies text, cooking text,
  budget_min integer check (budget_min >= 0), budget_max integer check (budget_max >= budget_min),
  needs jsonb not null default '{}'::jsonb,
  show_study boolean not null default true, show_needs boolean not null default true,
  show_optional boolean not null default false,
  hide_profile boolean not null default false,
  avatar_url text check (avatar_url is null or avatar_url like 'https://pkvbmoahccvatxzodaks.supabase.co/storage/v1/object/public/student-avatars/%'),
  updated_at timestamptz not null default now()
);
create table if not exists public.student_private_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text, zalo text, updated_at timestamptz not null default now()
);
create table if not exists public.student_roommate_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 90),
  area text not null check (char_length(area) between 2 and 100),
  near_campus text, capacity integer not null check (capacity between 2 and 4),
  occupied integer not null check (occupied >= 1 and occupied < capacity),
  price_per_person integer not null check (price_per_person between 100000 and 20000000),
  available_from date not null, gender_preference text not null default 'Any' check (gender_preference in ('Any','Female','Male')),
  deposit integer not null default 0 check (deposit >= 0),
  electricity text, water text, shared_costs text, guests text, shared_items text,
  amenities text[] not null default '{}', needs jsonb not null default '{}'::jsonb,
  description text check (char_length(description) <= 500),
  landlord_consent boolean not null check (landlord_consent),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.student_room_checks (
  listing_id uuid primary key references public.student_roommate_listings(id) on delete cascade,
  checked_at timestamptz not null, checked_by uuid not null references auth.users(id),
  notes text
);
create table if not exists public.student_roommate_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.student_roommate_listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  interested_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(listing_id,interested_user_id), check(owner_id <> interested_user_id)
);
create table if not exists public.student_roommate_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.student_roommate_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists student_listings_status_idx on public.student_roommate_listings(status,created_at desc);
create index if not exists student_threads_participants_idx on public.student_roommate_threads(owner_id,interested_user_id);
create index if not exists student_messages_thread_idx on public.student_roommate_messages(thread_id,created_at);
alter table public.student_profiles enable row level security;
alter table public.student_private_profiles enable row level security;
alter table public.student_roommate_listings enable row level security;
alter table public.student_room_checks enable row level security;
alter table public.student_roommate_threads enable row level security;
alter table public.student_roommate_messages enable row level security;
create or replace function public.is_ueh_student() returns boolean language sql stable as $$
 select coalesce(lower(auth.jwt()->>'email') ~ '^[a-z][a-z0-9_-]*\.[0-9]{6,15}@st\.ueh\.edu\.vn$',false)
$$;
create policy "Owners read full profiles" on public.student_profiles for select to authenticated using (public.is_ueh_student() and auth.uid()=user_id);
create policy "Owners write profiles" on public.student_profiles for all to authenticated using (public.is_ueh_student() and auth.uid()=user_id) with check (public.is_ueh_student() and auth.uid()=user_id);
create policy "Owners manage private profile" on public.student_private_profiles for all to authenticated using (public.is_ueh_student() and auth.uid()=user_id) with check (public.is_ueh_student() and auth.uid()=user_id);
create policy "Open listings are readable" on public.student_roommate_listings for select to authenticated using (public.is_ueh_student() and (status='open' or auth.uid()=owner_id));
create policy "Owners create listings" on public.student_roommate_listings for insert to authenticated with check (public.is_ueh_student() and auth.uid()=owner_id);
create policy "Owners update listings" on public.student_roommate_listings for update to authenticated using (public.is_ueh_student() and auth.uid()=owner_id) with check (public.is_ueh_student() and auth.uid()=owner_id);
create policy "Owners delete listings" on public.student_roommate_listings for delete to authenticated using (public.is_ueh_student() and auth.uid()=owner_id);
create policy "Room checks are readable" on public.student_room_checks for select to authenticated using (public.is_ueh_student());
-- Public-facing views expose only the fields allowed by profile visibility and listing verification.
create or replace view public.student_public_profiles as
 select user_id, display_name,
  case when hide_profile or not show_study then null else campus end as campus,
  case when hide_profile or not show_study then null else study_level end as study_level,
  case when hide_profile or not show_optional then null else age end as age,
  case when hide_profile or not show_optional then null else major end as major,
  case when hide_profile or not show_optional then null else hometown end as hometown,
  case when hide_profile or not show_optional then null else hobbies end as hobbies,
  case when hide_profile or not show_optional then null else cooking end as cooking,
  avatar_url, case when hide_profile then null else bio end as bio,
  case when hide_profile or not show_needs then null else needs end as needs
 from public.student_profiles where public.is_ueh_student();
grant select on public.student_public_profiles to authenticated;
create or replace view public.student_roommate_listing_cards with (security_invoker=true) as
 select l.*, (c.listing_id is not null) as room_check_verified
 from public.student_roommate_listings l left join public.student_room_checks c on c.listing_id=l.id;
grant select on public.student_roommate_listing_cards to authenticated;
create policy "Participants read threads" on public.student_roommate_threads for select to authenticated using (public.is_ueh_student() and auth.uid() in (owner_id,interested_user_id));
create policy "Interested students start threads" on public.student_roommate_threads for insert to authenticated with check (
 public.is_ueh_student() and auth.uid()=interested_user_id and exists (
  select 1 from public.student_roommate_listings l
  where l.id=listing_id and l.owner_id=owner_id and l.status='open'
 )
);
create policy "Participants read messages" on public.student_roommate_messages for select to authenticated using (
 public.is_ueh_student() and exists (select 1 from public.student_roommate_threads t where t.id=thread_id and auth.uid() in (t.owner_id,t.interested_user_id))
);
create policy "Participants send messages" on public.student_roommate_messages for insert to authenticated with check (
 public.is_ueh_student() and auth.uid()=sender_id and exists (select 1 from public.student_roommate_threads t where t.id=thread_id and auth.uid() in (t.owner_id,t.interested_user_id))
);
-- Clients can read verification data, but never grant insert/update/delete to them.
revoke insert,update,delete on public.student_room_checks from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('student-avatars','student-avatars',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
create policy "Avatar images are visible" on storage.objects for select to public using (bucket_id='student-avatars');
create policy "Owners upload avatars" on storage.objects for insert to authenticated with check (bucket_id='student-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Owners replace avatars" on storage.objects for update to authenticated using (bucket_id='student-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='student-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
