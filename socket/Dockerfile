FROM node:18

# install python pip for mediasoup related package.

RUN apt-get update

RUN apt-get install -y python3-pip

WORKDIR /usr/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3002

CMD ["node", "dist/index.js"]