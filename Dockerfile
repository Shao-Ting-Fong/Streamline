FROM node:18

WORKDIR /usr/app

COPY client/ ./client

COPY client/.env ./client/.env

RUN cd client && npm install && npm run build

COPY server/ ./server

COPY server/.env ./server/.env

WORKDIR /usr/app/server

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]