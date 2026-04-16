# Trello Clone

Kanban-style project management app inspired by Trello. The project is built as a monorepo with modular architecture:

- `apps/web`: Next.js App Router frontend
- `apps/api`: Express + TypeScript backend with controller/service/repository pattern
- `packages/shared`: Shared types between frontend and backend

No login is required for this assignment build. The app assumes one project workspace and uses seeded sample assignees for card assignment.

## Tech Stack

- Frontend: Next.js, React, TypeScript, dnd-kit
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL on Neon
- Styling: CSS with Trello-like board layout, responsive panels, and theme modes

## Run

1. Install dependencies:
   - `npm install`
2. Set backend environment:
   - Copy `apps/api/.env.example` to `apps/api/.env`
3. Paste your Neon PostgreSQL connection string into `apps/api/.env`:
   - `DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
4. Test PostgreSQL/Neon connectivity:
   - `npm run db:check --workspace @trello/api`
5. Initialize PostgreSQL tables:
   - `npm run db:init --workspace @trello/api`
6. Seed starter board data:
   - `npm run db:seed --workspace @trello/api`
7. Start backend:
   - `npm run dev:api`
8. Start frontend:
   - `npm run dev:web`

Frontend expects backend at `http://localhost:4000/api/v1`.

If `tsx` is blocked on Windows, build the API first and run the compiled scripts:

- `npm run build --workspace @trello/api`
- `node apps/api/dist/db/init-db.js`
- `node apps/api/dist/db/seed.js`

## API Modules (MVC)

The backend now follows a clean MVC structure with separate folders:

- `src/routes`: Express route definitions
- `src/controllers`: HTTP handlers
- `src/services`: Business logic

CRUD endpoints:

- Boards: `/api/v1/boards`
- Lists: `/api/v1/lists`
- Cards: `/api/v1/cards`

## PostgreSQL/Neon Storage Overview

The database stores normalized board structure plus JSON card metadata:

- `users`: seeded assignees only; no authentication flow is exposed in the UI.
- `boards`: board title, description, owner reference, timestamps.
- `board_members`: many-to-many relation between boards and seeded assignees.
- `lists`: lists linked to boards with a numeric `position` for drag ordering.
- `cards`: cards linked to lists with title, description, due date, position, labels, assignees, checklist, comments, and activity stored in `JSONB` columns.

The API repositories translate PostgreSQL rows into frontend-friendly objects. Drag-and-drop updates `position` fields so the same board order is restored after reload.

For deployment, set these environment variables:

- API service: `PORT`, `NODE_ENV=production`, `DATABASE_URL`
- Web service: `NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1`

Neon is recommended for deployment because it provides a hosted PostgreSQL URL, works well with Render/Railway/Vercel-style deployments, and avoids storing project data only on your laptop.
