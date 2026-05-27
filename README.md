# MentorMap

> A classroom mentoring analytics prototype for BCA students. A single 5-minute
> survey produces a clear picture of who needs help, where, and how to start the
> conversation.

MentorMap is a full-stack prototype covering all five modules from the brief:

1. **Student Survey** — 18 Likert items across 4 sections plus a 4-question
   programming diagnostic.
2. **Auto-scoring engine** — computes SHI, SEI, ATI, SWI (each 0–100) and DS
   (0–4) with reverse-scoring where appropriate, then assigns a Low / Medium /
   High mentoring tier.
3. **Teacher dashboard** — protected by a simple login; summary cards, a bar
   chart of class averages, and a color-coded student roster.
4. **Per-student mentoring snapshot** — index bars, tier badge, and
   auto-generated mentoring notes (confidence-building, stress support, study
   coaching, lab practice).
5. **ML insights placeholder** — three static cohort cards (Low Confidence,
   High Stress, Skill Gap) populated from the live data set.

The app is seeded with **10 dummy students** so the dashboard is populated on
first load.

## Stack

- **Frontend** — React 18 + Vite, `react-router-dom`, `recharts`.
- **Backend** — Node.js + Express, in-memory store (no DB to install).
- **Design** — navy + white + amber academic palette, mobile-responsive.

## Project layout

```
backend/    # Express API and scoring engine
frontend/   # React + Vite SPA
```

## Run locally

You need Node.js 18+.

```bash
# 1. Backend — http://localhost:4000
cd backend
npm install
npm start

# 2. Frontend — http://localhost:5173 (proxies /api → :4000)
cd ../frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### Prototype credentials

- Teacher login password: `mentor123` (override with `TEACHER_PASSWORD` env var).
- Teacher routes are gated by a static bearer token returned at login. This is
  deliberately simple for a prototype — do not ship as-is.

## Scoring rules

| Index | Items | Scale | Notes |
|-------|-------|-------|-------|
| SHI — Study Habits | 5 Likert | 0–100 | Plain average, rescaled from 1–5 to 0–100. |
| SEI — Self-Efficacy | 5 Likert | 0–100 | Items 3 and 5 are reverse-scored. |
| ATI — Attention/Thinking | 4 Likert | 0–100 | Plain average. |
| SWI — Stress & Well-being | 4 Likert | 0–100 | Every item is reverse-scored — higher stress = lower SWI. |
| DS — Diagnostic Skill | 4 MCQs | 0–4 raw | Each correct MCQ is +1. |

**Risk count** = number of indices below their threshold (SHI<60, SEI<60,
ATI<60, SWI<60, DS<2).

**Mentoring tier**

- `Low` — risk count 0–1
- `Medium` — risk count 2–3
- `High` — risk count 4–5

## API surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | — | Health probe. |
| GET | `/api/survey/schema` | — | Survey questions (correct answers stripped). |
| POST | `/api/survey/submit` | — | Submit responses, returns scored snapshot. |
| POST | `/api/auth/teacher-login` | — | Exchange password for bearer token. |
| GET | `/api/students` | teacher | Roster + class summary. |
| GET | `/api/students/:id` | teacher | Full student record. |
| GET | `/api/ml/clusters` | teacher | Static cluster placeholder. |

## Known prototype limitations

- In-memory store — data is lost on backend restart.
- Static bearer token — no per-user sessions, no expiry, no CSRF.
- ML insights are deterministic bucketing, not a real model.
