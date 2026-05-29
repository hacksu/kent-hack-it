#!/bin/bash
set -e

# allow www-data and group to handle server files
chown -R www-data:www-data /app/build

# Start supervisord in the background
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf &

# Wait until supervisor socket exists
echo "Waiting for supervisord socket..."
while [ ! -S /var/run/supervisor.sock ]; do
    sleep 0.1
done

# reload config
nginx -s reload

# Keep container alive
wait