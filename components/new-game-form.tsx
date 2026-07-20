"use client";

import { useActionState } from "react";
import Image from "next/image";
import { createGame } from "@/lib/actions/admin";
import { getDict, plural, words, type Locale } from "@/lib/i18n";
import type { Club } from "@/lib/types";

export function NewGameForm({ clubs, locale }: { clubs: Club[]; locale: Locale }) {
  const t = getDict(locale);
  const [state, formAction, pending] = useActionState(createGame, null);

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
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t.admin.clubsLabel}{" "}
            <span className="text-foreground/50">
              ({plural(locale, clubs.length, words.clubs)})
            </span>
          </span>
          <span className="text-sm text-foreground/50">{t.admin.allClubsNote}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {clubs.map((club) => (
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
