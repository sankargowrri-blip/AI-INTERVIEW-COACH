# AI Interview Coach — Frontend

> **Practice. Improve. Get Hired.**

A complete, professional frontend for the AI Interview Coach platform — built with React, TypeScript, Tailwind CSS v4, and Recharts.

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/**

**Demo login:**
- Email: `alex@example.com`
- Password: `password123`

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| React Router | 6 | Client-side routing |
| Recharts | 2 | Charts and data visualization |
| Lucide React | latest | Icons |
| Vite | 8 | Build tool |

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute, GuestRoute
│   ├── common/        # Button, Input, Card, Badge, ProgressBar, ScoreCard, LoadingState, EmptyState, ErrorState
│   ├── interview/
│   │   └── setup/     # 7 step wizard components + progress indicator
│   └── layout/        # Navbar, AppLayout, PublicLayout, BottomNav
├── context/
│   ├── AuthContext.tsx       # Auth state + login/register/logout
│   └── InterviewContext.tsx  # Full interview setup + session state
├── data/              # Centralized mock data (users, questions, results, progress, roles, companies)
├── pages/
│   ├── auth/          # LoginPage, RegisterPage
│   ├── interview/     # SetupPage, CameraCheck, LiveInterview, Completion, Result, History, HistoryDetail
│   ├── DashboardPage
│   ├── ProfilePage
│   ├── ProgressPage
│   ├── PracticePage
│   ├── ResumePage
│   ├── CompanyPreparationPage
│   └── LandingPage
├── services/          # authService, interviewService, resumeService, progressService
└── types/             # All TypeScript interfaces and types
```

---

## Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Landing Page | Guest only |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/dashboard` | Dashboard | Protected |
| `/profile` | Profile | Protected |
| `/progress` | Progress Dashboard | Protected |
| `/practice` | Practice Questions | Protected |
| `/resume` | Resume Upload + Analysis | Protected |
| `/company-preparation` | Company Prep | Protected |
| `/interview/setup` | Interview Setup Wizard | Protected |
| `/interview/setup/camera-check` | Camera & Mic Check | Protected |
| `/interview/live` | Live Interview | Protected |
| `/interview/completion` | Completion Loading | Protected |
| `/interview/result` | Full Result Report | Protected |
| `/interview/history` | Interview History | Protected |
| `/interview/history/:id` | History Detail | Protected |

---

## Features

- **Landing page** — Hero, How It Works, Features, Interview Types, Career categories, CTA
- **Auth** — Register, Login with frontend validation and mock credentials
- **Dashboard** — Stats cards, performance line chart, strong/weak areas, recent interviews
- **Interview Setup** — 7-step wizard: Experience → Resume → Role → Difficulty → Type → Settings → Ready
- **Resume Upload** — Drag & drop, file validation, mock parsing, invalid/valid states
- **Camera & Mic Check** — Real browser `getUserMedia` API, live camera preview, mic level visualisation
- **Live Interview** — Real-time question flow, AI speaking states, voice waveform, transcript preview, camera feed
- **Result Page** — Score, classification (EXCELLENT/MARVELOUS/GOOD/NOT BAD/BAD/WORST), radar chart, bar charts, breakdown, communication analysis, improvement areas, key points, practice plan
- **History** — Full list, filterable, clickable detail view
- **Progress** — Line charts over time, readiness score, session comparison
- **Practice** — Searchable/filterable question bank with tips and follow-ups
- **Resume Analysis** — ATS score, quality score, improvement suggestions (mock)
- **Company Prep** — Google, Amazon, Microsoft, Infosys, TCS, Zoho — tips and common roles
- **Profile** — Editable name, experience level, preferred role
- **Responsive** — Full mobile layout including bottom nav, mobile interview screen

---

## Future Backend Connection

All services in `src/services/` are structured to swap mock data for real API calls:

```
src/services/authService.ts       →  POST /auth/login, POST /auth/register
src/services/resumeService.ts     →  POST /resume/upload, POST /resume/validate
src/services/interviewService.ts  →  POST /interviews, GET /interviews/{id}/result
src/services/progressService.ts   →  GET /progress
```

Set `VITE_API_URL` in `.env` when the backend is ready.

---

## Build for Production

```bash
npm run build
# Output: dist/
```

Compatible with Vercel (see `vercel.json` for SPA routing).

---

## Important Notes

- All interview evaluations, resume analysis, and AI feedback shown in this frontend are **mock data for demonstration only**
- No real AI, backend, or database is used in this phase
- Camera/microphone access uses real browser APIs but no recording or upload is performed
- Backend (FastAPI + PostgreSQL) will be connected in a future phase
