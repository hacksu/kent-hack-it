# Kent-Hack-It
Website repo for the Kent Hack It CTF

## What is this?
The frontend uses ReactJS that communicates to a ExpressJS backend that handles: user login/registration, team creation/joining, and flag submission.

## :computer: Development Installation
### :hammer: Install Dependencies
```bash
# if you do not have NodeJS installed
sudo apt update && sudo apt install nodejs npm
```

### :wrench: Build
```bash
# installs dependencies/packages tracked by this project
npm install .
# compile and run the frontend locally
npm start
```

Move the `.env` file into the project root directory, then run the following to run the backend locally.
```bash
nodejs backend/server.mjs
```

## :chart_with_upwards_trend: Production
This project uses Docker :whale: for production set-up
```bash
sudo apt update && sudo apt install docker.io docker-compose
```
The following commands will build the docker via compose which builds the multi-docker system.
```bash
cd docker
docker network create traefik
docker-compose -p khi up --build
```
The following commands will build ONLY the khi website docker.
```bash
docker build -f docker/Dockerfile -t image_name .
docker run -d -p 8080:80 --name docker_name image_name
```