import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { Club, Contender, Game, Player } from "@/lib/types";
import { KnockoutGame } from "@/components/knockout-game";

export const dynamic = "force-dynamic";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function PlayPage({ params }: PageProps<"/play/[gameId]">) {
  const { gameId } = await params;
  const locale = await getLocale();
  const t = getDict(locale);
  const supabase = getSupabase();

  const { data: game } = await supabase
    .from("games")
    .select("id, name, status, kind, position")
    .eq("id", gameId)
    .maybeSingle<Game>();

  if (!game || game.status !== "open") notFound();

  let contenders: Contender[];
  if (game.kind === "players") {
    let query = supabase.from("players").select("id, name, position, country, club, rank, photo_path");
    if (game.position) query = query.eq("position", game.position);
    const { data: players } = await query.returns<Player[]>();
    contenders = (players ?? []).map((player) => ({
      id: player.id,
      name: player.name,
      imageSrc: player.photo_path ? `/player_photos/${player.photo_path}` : null,
      subtitle: `${t.position[player.position]} · ${player.club}`,
    }));
  } else {
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, name, country, logo_path")
      .returns<Club[]>();
    contenders = (clubs ?? []).map((club) => ({
      id: club.id,
      name: club.name,
      imageSrc: `/club_logos/${club.logo_path}`,
      subtitle: club.country,
    }));
  }

  if (contenders.length < 2) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <KnockoutGame
        gameId={game.id}
        gameName={game.name}
        playId={randomUUID()}
        contenders={shuffle(contenders)}
        locale={locale}
      />
    </main>
  );
}
