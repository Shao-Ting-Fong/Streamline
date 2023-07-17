FROM node:18

WORKDIR /usr/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3002

CMD ["node", "dist/index.js"]