### Linux / Mac
```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd)/data:/app/data \
  sparkew/containit:latest
```

### Windows (Docker Desktop)
Activer "Expose daemon on tcp://localhost:2375" dans Docker Desktop Settings.

```powershell
docker run -d `
  -p 3000:3000 `
  -e DOCKER_HOST=host.docker.internal `
  -e DOCKER_PORT=2375 `
  -v ${PWD}/data:/app/data `
  sparkew/containit:latest
```

### Avec docker compose
```bash
curl -O https://raw.githubusercontent.com/IGSparkew/ContainIt/main/exemple-compose.yml
docker compose up -d
```

avec powershell:
```bash
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/IGSparkew/ContainIt/main/exemple-compose.yml" -OutFile "docker-compose.yml"
```

Accès : http://localhost:3000