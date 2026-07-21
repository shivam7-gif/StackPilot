FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    nano \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash sandbox

WORKDIR /home/sandbox

RUN echo "PS1='\\w '" >> /home/sandbox/.bashrc

WORKDIR /home/sandbox/app

COPY package*.json ./
RUN npm install

COPY . .

USER sandbox