FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install


ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
COPY ./bot.js /usr/src/app/bot.js
COPY ./util /usr/src/app
EXPOSE 5000
CMD ["npm", "run", "start"]