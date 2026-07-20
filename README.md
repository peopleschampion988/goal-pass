# Goal Pass

Knockout duels for football fans: two contenders at a time — tap the one you love more. The winner stays on until every contender has been faced, and the last one standing scores a point on the leaderboard.

Two kinds of games:

- **Clubs** — 30 popular European clubs.
- **Players** — the 100 best players of 2026, optionally scoped to a position (goalkeepers, defenders, midfielders, forwards).

Built with Next.js (App Router) + Supabase. UI in English and Russian.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev
```

`.env.local` (server-only, never committed):

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (Dashboard → Project Settings → API) |
| `SUPABASE_SECRET_KEY` | Service-role secret key |
| `ADMIN_PASSWORD` | Password for the admin panel |

Database: apply `supabase/migrations/` (via `supabase db push` or the SQL editor), then seed clubs with `supabase/seed.sql` and players with `node scripts/seed-players.mjs`.

## Admin panel

The admin panel lives at **`/admin`** and is where games are created, closed, reopened, and inspected.

1. Open `http://localhost:3000/admin` (or `/admin` on the deployed site).
2. You'll be redirected to `/admin/login` — enter the password from `ADMIN_PASSWORD` in `.env.local` (on production, the value set in the hosting provider's environment variables).
3. That's it — you're in. The session is a cookie that lasts 7 days; use the **Log out** button in the top-right corner to end it early.

Notes:

- There is no username — just the one shared password.
- Changing `ADMIN_PASSWORD` immediately invalidates everyone's admin sessions.
- If you see "ADMIN_PASSWORD is not configured on the server", the env var is missing where the app runs.

## Scripts

| Script | Purpose |
| --- | --- |
| `scripts/download-logos.sh` | Downloads club logos into `public/club_logos/` |
| `scripts/download-player-photos.mjs` | Downloads player cutouts from TheSportsDB into `public/player_photos/` and regenerates `supabase/seed_players.sql` |
| `scripts/seed-players.mjs` | Upserts the 100 players into the Supabase `players` table |
| `scripts/players-data.mjs` | The curated top-100 list both scripts read from |
