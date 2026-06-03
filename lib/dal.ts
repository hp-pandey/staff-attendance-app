import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Thrown when a request has no authenticated user.
 * Route handlers catch this via `handleAuthError` to return a 401.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Thrown when an authenticated user lacks the required role. */
export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/**
 * Returns the current user's id, or throws UnauthorizedError.
 * Call this at the top of every protected route handler.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}

/**
 * Returns the current admin user's id, or throws. UnauthorizedError (401) if
 * not signed in, ForbiddenError (403) if signed in without the admin role.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  if (session.user.role !== "admin") throw new ForbiddenError();
  return { userId: session.user.id };
}

/**
 * Maps a thrown error to a JSON response. Use in a catch block so route
 * handlers can `await requireUserId()` / `requireAdmin()` without manual plumbing.
 */
export function handleAuthError(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  throw err;
}
