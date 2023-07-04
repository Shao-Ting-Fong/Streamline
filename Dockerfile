FROM node:18

# equal to cd /usr/app
WORKDIR /usr/app

COPY client/ ./client

COPY client/.env ./client/.env

RUN cd client && npm i

RUN npm run build

WORKDIR /usr/app

COPY server/ ./server

COPY server/.env ./server/.env

RUN cd server/ && npm i

RUN npm run build

CMD "npm run start"