/**
 * Returns the set of admin emails from the ADMIN_EMAILS env var
 * (comma-separated, case-insensitive).
 */
export function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** True if the given email is on the admin allowlist. */
export function isAllowlistedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase());
}
