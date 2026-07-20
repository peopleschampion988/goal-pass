import Link from "next/link";
import { ContenderImage } from "@/components/contender-card";

const RANK_COLORS = ["text-amber-500", "text-gray-400", "text-orange-400"];

export type LeaderboardRow = {
  id: string;
  name: string;
  imageSrc: string | null;
  subtitle: string;
  score: number;
};

export function LeaderboardList({ rows, maxScore }: { rows: LeaderboardRow[]; maxScore: number }) {
  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row, index) => (
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
  );
}

export function LeaderboardTabs({
  active,
  labels,
}: {
  active: "clubs" | "players";
  labels: { clubs: string; players: string };
}) {
  const tabClass = (isActive: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "border-foreground bg-foreground text-background"
        : "border-black/[.12] text-foreground/70 hover:bg-black/[.03] hover:text-foreground"
    }`;
  return (
    <div className="mt-6 flex gap-2">
      <Link href="/leaderboard" className={tabClass(active === "clubs")}>
        {labels.clubs}
      </Link>
      <Link href="/leaderboard/players" className={tabClass(active === "players")}>
        {labels.players}
      </Link>
    </div>
  );
}
