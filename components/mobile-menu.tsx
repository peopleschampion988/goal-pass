"use client";

import { useState } from "react";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function MobileMenu({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={t.nav.menu}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-black/[.12] transition-colors hover:bg-black/[.03]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          {open ? (
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M2 4h12M2 8h12M2 12h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-black/[.08] bg-background shadow-sm">
          <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.03]"
            >
              {t.nav.games}
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.03]"
            >
              {t.nav.leaderboard}
            </Link>
            <div className="mt-2 flex items-center justify-between border-t border-black/[.08] px-2 pt-3">
              <span className="text-xs text-foreground/50">{t.nav.language}</span>
              <LocaleSwitcher locale={locale} />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
