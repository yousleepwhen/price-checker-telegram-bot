FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install

ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
COPY ./index.js /usr/src/app/index.js
COPY ./*.* /usr/src/app/
COPY ./bot.js /usr/src/app/bot.js
COPY ./util/** /usr/src/app/util/
COPY ./lib/** /usr/src/app/lib/
COPY ./exchange/** /usr/src/app/exchange/
EXPOSE 5000
CMD ["npm", "run", "start"]