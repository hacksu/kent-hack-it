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
    nodejs \
    npm \
    net-tools \
    socat \
    libprotobuf32 \
    libnl-route-3-200 \
    libcap2-bin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# nsjail binary from the build stage
COPY --from=nsjail-builder /build/nsjail/nsjail /usr/bin/nsjail
RUN chmod +x /usr/bin/nsjail
# create the jail user
RUN groupadd -g 99999 ctf-player && \
    useradd -m -u 99999 -g 99999 -s /bin/bash ctf-player

# prep container dirs
RUN mkdir -p /jail
RUN mkdir -p /app/ctf
RUN mkdir -p /app/jobs

# move node application code and install needed dependencies
COPY ./handler/server.js ./handler/handler.js ./handler/package.json ./handler/package-lock.json /app
RUN npm install .

# allow www-data to rw /app and /jail
RUN chown -R www-data:www-data /app
RUN chown -R www-data:www-data /jail

# move automation conf
COPY ./handler/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# prep entry script and execute it
COPY ./handler/entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh
CMD ["/root/entrypoint.sh"]