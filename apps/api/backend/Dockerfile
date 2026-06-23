FROM node:20-bookworm-slim

RUN useradd -ms /bin/bash sandbox

WORKDIR /home/sandbox

RUN apt-get update && apt-get install -y nano

RUN echo "PS1='\\w '" >> /home/sandbox/.bashrc

WORKDIR /home/sandbox/app

USER sandbox