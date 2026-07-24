FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY drizzle.config.ts ./
COPY drizzle/ ./drizzle
COPY migrate/grant.ts ./

CMD bunx drizzle-kit migrate && bun run grant.ts
