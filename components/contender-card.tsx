import Image from "next/image";
import type { Contender } from "@/lib/types";

export type DuelResult = "win" | "lose" | null;

const AVATAR_COLORS = [
  "bg-amber-500/15 text-amber-700",
  "bg-sky-500/15 text-sky-700",
  "bg-emerald-500/15 text-emerald-700",
  "bg-violet-500/15 text-violet-700",
  "bg-rose-500/15 text-rose-700",
];

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ContenderImage({
  name,
  imageSrc,
  className,
  textClassName = "text-2xl",
}: {
  name: string;
  imageSrc: string | null;
  className: string;
  textClassName?: string;
}) {
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={name}
        width={512}
        height={512}
        className={`${className} object-contain`}
      />
    );
  }
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return (
    <span
      className={`${className} ${color} ${textClassName} grid place-items-center rounded-full font-bold`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function ContenderCard({
  contender,
  onPick,
  result = null,
}: {
  contender: Contender;
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
      <ContenderImage
        name={contender.name}
        imageSrc={contender.imageSrc}
        className="h-20 w-20 sm:h-36 sm:w-36"
        textClassName="text-2xl sm:text-4xl"
      />
      <span className="text-center text-sm font-semibold leading-tight sm:text-lg">
        {contender.name}
      </span>
      <span className="text-xs text-foreground/50 sm:text-sm">{contender.subtitle}</span>
    </button>
  );
}
