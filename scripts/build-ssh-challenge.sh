#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: $0 <challenge-dir> <slug>" >&2
    exit 1
fi

CHALLENGE_DIR="$1"
SLUG="$2"

docker build -t "khi-ssh-base/${SLUG}:latest" "$CHALLENGE_DIR"
