# Perfect Finances

A small budget tracker built with SvelteKit 3, Drizzle, and SQLite, running on Bun.

## Getting started

```sh
bun install
bun db:setup
bun run dev
```

Open http://localhost:3000.

## Scripts

| Script            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `bun dev`         | Start the dev server (Vite + Bun)                       |
| `bun build`       | Build the production server into `build/`               |
| `bun start`       | Run the built server with Bun                           |
| `bun check`       | Type-check the project with `svelte-check`              |
| `bun db:generate` | Generate a migration from `src/lib/server/db/schema.ts` |
| `bun db:migrate`  | Apply pending migrations (also runs on server start)    |
| `bun db:seed`     | Seed the local database                                 |
| `bun db:setup`    | Generate, migrate, and seed                             |

The SQLite database lives at `db/sqlite.db`. Migrations run automatically when the
server starts via the `init` hook in `src/hooks.server.ts`.

## Deploying

The app builds to a standalone Bun server with `@sveltejs/adapter-bun`:

```sh
bun run build
bun ./build
```

The server listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`).

`ORIGIN` is the app's public origin (for example `https://budget.example.com`). It is
read at build time and used by SvelteKit for CSRF checks on form submissions, replacing
the runtime `ORIGIN` variable that Hono and `adapter-node` used to read. Leave it unset
when the app is served over HTTPS behind a TLS-terminating proxy: `adapter-bun` then
derives the origin from the `Host` header. For a plain HTTP deployment, either bake the
origin in at build time (`docker build --build-arg ORIGIN=http://host:3000 ...`) or run
behind a proxy and set `PROTOCOL_HEADER=x-forwarded-proto`.

Docker:

```sh
bun docker:publish
```
