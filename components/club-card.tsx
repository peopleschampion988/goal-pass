import Image from "next/image";
import type { Club } from "@/lib/types";

export type DuelResult = "win" | "lose" | null;

export function ClubCard({
  club,
  onPick,
  result = null,
}: {
  club: Club;
  onPick: () => void;
  result?: DuelResult;
}) {
  const resultClass =
    result === "win"
      ? "win-pounce border-green-500 bg-green-500/[.06]"
      : result === "lose"
        ? "lose-fade"
        : "hover:border-black/35 hover:bg-black/[.02]";

  return (
    <button
      type="button"
      onClick={onPick}
      className={`relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-black/[.12] p-3 transition-colors active:scale-[0.98] sm:gap-3 sm:p-6 ${resultClass}`}
    >
      {result === "win" && (
        <span className="pop-in absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-green-500 text-sm font-bold text-white">
          ✓
        </span>
      )}
      <Image
        src={`/club_logos/${club.logo_path}`}
        alt={`${club.name} logo`}
        width={512}
        height={512}
        className="h-20 w-20 object-contain sm:h-36 sm:w-36"
      />
      <span className="text-center text-sm font-semibold leading-tight sm:text-lg">
        {club.name}
      </span>
      <span className="text-xs text-foreground/50 sm:text-sm">{club.country}</span>
    </button>
  );
}
