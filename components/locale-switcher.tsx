"use client";

import { locales, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`cursor-pointer rounded-full px-2 py-1 text-xs font-medium uppercase transition-colors ${
            l === locale
              ? "bg-foreground text-background"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
