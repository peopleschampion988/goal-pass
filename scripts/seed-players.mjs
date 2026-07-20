#!/usr/bin/env node
// Upserts the 100 players from scripts/players-data.mjs into the Supabase
// players table via PostgREST, using SUPABASE_URL/SUPABASE_SECRET_KEY from .env.local.
//
// Usage: node scripts/seed-players.mjs
// Run scripts/download-player-photos.mjs first so photo files exist locally.

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PLAYERS, slugOf } from "./players-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = resolve(root, "public/player_photos");

const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trimStart().startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);
const { SUPABASE_URL, SUPABASE_SECRET_KEY } = env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SECRET_KEY missing in .env.local");
  process.exit(1);
}

const photoFiles = readdirSync(photosDir);
const photoOf = (search) => {
  const slug = slugOf(search);
  return photoFiles.find((f) => f.replace(/\.[^.]+$/, "") === slug) ?? null;
};

const rows = PLAYERS.map(([rank, name, search, position, country, club]) => ({
  name,
  position,
  country,
  club,
  rank,
  photo_path: photoOf(search),
}));

const res = await fetch(`${SUPABASE_URL}/rest/v1/players?on_conflict=name`, {
  method: "POST",
  headers: {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error(`Upsert failed: HTTP ${res.status}`, await res.text());
  process.exit(1);
}

const count = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id`, {
  method: "HEAD",
  headers: {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    Prefer: "count=exact",
  },
});
console.log(
  `upserted ${rows.length} players · table now holds ${count.headers.get("content-range")?.split("/")[1] ?? "?"} rows`,
);
