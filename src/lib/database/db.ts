import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "$env/dynamic/private"; // dynamic allows the .env file to be read at runtime

const sql = postgres({
    host: env.PG_HOST,
    port: Number(env.PG_PORT),
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE
});

/*
   To prepare the postgresql db you must:
        - create the drizzle.config.ts
        - npx drizzle-kit generate
        - force feed psql the generated .sql file
*/
export const db = drizzle(sql);