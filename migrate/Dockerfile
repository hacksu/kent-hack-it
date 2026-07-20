FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY drizzle.config.ts ./
COPY drizzle/ ./drizzle

CMD ["npx", "drizzle-kit", "migrate"]
