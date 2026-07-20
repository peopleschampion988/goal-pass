import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Club, Player } from "@/lib/types";
import { ContenderImage } from "@/components/contender-card";

export const dynamic = "force-dynamic";

const RANK_COLORS = ["text-amber-500", "text-gray-400", "text-orange-400"];

type Row = {
  id: string;
  name: string;
  imageSrc: string | null;
  subtitle: string;
  score: number;
};

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const { tab } = await searchParams;
  const activeTab = tab === "players" ? "players" : "clubs";

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();

  let rows: Row[] = [];
  let error: { message: string } | null = null;
  if (activeTab === "players") {
    const result = await supabase
      .from("players")
      .select("id, name, position, country, club, photo_path, plays(count)")
      .returns<(Player & { plays: { count: number }[] })[]>();
    error = result.error;
    rows = (result.data ?? []).map((player) => ({
      id: player.id,
      name: player.name,
      imageSrc: player.photo_path ? `/player_photos/${player.photo_path}` : null,
      subtitle: `${t.position[player.position]} · ${player.club}`,
      score: player.plays[0]?.count ?? 0,
    }));
  } else {
    const result = await supabase
      .from("clubs")
      .select("id, name, country, logo_path, plays(count)")
      .returns<(Club & { plays: { count: number }[] })[]>();
    error = result.error;
    rows = (result.data ?? []).map((club) => ({
      id: club.id,
      name: club.name,
      imageSrc: `/club_logos/${club.logo_path}`,
      subtitle: club.country,
      score: club.plays[0]?.count ?? 0,
    }));
  }

  const ranked = rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const totalPoints = ranked.reduce((sum, row) => sum + row.score, 0);
  const maxScore = ranked[0]?.score || 1;

  const tabClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-foreground bg-foreground text-background"
        : "border-black/[.12] text-foreground/70 hover:bg-black/[.03] hover:text-foreground"
    }`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link
        href="/"
        className="inline-block rounded-full border border-black/[.12] px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.03] hover:text-foreground"
      >
        {t.leaderboard.back}
      </Link>

      <div className="mt-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">🏆 {t.leaderboard.title}</h1>
        <p className="max-w-xl text-foreground/65">{t.leaderboard.sub}</p>
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/leaderboard" className={tabClass(activeTab === "clubs")}>
          {t.leaderboard.tabClubs}
        </Link>
        <Link href="/leaderboard?tab=players" className={tabClass(activeTab === "players")}>
          {t.leaderboard.tabPlayers}
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.leaderboard.loadError} {error.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between text-sm font-medium text-foreground/55">
        <span>
          {plural(locale, ranked.length, activeTab === "players" ? words.players : words.clubs)}
        </span>
        <span>{plural(locale, totalPoints, words.points)}</span>
      </div>

      <ol className="mt-3 flex flex-col gap-2">
        {ranked.map((row, index) => (
          <li
            key={row.id}
            className="flex items-center gap-4 rounded-xl border border-black/[.12] px-4 py-3"
          >
            <span
              className={`w-6 shrink-0 text-right text-sm font-bold ${
                RANK_COLORS[index] ?? "text-foreground/35"
              }`}
            >
              {index + 1}
            </span>
            <ContenderImage
              name={row.name}
              imageSrc={row.imageSrc}
              className="h-10 w-10 shrink-0"
              textClassName="text-xs"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-medium">
                  {row.name}{" "}
                  <span className="text-sm font-normal text-foreground/45">{row.subtitle}</span>
                </span>
                <span className="shrink-0 font-mono text-sm font-semibold">🏆 {row.score}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/[.06]">
                <div
                  className="h-full rounded-full bg-foreground/80"
                  style={{ width: `${(row.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
