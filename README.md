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

Move the web related `.env` file into the project root directory, then run the following to run the backend locally.
```bash
nodejs backend/server.mjs
```

## :chart_with_upwards_trend: Production
This project uses Docker :whale: for production set-up

**docker-compose became deprecated within latest versions of Ubuntu and some python packages have became deprecated**

[> Jump to Latest Docker Compose](#how-to-use-docker-compose-on-latest-ubuntu-installs)

```bash
sudo apt update && sudo apt install docker.io docker-compose
```
The following commands will build the docker via compose which builds the multi-docker system.
You will need to move the `.env` into the project root folder before running the following:
```bash
docker network create traefik
docker-compose --env-file .env -p khi -f docker/docker-compose.yml up --build
```

### How to use docker compose on latest Ubuntu installs:
- Follow install instructions from [Install Documentation](https://docs.docker.com/engine/install/ubuntu/)

If the command `docker compose version` does not work go to the [releases page](https://github.com/docker/compose/releases) and find correct version
```bash
curl -SL https://github.com/docker/compose/releases/download/v2.39.2/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
```
Prepare and run Docker container
```bash
docker compose --env-file .env -p khi -f docker/docker-compose.yml up --build
```