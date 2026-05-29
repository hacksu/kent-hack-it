FROM nginx:latest
RUN apt-get update && apt-get install -y supervisor sudo nodejs npm net-tools && rm -rf /var/lib/apt/lists/*

# prepare necessary directories
RUN mkdir -p /app

# replace nginx config file
COPY khi.conf /etc/nginx/conf.d/default.conf

# move the svelte app into the container and build it
WORKDIR /app
COPY drizzle/ src/ static/ drizzle.config.ts package-lock.json package.json svelte.config.js tsconfig.json vite.config.ts .
RUN npm install . && npm run build

# copy the automation config for running nginx and the web-app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# prep entry script and execute it
COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh
CMD ["/root/entrypoint.sh"]