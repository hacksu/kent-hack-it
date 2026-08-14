import postgres from "postgres";

const DB_USER = process.env.DB_USER;
if (!DB_USER) {
    console.error("[-] Missing DB_USER - skipping app-user grant step");
    process.exit(1);
}

const sql = postgres({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

const DB_NAME = process.env.PG_DATABASE;

try {
    await sql.unsafe(`
        GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_USER};
        GRANT USAGE ON SCHEMA public TO ${DB_USER};
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_USER};
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_USER};
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${DB_USER};
        REVOKE CREATE ON SCHEMA public FROM ${DB_USER};
    `);
    console.log(`[+] Grants re-applied for ${DB_USER}`);
} finally {
    await sql.end();
}
