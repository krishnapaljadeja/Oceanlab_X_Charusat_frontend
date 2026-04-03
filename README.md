# Git History Teller — Frontend

React + TypeScript + Vite frontend for Git History Teller. Enter any public GitHub repository URL and get an AI-generated documentary-style narrative of the project's evolution — complete with phases, milestones, contributor stats, a commit activity heatmap, a health score, and an AI-powered Q&A panel that lets you ask plain-English questions about the repository.

---

## Tech Stack

| Layer       | Technology             |
| ----------- | ---------------------- |
| Framework   | React 18               |
| Language    | TypeScript 5           |
| Build Tool  | Vite 6                 |
| Styling     | Tailwind CSS 3         |
| Routing     | React Router DOM v6    |
| Animations  | GSAP 3 + `@gsap/react` |
| Charts      | Recharts               |
| PDF Export  | `@react-pdf/renderer`  |
| HTTP Client | Axios                  |

---

## Project Structure

```
frontend-react/
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Router setup (/, /analyze, /history)
│   ├── index.css              # Global styles + font imports
│   ├── components/
│   │   ├── CommitHeatmap.tsx      # GitHub-style 52-week commit activity grid
│   │   ├── ContributorSection.tsx
│   │   ├── DataConfidenceBanner.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── FreshnessBanner.tsx    # Staleness indicator + Re-analyze CTA
│   │   ├── HealthScore.tsx
│   │   ├── HistoryCard.tsx        # Card for each saved analysis
│   │   ├── LoadingState.tsx
│   │   ├── MilestoneList.tsx
│   │   ├── NarrativeChapter.tsx
│   │   ├── PdfDocument.tsx        # PDF export layout
│   │   ├── PhasesSection.tsx
│   │   ├── ProjectOverview.tsx
│   │   ├── RepoInput.tsx
│   │   ├── RepoQA.tsx             # Floating AI chat panel (FAB)
│   │   └── Timeline.tsx
│   ├── lib/
│   │   ├── api.ts             # All backend API calls
│   │   ├── timeAgo.ts         # Relative time formatter
│   │   ├── types.ts           # Shared TypeScript interfaces
│   │   └── utils.ts
│   └── pages/
│       ├── HomePage.tsx       # Repo URL input + analysis trigger
│       ├── AnalyzePage.tsx    # Full analysis results view
│       └── HistoryPage.tsx    # List of all previously analyzed repos
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** 18 or higher
- The **backend** running at `http://localhost:4000` (see [backend/README.md](../backend/README.md))

---

## Setup

### 1. Install dependencies

```bash
cd frontend-react
npm install
```

### 2. Configure environment variables _(optional)_

By default the frontend points to `http://localhost:4000`. If your backend is on a different host or port, create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Pages

### `/` — Home

Enter any public GitHub repository URL (e.g. `https://github.com/facebook/react`) and click **Analyze**. The app:

1. Calls `POST /api/analyze` on the backend
2. Shows an animated loading state while the analysis runs (can take 1–3 min for large repos)
3. Stores the result in `sessionStorage` and navigates to `/analyze`

Supports URL params for deep-linking:

- `/?repo=owner/repo` — auto-triggers analysis on load
- `/?repo=owner/repo&force=true` — triggers a **force refresh** (re-analysis)

### `/analyze` — Results

Displays the full analysis with a sticky navbar and the following sections:

| Section                   | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| **FreshnessBanner**       | Shows if the repo has new commits since the last analysis                    |
| **DataConfidenceBanner**  | Data quality indicator based on commit message quality score                 |
| **ProjectOverview**       | Repo stats (stars, forks, language), health score, AI overview text          |
| **The Story**             | AI-generated narrative chapters + architectural observations + current state |
| **Phases**                | Detected development phases with velocity indicators                         |
| **Timeline & Milestones** | Interactive commit timeline + auto-detected project milestones               |
| **Contributors**          | Contributor activity breakdown + AI insights                                 |
| **Commit Activity**       | GitHub-style 52-week heatmap with hover tooltips and stats                   |
| **Health Score**          | Aggregate code health score derived from commit patterns                     |
| **PDF Export**            | Download the full narrative as a formatted PDF                               |

Two floating action buttons are always visible:

- **Scroll-to-top** (bottom-right) — jump back to the top
- **Ask the Repo** (bottom-left) — open the AI Q&A chat panel

### `/history` — Analysis History

Lists all repositories that have been analyzed and stored in the database. Each card shows:

- Repo name, language badge, description
- Star count + commit count
- **View Results** — loads the cached analysis directly (no re-analysis)
- **Re-Analyze** — triggers a fresh analysis through the full loading flow

---

## Features

### Commit Activity Heatmap

A GitHub-style contribution grid rendered with pure CSS Grid + Tailwind — no charting library required.

- 52 columns × 7 rows covering the year of the most recent commit
- Color intensity (5 levels) calculated dynamically based on the maximum single-day commit count
- Month labels positioned above the correct week column
- Day-of-week labels (Mon / Wed / Fri) on the left
- Hover tooltip showing exact date and commit count
- Stats row: total commits, active days, longest streak, current streak, most active day of week, average commits per active day
- Color legend
- Data is derived from the stored analysis summary — no GitHub API call at render time

### AI Q&A (Floating Chat)

A floating chat panel anchored to the bottom-left corner, matching the dark theme of the app.

- **FAB button** — click the chat icon to open/close the panel
- **Suggested questions** — 8 clickable chips shown before the first message (when was it created? most active contributors? CI/CD setup? etc.)
- **Conversation history** — last 5 exchanges are sent to the LLM for context
- **User messages** — yellow `#FFD93D` bubbles, right-aligned
- **AI messages** — dark `#242424` bubbles, left-aligned
- **Typing indicator** — three staggered-bounce dots while waiting
- **Error banner** — dismissible error message on failure
- **Character limit** — 500 characters max; counter appears at > 400
- The LLM is grounded strictly in the stored analysis data — it will not invent information

---

## API Integration

All API calls are in [`src/lib/api.ts`](src/lib/api.ts):

| Function                            | Method | Endpoint                    | Description                        |
| ----------------------------------- | ------ | --------------------------- | ---------------------------------- |
| `analyzeRepo(url)`                  | POST   | `/api/analyze`              | Analyze or return cached result    |
| `refreshRepo(url)`                  | POST   | `/api/analyze/refresh`      | Force a fresh analysis             |
| `fetchHistory()`                    | GET    | `/api/history`              | Fetch all saved analyses           |
| `fetchHeatmap(owner, repo)`         | GET    | `/api/heatmap/:owner/:repo` | Fetch 52-week commit activity grid |
| `askQuestion(owner, repo, q, hist)` | POST   | `/api/qa`                   | Ask an AI question about the repo  |

The backend URL is controlled by `VITE_BACKEND_URL` (defaults to `http://localhost:4000`).

---

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR |
| `npm run build`   | Type-check + build to `dist/`  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

---

## Design System

The UI uses a consistent dark design language:

| Token         | Value                 | Usage                              |
| ------------- | --------------------- | ---------------------------------- |
| Background    | `#0f0f0f`             | Page background                    |
| Surface       | `#1a1a1a`             | Cards, panels                      |
| Surface 2     | `#242424`             | AI message bubbles, input fields   |
| Border        | `#2a2a2a` / `#3a3a3a` | Borders, dividers                  |
| Yellow accent | `#FFD93D`             | Primary CTA, highlights, user chat |
| Green accent  | `#6BCB77`             | Success, up-to-date states         |
| Cyan accent   | `#4CC9F0`             | Language badges, info              |
| Orange accent | `#FF8C42`             | Warnings                           |
| Heading font  | Bebas Neue            | Section titles, buttons, FAB label |
| Body font     | DM Sans               | All body/paragraph text            |

---

## User Flow

```
HomePage (enter URL)
    │
    ▼
Loading animation (1–3 min for large repos)
    │
    ▼
AnalyzePage (full results + FreshnessBanner)
    │
    ├── Floating Q&A chat → askQuestion() → AI answer
    │
    ├── Re-Analyze → HomePage (force=true) → fresh analysis → AnalyzePage
    │
    └── View History → HistoryPage
            │
            ├── View Results → analyzeRepo() (cached) → AnalyzePage
            │
            └── Re-Analyze → HomePage (force=true) → fresh analysis → AnalyzePage
```

---

## Tech Stack

| Layer       | Technology             |
| ----------- | ---------------------- |
| Framework   | React 18               |
| Language    | TypeScript 5           |
| Build Tool  | Vite 6                 |
| Styling     | Tailwind CSS 3         |
| Routing     | React Router DOM v6    |
| Animations  | GSAP 3 + `@gsap/react` |
| Charts      | Recharts               |
| PDF Export  | `@react-pdf/renderer`  |
| HTTP Client | Axios                  |

---

## Project Structure

```
frontend-react/
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Router setup (/, /analyze, /history)
│   ├── index.css              # Global styles + font imports
│   ├── components/
│   │   ├── ContributorSection.tsx
│   │   ├── DataConfidenceBanner.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── FreshnessBanner.tsx    # Staleness indicator + Re-analyze CTA
│   │   ├── HealthScore.tsx
│   │   ├── HistoryCard.tsx        # Card for each saved analysis
│   │   ├── LoadingState.tsx
│   │   ├── MilestoneList.tsx
│   │   ├── NarrativeChapter.tsx
│   │   ├── PdfDocument.tsx        # PDF export layout
│   │   ├── PhasesSection.tsx
│   │   ├── ProjectOverview.tsx
│   │   ├── RepoInput.tsx
│   │   └── Timeline.tsx
│   ├── lib/
│   │   ├── api.ts             # All backend API calls
│   │   ├── timeAgo.ts         # Relative time formatter
│   │   ├── types.ts           # Shared TypeScript interfaces
│   │   └── utils.ts
│   └── pages/
│       ├── HomePage.tsx       # Repo URL input + analysis trigger
│       ├── AnalyzePage.tsx    # Full analysis results view
│       └── HistoryPage.tsx    # List of all previously analyzed repos
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** 18 or higher
- The **backend** running at `http://localhost:4000` (see [backend/README.md](../backend/README.md))

---

## Setup

### 1. Install dependencies

```bash
cd frontend-react
npm install
```

### 2. Configure environment variables _(optional)_

By default the frontend points to `http://localhost:4000`. If your backend is on a different host or port, create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Pages

### `/` — Home

Enter any public GitHub repository URL (e.g. `https://github.com/facebook/react`) and click **Analyze**. The app:

1. Calls `POST /api/analyze` on the backend
2. Shows an animated loading state while the analysis runs (can take 1–3 min for large repos)
3. Stores the result in `sessionStorage` and navigates to `/analyze`

Supports URL params for deep-linking:

- `/?repo=owner/repo` — auto-triggers analysis on load
- `/?repo=owner/repo&force=true` — triggers a **force refresh** (re-analysis)

### `/analyze` — Results

Displays the full analysis with:

- **Navbar** — New Repo, View History, and tabbed navigation (Overview / Phases / Contributors / Timeline)
- **FreshnessBanner** — shows if the repo has new commits since the last analysis, with a Re-analyze button
- **DataConfidenceBanner** — data quality indicator
- **ProjectOverview** — repo stats, health score, description
- **PhasesSection** — detected development phases
- **ContributorSection** — contributor activity breakdown
- **Timeline** — interactive commit timeline
- **MilestoneList** — auto-detected project milestones
- **PDF Export** — download the full narrative as a PDF

### `/history` — Analysis History

Lists all repositories that have been analyzed and stored in the database. Each card shows:

- Repo name, language badge, description
- Star count + commit count
- **View Results** — loads the cached analysis directly (no re-analysis)
- **Re-Analyze** — triggers a fresh analysis through the full loading flow

---

## API Integration

All API calls are in [`src/lib/api.ts`](src/lib/api.ts):

| Function           | Method | Endpoint               | Description                     |
| ------------------ | ------ | ---------------------- | ------------------------------- |
| `analyzeRepo(url)` | POST   | `/api/analyze`         | Analyze or return cached result |
| `refreshRepo(url)` | POST   | `/api/analyze/refresh` | Force a fresh analysis          |
| `fetchHistory()`   | GET    | `/api/history`         | Fetch all saved analyses        |

The backend URL is controlled by `VITE_BACKEND_URL` (defaults to `http://localhost:4000`).

---

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR |
| `npm run build`   | Type-check + build to `dist/`  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

---

## Design System

The UI uses a consistent dark design language:

| Token         | Value                 | Usage                      |
| ------------- | --------------------- | -------------------------- |
| Background    | `#0f0f0f`             | Page background            |
| Surface       | `#1a1a1a`             | Cards, panels              |
| Border        | `#2a2a2a` / `#3a3a3a` | Borders, dividers          |
| Yellow accent | `#FFD93D`             | Primary CTA, highlights    |
| Green accent  | `#6BCB77`             | Success, up-to-date states |
| Cyan accent   | `#4CC9F0`             | Language badges, info      |
| Orange accent | `#FF8C42`             | Warnings                   |
| Heading font  | Bebas Neue            | Section titles, buttons    |
| Body font     | DM Sans               | All body/paragraph text    |

---

## User Flow

```
HomePage (enter URL)
    │
    ▼
Loading animation (1–3 min for large repos)
    │
    ▼
AnalyzePage (full results + FreshnessBanner)
    │
    ├── Re-Analyze → HomePage (force=true) → fresh analysis → AnalyzePage
    │
    └── View History → HistoryPage
            │
            ├── View Results → analyzeRepo() (cached) → AnalyzePage
            │
            └── Re-Analyze → HomePage (force=true) → fresh analysis → AnalyzePage
```
