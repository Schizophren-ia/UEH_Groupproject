-- TìmTrọ roommate finder schema for Supabase
-- Run this entire file in Supabase Dashboard > SQL Editor > New query.

create table if not exists public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 40),
  campus text not null,
  gender text not null default 'No preference',
  study_level text not null default 'Any study level',
  room_type text not null,
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  living_area text not null default '',
  lifestyle text[] not null default '{}',
  intro text not null default '' check (char_length(intro) <= 500),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roommate_connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommate_no_self_connection check (from_user_id <> to_user_id),
  constraint roommate_unique_connection unique (from_user_id, to_user_id)
);

create index if not exists roommate_profiles_created_at_idx on public.roommate_profiles (created_at desc);
create index if not exists roommate_connections_to_user_idx on public.roommate_connections (to_user_id, status);
create index if not exists roommate_connections_from_user_idx on public.roommate_connections (from_user_id, status);

alter table public.roommate_profiles enable row level security;
alter table public.roommate_connections enable row level security;

-- Signed-in users can discover roommate profiles. Each person can only write their own profile.
drop policy if exists "Roommate profiles are readable by signed-in users" on public.roommate_profiles;
create policy "Roommate profiles are readable by signed-in users"
  on public.roommate_profiles for select to authenticated using (true);

drop policy if exists "Users can create their own roommate profile" on public.roommate_profiles;
create policy "Users can create their own roommate profile"
  on public.roommate_profiles for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own roommate profile" on public.roommate_profiles;
create policy "Users can update their own roommate profile"
  on public.roommate_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own roommate profile" on public.roommate_profiles;
create policy "Users can delete their own roommate profile"
  on public.roommate_profiles for delete to authenticated using (auth.uid() = user_id);

-- Only the sender creates a request. Only either participant can read it; only the recipient can change status.
drop policy if exists "Participants can read roommate connections" on public.roommate_connections;
create policy "Participants can read roommate connections"
  on public.roommate_connections for select to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "Users can send roommate connection requests" on public.roommate_connections;
create policy "Users can send roommate connection requests"
  on public.roommate_connections for insert to authenticated
  with check (auth.uid() = from_user_id and auth.uid() <> to_user_id);

drop policy if exists "Recipients can respond to roommate requests" on public.roommate_connections;
create policy "Recipients can respond to roommate requests"
  on public.roommate_connections for update to authenticated
  using (auth.uid() = to_user_id)
  with check (auth.uid() = to_user_id);

-- Keep updated_at fresh when rows change.
create or replace function public.set_roommate_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists roommate_profiles_updated_at on public.roommate_profiles;
create trigger roommate_profiles_updated_at before update on public.roommate_profiles
for each row execute function public.set_roommate_updated_at();
drop trigger if exists roommate_connections_updated_at on public.roommate_connections;
create trigger roommate_connections_updated_at before update on public.roommate_connections
for each row execute function public.set_roommate_updated_at();

-- Grant table access to authenticated users; RLS policies above limit each operation.
grant select, insert, update, delete on public.roommate_profiles to authenticated;
grant select, insert, update on public.roommate_connections to authenticated;

-- Private messages are allowed only between users with an accepted roommate connection.
create table if not exists public.roommate_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  constraint roommate_message_not_self check (sender_id <> recipient_id)
);
create index if not exists roommate_messages_thread_idx on public.roommate_messages (sender_id, recipient_id, created_at);
alter table public.roommate_messages enable row level security;
drop policy if exists "Participants can read their roommate messages" on public.roommate_messages;
create policy "Participants can read their roommate messages"
  on public.roommate_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Only connected users can send roommate messages" on public.roommate_messages;
create policy "Only connected users can send roommate messages"
  on public.roommate_messages for insert to authenticated
  with check (
    auth.uid() = sender_id and exists (
      select 1 from public.roommate_connections c
      where c.status = 'accepted'
        and ((c.from_user_id = auth.uid() and c.to_user_id = recipient_id)
          or (c.to_user_id = auth.uid() and c.from_user_id = recipient_id))
    )
  );
grant select, insert on public.roommate_messages to authenticated;

-- Optional profile contact details. Private by default; UI only shows to accepted matches when enabled.
alter table public.roommate_profiles add column if not exists phone text not null default '';
alter table public.roommate_profiles add column if not exists zalo text not null default '';
alter table public.roommate_profiles add column if not exists contact_visibility text not null default 'private' check (contact_visibility in ('private','matches'));

-- Private in-app text messages between accepted roommate connections.
create table if not exists public.roommate_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  constraint roommate_message_no_self check (sender_id <> recipient_id)
);
create index if not exists roommate_messages_created_at_idx on public.roommate_messages (created_at asc);
alter table public.roommate_messages enable row level security;
drop policy if exists "Connected users can read their messages" on public.roommate_messages;
create policy "Connected users can read their messages" on public.roommate_messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Connected users can send messages" on public.roommate_messages;
create policy "Connected users can send messages" on public.roommate_messages for insert to authenticated with check (auth.uid() = sender_id and exists (select 1 from public.roommate_connections c where c.status = 'accepted' and ((c.from_user_id = auth.uid() and c.to_user_id = recipient_id) or (c.to_user_id = auth.uid() and c.from_user_id = recipient_id))));
