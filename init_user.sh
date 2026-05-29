#!/bin/bash
set -e
echo '[!] Initializing KHI Database'

psql -v ON_ERROR_STOP=1 \
     -v app_user="$DB_USER" \
     -v app_password="$DB_USER_PASSWORD" \
     -v db_name="$DB_NAME" \
     --username "$POSTGRES_USER" \
     --dbname "$DB_NAME" \
     -f /docker-entrypoint-initdb.d/init.sql
     
echo '[+] Database Configured!'