"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { submitPlay } from "@/lib/actions/play";
import { getDict, type Locale } from "@/lib/i18n";
import type { Contender } from "@/lib/types";
import { ContenderCard, ContenderImage } from "@/components/contender-card";

type Props = {
  gameId: string;
  gameName: string;
  playId: string; // server-generated; doubles as the idempotency key
  contenders: Contender[]; // pre-shuffled on the server
  leaderboardHref: string; // clubs and players have separate leaderboards
  locale: Locale;
};

type SubmitState = "idle" | "pending" | "done" | "error";

// Gauntlet elimination: the picked contender stays on and faces the next
// challenger until everyone has been faced; the survivor is champion.
export function KnockoutGame({
  gameId,
  gameName,
  playId,
  contenders,
  leaderboardHref,
  locale,
}: Props) {
  const t = getDict(locale);

  const [holder, setHolder] = useState<Contender>(contenders[0]);
  const [challengerIndex, setChallengerIndex] = useState(1);
  const [winnerSide, setWinnerSide] = useState<"holder" | "challenger" | null>(null);
  const [champion, setChampion] = useState<Contender | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [, startTransition] = useTransition();
  const submitted = useRef(false);

  const totalDuels = contenders.length - 1;
  const duelNumber = challengerIndex; // duel k pits the holder against contenders[k]

  function submit(winner: Contender) {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitState("pending");
    startTransition(async () => {
      const result = await submitPlay(playId, gameId, winner.id);
      if (result.ok) {
        setSubmitState("done");
      } else {
        submitted.current = false;
        setSubmitError(result.error);
        setSubmitState("error");
      }
    });
  }

  function advance(winner: Contender) {
    setWinnerSide(null);
    if (challengerIndex + 1 >= contenders.length) {
      setChampion(winner);
      submit(winner);
      return;
    }
    setHolder(winner);
    setChallengerIndex((i) => i + 1);
  }

  // Show the win/lose effect briefly, then bring in the next challenger.
  function pick(winner: Contender) {
    if (champion || winnerSide) return;
    setWinnerSide(winner.id === holder.id ? "holder" : "challenger");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => advance(winner), reducedMotion ? 0 : 500);
  }

  if (champion) {
    return (
      <div className="champion-pop mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-black/[.12] px-8 py-10">
          <span className="text-sm font-medium text-foreground/60">🏆 {t.play.champion}</span>
          <ContenderImage
            name={champion.name}
            imageSrc={champion.imageSrc}
            className="h-32 w-32"
            textClassName="text-4xl"
          />
          <span className="max-w-full break-words text-2xl font-bold sm:text-3xl">
            {champion.name}
          </span>
          <span className="text-sm">
            {submitState === "pending" && (
              <span className="text-foreground/60">{t.play.counting}</span>
            )}
            {submitState === "done" && <span className="text-green-600">{t.play.counted}</span>}
            {submitState === "error" && (
              <span className="text-red-500">
                {t.play.submitError} {submitError}
              </span>
            )}
          </span>
          {submitState === "error" && (
            <button
              type="button"
              onClick={() => submit(champion)}
              className="rounded-full border border-black/[.12] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.03]"
            >
              {t.play.retry}
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={leaderboardHref}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            {t.play.viewLeaderboard}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-black/[.12] px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-black/[.03] hover:text-foreground"
          >
            {t.play.backToGames}
          </Link>
        </div>
      </div>
    );
  }

  const challenger = contenders[challengerIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="w-fit rounded-full border border-black/[.12] px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-black/[.03] hover:text-foreground"
        >
          {t.play.back}
        </Link>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground/55">{t.play.eyebrow}</span>
          <h1 className="break-words text-xl font-bold sm:text-2xl">{gameName}</h1>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm text-foreground/60">
            <span className="shrink-0 font-mono">
              {t.play.duel} {duelNumber} / {totalDuels}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-black/[.08]">
            <div
              className="h-full rounded-full bg-foreground transition-[width] duration-300"
              style={{ width: `${((duelNumber - 1) / totalDuels) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-foreground/60">{t.play.tap}</p>

      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4 ${
          winnerSide ? "pointer-events-none" : ""
        }`}
      >
        <div key={holder.id} className="rise-in relative">
          <ContenderCard
            contender={holder}
            onPick={() => pick(holder)}
            result={winnerSide ? (winnerSide === "holder" ? "win" : "lose") : null}
          />
        </div>
        <span className="z-10 grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border-2 border-foreground bg-background text-xs font-bold sm:h-12 sm:w-12 sm:text-sm">
          VS
        </span>
        <div key={challenger.id} className="slide-in">
          <ContenderCard
            contender={challenger}
            onPick={() => pick(challenger)}
            result={winnerSide ? (winnerSide === "challenger" ? "win" : "lose") : null}
          />
        </div>
      </div>
    </div>
  );
}
