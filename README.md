# Kent-Hack-It
Website repo for the Kent Hack It CTF

## Architecture
KHI is a Svelte project that is compiled into a node project that uses better-auth for OAuth handling and Drizzle-ORM for Postgresql management. For challenge handling we use a mix of sub-containers and nsjail allowing us to host a challenge
gym. This project is designed for Docker compose deployment.

## Developer Section
Managing [Drizzle ORM](https://orm.drizzle.team/docs/kit-overview)
```ts
import { defineConfig } from "drizzle-kit";

// .env file read testing
console.log(process.env.DB_HOST!);
console.log(process.env.DB_USER!);
console.log(process.env.DB_DATABASE!);

export default defineConfig({
  schema: "./src/lib/database/my-schema.ts",
  out: "./drizzle",
  dialect: "...", // supports: postgresql, mysql, sqlite, mssql --> https://orm.drizzle.team/docs/drizzle-config-file#dialect
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!
  }
});
```

Preparing a .sql file based on a `drizzle.config.ts` config file
```console
npx drizzle-kit generate
```
To initialize your local PSQL container using psql in the command-line
```console
psql -h localhost -u DB_USER -p -d DB_DATABASE < file.sql
```

Running the website in developer mode, make sure you have a local `.env` file
containing the following:
```text
# false allows admins to test user actions without using a non-admin account
PROD=false

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

MIN_PORT=
MAX_PORT=

PG_HOST=postgres
PG_ADMIN_USER=
PG_ADMIN_PASSWORD=
PG_USER=
PG_PASSWORD=
PG_DATABASE=

HACKSU_GUILD_ID=
KHI_ADM_ROLE=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SSH_IMAGE_REGISTRY=
SSH_REGISTRY_USER=
SSH_REGISTRY_PASSWORD=

SSH_MIN_PORT=
SSH_MAX_PORT=
WEB_MIN_PORT=
WEB_MAX_PORT=

# use produced string from "openssl rand -hex 32"
FLAG_ENCRYPTION_KEY=

# optional regarding build using compose
UPLOADS_DIR=
BIN_UPLOADS_DIR=
JAIL_CONF_DIR=
```

When creating challenges as an admin, you can link either an uploaded jail configuration or a registered challenge image.
For more information regarding jail configurations click [here](./handler/HANDLER.md) to view documentation.

Running the svelte application
```console
bun install
bun run dev -- --open
```

If you'd prefer running the compose locally
```console
docker compose down -v && docker compose up -d --build
```