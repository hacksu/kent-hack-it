FROM oven/bun:1

WORKDIR /app

COPY ./ssh-orchestrator/package.json ./ssh-orchestrator/bun.lock ./
RUN bun install --frozen-lockfile

COPY ./ssh-orchestrator/server.js ./ssh-orchestrator/orchestrator.js ./

USER bun
CMD ["bun", "server.js"]
