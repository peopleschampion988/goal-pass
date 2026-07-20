import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logout, setGameStatus } from "@/lib/actions/admin";
import { getDict, plural, words } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { GameStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const [{ data: games, error }, { count: clubCount }] = await Promise.all([
    supabase
      .from("games")
      .select("id, name, status, created_at, plays(count)")
      .order("created_at", { ascending: false }),
    supabase.from("clubs").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t.admin.title}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/games/new"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            {t.admin.newGame}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-black/[.12] px-4 py-2 text-sm transition-colors hover:bg-black/[.03]"
            >
              {t.admin.logout}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.admin.loadGamesError} {error.message}
        </p>
      )}
      {!error && !games?.length && (
        <p className="mt-8 rounded-2xl border border-dashed border-black/[.15] p-10 text-center text-sm text-foreground/60">
          {t.admin.empty}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {games?.map((game) => {
          const nextStatus: GameStatus = game.status === "open" ? "closed" : "open";
          return (
            <div
              key={game.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[.12] p-5"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/games/${game.id}`}
                  className="truncate text-lg font-semibold underline-offset-4 hover:underline"
                >
                  {game.name}
                </Link>
                <span className="text-sm text-foreground/60">
                  <span className={game.status === "open" ? "text-green-600" : "text-red-500"}>
                    ● {game.status === "open" ? t.admin.open : t.admin.closed}
                  </span>{" "}
                  · {plural(locale, clubCount ?? 0, words.clubs)} ·{" "}
                  {plural(locale, game.plays[0]?.count ?? 0, words.plays)}
                </span>
              </div>
              <form action={setGameStatus.bind(null, game.id, nextStatus)}>
                <button
                  type="submit"
                  className="rounded-full border border-black/[.12] px-4 py-2 text-sm transition-colors hover:bg-black/[.03]"
                >
                  {game.status === "open" ? t.admin.close : t.admin.reopen}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </main>
  );
}
