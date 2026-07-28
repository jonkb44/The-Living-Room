-- The Living Room — MVP schema
-- Run this in the Supabase SQL editor on a fresh project.
-- Assumes Supabase auth.users as the source of truth for authenticated
-- identity; guest sessions are represented as rows in user_profiles with
-- is_guest = true and no matching auth.users row (handled in app logic
-- via anonymous sign-in, see README).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────
create type user_role as enum ('guest', 'member', 'host', 'moderator', 'admin');
create type room_format as enum ('quiet', 'conversation', 'activity');
create type activity_level as enum ('Quiet', 'Gentle Conversation', 'Active');
create type company_preference as enum ('talk', 'listen', 'quiet_company', 'not_sure');
create type feeling as enum (
  'fine_alone', 'a_little_flat', 'restless', 'anxious', 'sad',
  'tired', 'bored', 'cant_sleep', 'rather_not_say'
);
create type presence_activity as enum (
  'coffee', 'reading', 'cooking', 'watching_tv', 'working',
  'listening_to_music', 'resting', 'trying_to_sleep', 'just_sitting'
);
create type reaction_kind as enum ('heart', 'smile', 'wave', 'understand');
create type report_category as enum (
  'harassment', 'romantic_advances', 'hate_speech', 'scam_or_money',
  'inappropriate_content', 'threatening_behaviour', 'self_harm_concern', 'other'
);
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type moderation_action_type as enum ('mute', 'remove_message', 'suspend', 'ban', 'warn');

-- ─────────────────────────────────────────────
-- users / user_profiles
-- auth.users already exists (Supabase Auth). user_profiles extends it
-- for both registered members and guests.
-- ─────────────────────────────────────────────
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  is_guest boolean not null default false,
  company_preference company_preference,
  current_feeling feeling,
  role user_role not null default 'member',
  timezone_region text,
  share_online_status boolean not null default false,
  is_over_18_confirmed boolean not null default false,
  is_suspended boolean not null default false,
  suspended_until timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_profiles_auth_user_id_idx on user_profiles(auth_user_id) where auth_user_id is not null;

-- ─────────────────────────────────────────────
-- rooms
-- ─────────────────────────────────────────────
create table rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  format room_format not null,
  activity_level activity_level not null,
  host_id uuid references user_profiles(id) on delete set null,
  host_prompts text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- room_memberships (durable "has been in this room before")
-- ─────────────────────────────────────────────
create table room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  first_joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

-- ─────────────────────────────────────────────
-- room_presence (who is in a room right now — ephemeral, realtime)
-- ─────────────────────────────────────────────
create table room_presence (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  activity presence_activity,
  is_quiet boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, user_id)
);

-- ─────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  author_id uuid references user_profiles(id) on delete set null,
  body text not null check (char_length(body) between 1 and 600),
  is_system_message boolean not null default false,
  is_host_prompt boolean not null default false,
  is_deleted boolean not null default false,
  deleted_reason text,
  moderation_status text not null default 'visible', -- visible | hidden | flagged
  created_at timestamptz not null default now()
);

create index messages_room_id_created_at_idx on messages(room_id, created_at);

-- ─────────────────────────────────────────────
-- message_reactions
-- ─────────────────────────────────────────────
create table message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  kind reaction_kind not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, kind)
);

-- ─────────────────────────────────────────────
-- pending_interests → mutual_connections ("Familiar Faces")
-- A one-sided "I would be happy to see this person again" until both
-- sides express it, at which point a mutual_connections row is created.
-- ─────────────────────────────────────────────
create table pending_interests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references user_profiles(id) on delete cascade,
  to_user_id uuid not null references user_profiles(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

create table mutual_connections (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references user_profiles(id) on delete cascade,
  user_b_id uuid not null references user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

-- ─────────────────────────────────────────────
-- private_messages (Familiar Faces only)
-- ─────────────────────────────────────────────
create table private_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references mutual_connections(id) on delete cascade,
  sender_id uuid not null references user_profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- blocks / reports / moderation_actions
-- ─────────────────────────────────────────────
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references user_profiles(id) on delete cascade,
  blocked_id uuid not null references user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references user_profiles(id) on delete cascade,
  reported_user_id uuid not null references user_profiles(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  message_id uuid references messages(id) on delete set null,
  category report_category not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references user_profiles(id)
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references user_profiles(id),
  target_user_id uuid not null references user_profiles(id),
  action_type moderation_action_type not null,
  reason text,
  related_report_id uuid references reports(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- notification_preferences
-- ─────────────────────────────────────────────
create table notification_preferences (
  user_id uuid primary key references user_profiles(id) on delete cascade,
  familiar_face_online boolean not null default false,
  familiar_face_message boolean not null default true,
  room_invite boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
alter table user_profiles enable row level security;
alter table rooms enable row level security;
alter table room_presence enable row level security;
alter table room_memberships enable row level security;
alter table messages enable row level security;
alter table message_reactions enable row level security;
alter table pending_interests enable row level security;
alter table mutual_connections enable row level security;
alter table private_messages enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table moderation_actions enable row level security;
alter table notification_preferences enable row level security;

-- Rooms are public read (directory + room contents are meant to be seen
-- by anyone signed in, including guests).
create policy "rooms are readable by anyone authenticated"
  on rooms for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Profiles: a user can read their own profile plus minimal public fields
-- of others. For MVP simplicity we allow reading display_name-level data
-- broadly and restrict sensitive fields at the application layer.
create policy "profiles are self-manageable"
  on user_profiles for all
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy "profiles are readable for presence display"
  on user_profiles for select
  using (true);

-- Presence: users manage their own presence row; everyone can see who
-- is in a room.
create policy "presence readable by anyone"
  on room_presence for select using (true);

create policy "presence writable by owner"
  on room_presence for insert
  with check (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

create policy "presence updatable by owner"
  on room_presence for update
  using (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

create policy "presence deletable by owner"
  on room_presence for delete
  using (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- Messages: readable by anyone in the room; only the author can be
-- recorded as sender (moderators/admins get elevated delete rights via
-- a service-role edge function rather than client-side policy).
create policy "messages readable by anyone"
  on messages for select using (true);

create policy "messages insertable by author"
  on messages for insert
  with check (author_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- Reactions
create policy "reactions readable by anyone"
  on message_reactions for select using (true);

create policy "reactions writable by owner"
  on message_reactions for insert
  with check (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

create policy "reactions deletable by owner"
  on message_reactions for delete
  using (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- Pending interests: only visible to the sender (recipient must never
-- see an unreciprocated interest — this is the whole point of the
-- feature).
create policy "pending interests visible to sender only"
  on pending_interests for select
  using (from_user_id in (select id from user_profiles where auth_user_id = auth.uid()));

create policy "pending interests insertable by sender"
  on pending_interests for insert
  with check (from_user_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- Mutual connections: visible to either participant.
create policy "connections visible to participants"
  on mutual_connections for select
  using (
    user_a_id in (select id from user_profiles where auth_user_id = auth.uid())
    or user_b_id in (select id from user_profiles where auth_user_id = auth.uid())
  );

-- Private messages: only participants of the connection.
create policy "private messages visible to connection participants"
  on private_messages for select
  using (
    connection_id in (
      select id from mutual_connections
      where user_a_id in (select id from user_profiles where auth_user_id = auth.uid())
         or user_b_id in (select id from user_profiles where auth_user_id = auth.uid())
    )
  );

create policy "private messages insertable by connection participants"
  on private_messages for insert
  with check (
    sender_id in (select id from user_profiles where auth_user_id = auth.uid())
    and connection_id in (
      select id from mutual_connections
      where user_a_id in (select id from user_profiles where auth_user_id = auth.uid())
         or user_b_id in (select id from user_profiles where auth_user_id = auth.uid())
    )
  );

-- Blocks: only visible/manageable by the blocker.
create policy "blocks manageable by blocker"
  on blocks for all
  using (blocker_id in (select id from user_profiles where auth_user_id = auth.uid()))
  with check (blocker_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- Reports: reporter can create and read their own; moderators/admins
-- read all (checked at application layer via role, kept simple here).
create policy "reports insertable by reporter"
  on reports for insert
  with check (reporter_id in (select id from user_profiles where auth_user_id = auth.uid()));

create policy "reports readable by reporter or staff"
  on reports for select
  using (
    reporter_id in (select id from user_profiles where auth_user_id = auth.uid())
    or exists (
      select 1 from user_profiles
      where auth_user_id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- Moderation actions: staff only.
create policy "moderation actions staff only"
  on moderation_actions for all
  using (
    exists (
      select 1 from user_profiles
      where auth_user_id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- Notification preferences: owner only.
create policy "notification prefs owner only"
  on notification_preferences for all
  using (user_id in (select id from user_profiles where auth_user_id = auth.uid()))
  with check (user_id in (select id from user_profiles where auth_user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- Helper trigger: auto-create mutual_connections when both sides
-- express pending interest, always storing the pair with the smaller
-- id first so the unique constraint / check works.
-- ─────────────────────────────────────────────
create or replace function try_create_mutual_connection()
returns trigger as $$
declare
  reciprocal_exists boolean;
  a uuid;
  b uuid;
begin
  select exists (
    select 1 from pending_interests
    where from_user_id = new.to_user_id and to_user_id = new.from_user_id
  ) into reciprocal_exists;

  if reciprocal_exists then
    if new.from_user_id < new.to_user_id then
      a := new.from_user_id; b := new.to_user_id;
    else
      a := new.to_user_id; b := new.from_user_id;
    end if;

    insert into mutual_connections (user_a_id, user_b_id)
    values (a, b)
    on conflict (user_a_id, user_b_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_pending_interest_created
  after insert on pending_interests
  for each row execute function try_create_mutual_connection();
