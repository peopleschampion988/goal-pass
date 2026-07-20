import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";
import { NewGameForm } from "@/components/new-game-form";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  await requireAdmin();

  const locale = await getLocale();
  const t = getDict(locale);

  const supabase = getSupabase();
  const [{ data: clubs, error }, { data: players }] = await Promise.all([
    supabase.from("clubs").select("id, name, country, logo_path").order("name"),
    supabase
      .from("players")
      .select("id, name, position, country, club, rank, photo_path")
      .order("rank")
      .returns<Player[]>(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link
        href="/admin"
        className="inline-block rounded-full border border-black/[.12] px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.03] hover:text-foreground"
      >
        {t.admin.back}
      </Link>
      <h1 className="mt-6 text-2xl font-bold">{t.admin.newGameTitle}</h1>
      {error && (
        <p className="mt-6 text-sm text-red-500">
          {t.admin.loadClubsError} {error.message}
        </p>
      )}
      {clubs && <NewGameForm clubs={clubs} players={players ?? []} locale={locale} />}
    </main>
  );
}
