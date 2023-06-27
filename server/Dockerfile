FROM node:18

# equal to cd /usr/app
WORKDIR /usr/app

COPY . .

#COPY .env ./

RUN npm i

RUN npm run build

RUN 

EXPOSE 3000

CMD ["npm run start", "server startup"]