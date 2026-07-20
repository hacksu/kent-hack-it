FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY drizzle.config.ts ./
COPY drizzle/ ./drizzle

CMD ["bunx", "drizzle-kit", "migrate"]
