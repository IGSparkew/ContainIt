# ---- Stage 1 : Build frontend ----
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
# Le build Svelte/Vite sort dans /app/frontend/dist


# ---- Stage 2 : Build backend ----
FROM node:20-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build
# Le build TypeScript sort dans /app/backend/dist


# ---- Stage 3 : Image finale ----
FROM node:20-alpine

WORKDIR /app

# Copie le backend compilé
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./
RUN npm install --omit=dev

# Copie le frontend buildé dans public/
COPY --from=frontend-build /app/frontend/dist ./public

# Crée le dossier data pour db.json
RUN mkdir -p data

# Accès au socket Docker
RUN apk add --no-cache docker-cli

EXPOSE 3000

CMD ["node", "dist/presentation/hono/app.js"]