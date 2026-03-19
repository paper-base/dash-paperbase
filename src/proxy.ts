import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (previously Middleware) — route-level authentication guard.
 *
 * Checks for the presence of the `auth_session` cookie (set on login/register,
 * cleared on logout) and redirects unauthenticated users away from dashboard routes.
 *
 * NOTE: This cookie is NOT HttpOnly — it is a routing hint, not a security token.
 * The actual JWT is verified by the Django backend on every API call.  Migrating
 * tokens to HttpOnly cookies (served via a /api/auth proxy route) would enable
 * real cryptographic verification at the edge.
 */

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/onboarding",
  "/reset-password",
  "/verify-email",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and static assets.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authSession = request.cookies.get("auth_session");
  const isAuthed = !!authSession?.value;

  if (!isPublicPath(pathname) && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup to the dashboard.
  if (isAuthed && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
