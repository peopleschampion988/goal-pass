import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { LoginForm } from "@/components/login-form";

export default async function AdminLoginPage() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <span className="text-sm font-medium text-foreground/55">{t.login.staffOnly}</span>
      <h1 className="mt-1 text-2xl font-bold">{t.login.title}</h1>
      <LoginForm locale={locale} />
      <Link
        href="/"
        className="mt-6 text-center text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        {t.login.back}
      </Link>
    </main>
  );
}
