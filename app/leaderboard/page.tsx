import Image from "next/image";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

const RANK_COLORS = ["text-amber-500", "text-gray-400", "text-orange-400"];

export default async function LeaderboardPage() {
  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("id, name, country, logo_path, plays(count)");

  const ranked = (clubs ?? [])
    .map((club) => ({ ...club, score: club.plays[0]?.count ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const totalPoints = ranked.reduce((sum, club) => sum + club.score, 0);
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
        <h1 className="text-3xl font-bold">🏆 {t.leaderboard.title}</h1>
        <p className="max-w-xl text-foreground/65">{t.leaderboard.sub}</p>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.leaderboard.loadError} {error.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between text-sm font-medium text-foreground/55">
        <span>{plural(locale, ranked.length, words.clubs)}</span>
        <span>{plural(locale, totalPoints, words.points)}</span>
      </div>

      <ol className="mt-3 flex flex-col gap-2">
        {ranked.map((club, index) => (
          <li
            key={club.id}
            className="flex items-center gap-4 rounded-xl border border-black/[.12] px-4 py-3"
          >
            <span
              className={`w-6 shrink-0 text-right text-sm font-bold ${
                RANK_COLORS[index] ?? "text-foreground/35"
              }`}
            >
              {index + 1}
            </span>
            <Image
              src={`/club_logos/${club.logo_path}`}
              alt={`${club.name} logo`}
              width={512}
              height={512}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-medium">{club.name}</span>
                <span className="shrink-0 font-mono text-sm font-semibold">🏆 {club.score}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/[.06]">
                <div
                  className="h-full rounded-full bg-foreground/80"
                  style={{ width: `${(club.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
