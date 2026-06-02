# Staff Attendance & Payroll Manager

A full-stack web app to manage staff attendance, advances, and payments — built for small construction/contractor businesses.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/hp-pandey/staff-attendance-app)

---

## Features

| Module | What it does |
|--------|-------------|
| **Dashboard** | Daily snapshot — present / absent / late / overtime counts, total advances & payments |
| **Staff** | Add, edit, deactivate staff with role, phone, work site |
| **Attendance** | One-click status marking per staff per day (present / absent / late / overtime) |
| **Payments** | Record payments per staff member, running total |
| **Advances** | Track salary advances, mark as repaid / pending |
| **Work Sites** | Manage construction sites assigned to staff |

> No salary calculations or costing — purely record-keeping.

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS**
- **Prisma 7** + SQLite (`better-sqlite3`)
- No external database service required

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/hp-pandey/staff-attendance-app
cd staff-attendance-app
npm install

# 2. Set up the database
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma migrate dev

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Railway

Railway gives you a persistent server with disk storage — SQLite works perfectly.

1. Go to [railway.com](https://railway.com) → **New Project → Deploy from GitHub repo**
2. Select this repo (`hp-pandey/staff-attendance-app`)
3. Add these environment variables:
   ```
   DATABASE_URL=file:/data/staff.db
   NODE_ENV=production
   ```
4. **Settings → Volumes** → Add a volume mounted at `/data`
5. Click **Deploy**

Railway automatically runs `prisma migrate deploy && npm start`.
Your app goes live at `https://your-app.up.railway.app` — share that URL with anyone.

---

## Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `file:./dev.db` | `file:/data/staff.db` |
| `NODE_ENV` | `development` | `production` |

---

## Feedback

Open an issue on this repo with your feedback or bug reports.
