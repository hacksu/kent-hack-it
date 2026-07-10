FROM postgres:16

COPY ./psql/init-user.sh /docker-entrypoint-initdb.d/init-user.sh
COPY ./drizzle/0000_silent_gertrude_yorkes.sql /tmp/khi.sql

RUN printf "\nINSERT INTO event_config (name, event_start, event_length, site_active) VALUES ('config', NOW(), 7, false) ON CONFLICT (name) DO NOTHING;\n" >> /tmp/khi.sql \
    && chmod +x /docker-entrypoint-initdb.d/init-user.sh \
    && chmod 644 /tmp/khi.sql

# no need for CMD here because the image will auto start the postgres process