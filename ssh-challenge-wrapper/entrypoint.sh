#!/bin/sh
set -e

echo "ctf-player:${CTF_PASSWORD}" | chpasswd

echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config

exec /usr/sbin/sshd -D -e
