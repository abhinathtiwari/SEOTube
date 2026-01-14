# SEOTube

SEOTube is a developer tool that helps YouTube creators find underperforming videos and automatically SEO-optimize their metadata (title, description, tags, category). The project combines scheduled (cron) and on-demand optimization powered by AI, integrates with YouTube OAuth, sends email notifications, and provides a web UI for managing optimizations and user settings.

**Tech stack**: Node.js + TypeScript (backend), Vite + React + TypeScript (frontend), MongoDB, YouTube OAuth, OpenAI/Gemini (AI), Resend (email)

**Repository layout**
- `backend/` — Express/TS API server, cron jobs, YouTube integrations, and worker logic.
- `frontend/` — Vite + React app (TypeScript) providing the UI for authentication, home, videos, and user settings.

**Important features (high level)**
- Automatic SEO optimization: scheduled cron job detects underperforming videos and updates their metadata using AI-generated suggestions.
- On-demand optimization: optimize individual videos from the UI.
- AI-based analysis: generates channel-level advice and video ideas based on recent uploads.
- Email notifications: users are emailed when optimizations complete and when reminder/consistency alerts fire.
- Auth & security: JWT-based auth stored in cookies, password hashing with bcrypt, and YouTube OAuth for channel access.
- Account management: users can pause automatic updates and delete their account (revoking permissions).

**Architecture & components**
- Backend: `src/app.ts`, `src/server.ts`, route modules in `src/routes/` (auth, youtube, ai, user, cron triggers), cron jobs in `src/jobs/`.
- Frontend: React pages located in `frontend/src/pages/` and common components in `frontend/src/components/`.
- DB: MongoDB connection configured in `backend/src/config/db.ts`.
- AI: Uses OpenAI / Gemini keys to generate SEO metadata and content suggestions.
- Email: Resend is used to send transactional mails (on optimization completion and reminders).

**Environment variables**
Copy the example env files and fill values before running:

- Backend: copy `backend/.example.env` to `backend/.env` and populate values.
  Important variables (fill appropriately):
  - `PORT` — backend port (default 3000)
  - `MONGO_URI` — MongoDB connection string
  - `YT_CLIENT_ID` / `YT_CLIENT_SECRET` — Google OAuth credentials
  - `OPENAI_KEY` / `GEMINI_API_KEY` — AI API keys
  - `JWT_SECRET`, `REFRESH_TOKEN_SECRET` — token secrets
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — email sending credentials
  - `FRONTEND_BASE` — frontend base URL (used for callbacks/links)
  - `CRON_TIME` / `CRON_TIME2` — cron schedule expressions for optimization/reminders
  - `NUMBER_OF_VIDEOS` — number of videos processed per run
  - `REMINDER_THRESHOLD_DAYS` — days since last upload to trigger reminders

- Frontend: copy `frontend/.example.env.com` to `frontend/.env` and set:
  - `BACKEND_BASE` — backend API base URL (e.g., `http://localhost:3000`)

Note: Be careful to keep secrets out of source control. Use a secure vault for production secrets.

**Setup & running (local development)**
Prerequisites:
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB running (local or hosted)

Backend (API)

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create `.env` by copying the example and populate values:

```bash
copy .example.env .env
# then edit backend/.env to add secrets
```

4. Start the dev server:

```bash
npm run dev
```

By default the backend listens on the `PORT` value (example: `3000`). Cron jobs that perform optimization and reminders run as part of the backend process (see `src/jobs/`).

Frontend (Web UI)

1. Open a terminal in `frontend/`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create `.env` by copying the example and set `BACKEND_BASE`:

```bash
copy .example.env.com .env
# then edit frontend/.env to point to the backend API
```

4. Start the dev server:

```bash
npm run dev
```

The frontend typically runs on Vite's default port (e.g., `5173`). Configure `FRONTEND_BASE` (backend `.env`) if used for OAuth or callbacks.

**Key API surfaces (overview)**
- Authentication: endpoints for signup/login/refresh and cookie-based JWT flows (routes implemented in `src/routes/authUser.routes.ts`).
- YouTube integration: routes to fetch and manage videos, trigger optimizations, and handle OAuth (`src/routes/authYoutube.routes.ts`, `src/routes/youtube.routes.ts`).
- AI endpoints: helpers to request AI-generated titles/descriptions/tags and channel advice (`src/routes/ai.routes.ts`).
- User management: profile, pause/resume auto-updates, delete account (`src/routes/user.routes.ts`).
- Cron controls: some cron endpoints and triggers are available for testing or manual runs (`src/routes/youtube.cron.routes.ts`).

Refer to the route files under `backend/src/routes/` for exact endpoints and request/response shapes.

**Operational notes**
- Cron scheduling: `CRON_TIME`/`CRON_TIME2` control when optimization and reminder jobs run. In dev, you may set them to frequent schedules for testing.
- AI usage: AI calls consume tokens — the system minimizes calls by performing analysis only when new videos appear and by batching operations.
- Emails: ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set for notification delivery.
- YouTube scopes: set correct OAuth credentials and ensure the OAuth consent and redirect URIs are configured in Google Cloud console.

**Security & privacy**
- Passwords are hashed using `bcrypt`.
- Authentication tokens are stored in cookies (not in localStorage).
- When a user deletes their account the service attempts to revoke granted YouTube permissions.

**Troubleshooting**
- If server fails to start, check `backend/.env` for missing keys (Mongo URI, JWT secrets, OAuth credentials).
- Confirm MongoDB connectivity from the `MONGO_URI` value.
- For email issues verify `RESEND_API_KEY` and timestamps in logs for job runs.

**Contributing**
- Open a PR with focused changes. Run linters/tests before committing.

---
Created to help YouTube creators automate metadata SEO improvements and provide actionable channel guidance.
