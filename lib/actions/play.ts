"use server";

import { getSupabase } from "@/lib/supabase";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export type SubmitResult = { ok: true } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitPlay(
  playId: string,
  gameId: string,
  winnerId: string,
): Promise<SubmitResult> {
  const t = getDict(await getLocale());
  if (![playId, gameId, winnerId].every((v) => UUID_RE.test(v))) {
    return { ok: false, error: t.errors.invalidIds };
  }

  const supabase = getSupabase();

  const { data: game } = await supabase
    .from("games")
    .select("status, kind")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) return { ok: false, error: t.errors.gameNotFound };
  if (game.status !== "open") return { ok: false, error: t.errors.gameClosed };

  const winnerTable = game.kind === "players" ? "players" : "clubs";
  const { data: winner } = await supabase
    .from(winnerTable)
    .select("id")
    .eq("id", winnerId)
    .maybeSingle();
  if (!winner) return { ok: false, error: t.errors.unknownContender };

  const { error } = await supabase.from("plays").insert({
    id: playId,
    game_id: gameId,
    winner_club_id: game.kind === "players" ? null : winnerId,
    winner_player_id: game.kind === "players" ? winnerId : null,
  });
  // 23505 = duplicate playId: this playthrough was already counted — treat as success.
  if (error && error.code !== "23505") return { ok: false, error: error.message };

  return { ok: true };
}
