#!/bin/sh
set -e

echo "ctf-player:${CTF_PASSWORD}" | chpasswd

echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config

if command -v cron >/dev/null 2>&1; then
    cron
elif command -v crond >/dev/null 2>&1; then
    crond -b
fi

exec /usr/sbin/sshd -D -e
