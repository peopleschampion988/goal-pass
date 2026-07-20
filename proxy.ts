import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

// UX gate for /admin — real enforcement lives in requireAdmin() inside every
// admin server action and page, since actions are directly POSTable.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD ?? "";
  const got = request.cookies.get("admin_session")?.value ?? "";
  const want = createHmac("sha256", password).update("admin-session-v1").digest("hex");
  const ok =
    password.length > 0 &&
    got.length === want.length &&
    timingSafeEqual(Buffer.from(got), Buffer.from(want));

  if (!ok) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
