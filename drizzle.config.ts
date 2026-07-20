import { defineConfig } from "drizzle-kit";

console.log(process.env.PG_HOST!);
console.log(process.env.PG_USER!);
console.log(process.env.PG_PASSWORD!);
console.log(process.env.PG_DATABASE!);

export default defineConfig({
  schema: "./src/lib/database/auth-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST!,
    port: Number(process.env.PG_PORT!),
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    ssl: false
  }
});
