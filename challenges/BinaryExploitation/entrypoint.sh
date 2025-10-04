#!/bin/bash

# ensure execution permission and prepare programs and flags
chmod +x /root/write_flags.sh && bash /root/write_flags.sh

# Start supervisord in the background
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf &

# Keep container alive
tail -f /dev/null