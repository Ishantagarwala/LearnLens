# AGENTS.md

## Cursor Cloud specific instructions

MentorMap is a two-package repo (`backend/`, `frontend/`) with no root workspace or Docker. See [README.md](README.md) for scoring rules and API details.

### Services (both required for E2E)

| Service | Directory | Dev command | URL |
|---------|-----------|-------------|-----|
| Backend API | `backend/` | `npm start` or `npm run dev` (`--watch`) | http://localhost:4000 |
| Frontend SPA | `frontend/` | `npm run dev` | http://localhost:5173 |

Vite proxies `/api` to port 4000 (`frontend/vite.config.js`). The frontend alone is not enough for real flows.

### Startup notes

- **Node.js 18+** required (no `.nvmrc` in repo).
- Backend uses an **in-memory store**; data resets when the backend process restarts. Ten seed students load on startup; new submissions persist until restart.
- Teacher login: password `mentor123` (override with `TEACHER_PASSWORD`). Returns static bearer `mentormap-teacher-token`.
- Optional backend env: `PORT` (default `4000`).

### Verification

- Health: `curl http://localhost:4000/api/health`
- No `lint` or `test` scripts in either `package.json`.
- Production build check: `cd frontend && npm run build` (still needs backend running for API unless you add separate hosting).

### tmux (long-running dev servers)

If you need persistent dev servers, use descriptive session names, e.g. `mentormap-backend` and `mentormap-frontend`, with working directories set to each package before running `npm start` / `npm run dev`.
