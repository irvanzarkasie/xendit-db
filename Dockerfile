FROM node:8-alpine

RUN npm install express

RUN npm install request

RUN npm install dotenv

RUN npm install mongodb

COPY .env.docker .env

COPY xendit-db-app.js .

CMD KUBE_LOGGER_SERVICE_HOST=localhost KUBE_LOGGER_SERVICE_PORT=3001 node xendit-db-app.js >> xendit-db-app.out

EXPOSE 3002
