FROM node:18

# install python pip for mediasoup related package.

RUN apt-get update

RUN apt-get install -y python3-pip

WORKDIR /usr/app

COPY client/ ./client

COPY client/.env ./client/.env

RUN cd client && npm i && npm run build

COPY server/ ./server

COPY server/.env ./server/.env

WORKDIR /usr/app/server

RUN npm i

RUN npm run build

CMD "npm run start"