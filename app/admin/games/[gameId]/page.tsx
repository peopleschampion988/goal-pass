import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { Club } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminGamePage({ params }: PageProps<"/admin/games/[gameId]">) {
  await requireAdmin();
  const { gameId } = await params;

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const [{ data: game }, { data: plays }, { data: allClubs }] = await Promise.all([
    supabase
      .from("games")
      .select("id, name, status, created_at")
      .eq("id", gameId)
      .maybeSingle(),
    supabase.from("plays").select("winner_club_id").eq("game_id", gameId),
    supabase.from("clubs").select("id, name, country, logo_path").returns<Club[]>(),
  ]);

  if (!game) notFound();

  const scoreByClub = new Map<string, number>();
  for (const play of plays ?? []) {
    scoreByClub.set(play.winner_club_id, (scoreByClub.get(play.winner_club_id) ?? 0) + 1);
  }

  const clubs = (allClubs ?? [])
    .map((club) => ({ ...club, score: scoreByClub.get(club.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const totalPlays = plays?.length ?? 0;
  const maxScore = clubs[0]?.score || 1;

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
          · {plural(locale, clubs.length, words.clubs)} · {plural(locale, totalPlays, words.plays)}
        </p>
      </div>

      <ol className="mt-8 flex flex-col gap-2">
        {clubs.map((club, index) => (
          <li
            key={club.id}
            className="flex items-center gap-4 rounded-xl border border-black/[.12] px-4 py-3"
          >
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-foreground/40">
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
