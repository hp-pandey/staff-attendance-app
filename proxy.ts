import { NextRequest, NextResponse } from "next/server";

// Public routes that an unauthenticated user is allowed to reach.
const PUBLIC_PATHS = ["/login", "/register"];

// Auth.js session cookie names (dev vs. production "__Secure-" prefix).
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

/**
 * Optimistic auth gate (Node runtime). We only check for the presence of a
 * session cookie here for redirect UX — real authorization is enforced in
 * every API route via `requireUserId()` and on the page via `auth()`.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  if (!hasSession && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except API, Next internals, and PWA/static assets.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon-192.png|icon-512.png).*)",
  ],
};
