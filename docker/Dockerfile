FROM nginx:latest
WORKDIR /

# setup for mongo container manually:
# docker run -d --name khi_db -e MONGO_INITDB_ROOT_USERNAME=env.user -e MONGO_INITDB_ROOT_PASSWORD=env.password -e MONGO_INITDB_DATABASE=env.db -v mongodb_data:/data/db -p 27017:27017 mongo:latest
RUN apt-get update && apt-get install -y supervisor sudo nodejs npm net-tools

# move production build into docker and move
# nginx conf file into the docker
COPY build /var/www/khi
COPY package.json /var/www/khi/package.json
COPY .env /var/www/khi/.env
COPY docker/khi /etc/nginx/conf.d/khi.conf

# move backend to web root
COPY backend /var/www/khi/backend

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# give www-data ability to run commands and interact with web-root
RUN chsh -s /bin/bash www-data
RUN chown -R www-data:www-data /var/www
# install needed nodejs packages to allow the backend to run
RUN su www-data -s /bin/sh -c "cd /var/www/khi && npm install ."

EXPOSE 80

# start an auto restart service for the backend
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]