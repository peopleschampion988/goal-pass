"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminToken, requireAdmin } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";
import type { GameStatus } from "@/lib/types";

export type FormState = { error: string } | null;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD is not configured on the server." };

  // Hash both sides so timingSafeEqual gets equal-length buffers.
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) return { error: "Wrong password." };

  (await cookies()).set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function createGame(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "clubs");
  const position = String(formData.get("position") ?? "");
  if (!name) return { error: "Game name is required." };
  if (kind !== "clubs" && kind !== "players") return { error: "Invalid game type." };
  if (position && !["GK", "DF", "MF", "FW"].includes(position)) {
    return { error: "Invalid position." };
  }

  const supabase = getSupabase();
  const { error: gameError } = await supabase.from("games").insert({
    name,
    kind,
    position: kind === "players" && position ? position : null,
  });
  if (gameError) return { error: gameError.message };

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function setGameStatus(gameId: string, status: GameStatus): Promise<void> {
  await requireAdmin();

  const supabase = getSupabase();
  const { error } = await supabase.from("games").update({ status }).eq("id", gameId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
}
