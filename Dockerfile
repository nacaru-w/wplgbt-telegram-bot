FROM node:24-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run typecheck && npm run bundle

FROM node:24-alpine AS runtime-binary
RUN apk add --no-cache binutils && strip -s /usr/local/bin/node

FROM alpine:3.23
RUN apk add --no-cache libstdc++
COPY --from=runtime-binary /usr/local/bin/node /usr/local/bin/node
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/data
COPY --from=builder /usr/src/app/dist/bundle.js /usr/src/app/dist/bundle.js.map ./
CMD ["node", "--enable-source-maps", "bundle.js"]
