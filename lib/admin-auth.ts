import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "admin_session";

// Stateless session token derived from the admin password — no extra secret
// env var, and changing ADMIN_PASSWORD invalidates all sessions.
export function adminToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD must be set in .env.local");
  return createHmac("sha256", password).update("admin-session-v1").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const got = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  const want = adminToken();
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
