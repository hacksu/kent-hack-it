FROM ubuntu:24.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install build tools
RUN apt-get update && \
    apt-get install -y \
        net-tools \
        g++ \
        gcc \
        cmake \
        make \
        python3 \
        supervisor \
        socat && \
    rm -rf /var/lib/apt/lists/*

# make low-priv users
RUN useradd -m -s /bin/bash programmer
WORKDIR /home/programmer
COPY ./rev1/mfa.cpp ./rev1/authenticator.py /home/programmer/
COPY programmer.conf /etc/supervisor/conf.d/programmer.conf

RUN useradd -m -s /bin/bash programmer2
WORKDIR /home/programmer2
COPY ./rev2/Project/ /home/programmer2/
COPY programmer2.conf /etc/supervisor/conf.d/programmer2.conf

WORKDIR /root
COPY write_flags.sh /root/write_flags.sh
RUN chmod +x /root/write_flags.sh

COPY entrypoint.sh /root/entrypoint.sh
CMD ["bash", "/root/entrypoint.sh"]