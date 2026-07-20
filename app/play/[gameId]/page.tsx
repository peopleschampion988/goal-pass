import { randomUUID } from "node:crypto";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { gameName, getDict } from "@/lib/i18n";
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

// Fetched by both generateMetadata and the page; cache() dedupes the query.
const getGame = cache(async (gameId: string) => {
  const { data } = await getSupabase()
    .from("games")
    .select("id, name_en, name_ru, status, kind, position")
    .eq("id", gameId)
    .maybeSingle<Game>();
  return data;
});

export async function generateMetadata({
  params,
}: PageProps<"/play/[gameId]">): Promise<Metadata> {
  const { gameId } = await params;
  const locale = await getLocale();
  const game = await getGame(gameId);
  if (!game) return {};
  const title = gameName(game, locale);
  return {
    title,
    openGraph: { title, url: `/play/${gameId}` },
    twitter: { title },
  };
}

export default async function PlayPage({ params }: PageProps<"/play/[gameId]">) {
  const { gameId } = await params;
  const locale = await getLocale();
  const t = getDict(locale);
  const supabase = getSupabase();

  const game = await getGame(gameId);
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
        gameName={gameName(game, locale)}
        playId={randomUUID()}
        contenders={shuffle(contenders)}
        leaderboardHref={game.kind === "players" ? "/leaderboard/players" : "/leaderboard"}
        locale={locale}
      />
    </main>
  );
}
