#!/bin/bash

# THIS SCRIPT RUNS AS USER: POSTGRES

set -e
echo '[!] Initializing KHI Database'

cat > /tmp/init.sql <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_USER_PASSWORD' CONNECTION LIMIT 100;

GRANT CONNECT ON DATABASE $DB_NAME TO $DB_USER;
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO $DB_USER;
REVOKE CREATE ON SCHEMA public FROM $DB_USER;
REVOKE ALL ON pg_shadow FROM $DB_USER;
ALTER USER $DB_USER NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
EOF

echo "[*] Running init.sql..."
if psql -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" \
    --dbname "$DB_NAME" \
    -f /tmp/init.sql
then
    echo "[+] init.sql completed successfully"
else
    echo "[-] init.sql failed"
    exit 1
fi

echo "[*] Running khi.sql..."

if psql -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" \
    --dbname "$DB_NAME" \
    -f /tmp/khi.sql
then
    echo "[+] khi.sql completed successfully"
else
    echo "[-] khi.sql failed"
    exit 1
fi

echo '[+] Database Configured!'