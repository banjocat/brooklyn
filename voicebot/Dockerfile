FROM node:7

RUN mkdir -p /app

RUN apt-get update && apt-get install -y \
        festival \
        festvox-kallpc16k
WORKDIR /app
COPY index.js .
COPY package.json .
RUN yarn
CMD node index.js
