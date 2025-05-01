# Kent-Hack-It
Website repo for the Kent Hack It CTF

## What is this?
The frontend uses ReactJS that communicates to a ExpressJS backend that handles: user login/registration, team creation/joining, and flag submission.

## :hammer: Install Dependencies
```bash
# if you do not have NodeJS installed
sudo apt update && sudo apt install nodejs npm

# use npm to install latest node
sudo npm install -g n && sudo n stable

# if you do not want to keep the older nodejs binary on the system:
# replace old nodejs for new nodejs
$oldNode = $(which nodejs)
sudo rm -f $oldNode

# create a symlink named nodejs to execute the node binary
sudo ln -s $(which node) $oldNode
```

## :wrench: Build
```bash
# installs dependencies/packages tracked by this project
npm install .
# compile and run the frontend locally
npm start
```

Move the `.env` file into the project root directory, then run the following to run the backend locally.
```bash
# if you want to use the latest node binary replace nodejs -> node
nodejs ./src/backend/server.js
```