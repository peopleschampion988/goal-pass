import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Club Duels",
  description: "Pick your favorite football club, duel by duel",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-black/[.08] bg-background/95">
          <div className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              ⚽ Club Duels
            </Link>
            <div className="hidden items-center gap-5 sm:flex">
              <nav className="flex items-center gap-4 text-sm text-foreground/60">
                <Link href="/" className="transition-colors hover:text-foreground">
                  {t.nav.games}
                </Link>
                <Link href="/leaderboard" className="transition-colors hover:text-foreground">
                  {t.nav.leaderboard}
                </Link>
              </nav>
              <LocaleSwitcher locale={locale} />
            </div>
            <MobileMenu locale={locale} />
          </div>
        </header>
        {children}
        <footer className="border-t border-black/[.08] py-6 text-center text-xs text-foreground/45">
          {t.footer}
        </footer>
      </body>
    </html>
  );
}
