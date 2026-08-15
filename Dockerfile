FROM oven/bun:1 AS build

WORKDIR /app
COPY drizzle/ ./drizzle
COPY src/ ./src
COPY static/ ./static
COPY drizzle.config.ts bun.lock package.json svelte.config.js tsconfig.json vite.config.ts .

RUN bun install --frozen-lockfile && \
    BETTER_AUTH_URL=http://placeholder \
    BETTER_AUTH_SECRET=placeholder \
    bun run build

FROM nginx:latest
RUN apt-get update && apt-get install -y supervisor net-tools gettext-base && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/bin/bun /usr/local/bin/bun

# prepare necessary directories
RUN mkdir -p /app

COPY khi.conf.template /etc/nginx/khi.conf.template

WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# copy the automation config for running nginx and the web-app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# prep entry script and execute it
COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh
CMD ["/root/entrypoint.sh"]
