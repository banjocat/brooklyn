FROM node:7

RUN mkdir /bot
WORKDIR /bot
COPY package.json .
RUN yarn
COPY bot.js .
COPY actions actions
CMD node bot.js

