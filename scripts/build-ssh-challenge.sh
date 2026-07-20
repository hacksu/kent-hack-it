#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: $0 <challenge-dir> <slug>" >&2
    exit 1
fi

CHALLENGE_DIR="$1"
SLUG="$2"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WRAPPER_DIR="${SCRIPT_DIR}/../ssh-challenge-wrapper"

docker build -t "khi-ssh-base/${SLUG}:latest" "$CHALLENGE_DIR"

docker build \
    -f "${WRAPPER_DIR}/Dockerfile.wrapper" \
    --build-arg BASE_IMAGE="khi-ssh-base/${SLUG}:latest" \
    -t "khi-ssh/${SLUG}:latest" \
    "$WRAPPER_DIR"
