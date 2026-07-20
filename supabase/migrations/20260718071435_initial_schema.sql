-- Club Duels schema. Run once in the Supabase SQL Editor (or via MCP execute_sql).

create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country text not null,
  logo_path text not null,          -- filename inside public/club_logos/
  created_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table game_clubs (
  game_id uuid not null references games(id) on delete cascade,
  club_id uuid not null references clubs(id) on delete restrict,
  primary key (game_id, club_id)
);
create index game_clubs_club_id_idx on game_clubs(club_id);

create table plays (
  id uuid primary key,              -- server-generated per pageview => idempotency key
  game_id uuid not null references games(id) on delete cascade,
  winner_club_id uuid not null references clubs(id),
  completed_at timestamptz not null default now()
);
create index plays_game_id_idx on plays(game_id);
create index plays_winner_club_id_idx on plays(winner_club_id);

-- RLS on with NO policies: anon/authenticated are denied everything.
-- The app talks to the DB exclusively from the server with the secret
-- (service-role) key, which bypasses RLS. This is intentional.
alter table clubs enable row level security;
alter table games enable row level security;
alter table game_clubs enable row level security;
alter table plays enable row level security;
