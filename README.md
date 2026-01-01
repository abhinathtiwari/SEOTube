# SEOTube

SEOTube is an automated YouTube SEO optimizer that analyzes a user's channel, generates SEO-optimized titles, descriptions and tags using a generative AI model, updates videos through the YouTube API, and notifies users by email. It's built with a TypeScript Node.js backend and a React + Vite frontend.

**Tech stack**
- Backend: Node.js, Express, TypeScript, Mongoose (MongoDB)
- Frontend: React, Vite, TypeScript
- AI: Google Generative AI (Gemini)
- Email: Resend

## Features
- Connect a YouTube channel via Google OAuth
- Periodic cron job to analyze least-performing videos
- AI-generated SEO improvements (title, description, tags)
- Automatic updates to video metadata via YouTube API
- Email notifications when updates are applied

## Project layout
- `backend/`: Express API and cron job
  - `src/app.ts` - Express app and route registrations
  - `src/server.ts` - app bootstrap, DB connect, and cron start
  - `src/config/` - configuration helpers (MongoDB, YouTube OAuth)
  - `src/routes/` - API routes (`/auth`, `/youtube`, `/youtubecron`, `/ai`, `/auth/user`)
  - `src/jobs/cron.job.ts` - cron worker that runs SEO pipeline
  - `src/utils/` - helpers (email, prompts, middlewares)
- `frontend/`: React single-page app (Vite)

## Environment variables
Create a `.env` file in `backend/` with the following variables:

- `MONGO_URI` - MongoDB connection string
- `PORT` - Backend server port (e.g. `3000`)
- `YT_CLIENT_ID` - Google OAuth client ID
- `YT_CLIENT_SECRET` - Google OAuth client secret
- `FRONTEND_BASE` - Frontend base URL (e.g. `http://localhost:5173`)
- `JWT_SECRET` - Secret used to sign auth JWTs
- `RESEND_API_KEY` - API key for Resend email service
- `GEMINI_API_KEY` - API key for Google Generative AI (Gemini)
- `CRON_TIME` - Cron schedule expression (e.g. `0 */6 * * *`)
- `NUMBER_OF_VIDEOS` - Number of worst-performing videos to analyze per channel

Notes:
- The Google OAuth redirect URI used by the app is `http://localhost:3000/auth/youtube/callback`. Make sure this is registered in your Google Cloud OAuth credentials.
- The backend serves static files from `public/` and expects the frontend to run on `http://localhost:5173` by default (CORS configured accordingly).

## Quick start (development)
Prerequisites: Node.js (16+ recommended), npm or yarn, a MongoDB instance.

1. Backend

```bash
cd backend
npm install
# create .env with the variables above
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173` and the backend listens on the port set in `PORT` (default `3000` in many local setups).

## How it works (high level)
1. A user signs up / logs in to the frontend and connects their YouTube account via Google OAuth. The backend stores a refresh token and channel ID on the user record.
2. A periodic cron job (configured via `CRON_TIME`) finds users with refresh tokens, fetches analytics for their channel, selects the least-performing videos, and builds a JSON prompt.
3. The prompt is sent to the Gemini model via the `/ai/run` endpoint; the returned structured JSON contains new titles, descriptions and tags.
4. The backend calls YouTube APIs to update the video metadata using the stored refresh token.
5. After updates, the backend sends a notification email via Resend.

## Important endpoints (backend)
- `POST /ai/run` - Run the AI generation with a `prompt` body.
- `GET /auth/youtube` - Start Google OAuth flow (requires logged-in user).
- `GET /auth/youtube/callback` - OAuth callback that stores refresh token and channel ID.
- `POST /youtubecron/analytics` - Internal endpoint used by the cron worker to fetch analytics for a channel (accepts `{ refreshToken }`).
- `PUT /youtube/update/:videoId` - Update a video (used internally by cron workflow).

## Notes for deployment
- Ensure secure storage of secrets (`GEMINI_API_KEY`, `YT_CLIENT_SECRET`, `RESEND_API_KEY`, `JWT_SECRET`, `MONGO_URI`).
- Update `FRONTEND_BASE` to your production frontend origin and add that origin to CORS in `src/app.ts` if changed.
- Register proper OAuth redirect URIs in Google Cloud (production callback differs from local).