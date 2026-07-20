-- Player Duels: players table, game kinds, and player winners.
-- Run once in the Supabase SQL Editor (or via MCP execute_sql).

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position text not null check (position in ('GK', 'DF', 'MF', 'FW')),
  country text not null,
  club text not null,               -- display-only club name (not all top players' clubs are in clubs table)
  rank int not null,                -- 1..100 "best of 2026" ordering
  photo_path text,                  -- filename inside public/player_photos/; null => initials avatar
  created_at timestamptz not null default now()
);

alter table games add column kind text not null default 'clubs' check (kind in ('clubs', 'players'));
alter table games add column position text check (position in ('GK', 'DF', 'MF', 'FW'));

alter table plays alter column winner_club_id drop not null;
alter table plays add column winner_player_id uuid references players(id);
alter table plays add constraint plays_one_winner
  check ((winner_club_id is null) <> (winner_player_id is null));
create index plays_winner_player_id_idx on plays(winner_player_id);

-- RLS on with NO policies: server-only access via service-role key (existing pattern).
alter table players enable row level security;
