"use server";

import { getSupabase } from "@/lib/supabase";

export type SubmitResult = { ok: true } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitPlay(
  playId: string,
  gameId: string,
  winnerClubId: string,
): Promise<SubmitResult> {
  if (![playId, gameId, winnerClubId].every((v) => UUID_RE.test(v))) {
    return { ok: false, error: "Invalid ids." };
  }

  const supabase = getSupabase();

  const { data: game } = await supabase
    .from("games")
    .select("status")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) return { ok: false, error: "Game not found." };
  if (game.status !== "open") return { ok: false, error: "This game is closed." };

  const { data: club } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", winnerClubId)
    .maybeSingle();
  if (!club) return { ok: false, error: "Unknown club." };

  const { error } = await supabase
    .from("plays")
    .insert({ id: playId, game_id: gameId, winner_club_id: winnerClubId });
  // 23505 = duplicate playId: this playthrough was already counted — treat as success.
  if (error && error.code !== "23505") return { ok: false, error: error.message };

  return { ok: true };
}
