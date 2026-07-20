import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Club } from "@/lib/types";
import { LeaderboardList, LeaderboardTabs } from "@/components/leaderboard-list";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = getDict(await getLocale());
  return { title: t.leaderboard.title, description: t.leaderboard.sub };
}

export default async function LeaderboardPage() {
  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("id, name, country, logo_path, plays(count)")
    .returns<(Club & { plays: { count: number }[] })[]>();

  const ranked = (clubs ?? [])
    .map((club) => ({
      id: club.id,
      name: club.name,
      imageSrc: `/club_logos/${club.logo_path}`,
      subtitle: club.country,
      score: club.plays[0]?.count ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const totalPoints = ranked.reduce((sum, row) => sum + row.score, 0);
  const maxScore = ranked[0]?.score || 1;

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
        <p className="max-w-xl text-foreground/65">{t.leaderboard.sub}</p>
      </div>

      <LeaderboardTabs
        active="clubs"
        labels={{ clubs: t.leaderboard.tabClubs, players: t.leaderboard.tabPlayers }}
      />

      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.leaderboard.loadError} {error.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between text-sm font-medium text-foreground/55">
        <span>{plural(locale, ranked.length, words.clubs)}</span>
        <span>{plural(locale, totalPoints, words.points)}</span>
      </div>

      <div className="mt-3">
        <LeaderboardList rows={ranked} maxScore={maxScore} />
      </div>
    </main>
  );
}
