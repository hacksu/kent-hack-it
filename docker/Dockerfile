FROM nginx:latest
WORKDIR /

# setup for mongo container manually:
# docker run -d --name khi_db -e MONGO_INITDB_ROOT_USERNAME=env.user -e MONGO_INITDB_ROOT_PASSWORD=env.password -e MONGO_INITDB_DATABASE=env.db -v mongodb_data:/data/db -p 27017:27017 mongo:latest
RUN apt-get update && apt-get install -y supervisor sudo nodejs npm net-tools

# ensure react env vars are present on build
ARG T_URL
ENV REACT_APP_HOMEPAGE_URL=$T_URL

# ensure directories exist
RUN mkdir -p /var/www/khi
RUN mkdir -p /var/www/project
RUN mkdir -p /ctf/challenge_archives

# give www-data ability to run commands and interact with web-root
RUN chsh -s /bin/bash www-data

# move production build into docker and move
# nginx conf file into the docker
COPY public /var/www/project/public
COPY src /var/www/project/src
COPY package.json /var/www/project/package.json

# create symlink(s)
RUN ln -s /var/www/project/package.json /var/www/khi/package.json

COPY docker/khi /etc/nginx/conf.d/khi.conf

# move backend to web root
COPY backend /var/www/khi/backend

# remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# after initial setup as root, give www-data full-access to /var/www
RUN chown -R www-data:www-data /var/www
RUN chown -R www-data:www-data /ctf/challenge_archives

# build react app
RUN su www-data -s /bin/sh -c "cd /var/www/project && npm install . && npm run build && cp -r build/* -t /var/www/khi"

# install needed nodejs packages to allow the backend to run
RUN su www-data -s /bin/sh -c "cd /var/www/khi && npm install ."

EXPOSE 80

# start an auto restart service for the backend
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]