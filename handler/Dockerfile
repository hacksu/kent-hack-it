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
    nodejs \
    npm \
    net-tools \
    socat \
    libprotobuf32 \
    libnl-route-3-200 \
    && rm -rf /var/lib/apt/lists/*

# nsjail binary from the build stage
COPY --from=nsjail-builder /build/nsjail/nsjail /usr/bin/nsjail
RUN chmod +x /usr/bin/nsjail

# prep container dirs
RUN mkdir -p /jail
RUN mkdir -p /app/ctf

WORKDIR /app
#EXPOSE 5000