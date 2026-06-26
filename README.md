# CoachCRM

A full-stack coaching management platform built for **Mumkin**, a real coaching company based in Riyadh, Saudi Arabia. Built as the SE 324 (Web Application Development) course project at Alfaisal University.

**🔗 Live demo:** https://mellifluous-kangaroo-74a94a.netlify.app

| Role | Email | Password |
|------|-------|----------|
| Coach | `sarah@coachcrm.com` | `password123` |
| Client | `ahmed@client.com` | `password123` |

> This is a live demo connected to a real database — feel free to click around. Changes persist but the data can be reset on request.

---

## What it does

CoachCRM gives a coach a single place to manage every client relationship — goals, progress, sessions, and messaging — while giving each client a simplified, read-only view of their own coaching journey.

**Coach side**
- Dashboard with live stats (active clients, goals, pending actions, upcoming sessions)
- Client profiles with goals, session history, and free-form coaching notes
- Goal tracking with progress bars, action items, and a confidence-scored progress timeline
- Session scheduling with approve/reject workflow and post-session notes
- Direct messaging with read receipts
- Notifications feed

**Client side**
- Personalized dashboard (next session, pending actions, active goals)
- Read-only view of sessions, goals, and assigned action items
- Messaging with their assigned coach

The app is fully responsive — the sidebar collapses into a mobile hamburger menu, and the messaging UI switches to a single-pane view with a back button on small screens.

---

## Tech stack

**Frontend:** React 18, Vite, React Router · deployed on Netlify
**Backend:** PHP 8, PDO/MySQL · deployed on Railway
**Auth:** JWT (stateless, cross-domain) with bcrypt password hashing
**Database:** MySQL — 11 tables modeling the full coaching lifecycle (users, client profiles, goals, action items, progress logs, sessions, session notes, messages, notifications)

Backend repo: [coach-crm-backend](https://github.com/ashar-naveed/coach-crm-backend)

---

## Architecture notes

The frontend and backend are deployed on two different domains (Netlify ↔ Railway). Authentication originally used PHP session cookies, but cross-domain third-party cookie blocking in modern browsers made that unreliable — the app was migrated to stateless JWTs stored client-side, sent via the `Authorization` header on every request.

The PHP backend runs on Railway's FrankenPHP/Caddy runtime, configured via a `composer.json` (to declare the `pdo_mysql` extension Railway's buildpack needs) and an explicit `Caddyfile` so each API route resolves to its matching PHP file rather than a single entry point.

---

## Running locally

```bash
# Backend: requires XAMPP (Apache + MariaDB + PHP)
# Import database/schema.sql then database/seed.sql

cd frontend
npm install
npm run dev
```

Frontend runs at `localhost:5173` and proxies `/api` requests to the local PHP backend.

---

## Author

**Ashar Naveed** — Software Engineering (AI & Big Data), Alfaisal University
