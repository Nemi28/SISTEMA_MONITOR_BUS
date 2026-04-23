# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Development server with hot reload (ts-node + nodemon, port 3000)
npm run build    # Compile TypeScript to ./dist
npm run start    # Run compiled output
npm run seed     # Seed database with initial data
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Infrastructure
```bash
docker-compose up   # Spin up PostgreSQL 16 + backend
```

### Database
```bash
# Run from /backend
npx prisma migrate dev    # Apply pending migrations
npx prisma studio         # Open Prisma GUI
npx prisma generate       # Regenerate Prisma client after schema changes
```

## Environment Setup

**Backend** — copy `backend/.env.example` to `backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sistema_bus"
PORT=3000
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## Architecture

### Overview
Sistema Monitor de Buses is a real-time fleet monitoring system. The backend runs an automatic simulation engine that generates mock GPS/occupancy reports for buses every 5 seconds. The frontend polls the API continuously to display live data.

### Data Flow
```
PostgreSQL ← Prisma ORM ← Express Services ← Controllers ← REST API
                                                               ↑
                                              Frontend (polls every 5–30 s via usePolling hook)
```

### Backend (`backend/src/`)
Follows a module-per-domain structure: each domain (`buses`, `lines`, `stations`, `reports`, `simulation`) has its own `controller.ts`, `service.ts`, and `routes.ts`. All routes are aggregated in `routes/index.ts` and mounted at `/api/*` in `app.ts`.

- `prisma/` — Singleton Prisma client (`prisma.service.ts`)
- `simulation/simulation.service.ts` — Auto-starts on boot; generates a `Reporte` every 5 s for every `Bus` that has an assigned `Ruta`. Coordinates are randomly offset from Lima base coordinates.
- `middlewares/` — Global error handler and 404 catcher

### Frontend (`frontend/src/`)
Single-page app with tab-based navigation in `App.tsx`. Components are in `src/components/`. All API calls go through `src/services/api.ts` (axios, baseURL from `VITE_API_URL`).

- `hooks/usePolling.ts` — Generic polling hook wrapping `setInterval`; used throughout to refresh data without WebSockets
- `components/BusMap.tsx` — Leaflet map; must be rendered client-side only (SSR incompatible)
- `components/ManagementPanel.tsx` — CRUD for buses and routes (líneas)

### Database Schema (Prisma)
- `Ruta` → has many `Estacion` (ordered stops) and many `Bus`
- `Bus` → has many `Reporte` (tracking snapshots)
- `Reporte` — stores lat/lng, speed, passenger count, and auto-calculated `nivelOcupacion` (BAJO/MEDIO/ALTO/LLENO)
- Buses use soft-delete via `estado` field (ACTIVO/INACTIVO/MANTENIMIENTO)

### Key Constraints
- Simulation only creates reports for buses where `rutaId` is set (buses must be assigned to a route)
- `Bus.codigo` and `Bus.placa` have unique constraints
- The backend health check lives at `GET /health`
