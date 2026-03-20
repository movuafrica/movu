FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Build stage ──────────────────────────────────────────────────────────────
FROM base AS build
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/schemas build
RUN pnpm --filter api build

# ── Runner stage ─────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Workspace node_modules (shared packages live here as symlink targets)
COPY --from=build /app/node_modules ./node_modules
# API-level node_modules overrides
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
# Compiled output
COPY --from=build /app/apps/api/dist ./apps/api/dist
# SQL migration files — copied into dist/db/migrations so migrate.js can find them
COPY --from=build /app/apps/api/src/db/migrations ./apps/api/dist/db/migrations
# Shared packages source (required at runtime for workspace symlinks)
COPY --from=build /app/packages ./packages

# Materialize workspace package for runtime resolution in api/node_modules
RUN rm -rf ./apps/api/node_modules/@workspace/schemas \
	&& mkdir -p ./apps/api/node_modules/@workspace/schemas/dist
COPY --from=build /app/packages/schemas/package.json ./apps/api/node_modules/@workspace/schemas/package.json
COPY --from=build /app/packages/schemas/dist ./apps/api/node_modules/@workspace/schemas/dist

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
