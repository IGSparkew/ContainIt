# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is ContainIt

Full-stack Docker management web app that lets users spin up database containers (PostgreSQL, MySQL, MongoDB, Redis) through a UI without deep Docker knowledge. Frontend is a Svelte SPA; backend is a Hono/Node.js API that talks to Docker via dockerode.

## Development Commands

### Backend (`backend/`)
```bash
npm install
npm run dev      # tsx watch — hot reload on port 3000
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled output
```

### Frontend (`frontend/`)
```bash
npm install
npm run dev      # Vite dev server on port 5173 (proxies /api → localhost:3000)
npm run build    # Production build → dist/
npm run check    # svelte-check + TypeScript type checking
```

### Docker
```bash
docker-compose up          # Full stack on port 3000
docker build .             # Multi-stage production image
```

No test runner is configured in this project.

## Architecture

### Request flow
```
Browser → Svelte stores/api clients
       → GET/POST /api/* (Vite proxy in dev, same origin in prod)
       → Hono routes (backend/src/routes/)
       → Controllers (backend/src/controller/)  — HTTP glue, Zod validation
       → Services (backend/src/services/)       — business logic
       → DockerService (dockerode) + DbService (lowdb → data/db.json)
```

### Backend key files
- `backend/src/index.ts` — Hono server entry, middleware, route registration
- `backend/src/registrer.ts` — tsyringe DI container registrations (singletons)
- `backend/src/services/dockerService.ts` — all Docker operations (pull image, create/start/stop/delete container, stats)
- `backend/src/services/dbService.ts` — lowdb wrapper; persists to `data/db.json`
- `backend/src/services/instanceService.ts` — CRUD for container instances
- `backend/src/services/validationService.ts` — port range/availability, password strength, name uniqueness, supported images
- `backend/src/services/volumesService.ts` — volume lifecycle (orphan, re-attach, delete)

### Frontend key files
- `frontend/src/App.svelte` — root layout + navbar
- `frontend/src/stores/` — reactive Svelte stores (`instanceStore`, `storeModal`, `volumeStore`)
- `frontend/src/api/` — fetch wrapper classes (`ServiceInstanceApi`, `ServiceVolumeApi`)
- `frontend/src/components/` — UI components (InstanceTable, InstanceModal, ConfirmDeleteModal, …)

### Dependency injection
Services use [tsyringe](https://github.com/microsoft/tsyringe) with `@injectable()` / `@inject()` decorators. New services must be registered as singletons in `backend/src/registrer.ts` before they can be injected into controllers.

### Persistence
`data/db.json` (lowdb) stores two collections: `instances` (container metadata) and `volumes` (volume lifecycle state). The file is bind-mounted in Docker so data survives restarts.

### Environment variables
Copy `.env.exemple` to `.env`. Key variables:
- `DOCKER_SOCKET` — Unix socket path (default `/var/run/docker.sock`; Windows: `//./pipe/docker_engine`)
- `DOCKER_HOST` / `DOCKER_PORT` — alternative TCP connection

### Production build
Multi-stage Dockerfile: (1) build Svelte → static files, (2) compile backend TypeScript, (3) final Node Alpine image serves static SPA and API on port 3000.