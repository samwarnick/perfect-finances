FROM oven/bun:1.4-alpine AS build
WORKDIR /app

ARG ORIGIN
ENV ORIGIN=$ORIGIN

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1.4-alpine
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

COPY --from=build /app/build ./build
COPY --from=build /app/src/lib/server/db/migrations ./src/lib/server/db/migrations

RUN mkdir -p ./db
ENV PORT=3000
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "./build" ]
