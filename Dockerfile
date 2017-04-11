FROM node:7

RUN mkdir /bot
WORKDIR /bot
COPY package.json .
RUN yarn
COPY bot.js .
COPY bootstrap.js .
COPY simpleconversation.json .
COPY actions actions
COPY models models
CMD node bot.js

