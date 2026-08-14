#!/bin/bash
set -e

# Start supervisord in the background
echo "[*] Starting supervisord..."
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf &

# Wait until supervisor socket exists
echo "Waiting for supervisord socket..."
while [ ! -S /var/run/supervisor.sock ]; do
    sleep 0.1
done

# Keep container alive
/bin/bash