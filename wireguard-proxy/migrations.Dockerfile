FROM node:20.9.0-alpine3.18

WORKDIR /app

COPY ./wireguard-proxy/package*.json ./wireguard-proxy/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./wireguard-proxy/ .
RUN yarn build

CMD ["yarn", "typeorm:run"]
