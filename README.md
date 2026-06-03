# CareerPilot AI

> An AI-powered career guidance web app that helps users discover careers, get personalized roadmaps, find courses, and study with AI.

## Features

- **AI Career Discovery** — Take a quiz and get top 5 career matches with match percentages
- **Personalized Roadmaps** — AI-generated month-by-month learning plans for any career
- **Course Recommendations** — Curated courses from top platforms matched to your goals
- **AI PDF Assistant** — Upload notes for summaries, MCQs, flashcards, and explanations
- **AI Tutor** — ChatGPT-style chat with streaming responses and conversation history
- **Resume Analyzer** — Detailed resume scoring with section analysis, ATS compatibility, and recommendations
- **Project Ideas** — AI-generated portfolio project suggestions based on skill level
- **Dashboard** — Track your progress with saved roadmaps, bookmarks, and activity

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express.js
- **Database:** SQLite + Prisma ORM
- **Auth:** JWT + bcrypt (email/password)
- **AI:** OpenAI GPT-4o-mini
- **UI:** Glassmorphism design, dark theme, purple/violet gradients

## Project Layout

```
backend/        # Express API, Prisma schema, AI routes
frontend/       # React + Vite SPA
```

## Run Locally

You need Node.js 18+.

```bash
# 1. Backend setup
cd backend
npm install
cp .env.example .env  # Add your API keys
npx prisma db push
npm run dev            # → http://localhost:4000

# 2. Frontend setup
cd ../frontend
npm install
npm run dev            # → http://localhost:5173
```

### Environment Variables

Create `backend/.env` with:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
CLIENT_URL="http://localhost:5173"
PORT=4000
```

## Design System

- Background: `#0A0A0F` (near black)
- Primary gradient: `#6C3EF6` → `#A855F7` (violet → purple)
- Card style: Glassmorphism (`bg-white/5`, `backdrop-blur`, `border-white/10`)
- Font: Inter (Google Fonts)
- Animations: Framer Motion fade-in-up, hover scale effects
