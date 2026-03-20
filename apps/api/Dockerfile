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

# Copy the fully built workspace so pnpm workspace links resolve exactly as they
# did in the build stage.
COPY --from=build /app ./

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
