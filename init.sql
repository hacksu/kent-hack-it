-- create the restricted app user with a connection cap to prevent connection exhaustion attacks
CREATE USER :app_user WITH PASSWORD :'app_password' CONNECTION LIMIT 100;

-- allow the user to connect to only this database — they cannot touch any other db on the server
GRANT CONNECT ON DATABASE :db_name TO :app_user;

-- allow the user to see and use the public schema — required to access tables
GRANT USAGE ON SCHEMA public TO :app_user;

-- allow DML only on existing tables — no DDL (no CREATE, DROP, ALTER, TRUNCATE)
-- limits SQLI blast radius to data manipulation only, not structural changes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :app_user;

-- allow the user to advance and read sequences (required for serial/auto-increment inserts)
-- without this, INSERT on any table with a serial primary key would fail
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :app_user;

-- apply the same DML-only privileges to any tables created in the future
-- without this, new tables would be inaccessible to the app user until manually granted
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :app_user;

-- same future-proofing for sequences created alongside future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :app_user;

-- prevent the user from creating new tables, functions, or other objects in the schema
-- blocks SQLI attacks that attempt to create backdoor tables or malicious functions
REVOKE CREATE ON SCHEMA public FROM :app_user;

-- block access to the system catalog that stores usernames and password hashes
-- prevents credential harvesting
REVOKE ALL ON pg_shadow FROM :app_user;

-- strip any elevated server-level privileges:
-- NOSUPERUSER  — cannot bypass any access controls
-- NOCREATEDB   — cannot create new databases
-- NOCREATEROLE — cannot create or modify other users/roles (no privilege escalation)
-- NOREPLICATION — cannot act as a replication client/source
ALTER USER :app_user NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;