"use client";

import { useState } from "react";

type Props = {
  title: string;
  text: string;
  shareLabel: string;
  copiedLabel: string;
};

// Native share sheet where available (mobile), clipboard fallback elsewhere,
// plus direct links to the platforms our audience actually uses.
export function ShareButtons({ title, text, shareLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user closed the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing to do
    }
  }

  function openPlatform(buildUrl: (text: string, url: string) => string) {
    const url = window.location.href;
    window.open(buildUrl(encodeURIComponent(text), encodeURIComponent(url)), "_blank", "noopener");
  }

  const pillClass =
    "cursor-pointer rounded-full border border-black/[.12] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.03]";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={share} className={pillClass}>
        {copied ? `✓ ${copiedLabel}` : `↗ ${shareLabel}`}
      </button>
      <button
        type="button"
        onClick={() => openPlatform((t, u) => `https://t.me/share/url?url=${u}&text=${t}`)}
        className={pillClass}
      >
        Telegram
      </button>
      <button
        type="button"
        onClick={() => openPlatform((t, u) => `https://wa.me/?text=${t}%20${u}`)}
        className={pillClass}
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => openPlatform((t, u) => `https://x.com/intent/post?text=${t}&url=${u}`)}
        className={pillClass}
      >
        X
      </button>
    </div>
  );
}
