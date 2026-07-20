import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { Club, Game, Player } from "@/lib/types";
import { ContenderImage } from "@/components/contender-card";

export const dynamic = "force-dynamic";

export default async function AdminGamePage({ params }: PageProps<"/admin/games/[gameId]">) {
  await requireAdmin();
  const { gameId } = await params;

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const [{ data: game }, { data: plays }] = await Promise.all([
    supabase
      .from("games")
      .select("id, name, status, kind, position, created_at")
      .eq("id", gameId)
      .maybeSingle<Game>(),
    supabase.from("plays").select("winner_club_id, winner_player_id").eq("game_id", gameId),
  ]);

  if (!game) notFound();

  const scoreByContender = new Map<string, number>();
  for (const play of plays ?? []) {
    const winnerId = game.kind === "players" ? play.winner_player_id : play.winner_club_id;
    if (!winnerId) continue;
    scoreByContender.set(winnerId, (scoreByContender.get(winnerId) ?? 0) + 1);
  }

  let pool: { id: string; name: string; imageSrc: string | null; subtitle: string }[];
  if (game.kind === "players") {
    let query = supabase.from("players").select("id, name, position, country, club, rank, photo_path");
    if (game.position) query = query.eq("position", game.position);
    const { data: players } = await query.returns<Player[]>();
    pool = (players ?? []).map((player) => ({
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
    pool = (clubs ?? []).map((club) => ({
      id: club.id,
      name: club.name,
      imageSrc: `/club_logos/${club.logo_path}`,
      subtitle: club.country,
    }));
  }

  const ranked = pool
    .map((contender) => ({ ...contender, score: scoreByContender.get(contender.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const totalPlays = plays?.length ?? 0;
  const maxScore = ranked[0]?.score || 1;
  const poolWords = game.kind === "players" ? words.players : words.clubs;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link
        href="/admin"
        className="inline-block rounded-full border border-black/[.12] px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.03] hover:text-foreground"
      >
        {t.admin.back}
      </Link>
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{game.name}</h1>
        <p className="text-sm text-foreground/60">
          <span className={game.status === "open" ? "text-green-600" : "text-red-500"}>
            ● {game.status === "open" ? t.admin.open : t.admin.closed}
          </span>{" "}
          ·{" "}
          {game.kind === "players"
            ? game.position
              ? t.positions[game.position]
              : t.kinds.players
            : t.kinds.clubs}{" "}
          · {plural(locale, ranked.length, poolWords)} · {plural(locale, totalPlays, words.plays)}
        </p>
      </div>

      <ol className="mt-8 flex flex-col gap-2">
        {ranked.map((contender, index) => (
          <li
            key={contender.id}
            className="flex items-center gap-4 rounded-xl border border-black/[.12] px-4 py-3"
          >
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-foreground/40">
              {index + 1}
            </span>
            <ContenderImage
              name={contender.name}
              imageSrc={contender.imageSrc}
              className="h-10 w-10 shrink-0"
              textClassName="text-xs"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-medium">{contender.name}</span>
                <span className="shrink-0 font-mono text-sm font-semibold">🏆 {contender.score}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/[.06]">
                <div
                  className="h-full rounded-full bg-foreground/80"
                  style={{ width: `${(contender.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
