import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getSupabase } from "@/lib/supabase";
import type { Club } from "@/lib/types";
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

export default async function PlayPage({ params }: PageProps<"/play/[gameId]">) {
  const { gameId } = await params;
  const supabase = getSupabase();

  const { data: game } = await supabase
    .from("games")
    .select("id, name, status")
    .eq("id", gameId)
    .maybeSingle();

  if (!game || game.status !== "open") notFound();

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, country, logo_path")
    .returns<Club[]>();
  if (!clubs || clubs.length < 2) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <KnockoutGame
        gameId={game.id}
        gameName={game.name}
        playId={randomUUID()}
        clubs={shuffle(clubs)}
        locale={await getLocale()}
      />
    </main>
  );
}
