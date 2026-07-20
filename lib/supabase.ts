import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the secret (service-role) key, which bypasses RLS — must never be
// imported from client code ("server-only" enforces this at build time).
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
