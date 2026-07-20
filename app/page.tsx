import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { gameName, getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Game, Position } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const [{ data: games, error }, { count: clubCount }, { data: playerPositions }] =
    await Promise.all([
      supabase
        .from("games")
        .select("id, name_en, name_ru, kind, position, created_at, plays(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .returns<(Game & { plays: { count: number }[] })[]>(),
      supabase.from("clubs").select("*", { count: "exact", head: true }),
      supabase.from("players").select("position").returns<{ position: Position }[]>(),
    ]);

  const poolSize = (game: Game) =>
    game.kind === "players"
      ? (playerPositions ?? []).filter((p) => !game.position || p.position === game.position).length
      : (clubCount ?? 0);
  const poolWords = (game: Game) => (game.kind === "players" ? words.players : words.clubs);
  const badge = (game: Game) =>
    game.kind === "players"
      ? game.position
        ? t.positions[game.position]
        : t.kinds.players
      : t.kinds.clubs;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm font-medium text-foreground/55">
          <span>{t.home.openGames}</span>
          <span>{games?.length ?? 0}</span>
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {t.home.loadError} {error.message}
          </p>
        )}
        {!error && !games?.length && (
          <p className="rounded-2xl border border-dashed border-black/[.15] p-10 text-center text-sm text-foreground/60">
            {t.home.empty}
          </p>
        )}
        {games?.map((game) => (
          <Link
            key={game.id}
            href={`/play/${game.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-black/[.12] p-5 transition-colors hover:bg-black/[.03]"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden />
                <span className="min-w-0 break-words text-base font-semibold sm:text-lg">
                  {gameName(game, locale)}
                </span>
                <span className="shrink-0 rounded-full border border-black/[.12] px-2 py-0.5 text-xs font-medium text-foreground/60">
                  {badge(game)}
                </span>
              </span>
              <span className="text-sm text-foreground/60">
                {plural(locale, poolSize(game), poolWords(game))} ·{" "}
                {plural(locale, game.plays[0]?.count ?? 0, words.plays)}
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity group-hover:opacity-85">
              {t.home.play}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/leaderboard"
          className="inline-block rounded-full border border-black/[.12] px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/[.03] hover:text-foreground"
        >
          {t.home.leaderboard}
        </Link>
      </div>
    </main>
  );
}
