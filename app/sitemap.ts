import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/site";

// Re-generate at most hourly so newly opened games get picked up.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: games } = await getSupabase()
    .from("games")
    .select("id, created_at")
    .eq("status", "open");

  return [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/leaderboard`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/leaderboard/players`, changeFrequency: "hourly", priority: 0.8 },
    ...(games ?? []).map((game) => ({
      url: `${siteUrl}/play/${game.id}`,
      lastModified: new Date(game.created_at),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
}
