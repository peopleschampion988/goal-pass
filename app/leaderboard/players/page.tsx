import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Player, Position } from "@/lib/types";
import { LeaderboardList, LeaderboardTabs } from "@/components/leaderboard-list";

export const dynamic = "force-dynamic";

const SECTIONS: { position: Position; emoji: string }[] = [
  { position: "GK", emoji: "🧤" },
  { position: "DF", emoji: "🛡️" },
  { position: "MF", emoji: "🎯" },
  { position: "FW", emoji: "⚽" },
];

function isPosition(value: unknown): value is Position {
  return value === "GK" || value === "DF" || value === "MF" || value === "FW";
}

export default async function PlayersLeaderboardPage({
  searchParams,
}: PageProps<"/leaderboard/players">) {
  const { pos } = await searchParams;
  const activePos = isPosition(pos) ? pos : null;

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, position, country, club, rank, photo_path, plays(count)")
    .returns<(Player & { plays: { count: number }[] })[]>();

  const rows = (players ?? []).map((player) => ({
    id: player.id,
    name: player.name,
    position: player.position,
    imageSrc: player.photo_path ? `/player_photos/${player.photo_path}` : null,
    subtitle: `${player.club} · ${player.country}`,
    score: player.plays[0]?.count ?? 0,
  }));

  const totalPoints = rows.reduce((sum, row) => sum + row.score, 0);

  const sections = SECTIONS.filter(
    (section) => !activePos || section.position === activePos,
  ).map(({ position, emoji }) => {
    const ranked = rows
      .filter((row) => row.position === position)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return {
      position,
      emoji,
      ranked,
      points: ranked.reduce((sum, row) => sum + row.score, 0),
      maxScore: ranked[0]?.score || 1,
    };
  });

  const posPillClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-foreground bg-black/[.05] text-foreground"
        : "border-black/[.12] text-foreground/60 hover:bg-black/[.03] hover:text-foreground"
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
        <h1 className="text-2xl font-bold sm:text-3xl">🏆 {t.leaderboard.title}</h1>
        <p className="max-w-xl text-foreground/65">{t.leaderboard.playersSub}</p>
      </div>

      <LeaderboardTabs
        active="players"
        labels={{ clubs: t.leaderboard.tabClubs, players: t.leaderboard.tabPlayers }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/leaderboard/players" className={posPillClass(!activePos)}>
          {t.leaderboard.allPositions}
        </Link>
        {SECTIONS.map(({ position, emoji }) => (
          <Link
            key={position}
            href={`/leaderboard/players?pos=${position}`}
            className={posPillClass(activePos === position)}
          >
            {emoji} {t.positions[position]}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.leaderboard.loadError} {error.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between text-sm font-medium text-foreground/55">
        <span>
          {plural(
            locale,
            sections.reduce((sum, section) => sum + section.ranked.length, 0),
            words.players,
          )}
        </span>
        <span>
          {plural(locale, activePos ? (sections[0]?.points ?? 0) : totalPoints, words.points)}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.position} className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-black/[.08] pb-2">
              <h2 className="text-lg font-bold">
                {section.emoji} {t.positions[section.position]}
              </h2>
              <span className="text-sm font-medium text-foreground/55">
                {plural(locale, section.points, words.points)}
              </span>
            </div>
            <LeaderboardList rows={section.ranked} maxScore={section.maxScore} />
          </section>
        ))}
      </div>
    </main>
  );
}
