# ContainIt

A web-based Docker management app that lets you spin up database containers (PostgreSQL, MySQL, MongoDB, Redis) through a simple UI — no deep Docker knowledge required.

![Docker](https://img.shields.io/badge/Docker-required-blue)
![Node.js](https://img.shields.io/badge/Node.js-backend-green)
![Svelte](https://img.shields.io/badge/Svelte-frontend-orange)

## Features

- Create and manage database containers from a browser UI
- Supports PostgreSQL, MySQL, MongoDB, and Redis
- Configure ports, passwords, and persistent volumes per instance
- Start, stop, and delete containers on demand
- Volume lifecycle management (orphan detection, re-attach, delete)
- Persistent state across restarts via a local JSON database

## Quick Start

### Linux / macOS

```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd)/data:/app/data \
  sparkew/containit:latest
```

### Windows (Docker Desktop)

Enable **"Expose daemon on tcp://localhost:2375"** in Docker Desktop Settings, then:

```powershell
docker run -d `
  -p 3000:3000 `
  -e DOCKER_HOST=host.docker.internal `
  -e DOCKER_PORT=2375 `
  -v ${PWD}/data:/app/data `
  sparkew/containit:latest
```

### Docker Compose

```bash
curl -O https://raw.githubusercontent.com/IGSparkew/ContainIt/main/exemple-compose.yml
docker compose up -d
```

On PowerShell:

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/IGSparkew/ContainIt/main/exemple-compose.yml" -OutFile "docker-compose.yml"
docker compose up -d
```

Access the UI at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable        | Default                    | Description                                    |
|-----------------|----------------------------|------------------------------------------------|
| `DOCKER_SOCKET` | `/var/run/docker.sock`     | Docker Unix socket path                        |
| `DOCKER_HOST`   | _(empty)_                  | Docker TCP host (e.g. `host.docker.internal`)  |
| `DOCKER_PORT`   | `2375`                     | Docker TCP port                                |

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Svelte + Vite                       |
| Backend  | Hono + Node.js + TypeScript         |
| Docker   | dockerode                           |
| Database | lowdb (JSON file — `data/db.json`)  |
| DI       | tsyringe                            |

## Development

### Prerequisites

- Node.js 20+
- Docker (with socket access)

### Backend

```bash
cd backend
npm install
npm run dev   # Hot reload on port 3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # Vite dev server on port 5173 (proxies /api → localhost:3000)
```

### Full stack (Docker)

```bash
docker-compose up
```

## Architecture

```
Browser → Svelte stores / API clients
       → GET/POST /api/*  (Vite proxy in dev, same origin in prod)
       → Hono routes
       → Controllers  (HTTP glue, Zod validation)
       → Services     (business logic)
       → DockerService (dockerode) + DbService (lowdb)
```

Data is persisted in `data/db.json`, which is bind-mounted in Docker so it survives container restarts.

---

## Links

- [Docker Hub](https://hub.docker.com/r/sparkew/containit)

**Author:** [IGSparkew](https://github.com/IGSparkew)

Copyright © 2026 IGSparkew
