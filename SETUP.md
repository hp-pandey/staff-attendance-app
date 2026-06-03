# Setup: Authentication, Per-User Data & Android APK

This app now requires sign-in (email/password **or** Google), and every user only
sees their own staff, attendance, advances, payments, and work sites.

## 1. Environment variables

Copy `.env.example` → `.env` and fill it in:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<generated>"          # npx auth secret
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="<from Google>"
AUTH_GOOGLE_SECRET="<from Google>"
```

`AUTH_SECRET` was already generated into your local `.env`. Generate a fresh one
anytime with `npx auth secret`.

## 2. Database

```bash
npx prisma migrate dev      # local: creates dev.db + applies migrations
```

The schema adds Auth.js tables (`User`, `Account`, `Session`, `VerificationToken`)
and a `userId` owner column on `WorkSite` and `Staff`. Attendance / Advance /
Payment are scoped through their parent `Staff`.

## 3. Google OAuth (for "Continue with Google")

1. Go to <https://console.cloud.google.com/> → create / pick a project.
2. **APIs & Services → OAuth consent screen** → *External* → add your email as a
   **Test user** (so you can log in before the app is verified).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   *Web application*.
4. **Authorized redirect URIs** — add both:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-prod-domain>/api/auth/callback/google`
5. Copy the **Client ID** and **Client secret** into `.env`
   (`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`).

Email/password login works without any of this; Google is optional.

## 4. Run locally

```bash
npm run dev      # http://localhost:3000  → redirects to /login
```

Register an account, or click **Continue with Google**.

## 5. Deploy (Railway)

The existing `railway.json` runs `prisma migrate deploy && npm start`. In Railway:

1. Add a **Volume** mounted at `/data` (SQLite persistence).
2. Set env vars: `DATABASE_URL=file:/data/staff.db`, `AUTH_SECRET=...`,
   `AUTH_URL=https://<your-app>.up.railway.app`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
3. Add the prod callback URL to the Google credentials (step 3.4).

> ⚠️ If a database already has data from before this change, the migration that
> adds the non-null `userId` will need a backfill or a reset. For a fresh deploy
> there is nothing to do.

## 6. Admin panel

Set `ADMIN_EMAILS` in `.env` (comma-separated). Any account whose email matches
**becomes an admin automatically on next login** and gets a 🛠️ **Admin** link in
the sidebar (also reachable at `/admin`).

```
ADMIN_EMAILS="you@example.com,partner@example.com"
```

From `/admin` an admin can:
- **See storage stats** — total users, per-table counts, and the SQLite DB file size.
- **View every user** with their per-user record counts.
- **Promote / demote** other users (allowlist admins are locked, marked 🔒).
- **Wipe a user's data** — deletes their staff/attendance/advances/payments/work
  sites but keeps the account.
- **Delete a user** — removes the account and cascades **all** their data.

Admins on the `ADMIN_EMAILS` allowlist cannot be demoted or deleted from the UI,
and you cannot delete or change your own account. All `/api/admin/*` endpoints
return 403 for non-admins.

## 7. Build the Android APK (PWA → TWA)

The app is now an installable PWA (`app/manifest.ts`, `public/sw.js`, icons in
`public/`). The APK is a thin wrapper (Trusted Web Activity) around the **deployed
HTTPS site** — it is not an offline app, and data stays on the server per user.

**Easiest — PWABuilder (web):**
1. Deploy (step 5) and confirm the site loads over HTTPS.
2. Go to <https://www.pwabuilder.com>, enter your prod URL, click **Start**.
3. Open the **Android** package options → **Generate Package** → download the
   `.apk` (test) / `.aab` (Play Store) plus the signing key.
4. Install the APK on a device (`adb install app.apk`) or share the file.

**Alternative — Bubblewrap (CLI):** requires JDK 17+ and Android SDK.
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest
bubblewrap build
```

**Optional (hide the URL bar / Play Store):** host the Digital Asset Links file
PWABuilder/Bubblewrap gives you at
`https://<your-domain>/.well-known/assetlinks.json`.
