"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { createGame } from "@/lib/actions/admin";
import { getDict, plural, words, type Locale } from "@/lib/i18n";
import type { Club, GameKind, Player, Position } from "@/lib/types";
import { ContenderImage } from "@/components/contender-card";

const POSITIONS: Position[] = ["GK", "DF", "MF", "FW"];

export function NewGameForm({
  clubs,
  players,
  locale,
}: {
  clubs: Club[];
  players: Player[];
  locale: Locale;
}) {
  const t = getDict(locale);
  const [state, formAction, pending] = useActionState(createGame, null);
  const [kind, setKind] = useState<GameKind>("clubs");
  const [position, setPosition] = useState<Position | "">("");

  const pool = kind === "players" ? players.filter((p) => !position || p.position === position) : [];

  const chipClass = (active: boolean) =>
    `cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active ? "border-foreground bg-black/[.04]" : "border-black/[.12] hover:border-black/30"
    }`;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.admin.gameName}</span>
        <input
          type="text"
          name="name"
          placeholder={t.admin.gameNamePlaceholder}
          required
          className="rounded-xl border border-black/[.12] bg-transparent px-4 py-3 outline-none transition-colors focus:border-black/40"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.admin.kindLabel}</span>
        <input type="hidden" name="kind" value={kind} />
        <div className="flex flex-wrap gap-2">
          {(["clubs", "players"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={chipClass(kind === k)}
            >
              {t.kinds[k]}
            </button>
          ))}
        </div>
      </div>

      {kind === "players" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t.admin.positionLabel}</span>
          <input type="hidden" name="position" value={position} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPosition("")} className={chipClass(position === "")}>
              {t.admin.positionAll}
            </button>
            {POSITIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPosition(p)}
                className={chipClass(position === p)}
              >
                {t.positions[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">
            {kind === "clubs" ? t.admin.clubsLabel : t.admin.playersLabel}{" "}
            <span className="text-foreground/50">
              (
              {kind === "clubs"
                ? plural(locale, clubs.length, words.clubs)
                : plural(locale, pool.length, words.players)}
              )
            </span>
          </span>
          <span className="text-right text-sm text-foreground/50">
            {kind === "clubs" ? t.admin.allClubsNote : t.admin.allPlayersNote}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {kind === "clubs"
            ? clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center gap-2 rounded-xl border border-black/[.12] p-3 text-sm"
                >
                  <Image
                    src={`/club_logos/${club.logo_path}`}
                    alt=""
                    width={512}
                    height={512}
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <span className="truncate">{club.name}</span>
                </div>
              ))
            : pool.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 rounded-xl border border-black/[.12] p-3 text-sm"
                >
                  <ContenderImage
                    name={player.name}
                    imageSrc={player.photo_path ? `/player_photos/${player.photo_path}` : null}
                    className="h-8 w-8 shrink-0"
                    textClassName="text-[10px]"
                  />
                  <span className="min-w-0 flex-1 truncate">{player.name}</span>
                  <span className="shrink-0 text-xs text-foreground/45">{player.position}</span>
                </div>
              ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-3 font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? t.admin.creating : t.admin.create}
      </button>
    </form>
  );
}
