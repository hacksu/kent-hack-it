FROM postgres:16

COPY ./psql/init-user.sh /docker-entrypoint-initdb.d/init-user.sh

RUN chmod +x /docker-entrypoint-initdb.d/init-user.sh

# no need for CMD here because the image will auto start the postgres process