# Kent-Hack-It
Website repo for the Kent Hack It CTF

## Architecture
KHI is a Svelte project that is compiled into a node project that uses better-auth for OAuth handling and Drizzle-ORM for Postgresql management.
This project is designed for Docker deployment.

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
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

PG_HOST=localhost
PG_PORT=5432
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

TESTING_READ=
```

Running the svelte application
```console
npm install .
npm run dev -- --open
```