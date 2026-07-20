"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/admin";
import { getDict, type Locale } from "@/lib/i18n";

export function LoginForm({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <input
        type="password"
        name="password"
        placeholder={t.login.password}
        required
        autoFocus
        className="rounded-xl border border-black/[.12] bg-transparent px-4 py-3 outline-none transition-colors focus:border-black/40"
      />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-3 font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? t.login.signingIn : t.login.signIn}
      </button>
    </form>
  );
}
