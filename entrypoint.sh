#!/bin/bash
set -e

# prep extern dirs
echo "[*] Preparing www-data directories..."
chown -R www-data:www-data "/app/build"
mkdir -p "${UPLOADS_DIR}" && chown -R www-data:www-data "${UPLOADS_DIR}"
mkdir -p "${BIN_UPLOADS_DIR}" && chown -R www-data:www-data "${BIN_UPLOADS_DIR}"

# Start supervisord in the background
echo "[*] Starting supervisord..."
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf &

# Wait until supervisor socket exists
echo "Waiting for supervisord socket..."
while [ ! -S /var/run/supervisor.sock ]; do
    sleep 0.1
done

# reload config
echo "[*] Reloading NGINX..."
nginx -s reload

# Keep container alive
wait