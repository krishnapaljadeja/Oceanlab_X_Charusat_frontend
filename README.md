# OceanLab Frontend

React + TypeScript single-page app for visualizing repository health, commit narrative, contributor insights, and AI-powered repository assistance.

## Tech Stack

- React 18 + React Router
- Vite
- TypeScript
- Tailwind CSS
- Supabase client auth
- GSAP / Framer Motion / Recharts / React PDF

## Features

- Analyze a GitHub repository and view:
  - project overview and health score
  - phased development timeline
  - contributor breakdown and deep contributor profile pages
  - commit heatmap and activity stats
  - milestone and narrative chapter summaries
- Ask repository questions with context-aware QA
- Generate onboarding guide and documentation artifacts
- View per-user analysis history
- Supabase-based login/signup session flow

## Routes

- `/` home (repo input + analysis trigger)
- `/analyze` analysis dashboard
- `/ingest` repository digest + README tools
- `/onboard` onboarding guide generation
- `/history` user analysis history
- `/contributor/:login` contributor profile
- `/login` and `/signup` auth pages

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running (default `http://localhost:4000`)
- Supabase project for authentication

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in `Frontend/`:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Start development server:

```bash
npm run dev
```

Default local URL is usually `http://localhost:5173`.

## Scripts

- `npm run dev` start Vite development server
- `npm run build` run TypeScript build and bundle production assets
- `npm run preview` preview production build locally
- `npm run lint` run ESLint

## Environment Notes

- `VITE_BACKEND_URL` points to the backend base URL.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for auth actions.
- If Supabase variables are missing, auth methods return configuration errors and protected flows cannot proceed.

## Build and Deploy

1. Build:

```bash
npm run build
```

2. Deploy the generated `dist/` folder with any static hosting provider.

3. Configure production environment variables (`VITE_BACKEND_URL`, Supabase values) in your host.

## Troubleshooting

- Login/signup not working: check Supabase URL/anon key and project auth settings.
- Network errors on analysis: verify backend is running and `VITE_BACKEND_URL` is correct.
- CORS errors: backend `FRONTEND_URL` must match frontend origin.
- Empty user history: history is user-scoped and requires authenticated requests.

## Project Structure

```text
Frontend/
	src/
		components/
		context/
		lib/
		pages/
		App.tsx
		main.tsx
	public/
	index.html
	vite.config.ts
```
