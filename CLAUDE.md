# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is ContainIt

Full-stack Docker management web app that lets users spin up database containers (PostgreSQL, MySQL, MongoDB, Redis) through a UI without deep Docker knowledge. Frontend is a Svelte SPA; backend is a Hono/Node.js API that talks to Docker via dockerode.

## Development Commands

### Backend (`backend/`)
```bash
npm install
npm run dev           # tsx watch — hot reload on port 3000
npm run build         # Compile TypeScript → dist/
npm start             # Run compiled output
npm run test          # Run unit tests (Vitest)
npm run test:watch    # Vitest in watch mode
npm run test:coverage # Coverage report (v8)
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

## Architecture

The backend follows **Clean Architecture** with four layers:

```
domain/          — models, no dependencies
application/     — use cases + repository interfaces
infrastructure/  — implementations (lowdb, dockerode, composers)
presentation/    — Hono routes, controllers, Zod schemas, HTTP helpers
```

### Request flow
```
Browser → Svelte stores/api clients
       → GET/POST /api/* (Vite proxy in dev, same origin in prod)
       → Hono routes  (backend/src/presentation/hono/routers/)
       → honoAdapter  (backend/src/presentation/adapters/honoAdapter.ts)
       → Controllers  (backend/src/presentation/http/controllers/)  — HTTP glue
       → Use cases    (backend/src/application/usecases/**/impl/)   — business logic
       → Repositories (backend/src/application/repositories/I*.ts) — interfaces
       → Infrastructure implementations (lowdb, DockerPort)
```

### Backend key files

#### Entry point
- `backend/src/presentation/hono/app.ts` — Hono server, middleware, route registration, static SPA serving

#### Domain models
- `backend/src/domain/models/instance.ts` — `Instance`, `InstanceType`, `isAdminType()`
- `backend/src/domain/models/networks.ts` — `Network`
- `backend/src/domain/models/volumes.ts` — `Volume`

#### Application layer
- `backend/src/application/repositories/IInstanceRepository.ts` — CRUD interface for instances
- `backend/src/application/repositories/INetworkRepository.ts` — CRUD + attach/detach interface
- `backend/src/application/repositories/IVolumeRepository.ts` — CRUD + link/unlink interface
- `backend/src/application/repositories/IDockerPort.ts` — Docker operations interface
- `backend/src/application/usecases/**/impl/` — all use case implementations

#### Infrastructure layer
- `backend/src/infrastructure/services/DockerPort.ts` — dockerode wrapper (create/start/stop/delete/stats/networks)
- `backend/src/infrastructure/services/DockerSettings.ts` — image names, ports, env vars, volume mount paths per DB type
- `backend/src/infrastructure/providers/LowDbClient.ts` — lowdb wrapper, persists to `data/db.json`
- `backend/src/infrastructure/repositories/` — lowdb implementations of repository interfaces
- `backend/src/infrastructure/services/composer/` — factory functions that wire use cases (one file per use case)

#### Presentation layer
- `backend/src/presentation/hono/routers/` — `instanceRouter`, `volumeRouter`, `networkRouter`
- `backend/src/presentation/hono/schemas/` — Zod schemas for request validation
- `backend/src/presentation/http/controllers/` — controllers implementing `IController`
- `backend/src/presentation/adapters/honoAdapter.ts` — bridges Hono context → `HttpRequest` → controller

### Frontend key files
- `frontend/src/App.svelte` — root layout + navbar; modals always mounted (not conditionally rendered)
- `frontend/src/stores/` — reactive Svelte stores (`instanceStore`, `networkStore`, `volumeStore`, `storeModal`)
- `frontend/src/api/` — fetch wrapper classes (`ServiceInstanceApi`, `ServiceNetworkApi`, `ServiceVolumeApi`)
- `frontend/src/components/` — UI components (InstanceTable, InstanceModal, ConfirmDeleteModal, …)

### Composers (dependency wiring)
Each use case has a dedicated composer in `backend/src/infrastructure/services/composer/`. A composer instantiates all dependencies (repositories, DockerPort) and returns a ready-to-use controller. **When adding a new use case, create a matching composer and import it in the relevant router.**

### Persistence
`data/db.json` (lowdb) stores three collections: `instances`, `volumes`, and `networks`. The file is bind-mounted in Docker so data survives restarts.

### Environment variables
Copy `.env.exemple` to `.env`. Key variables:
- `DOCKER_SOCKET` — Unix socket path (default `/var/run/docker.sock`; Windows: `//./pipe/docker_engine`)
- `DOCKER_HOST` / `DOCKER_PORT` — alternative TCP connection

### Production build
Multi-stage Dockerfile: (1) build Svelte → static files, (2) compile backend TypeScript, (3) final Node Alpine image serves static SPA and API on port 3000.

## Unit Tests

Tests live in `backend/tests/` and run with **Vitest**. Only the backend has tests.

```
backend/tests/
  helpers/
    mocks.ts                  — shared mock factories (makeInstance, makeNetwork, makeVolume, repo/dockerPort mocks)
  usecases/
    instances/                — CreateInstance, DeleteInstance, GetAll, GetById, GetStats, Start, Stop
    networks/                 — AttachContainer, CreateNetwork, DeleteNetwork, DetachContainer, GetAll, GetById
    volumes/                  — AttachVolume, DeleteOrphanVolume, GetOrphanVolumes
```

Coverage is configured for `src/application/usecases/**/impl/**/*.ts` (use case implementations only).

### Writing new tests

- Use the factories in `tests/helpers/mocks.ts` (`makeInstance`, `makeNetwork`, `makeVolume`, `makeInstanceRepoMock`, etc.)
- Mock only the direct dependencies of the use case under test
- Each test file follows the pattern: `new XxxUseCase(repoMock, ..., dockerPortMock)`
- Test files must be placed under `tests/` to be picked up by Vitest (see `vitest.config.ts`)

## Key invariants

- **Deleting an instance** also detaches it from all associated networks in DB (both admin-tool and DB-instance branches of `DeleteInstanceUseCase`).
- **Deleting a network** first purges ghost container references (containers no longer in the instance repository) before checking if active containers remain.
- **PostgreSQL 18+** volume mount path is `/var/lib/postgresql` (not `/var/lib/postgresql/data`) — configured in `DockerSettings.ts`.
- **`c.json(body, statusCode)`** is the correct Hono argument order — not `c.json(statusCode, body)`.
