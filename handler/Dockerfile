# ---- Stage 1: build nsjail from source ----
FROM debian:bookworm-slim AS nsjail-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf \
    bison \
    flex \
    gcc \
    g++ \
    git \
    libprotobuf-dev \
    libnl-route-3-dev \
    libtool \
    make \
    pkg-config \
    protobuf-compiler \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 https://github.com/google/nsjail.git
WORKDIR /build/nsjail
RUN make -j"$(nproc)"


# ---- Stage 2: copy nsjail into handler app container ----
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    net-tools \
    socat \
    libprotobuf32 \
    libnl-route-3-200 \
    libcap2-bin \
    uidmap \
    && rm -rf /var/lib/apt/lists/*

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# nsjail binary from the build stage
COPY --from=nsjail-builder /build/nsjail/nsjail /usr/bin/nsjail
RUN chmod +x /usr/bin/nsjail
# create the jail user
RUN setcap cap_sys_admin+eip /usr/bin/nsjail
RUN groupadd -g 99999 ctf-player && \
    useradd -m -u 99999 -g 99999 -s /bin/bash ctf-player

RUN echo "www-data:99999:1" >> /etc/subuid && \
    echo "www-data:99999:1" >> /etc/subgid

# prep container dirs
RUN mkdir -p /jail
RUN mkdir -p /app/ctf
RUN mkdir -p /app/jobs

# move node application code and install needed dependencies
COPY ./handler/server.js ./handler/handler.js ./handler/package.json ./handler/bun.lock /app
RUN bun install --frozen-lockfile

# allow www-data to rw /app and /jail
RUN chown -R www-data:www-data /app
RUN chown -R www-data:www-data /jail

# move automation conf
COPY ./handler/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# prep entry script and execute it
COPY ./handler/entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh
CMD ["/root/entrypoint.sh"]